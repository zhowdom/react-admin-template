import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import type { ActionType } from '@ant-design/pro-table';
import { useRef, useState } from 'react';
import { Access, useAccess, history } from 'umi';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import DialogTable from './DialogTable';
import DateSearch from '../DateSearch';
import moment from 'moment';
import {
  prescriptionSummary,
  prescriptionDetail,
  prescriptionSummaryExport,
} from '@/services/pages/logisticsManageIn/timelinessStatistics';
import { principalList } from '@/services/pages/logisticsManageIn/lsp';
import { pubGetSysPortList } from '@/utils/pubConfirm';
import ExportBtn from '@/components/ExportBtn';
import { getUuid } from '@/utils/pubConfirm';

export default (props: any) => {
  const { dicList } = props;
  console.log(dicList);
  const access = useAccess();
  const [exportForm, setExportForm] = useState<any>({});

  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  // 获取负责人
  const pubGetUserListAction = async (key: any): Promise<any> => {
    return new Promise(async (resolve) => {
      const res = await principalList({
        key_word: key.keyWords?.replace(/(^\s*)/g, '') || '',
      });
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
        resolve([]);
        return;
      }
      const newArray = res?.data.map((v: any) => {
        return {
          ...v,
          value: v.user_id,
          label: v.name + '(' + v.account + ')',
          name: v.name,
        };
      });
      resolve(newArray);
    });
  };
  // 获取目的港仓 下拉
  const pubGetSysPortListAction = async (): Promise<any> => {
    const res: any = await pubGetSysPortList({ type: 2 });
    return res;
  };

  const columns: any[] = [
    {
      title: '跨境物流单号',
      dataIndex: 'order_no',
      align: 'center',
      order: 20,
      render: (_: any, record: any) => {
        return (
          <div className="order-wrapper">
            {access.canSee('scm_logisticsOrder_detail') ? (
              <a
                onClick={() => {
                  history.push(
                    `/logistics-manage-in/logistics-order-detail?id=${record.order_id
                    }&from=timeliness&timeStamp=${new Date().getTime()}`,
                  );
                }}
              >
                {record.order_no}
              </a>
            ) : (
              <span className="c-order">{record.order_no}</span>
            )}
          </div>
        );
      },
    },
    {
      title: '订舱号',
      dataIndex: 'booking_number',
      align: 'center',
      order: 19,
    },
    {
      title: '物流负责人',
      dataIndex: 'principal_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '物流负责人',
      dataIndex: 'principal_id',
      align: 'center',
      request: pubGetUserListAction,
      valueType: 'select',
      fieldProps: selectProps,
      hideInTable: true,
      order: 16,
    },
    {
      title: '目的港仓库',
      dataIndex: 'end_port_warehouse_id',
      align: 'center',
      request: pubGetSysPortListAction,
      valueType: 'select',
      fieldProps: selectProps,
      hideInTable: true,
      order: 15,
    },
    {
      title: '实际出厂/发货/装柜时间',
      dataIndex: 'delivery_date',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return record?.delivery_date ? moment(record?.delivery_date).format('YYYY-MM-DD') : '-';
      },
    },
    {
      title: '实际开船时间',
      dataIndex: 'atd_date',
      align: 'center',
      hideInSearch: true,
    },

    {
      title: '出货渠道（运输方式）',
      dataIndex: 'shipping_method',
      align: 'center',
      order: 18,
      valueType: 'select',
      render: (_: any, record: any) =>
        pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD, record?.shipping_method) ??
        '-',
      valueEnum: dicList.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD,
    },
    {
      title: '舱位类型',
      dataIndex: 'shipping_space_type',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        pubFilter(dicList?.LOGISTICS_ORDER_SHIPPING_SPACE_TYPE, record?.shipping_space_type) ?? '-',
    },
    {
      title: '起运港',
      dataIndex: 'start_port_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '目的港仓库',
      dataIndex: 'end_port_warehouse_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: <>货好时间-装柜时间<br />(天)</>,
      dataIndex: 'warehouse_delivery_days',
      align: 'center',
      hideInSearch: true,
      sort: true,
      width: 130
    },
    {
      title: <>发货-ATD<br />(天)</>,
      dataIndex: 'delivery_atd',
      align: 'center',
      hideInSearch: true,
      sort: true,
    },
    {
      title: <>ATD-ATA<br />(天)</>,
      dataIndex: 'atd_ata',
      align: 'center',
      hideInSearch: true,
      sort: true,
    },
    {
      title: <>ATA-入仓<br />(天)</>,
      dataIndex: 'ata_warehouse',
      align: 'center',
      hideInSearch: true,
      sort: true,
    },
    {
      title: <>总时效<br />(天)</>,
      dataIndex: 'total',
      align: 'center',
      hideInSearch: true,
      sort: true,
    },
    {
      title: '货件数（入库单维度）',
      dataIndex: 'warehouse_total',
      align: 'center',
      hideInSearch: true,
      sort: true,
      render: (_: any, record: any) => (
        <DialogTable
          recordData={record}
          trigger={<a key="bookingNumTabDetail">{record.warehouse_total}</a>}
          api={prescriptionDetail}
          dicList={dicList}
        />
      ),
    },

    {
      title: (
        <>
          要求入库时间
          <Tooltip
            placement="top"
            title={
              <>
                <div>
                  一个柜有多个货件，每个货件的要求入库时间不一致的时候，取最晚的一个要求入库时间：
                </div>
                <div>例如：</div>
                <div>入库单1的货件要求入库时间是2022-11-29</div>
                <div>入库单2的货件要求入库时间是2022-11-30</div>
                <div>那么这个货柜的要求入库时间取2022-11-30</div>
              </>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'required_warehousing_time',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '实际入仓时间',
      dataIndex: 'warehousing_time',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: (
        <>
          提前/延迟天数
          <Tooltip
            placement="top"
            title={
              <>
                <div>要求平台入库时间减去实际入库时间，提前10天，即正数10天内（包含）算达成；</div>
                <div>要求平台入库时间减去实际入库时间，延迟7天，即负数-7天内（包含）算达成；</div>
                <div>提前超过10天和延迟超过7天均算未达成。</div>
              </>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'delay_day',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <span style={{ color: record.delay_day > 0 ? 'green' : 'red' }}>{record.delay_day}</span>
      ),
    },
    {
      title: '',
      dataIndex: 'timeRange',
      hideInTable: true,
      order: 17,
      formItemProps: {
        noStyle: true,
        label: '',
      },
      renderFormItem: () => <DateSearch />,
      search: {
        transform: (val: any) => {
          if (val?.dates && val.dates[0] && val.dates[1]) {
            return {
              begin_required_warehousing_time:
                val?.type == '2' ? moment(val.dates[0]).format('YYYY-MM-DD') : null,
              end_required_warehousing_time:
                val?.type == '2' ? moment(val.dates[1]).format('YYYY-MM-DD') : null,
              begin_warehousing_time:
                val?.type == '1' ? moment(val.dates[0]).format('YYYY-MM-DD') : null,
              end_warehousing_time:
                val?.type == '1' ? moment(val.dates[1]).format('YYYY-MM-DD') : null,
            };
          }
          return {};
        },
      },
    },
  ];

  const ref: any = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  // 获取表格数据
  const getListAction = async (params: any, sort: any): Promise<any> => {
    const sortList: any = {};
    Object.keys(sort).forEach((key: any) => {
      sortList.column = key;
      sortList.asc = sort[key] == 'ascend' ? true : false;
    });
    const postData = {
      ...params,
      type: 3,
      orderItems: JSON.stringify(sort) == '{}' ? [] : [sortList],
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    setExportForm(postData)
    const res = await prescriptionSummary(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    ref?.current?.clearSelected();
    return {
      data: res?.data?.records.map((v: any)=>({
        ...v,
        uid: getUuid(),
      })) || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1300, '1');
  return (
    <ProTable
      columns={columns}
      search={{ labelWidth: 'auto', defaultCollapsed: false }}
      pagination={{
        showSizeChanger: true,
      }}
      actionRef={ref}
      formRef={formRef}
      bordered
      tableAlertRender={false}
      tableAlertOptionRender={false}
      {...ColumnSet}
      request={getListAction}
      scroll={{ x: 1400 }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      rowKey="uid"
      dateFormatter="string"
      toolbar={{
        actions: [
          <Access
            key="exportButton"
            accessible={access.canSee('scm_booking_number_export')}
          >
            <ExportBtn
              exportHandle={prescriptionSummaryExport}
              exportForm={{
                ...exportForm,
                export_config: { columns: ColumnSet.customExportConfig },
              }}
            />
          </Access>,
        ],
      }}
    />
  );
};

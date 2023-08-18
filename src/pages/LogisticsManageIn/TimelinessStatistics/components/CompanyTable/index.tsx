import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import type { ActionType } from '@ant-design/pro-table';
import { useRef } from 'react';
import { Statistic, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { getCompanyList } from '@/services/pages/logisticsManageIn/company';
import DialogTable from './DialogTable';
import moment from 'moment';
import DateSearch from '../DateSearch';
import {
  prescriptionSummary,
  prescriptionDetail,
} from '@/services/pages/logisticsManageIn/timelinessStatistics';
import { getUuid } from '@/utils/pubConfirm';

export default (props: any) => {
  const { dicList } = props;
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

  const columns: any[] = [
    {
      title: '船公司/快递公司',
      dataIndex: 'express_id',
      align: 'center',
      fieldProps: selectProps,
      valueType: 'select',
      sorter: true,
      request: async () => {
        const res: any = await getCompanyList({
          current_page: 1,
          page_size: 99999,
          business_scope: 'IN',
        });
        return res?.data?.records
          ?.map((v: any) => ({
            value: v.id,
            label: v.name,
            data: v,
            disabled: v.status != '1',
          }))
          .sort((a: any, b: any) => b.status - a.status);
      },
    },
    {
      title: '起运港',
      dataIndex: 'start_port_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '目的港',
      dataIndex: 'end_port_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: (
        <>
          发货-ATD (平均值.天)
          <Tooltip
            placement="top"
            title={
              <>
                平均时效公式：各个跨境物流单（订舱号维度）时效之和，除以跨境物流单数量（订舱号维度）
              </>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'delivery_atd',
      align: 'center',
      hideInSearch: true,
      sorter: true,
      render: (_, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.delivery_atd}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
              precision={2}
            />
          </span>,
        ];
      },
    },
    {
      title: (
        <>
          ATD-ATA (平均值.天)
          <Tooltip
            placement="top"
            title={
              <>
                平均时效公式：各个跨境物流单（订舱号维度）时效之和，除以跨境物流单数量（订舱号维度）
              </>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'atd_ata',
      align: 'center',
      sorter: true,
      hideInSearch: true,
      render: (_, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.atd_ata}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
              precision={2}
            />
          </span>,
        ];
      },
    },
    {
      title: (
        <>
          ATA-入仓 (平均值.天)
          <Tooltip
            placement="top"
            title={
              <>
                平均时效公式：各个跨境物流单（订舱号维度）时效之和，除以跨境物流单数量（订舱号维度）
              </>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'ata_warehouse',
      align: 'center',
      sorter: true,
      hideInSearch: true,
      render: (_, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.ata_warehouse}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
              precision={2}
            />
          </span>,
        ];
      },
    },
    {
      title: (
        <>
          总时效 (平均值.天)
          <Tooltip
            placement="top"
            title={
              <>
                平均时效公式：各个跨境物流单（订舱号维度）时效之和，除以跨境物流单数量（订舱号维度）
              </>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'total',
      align: 'center',
      sorter: true,
      hideInSearch: true,
      render: (_, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.total}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
              precision={2}
            />
          </span>,
        ];
      },
    },
    {
      title: (
        <>
          货件数（入库单维度）
          <Tooltip
            placement="top"
            title="入库单维度，统计该船公司或快递公司，关联的订舱号，每个订舱号关联的入库单数量"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'warehouse_total',
      sorter: true,
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <DialogTable
          recordData={record}
          trigger={<a key="companyTabNumDetail">{record.warehouse_total}</a>}
          api={prescriptionDetail}
          dicList={dicList}
        />
      ),
    },
    {
      title: (
        <>
          达成率
          <Tooltip
            placement="top"
            title={
              <>
                <div>要求平台入库时间减去实际入库时间，提前10天，即正数10天内（包含）算达成；</div>
                <div>要求平台入库时间减去实际入库时间，延迟7天，即负数-7天内（包含）算达成</div>
                <div>提前超过10天和延迟超过7天均算未达成。</div>
                <div>
                  例如有5个入库单，有4个在正10天、负7天内入仓了，有1个没有在正10天、负7天内入仓，那么达成率是80%。
                </div>
              </>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'completion_rate',
      align: 'center',
      hideInSearch: true,
      sorter: true,
      render: (_: any, record: any) =>
        !record.completion_rate && record.completion_rate != 0 ? '-' : `${record.completion_rate}%`,
    },
    {
      title: '达成率规则',
      dataIndex: 'prescription_config_describe',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '',
      dataIndex: 'timeRange',
      hideInTable: true,
      renderFormItem: () => <DateSearch />,
      formItemProps: {
        noStyle: true,
        label: '',
      },
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
      type: 1,
      orderItems: JSON.stringify(sort) == '{}' ? [] : [sortList],
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await prescriptionSummary(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
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
      search={{ labelWidth: 100, defaultCollapsed: false }}
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
    />
  );
};

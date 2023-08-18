import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { useState } from 'react';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import { Tooltip } from 'antd';
import { Access,useAccess } from 'umi';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { getCompanyList } from '@/services/pages/logisticsManageIn/company';
import { principalList } from '@/services/pages/logisticsManageIn/lsp';
import {  pubGetSysPortList } from '@/utils/pubConfirm';
import ExportBtn from '@/components/ExportBtn';
import DateSearch from '../DateSearch';
import moment from 'moment';
import { getUuid } from '@/utils/pubConfirm';

export default (props: any) => {
  const { api, recordData, dicList } = props;
  const access = useAccess();
  const [exportForm, exportFormSet] = useState({});
  // 搜索
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
    const res: any = await pubGetSysPortList({type: 2});
    return res;
  };
  const columns: any = [
    {
      title: '跨境物流单号',
      dataIndex: 'order_no',
      align: 'center',
      order: 20,
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
      request:pubGetSysPortListAction,
      valueType: 'select',
      fieldProps: selectProps,
      hideInTable: true,
      order: 15,
    },
    {
      title: '',
      dataIndex: 'timeRange',
      order: 14,
      hideInTable: true,
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
    {
      title: '实际出厂/发货/装柜时间',
      dataIndex: 'delivery_date',
      align: 'center',
      hideInSearch: true,
      render: (_: any,record: any) => {
        return record?.delivery_date ? moment(record?.delivery_date).format('YYYY-MM-DD') : '-'
      }
    },

    {
      title: '船公司/快递公司',
      dataIndex: 'express_id',
      order: 18,
      align: 'center',
      fieldProps: selectProps,
      valueType: 'select',
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
      title: '舱位类型',
      dataIndex: 'shipping_space_type',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        pubFilter(dicList?.LOGISTICS_ORDER_SHIPPING_SPACE_TYPE, record?.shipping_space_type) ?? '-',
    },
    {
      title: '目的港仓库',
      dataIndex: 'end_port_warehouse_name',
      align: 'center',
      hideInSearch: true,
    },

    {
      title: <>发货-ATD<br/>(天)</>,
      dataIndex: 'delivery_atd',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: <>ATD-ATA<br/>(天)</>,
      dataIndex: 'atd_ata',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: <>ATA-入仓<br/>(天)</>,
      dataIndex: 'ata_warehouse',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: <>总时效<br/>(天)</>,
      dataIndex: 'total',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '货件数（入库单维度）',
      dataIndex: 'warehouse_total',
      align: 'center',
      hideInSearch: true,
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
  ];
  const [custonConfig] = useState(useCustomColumnSet(columns, 1300, `d2`));
  return (
    <ModalForm
      title="货件数（入库单维度）"
      trigger={props.trigger}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={{
        searchConfig: {
          submitText: '确认',
          resetText: '关闭',
        },
        submitButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
      width={1200}
    >
      <ProTable
        cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
        request={async (params: any): Promise<any> => {
          const postData: any = {
            current_page: params?.current,
            page_size: params?.pageSize,
            ...params,
            type: '2',
            shipping_method: recordData.shipping_method,
            start_port_id: recordData.start_port_id,
            end_port_id: recordData.end_port_id,
            prescription_config_id: recordData.prescription_config_id,
          };
          exportFormSet(postData)
          const res = await api(postData);
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
        }}
        {...custonConfig}
        options={false}
        bordered
        size="small"
        rowKey="uid"
        search={{ labelWidth: 'auto', defaultCollapsed: false }}
        pagination={{
          showSizeChanger: true,
          className: 'modal-pagi',
        }}
        columns={columns}
        toolbar={{
          actions: [
            <Access
              key="exportButton"
              accessible={access.canSee('scm_shippingMethod_detail_export')}
            >
              <ExportBtn
                btnText={'导出'}
                exportForm={exportForm}
                exportHandle={`/sc-scm/logisticsOrder/prescriptionDetailExport`}
              />
            </Access>,
          ],
        }}
      />
    </ModalForm>
  );
};

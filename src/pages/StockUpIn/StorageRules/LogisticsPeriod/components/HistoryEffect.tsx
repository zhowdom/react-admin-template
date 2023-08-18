import { Access, connect, useAccess } from 'umi';
import React, { useRef, useState } from 'react';
import { useActivate } from 'react-activation';
import { Button, DatePicker, Popconfirm, Space } from 'antd';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import Update from './Dialogs/Update';
import * as api from '@/services/pages/stockUpIn/rate';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubBlobDownLoad } from '@/utils/pubConfirm';
import { pubGetPlatformList } from '@/utils/pubConfirm';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import Log from '@/pages/StockUpIn/Components/Log';
import moment from 'moment'; 
import './Dialogs/index.less'

/*跨境备货 - 月度汇率管理  @zhujing 2022-09-26*/
// 格式币种下拉, 只展示英文
const formatCurrency = (currencyObj: any = {}) => {
  Object.keys(currencyObj).forEach((key: string) => {
    currencyObj[key].text = key;
  });
  return currencyObj;
};
const Page: React.FC<{ dicList: any }> = ({ dicList }) => {
  const formRef: any = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [queryParams, queryParamsSet] = useState<any>({});
  const [exporting, exportingSet] = useState(false);
  const [selectedRowKeys, selectedRowKeysSet] = useState([]);
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  // 列表
  const columns: ProColumns<any>[] = [
    
    {
      title: '平台',
      dataIndex: 'platform_id',
      key: 'platform_id',
      valueType: 'select',
      align: 'center',
      request: () => pubGetPlatformList({ business_scope: 'IN'}),
      fieldProps: { showSearch: true },
      width: 120,
    },

  {
      title: '站点',
      dataIndex: 'site',
      key: 'site',
      align: 'center',
      valueEnum: dicList?.SYS_PLATFORM_SHOP_SITE || [],
      fieldProps: {
        showSearch: true,
      },
    },
    {
      title: '目的仓',
      dataIndex: 'delivery_route',
      key: 'delivery_route',
      align: 'center',
      valueEnum: dicList?.LOGISTICS_TIME_MANAGE_IN_DELIVERY_ROUTE || [],
      fieldProps: {
        showSearch: true,
      },
    },
    {
      title: '运输方式',
      dataIndex: 'shipping_method',
      key: 'shipping_method',
      align: 'center',
      valueEnum: dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || [],
      fieldProps: {
        showSearch: true,
      },
    },
    {
      title: '国内运输周期（天）',
      dataIndex: 'domestic_transport_cycle',
      key: 'domestic_transport_cycle',
      className: 'effectTxtRight',
      hideInSearch: true,
    },
    {
        title: '跨境运输周期（天）',
        hideInSearch: true,
        children: [
            {
                title: '整柜',
                children: [
                    {
                        title: '标准件',
                        key: 'whole_box_standard',
                        className: 'effectTxtRight',
                        dataIndex: 'whole_box_standard'
                    },
                    {
                        title: '大件',
                        key: 'whole_box_big',
                        className: 'effectTxtRight',
                        dataIndex: 'whole_box_big'
                    }
                ]
            },
            {
                title: '散货',
                children: [
                    {
                        title: '标准件',
                        key: 'part_box_standard',
                        className: 'effectTxtRight',
                        dataIndex: 'part_box_standard'
                    },
                    {
                        title: '大件',
                        key: 'part_box_big',
                        className: 'effectTxtRight',
                        dataIndex: 'part_box_big'
                    }
                ]
            },
        ]
    },
    {
      title: '上架周期（天）',
      dataIndex: 'shelves_cycle',
      key: 'shelves_cycle',
      className: 'effectTxtRight',
      hideInSearch: true,
  },
    {
      title: '总时效（天）',
      hideInSearch: true,
      children: [
          {
              title: '整柜',
              children: [
                  {
                      title: '标准件',
                      key: 'all_whole_box_standard',
                      className: 'effectTxtRight',
                      dataIndex: 'all_whole_box_standard'
                  },
                  {
                      title: '大件',
                      key: 'all_whole_box_big',
                      className: 'effectTxtRight',
                      dataIndex: 'all_whole_box_big'
                  }
              ]
          },
          {
              title: '散货',
              children: [
                  {
                      title: '标准件',
                      key: 'all_part_box_standard',
                      className: 'effectTxtRight',
                      dataIndex: 'all_part_box_standard'
                  },
                  {
                      title: '大件',
                      key: 'all_part_box_big',
                      className: 'effectTxtRight',
                      dataIndex: 'all_part_box_big'
                  }
              ]
          },
      ]
    },
    
    {
      title: '使用月份',
      dataIndex: 'date',
      align: 'center',
      valueType: 'dateMonth',
      hideInSearch: true,
    },
    {
      title: '使用月份',
      dataIndex: 'date',
      align: 'center',
      render: (_, record) => record.date,
      renderFormItem: () => <NewDatePicker picker={'month'} />,
      search: {
        transform: (value: any) => {
          let _d0 = value[0] ? value[0].split(' ')[0] : '';
          let _d1 = value[1] ? value[1].split(' ')[0] : '';
          return {
            dates: [_d0, _d1],
          }},
      },
      hideInTable: true,
    },

    // {
    //   title: '使用月份',
    //   dataIndex: 'month',
    //   align: 'center',
    //   valueType: 'dateMonth',
    //   renderFormItem: () => (
    //     // @ts-ignore
    //     <DatePicker.RangePicker placeholder={['开始', '结束']} picker="month" />
    //   ),
    //   search: {
    //     transform: (val) => ({ startMonth: val[0], endMonth: val[1] }),
    //   },
    //   hideInTable: true,
    // },
    {
      title: '备份时间',
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
    },
  ];
  // 导出
  const exportExcel = async () => {
    exportingSet(true);
    const res: any = await api.exportExceHistory(queryParams);
    exportingSet(false);
    pubBlobDownLoad(res, `历史时效(${queryParams.startMonth || ''}-${queryParams.endMonth || ''})`);
    return;
  };
  return (
      <ProTable
        bordered
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        pagination={{
          showSizeChanger: true,
        }}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={async (params: any) => {
          const formData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
          };
          if (formData?.dates && (!formData?.dates[0] || !formData?.dates[1])) Reflect.deleteProperty(formData, 'dates')
          queryParamsSet(formData);
          const res = await api.getList_history(formData);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          return {
            success: true,
            data: res?.data?.records || [],
            total: res?.data?.total || 0,
          };
        }}
        rowKey="id"
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
        dateFormatter="string"
        headerTitle={
          <Space>
            
            <Access key="export" accessible={access.canSee('stock_up_logisticsPeriod_history_export')}>
              <Button onClick={() => exportExcel()} loading={exporting} type="primary">
                {exporting ? '导出中' : '导出'}
              </Button>
            </Access>
            
          </Space>
        }
        scroll={{ x: 800 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        // rowSelection={{
        //   selectedRowKeys,
        //   onChange: (keys: any) => selectedRowKeysSet(keys),
        // }}
      />
  );
};

export default Page;

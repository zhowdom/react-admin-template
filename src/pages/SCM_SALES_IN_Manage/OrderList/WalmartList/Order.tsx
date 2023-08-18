import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetStoreList } from '@/utils/pubConfirm';
import {
  exportExcel,
  getList,
} from '@/services/pages/SCM_SALES_IN_Manage/orderList/walmartListOrder';
import { Space } from 'antd';
import { useAccess } from 'umi';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import ExportBtn from '@/components/ExportBtn';
// walmart订单明细
const Order: React.FC<{
  common: any;
}> = () => {
  const actionRef = useRef<ActionType>();
  const [exportForm, setExportForm] = useState({});
  const access = useAccess();

  // 获取表格数据
  const requestTableData = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      pageIndex: params?.current,
    };
    const res = await getList(postData);
    setExportForm(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
    return {
      data: res?.data?.list || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // table配置
  const columns: ProColumns<any>[] = [
    {
      title: '店铺',
      dataIndex: 'shopId',
      request: () => pubGetStoreList({ business_scope: 'IN' }),
      fieldProps: { showSearch: true },
      valueType: 'select',
      hideInTable: true,
    },
    {
      title: '店铺',
      dataIndex: 'shopName',
      valueType: 'select',
      hideInSearch: true,
    },
    {
      title: '订单号',
      dataIndex: 'customerOrderId',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      hideInSearch: true,
      align: 'right',
    },
    {
      title: '下单币种',
      dataIndex: 'productCurrency',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '销售金额',
      dataIndex: 'productAmount',
      hideInSearch: true,
      align: 'right',
      width: 100,
    },
    {
      title: '税金',
      dataIndex: 'productTaxAmount',
      hideInSearch: true,
      align: 'right',
    },
    {
      title: '下单汇率',
      dataIndex: 'orderExchangeRate',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '销售金额(USD)',
      dataIndex: 'productAmountUsd',
      hideInSearch: true,
      align: 'right',
      width: 100,
    },
    {
      title: '税金(USD)',
      dataIndex: 'productTaxAmountUsd',
      hideInSearch: true,
      align: 'right',
    },
    {
      title: '发货方式',
      dataIndex: 'shipNodeType',
      align: 'center',
      request: () =>
        Promise.resolve([
          { label: 'SellerFulfilled', value: 'SellerFulfilled' },
          { label: 'WFSFulfilled', value: 'WFSFulfilled' },
          { label: '3PLFulfilled', value: '3PLFulfilled' },
        ]),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      request: () =>
        Promise.resolve([
          { label: 'Created', value: 'Created' },
          { label: 'Acknowledged', value: 'Acknowledged' },
          { label: 'Shipped', value: 'Shipped' },
          { label: 'Delivered', value: 'Delivered' },
          { label: 'Cancelled', value: 'Cancelled' },
        ]),
    },
    {
      title: '下单日期',
      dataIndex: 'orderDate',
      align: 'center',
      width: 146,
      valueType: 'dateRange',
      render: (_, record) => record.orderDate,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          orderDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          orderDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
    {
      title: '预计发货日期',
      dataIndex: 'estimatedShipDate',
      align: 'center',
      width: 146,
      valueType: 'dateRange',
      render: (_, record) => record.estimatedShipDate,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          estimatedShipDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          estimatedShipDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
    {
      title: '预计收货日期',
      dataIndex: 'estimatedDeliveryDate',
      align: 'center',
      width: 146,
      valueType: 'dateRange',
      render: (_, record) => record.estimatedDeliveryDate,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          estimatedDeliveryDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          estimatedDeliveryDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1200, 'order');

  return (
    <ProTable
      actionRef={actionRef}
      rowKey="id"
      dateFormatter="string"
      pagination={{
        showSizeChanger: true,
      }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      {...ColumnSet}
      showSorterTooltip={false}
      request={requestTableData}
      columns={columns}
      search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
      toolBarRender={() => [
        <Space key="space">
          {access.canSee('liyi99-report_order-order-walmart-export') ? (
            <ExportBtn
              exportHandle={exportExcel}
              exportForm={{
                ...exportForm,
                exportConfig: { columns: ColumnSet.customExportConfig },
              }}
            />
          ) : null}
        </Space>,
      ]}
    />
  );
};
export default Order;

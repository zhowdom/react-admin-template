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
// walmart退货明细
const Refund: React.FC<{
  common: any;
}> = () => {
  const actionRef = useRef<ActionType>();
  const [exportForm, setExportForm] = useState({});
  const access = useAccess();

  // 获取表格数据
  const requestTableData = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      returnFlag: '1',
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
      title: '原订单号',
      dataIndex: 'customerOrderId',
    },
    {
      title: '退货单号',
      dataIndex: 'walmartReturnOrderId',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
    },
    {
      title: '退货数量',
      dataIndex: 'returnQuantity',
      hideInSearch: true,
      align: 'right',
    },
    {
      title: '退款币种',
      dataIndex: 'refundProductCurrency',
      hideInSearch: true,
      align: 'right',
    },
    {
      title: '退款金额',
      dataIndex: 'refundProductAmount',
      hideInSearch: true,
      align: 'right',
    },
    {
      title: '退款税金',
      dataIndex: 'refundProductTaxAmount',
      hideInSearch: true,
      align: 'right',
    },
    {
      title: '退款汇率',
      dataIndex: 'returnExchangeRate',
      hideInSearch: true,
      align: 'right',
    },
    {
      title: '退款金额(USD)',
      dataIndex: 'refundProductAmountUsd',
      hideInSearch: true,
      align: 'right',
    },
    {
      title: '退款税金(USD)',
      dataIndex: 'refundProductTaxAmountUsd',
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
      title: '退款日期',
      dataIndex: 'returnByDate',
      align: 'center',
      width: 146,
      valueType: 'dateRange',
      render: (_, record) => record.returnByDate,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          returnByDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          returnByDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1300, 'refund');
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
          {access.canSee('liyi99-report_order-refund-walmart-export') ? (
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
export default Refund;

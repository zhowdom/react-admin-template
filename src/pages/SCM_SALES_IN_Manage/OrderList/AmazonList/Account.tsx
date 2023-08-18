import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetStoreList } from '@/utils/pubConfirm';
import {
  exportExcel,
  getList,
} from '@/services/pages/SCM_SALES_IN_Manage/orderList/amazonListAccount';
import { Space } from 'antd';
import AccountDetail from './dialog/AccountDetail';
import moment from 'moment';
import { useAccess } from 'umi';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import ExportBtn from '@/components/ExportBtn';
// 结算报告
const Order: React.FC<{
  common: any;
}> = () => {
  const actionRef = useRef<ActionType>();
  const [exportForm, setExportForm] = useState<any>({});
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
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      request: () =>
        Promise.resolve([
          { label: 'Order', value: 'Order' },
          { label: 'Refund', value: 'Refund' },
        ]),
    },
    {
      title: '订单编号',
      dataIndex: 'amazonOrderId',
      render: (_, record: any) => (
        <AccountDetail dataSource={record} trigger={<a>{record.amazonOrderId}</a>} />
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      align: 'right',
      hideInSearch: true,
    },
    {
      title: '销售金额',
      dataIndex: 'productSales',
      align: 'right',
      hideInSearch: true,
    },
    {
      title: '市场预收税',
      dataIndex: 'marketplaceWithheldTax',
      align: 'right',
      hideInSearch: true,
      width: 90,
    },
    {
      title: '配送折扣优惠',
      dataIndex: 'shipPromotionDiscount',
      align: 'right',
      hideInSearch: true,
      width: 100,
    },
    {
      title: '总计',
      dataIndex: 'total',
      align: 'right',
      hideInSearch: true,
    },
    {
      title: '原币种',
      dataIndex: 'currency',
      align: 'right',
      hideInSearch: true,
    },
    {
      title: '汇率',
      dataIndex: 'exchangeRate',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 6,
      },
    },
    {
      title: (
        <>
          销售金额
          <br />
          (USD)
        </>
      ),
      dataIndex: 'productSalesUsd',
      align: 'right',
      hideInSearch: true,
    },
    {
      title: (
        <>
          市场预收税
          <br />
          (USD)
        </>
      ),
      dataIndex: 'marketplaceWithheldTaxUsd',
      align: 'right',
      hideInSearch: true,
      width: 100,
    },
    {
      title: (
        <>
          配送折扣
          <br />
          (USD)
        </>
      ),
      dataIndex: 'shipPromotionDiscountUsd',
      align: 'right',
      hideInSearch: true,
    },
    {
      title: (
        <>
          总计
          <br />
          (USD)
        </>
      ),
      dataIndex: 'totalUsd',
      align: 'right',
      hideInSearch: true,
    },
    {
      title: '下单时间(当地)',
      dataIndex: 'purchaseDate',
      align: 'center',
      width: 128,
      valueType: 'dateRange',
      render: (_: any, record: any) => record.purchaseDate || '-',
      initialValue: [moment().subtract(1, 'months'), moment()],
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          purchaseStartDate: value[0] ? `${value[0]} 00:00:00` : null,
          purchaseEndDate: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
    {
      title: '下单时间(0时区)',
      dataIndex: 'utcPurchaseDate',
      align: 'center',
      width: 146,
      valueType: 'dateRange',
      render: (_: any, record: any) => record.utcPurchaseDate || '-',
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          utcPurchaseStartDate: value[0] ? `${value[0]} 00:00:00` : null,
          utcPurchaseEndDate: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
    {
      title: '结算时间(当地)',
      dataIndex: 'postedDate',
      align: 'center',
      width: 128,
      valueType: 'dateRange',
      render: (_, record) => record.postedDate || '-',
      renderFormItem: () => <NewDatePicker />,
        fieldProps: {
          allowClear: false,
        },
        search: {
          transform: (value: any) => ({
            postedStartDate: value[0] ? `${value[0]} 00:00:00` : null,
            postedEndDate: value[1] ? `${value[1]} 23:59:59` : null,
          }),
        },
    },
    {
      title: '结算时间(0时区)',
      dataIndex: 'utcPostedDate',
      align: 'center',
      width: 128,
      valueType: 'dateRange',
      render: (_, record) => record.utcPostedDate || '-',
      renderFormItem: () => <NewDatePicker />,
      fieldProps: {
        allowClear: false,
      },
      search: {
        transform: (value: any) => ({
          utcPostedStartDate: value[0] ? `${value[0]} 00:00:00` : null,
          utcPostedEndDate: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1400, 'account', undefined, ['productSales','marketplaceWithheldTax','shipPromotionDiscount','total','currency','exchangeRate','utcPurchaseDate','utcPostedDate']);
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
          {access.canSee('liyi99-report_order-account-amazon-export') ? (
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

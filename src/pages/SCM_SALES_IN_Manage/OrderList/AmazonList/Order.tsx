import React, { useRef, useState, useMemo } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetStoreList } from '@/utils/pubConfirm';
import {
  exportExcel,
  getList,
} from '@/services/pages/SCM_SALES_IN_Manage/orderList/amazonListOrder';
import { Space } from 'antd';
import OrderDetail from './dialog/OrderDetail';
import { useAccess } from 'umi';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import moment from 'moment';
import ExportBtn from '@/components/ExportBtn';

// 订单报表
const Order: React.FC<{
  common: any;
}> = ({ common }) => {
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
  const columns: ProColumns<any>[] = useMemo(
    () => [
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
        title: '亚马逊订单号',
        dataIndex: 'amazonOrderId',
        render: (_, record: any) => <OrderDetail title={`订单详情(${record?.amazonOrderId})`} trigger={<a>{record.amazonOrderId}</a>} dataSource={record} />,
        width: 100,
      },
      {
        title: '卖家订单号',
        dataIndex: 'merchantOrderId',
        width: 100,
      },
      {
        title: '订单状态',
        dataIndex: 'orderStatus',
        align: 'center',
        valueType: 'select',
        valueEnum: common?.dicList?.report_order_status || {},
      },
      {
        title: 'SKU',
        dataIndex: 'sku',
      },
      {
        title: 'ASIN',
        dataIndex: 'asin',
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        align: 'right',
        hideInSearch: true,
      },
      {
        title: (
          <>
            订单金额 <br />
            (原币种)
          </>
        ),
        dataIndex: 'itemPrice',
        align: 'right',
        hideInSearch: true,
      },
      {
        title: '配送促销折扣',
        dataIndex: 'shipPromotionDiscount',
        align: 'right',
        hideInSearch: true,
        width: 100,
      },
      {
        title: '原币种',
        dataIndex: 'currency',
        align: 'center',
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
            订单金额
            <br />
            (USD)
          </>
        ),
        dataIndex: 'itemPriceUsd',
        align: 'right',
        hideInSearch: true,
      },
      {
        title: '商品状态',
        dataIndex: 'itemStatus',
        align: 'center',
        valueType: 'select',
        valueEnum: common?.dicList?.report_item_status || {},
      },
      {
        title: '销售渠道',
        dataIndex: 'salesChannel',
        align: 'center',
        valueType: 'select',
      },
      {
        title: '下单时间(当地)',
        dataIndex: 'purchaseDate',
        align: 'center',
        valueType: 'dateRange',
        width: 130,
        initialValue: [moment().add(-3, 'M'), moment()],
        renderFormItem: () => <NewDatePicker />,
        fieldProps: {
          allowClear: false,
        },
        render: (_, record) => record.purchaseDate,
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
        valueType: 'dateRange',
        width: 130,
        renderFormItem: () => <NewDatePicker />,
        fieldProps: {
          allowClear: false,
        },
        render: (_, record) => record.utcPurchaseDate,
        search: {
          transform: (value: any) => ({
            utcPurchaseStartDate: value[0] ? `${value[0]} 00:00:00` : null,
            utcPurchaseEndDate: value[1] ? `${value[1]} 23:59:59` : null,
          }),
        },
      },
      {
        title: '最后更新时间',
        dataIndex: 'lastUpdatedDate',
        align: 'center',
        hideInSearch: true,
        width: 130,
      },
      {
        title: '结算日期（当地）',
        dataIndex: 'postedDate',
        align: 'center',
        hideInSearch: true,
        width: 130,
      },
    ],
    [common],
  );
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1300, 'order', undefined, ['itemPrice','shipPromotionDiscount','currency','exchangeRate','utcPurchaseDate']);
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
          {access.canSee('liyi99-report_order-order-amazon-export') ? (
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

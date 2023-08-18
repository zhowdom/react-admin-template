import React, { useRef, useState, useMemo } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetStoreList } from '@/utils/pubConfirm';
import {
  exportExcel,
  getList,
} from '@/services/pages/SCM_SALES_IN_Manage/orderList/amazonListSales';
import { Space } from 'antd';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import ExportBtn from '@/components/ExportBtn';
import moment from 'moment';

// 订单销量
const Sales: React.FC<{
  common: any;
}> = ({ common }) => {
  const actionRef = useRef<ActionType>();
  const [exportForm, setExportForm] = useState<any>({});
  // 获取表格数据
  const requestTableData = async (params: any): Promise<any> => {
    if(!params?.purchaseDate[0] || !params?.purchaseDate[1]) {
      pubMsg('请选择下单时间区间')
      return {
        data: [],
        success: false,
        total: 0,
      };
    };
    const postData = {
      ...params,
      pageIndex: params?.current,
    };
    const res = await getList(postData);
    setExportForm(postData);
    if (res?.code != pubConfig.sCode) {
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
        hideInSearch: true,
      },
      {
        title: '亚马逊订单号',
        dataIndex: 'amazonOrderId',
        width: 100,
      },
      {
        title: '卖家订单号',
        dataIndex: 'sellerOrderId',
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
        dataIndex: 'quantityOrdered',
        hideInSearch: true,
        align: 'center',
      },
      {
        title: (
          <>
            订单金额 <br />
            (原币种)
          </>
        ),
        dataIndex: 'itemPriceAmount',
        align: 'right',
        hideInSearch: true,
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
        align: 'center',
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
        dataIndex: 'itemPriceAmountUsd',
        align: 'right',
        hideInSearch: true,
      },
      {
        title: '销售渠道',
        dataIndex: 'salesChannel',
        align: 'center',
      },
      {
        title: '下单时间',
        dataIndex: 'purchaseDate',
        align: 'center',
        valueType: 'dateRange',
        initialValue: [moment().add(-3, 'M'), moment()],
        renderFormItem: () => <NewDatePicker />,
        render: (_, record) => record.purchaseDate,
        width: 128
      },
      {
        title: '最后更新时间',
        dataIndex: 'lastUpdateTime',
        align: 'center',
        hideInSearch: true,
        width: 128
      },
      {
        title: '结算日期',
        dataIndex: 'postedDate',
        align: 'center',
        hideInSearch: true,
        width: 128
      },
    ],
    [common],
  );
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1300, 'sales');
  return (
    <ProTable
      actionRef={actionRef}
      rowKey="id"
      dateFormatter="string"
      pagination={{
        showSizeChanger: true,
      }}
      sticky={{ offsetHeader: 48 }}
      {...ColumnSet}
      showSorterTooltip={false}
      request={requestTableData}
      columns={columns}
      search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
      toolBarRender={() => [
        <Space key="space">
            <ExportBtn
              exportHandle={exportExcel}
              exportForm={{
                ...exportForm,
                exportConfig: { columns: ColumnSet.customExportConfig },
              }}
            />
        </Space>,
      ]}
    />
  );
};
export default Sales;

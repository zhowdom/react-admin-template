import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetStoreList } from '@/utils/pubConfirm';
import {
  exportExcel,
  getList,
} from '@/services/pages/SCM_SALES_IN_Manage/orderList/amazonListRefund';
import { Space } from 'antd';
import { useAccess } from 'umi';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import ExportBtn from '@/components/ExportBtn';
import moment from 'moment';
// 退货报告
const Refund: React.FC<{
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
      title: '原订单号',
      dataIndex: 'orderId',
      width: 156,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      width: 126,
    },
    {
      title: 'FNSKU',
      dataIndex: 'fnsku',
      hideInSearch: true,
      width: 126,
    },
    {
      title: '退货数量',
      dataIndex: 'quantity',
      align: 'right',
      hideInSearch: true,
    },
    {
      title: '运营中心',
      dataIndex: 'fulfillmentCenterId',
      hideInSearch: true,
    },
    {
      title: '原因',
      dataIndex: 'reasonName',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '退货描述',
      dataIndex: 'customerComments',
      ellipsis: true,
      width: 160,
      hideInSearch: true,
    },
    {
      title: '退货时间(当地)',
      dataIndex: 'returnedDate',
      align: 'center',
      valueType: 'dateRange',
      width: 146,
      render: (_: any, record: any) => record.returnedDate,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          returnedDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          returnedDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
    {
      title: '退货时间(0时区)',
      dataIndex: 'utcReturnedDate',
      align: 'center',
      valueType: 'dateRange',
      width: 146,
      render: (_: any, record: any) => record.utcReturnedDate,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          utcReturnedDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          utcReturnedDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
    {
      title: '下单时间(当地)',
      dataIndex: 'originalPurchaseDate',
      align: 'center',
      valueType: 'dateRange',
      width: 146,
      render: (_: any, record: any) => record.originalPurchaseDate,
      initialValue: [moment().subtract(1, 'months'), moment()],
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          originalPurchaseDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          originalPurchaseDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
    {
      title: '下单时间(0时区)',
      dataIndex: 'utcOriginalPurchaseDate',
      align: 'center',
      valueType: 'dateRange',
      width: 146,
      render: (_: any, record: any) => record.utcOriginalPurchaseDate,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          utcOriginalPurchaseDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          utcOriginalPurchaseDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1400, 'refund', undefined, ['utcReturnedDate','utcOriginalPurchaseDate']);
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
          {access.canSee('liyi99-report_order-refund-amazon-export') ? (
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

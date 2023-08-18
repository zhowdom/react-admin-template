import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetStoreList } from '@/utils/pubConfirm';
import {
  exportExcel,
  getList,
} from '@/services/pages/SCM_SALES_IN_Manage/orderList/amazonListReplaces';
import { Space } from 'antd';
import { useAccess } from 'umi';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import ExportBtn from '@/components/ExportBtn';
import moment from 'moment';
// 换货报告
const Replaces: React.FC<{
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
      title: '换货新订单号',
      dataIndex: 'replacementAmazonOrderId',
    },
    {
      title: '原订单号',
      dataIndex: 'originalAmazonOrderId',
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
      title: '补发运营中心',
      dataIndex: 'fulfillmentCenterId',
      hideInSearch: true,
    },
    {
      title: '原单运营中心',
      dataIndex: 'originalFulfillmentCenterId',
      hideInSearch: true,
    },
    {
      title: '换货原因',
      dataIndex: 'replacementReasonName',
      hideInSearch: true,
    },
    {
      title: '换货单下单时间(当地)',
      dataIndex: 'replacementPurchaseDate',
      align: 'center',
      valueType: 'dateRange',
      render: (_, record) => record.replacementPurchaseDate || '-',
      initialValue: [moment().subtract(1, 'months'), moment()],
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          replacementPurchaseDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          replacementPurchaseDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
      width: 128
    },
    {
      title: '换货单下单时间(0时区)',
      dataIndex: 'utcReplacementPurchaseDate',
      align: 'center',
      valueType: 'dateRange',
      render: (_, record) => record.utcReplacementPurchaseDate || '-',
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          utcReplacementPurchaseDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          utcReplacementPurchaseDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
    {
      title: '换货单发货时间(当地)',
      dataIndex: 'shipmentDate',
      align: 'center',
      valueType: 'dateRange',
      renderFormItem: () => <NewDatePicker />,
      render: (_, record) => record.shipmentDate || '-',
      search: {
        transform: (value: any) => ({
          shipmentDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          shipmentDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
      width: 128
    },
    {
      title: '换货单发货时间(0时区)',
      dataIndex: 'utcShipmentDate',
      align: 'center',
      valueType: 'dateRange',
      renderFormItem: () => <NewDatePicker />,
      render: (_, record) => record.utcShipmentDate || '-',
      search: {
        transform: (value: any) => ({
          utcShipmentDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          utcShipmentDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
    },
    {
      title: '原订单下单时间(当地)',
      dataIndex: 'originalPurchaseDate',
      align: 'center',
      valueType: 'dateRange',
      renderFormItem: () => <NewDatePicker />,
      render: (_, record) => record.originalPurchaseDate || '-',
      search: {
        transform: (value: any) => ({
          originalPurchaseDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          originalPurchaseDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
      width: 128
    },
    {
      title: '原订单下单时间(0时区)',
      dataIndex: 'utcOriginalPurchaseDate',
      align: 'center',
      valueType: 'dateRange',
      renderFormItem: () => <NewDatePicker />,
      render: (_, record) => record.utcOriginalPurchaseDate || '-',
      search: {
        transform: (value: any) => ({
          utcOriginalPurchaseDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          utcOriginalPurchaseDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
      width: 128
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1200, 'replace', undefined, ['utcReplacementPurchaseDate','utcShipmentDate','utcOriginalPurchaseDate']);

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
          {access.canSee('liyi99-report_order-replaces-amazon-export') ? (
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
export default Replaces;

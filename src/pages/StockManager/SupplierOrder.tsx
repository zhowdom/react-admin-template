/*货件关联采购单信息*/
import React from 'react';
import * as api from '@/services/pages/stockManager';
import ProTable from '@ant-design/pro-table';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const SupplierOrder: React.FC<{
  dataSource: any;
}> = ({ dataSource }) => {
  return (
    <ProTable
      size={'small'}
      bordered
      rowKey={'id'}
      pagination={false}
      search={false}
      toolBarRender={false}
      columns={[
        {
          title: '供应商',
          dataIndex: 'vendor_name',
          width: 120,
          onCell: (record: any) => {
            return { rowSpan: record.skuPurchaseOrderList?.length || 0 };
          },
        },
        {
          title: '供应商代码',
          dataIndex: 'vendor_code',
          align: 'center',
          width: 90,
          onCell: (record: any) => {
            return { rowSpan: record.skuPurchaseOrderList?.length || 0 };
          },
        },
        {
          title: '商品名称',
          dataIndex: 'sku_name',
          width: 120,
          onCell: (record: any) => {
            return { rowSpan: record.orderDetails?.length || 0 };
          },
        },
        {
          title: 'SKU',
          dataIndex: 'shop_sku_code',
          align: 'center',
          width: 100,
          onCell: (record: any) => {
            return { rowSpan: record.orderDetails?.length || 0 };
          },
        },
        {
          title: '单据类型',
          dataIndex: 'type',
          align: 'center',
          width: 100,
          valueEnum: {
            1: { text: '采购单' },
            2: { text: '维修单' },
          },
          onCell: () => ({ colSpan: 3, style: { padding: 0 } }),
          render: (_: any, record: any) => (
            <ProTable
              size={'small'}
              bordered
              rowKey={'id'}
              pagination={false}
              search={false}
              toolBarRender={false}
              showHeader={false}
              columns={[
                {
                  title: '单据类型',
                  dataIndex: 'type',
                  align: 'center',
                  width: 100,
                  valueEnum: {
                    1: { text: '采购单' },
                    2: { text: '维修单' },
                  },
                },
                {
                  title: '单号',
                  dataIndex: 'p_order_no',
                  align: 'center',
                  width: 110,
                },
                {
                  title: '扣减数量',
                  dataIndex: 'actual_num',
                  align: 'right',
                  width: 100,
                },
              ]}
              dataSource={record.orderDetails}
            />
          ),
        },
        {
          title: '单号',
          dataIndex: 'p_order_no',
          align: 'center',
          width: 110,
          onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
        },
        {
          title: '扣减数量',
          dataIndex: 'actual_num',
          align: 'right',
          width: 100,
          onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
        },
      ]}
      request={async () => {
        const res = await api.findActualDeductionQty({ id: dataSource.id });
        if (res.code != pubConfig.sCode) {
          pubMsg('获取关联采购单信息失败');
          return [];
        }
        const data: any = [];
        /*合并行需要过滤数据*/
        res.data.forEach((item: any) => {
          if (item.skuPurchaseOrderList && item.skuPurchaseOrderList.length) {
            data.push({ ...item, ...item.skuPurchaseOrderList[0] });
            item.skuPurchaseOrderList.forEach((order: any, i: number) => {
              if (i) data.push(order);
            });
          } else {
            data.push({ ...item });
          }
        });
        return {
          success: true,
          data,
        };
      }}
    />
  );
};
export default SupplierOrder;

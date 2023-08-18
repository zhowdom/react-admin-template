import React from 'react';
import ProTable from '@ant-design/pro-table';
import { history } from 'umi';
import type { ProColumns } from '@ant-design/pro-table';
import { getList } from '@/services/pages/shipment/warehousecN';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

type DataSourceType = {
  id?: React.Key;
  sku_name?: string;
  sys_files?: any[];
  project_price?: number;
  tempId: any;
  ref1: any;
};

const CloudCangTable = (props: any) => {
  const fileColumns: ProColumns<DataSourceType>[] = [
    {
      title: '款式属性',
      dataIndex: 'sku_attribute',
      align: 'center',
      width: 200,
      hideInTable:
        props.approval_status > 5 &&
        history?.location?.pathname.indexOf('/finalize-detail-edit') == -1,
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      hideInTable: !(
        props.approval_status > 5 &&
        history?.location?.pathname.indexOf('/finalize-detail-edit') == -1
      ),
      width: 120,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'center',
      hideInTable: !(
        props.approval_status > 5 &&
        history?.location?.pathname.indexOf('/finalize-detail-edit') == -1
      ),
      width: 120,
    },

    {
      title: '发货仓',
      dataIndex: 'cloud_warehouse_id',
      valueType: 'select',
      align: 'center',
      width: 120,
      request: async () => {
        const res: any = await getList({
          current_page: 1,
          page_size: '99999',
          platform_code: 'QIMEN_YUNCANG',
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return [];
        }
        const newArray = res?.data?.records
          .map((v: any) => {
            return {
              value: v.id,
              label: v.warehouse_name + '(' + v.warehouse_code + ')',
              name: v.warehouse_name,
              disabled: v.status != 1,
              data: v,
              status: v.status,
            };
          })
          .sort((a: any, b: any) => b.status - a.status);
        return newArray;
      },
    },
    {
      title: '退货仓',
      dataIndex: 'return_cloud_warehouse_id',
      valueType: 'select',
      align: 'center',
      width: 120,
      request: async () => {
        const res: any = await getList({
          current_page: 1,
          page_size: '99999',
          platform_code: 'QIMEN_YUNCANG',
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return [];
        }
        const newArray = res?.data?.records
          .map((v: any) => {
            return {
              value: v.id,
              label: v.warehouse_name + '(' + v.warehouse_code + ')',
              name: v.warehouse_name,
              disabled: v.status != 1,
              data: v,
              status: v.status,
            };
          })
          .sort((a: any, b: any) => b.status - a.status);
        return newArray;
      },
    },
  ];
  return (
    <ProTable<any>
      columns={fileColumns}
      search={false}
      bordered
      options={false}
      pagination={false}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      dataSource={props?.defaultData}
      rowKey="id"
      dateFormatter="string"
      className="p-table-0"
      style={{ width: '100%' }}
      headerTitle={false}
    />
  );
};
export default CloudCangTable;

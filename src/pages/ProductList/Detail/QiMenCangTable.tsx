import React, { useState, useEffect } from 'react';
import type { ProColumns } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
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
  console.log(props, 'props');
  // 设置选中的表格key
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  // 设置表格数据
  const fileColumns: ProColumns<DataSourceType>[] = [
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      width: 100,
      editable: false,
    },
    {
      title: 'ERP编码',
      dataIndex: 'erp_sku',
      align: 'center',
      width: 100,
      editable: false,
    },
    {
      title: '款式名称',
      dataIndex: 'old_sku_name',
      render: (_: any, record: any) => {
        return props?.disable
          ? record.sku_name
          : `${props?.productName}${record?.sku_name?.sku_form ?? '-'}${
              record?.sku_name?.sku_spec ?? '-'
            }`;
      },
      align: 'center',
      width: 120,
      editable: false,
    },

    {
      title: '发货仓',
      dataIndex: 'cloud_warehouse_id',
      valueType: 'select',
      align: 'center',
      width: 120,
      formItemProps: {
        rules: [{ required: true, message: '请选择发货仓' }],
      },
      fieldProps: {
        showSearch: true,
        filterOption: (input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        },
      },
      params: { platform_code: props?.platform_code },
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
      fieldProps: {
        showSearch: true,
        filterOption: (input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        },
      },
      params: { platform_code: props?.platform_code },
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
  useEffect(() => {
    const data = props.formRef.current.getFieldValue('projectsQiMenCloudCangData');
    setEditableRowKeys(data?.map((k: any) => k.id));
    setDataSource(data);
  }, [props]);
  return (
    <>
      <EditableProTable<DataSourceType>
        columns={fileColumns}
        className="p-table-0"
        rowKey="id"
        value={dataSource}
        bordered
        recordCreatorProps={false}
        editable={{
          type: 'multiple',
          editableKeys: props?.disable ? [] : editableKeys,
          form: props.form,
          onValuesChange: (record: any, recordList) => {
            props?.formRef?.current?.setFieldsValue({
              projectsQiMenCloudCangData: recordList,
              goodsSkus: props?.formRef?.current?.getFieldValue('goodsSkus').map((v: any) => ({
                ...v,
                cloud_warehouse_id:
                  record.id == v.id ? record.cloud_warehouse_id : v.cloud_warehouse_id,
                return_cloud_warehouse_id:
                  record.id == v.id
                    ? record.return_cloud_warehouse_id
                    : v.return_cloud_warehouse_id,
              })),
            });
          },
          onChange: (editableKeyss) => {
            setEditableRowKeys(editableKeyss);
          },
        }}
      />
    </>
  );
};
export default CloudCangTable;

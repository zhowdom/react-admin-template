import { Modal } from 'antd';
import { EditableProTable, ProFormSelect, ProFormText, ProForm } from '@ant-design/pro-components';
import type { ProColumns, ActionType, EditableFormInstance } from '@ant-design/pro-components';
import {
  findPartsVendorAllByGoodsId,
  updatePartsGoodsSkuVendor,
  insertPartsGoodsSkuVendor,
} from '@/services/pages/partsProduct';
import { useRef, useState } from 'react';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { findCategoryToValidVendor } from '@/services/pages/cooperateProduct';

// 包邮配置
const Shipment: React.FC<{
  dicList: any;
  value?: any[]; // ['free_shipping', free_shipping_region]:[是否包邮, 包邮区域]
  onChange?: any;
  record: any;
}> = ({ onChange, dicList, record }) => {
  const free_shipping = Array.isArray(record?.free_shipping)
    ? record.free_shipping[0]
    : record.free_shipping;
  const [data, dataSet] = useState<any[]>([free_shipping || '1', record.free_shipping_region]);
  return (
    <ProForm.Group>
      <ProFormSelect
        name={'free_shipping'}
        valueEnum={dicList?.PROJECTS_PRICE_FREE_SHIPPING || {}}
        ignoreFormItem
        fieldProps={{
          value: data[0] + '',
          allowClear: false,
          onSelect: (val: any) => {
            let temp = [val, data[1]];
            // 不包邮: 1  包邮: 2
            if (val == 1) {
              temp = [val, ''];
            }
            dataSet(temp);
            onChange(temp);
          },
        }}
      />
      {data[0] == 2 ? (
        <ProFormText
          placeholder={'填写包邮区域用,分隔'}
          name={'free_shipping_region'}
          ignoreFormItem
          fieldProps={{
            value: data[1],
            onChange: (e: any) => {
              const temp = [data[0], e.target?.value];
              dataSet(temp);
              onChange(temp);
            },
          }}
        />
      ) : null}
    </ProForm.Group>
  );
};

const VendorSet: React.FC<{
  open: boolean;
  openSet: any;
  dicList: any;
  selectedRow: any;
}> = ({ open, openSet, dicList, selectedRow }) => {
  const actionRef = useRef<ActionType>();
  const editableFormRef = useRef<EditableFormInstance>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [goods_sku_id, goods_sku_idSet] = useState<string>('');
  const [editableRow, editableRowSet] = useState<any>(null);
  const [isEdit, isEditSet] = useState<boolean>(false);
  const columns: ProColumns<any>[] = [
    {
      title: '配件名',
      dataIndex: 'goods_sku_id',
      valueType: 'select',
      formItemProps: {
        rules: [pubRequiredRule],
      },
      fieldProps: (_, { rowIndex }) => {
        return {
          allowClear: false,
          showSearch: true,
          onSelect: (val: any) => {
            goods_sku_idSet(val);
            editableFormRef.current?.setRowData?.(rowIndex, {
              vendor_id: '',
              vendor_name: '',
            });
          },
        };
      },
      params: { id: selectedRow?.id },
      request: async () => {
        return (
          selectedRow?.goodsSkus.map((item: any) => ({ label: item.sku_name, value: item.id })) ||
          []
        );
      },
      render: (_, record: any) => record.sku_name,
      editable: isEdit ? false : undefined,
    },
    {
      title: '供应商名称',
      dataIndex: 'vendor_id',
      valueType: 'select',
      fieldProps: (_, { rowIndex }) => {
        return {
          allowClear: false,
          showSearch: true,
          onSelect: (val: any, option: any) => {
            editableFormRef.current?.setRowData?.(rowIndex, {
              vendor_id: val,
              vendor_name: option?.label,
            });
          },
        };
      },
      formItemProps: {
        rules: [pubRequiredRule],
      },
      params: { goods_sku_id: goods_sku_id || editableRow?.goods_sku_id },
      render: (_, record: any) => record.vendor_name,
      request: async (params) => {
        if (!params?.goods_sku_id) return;
        const res = await findCategoryToValidVendor(params);
        if (res?.code != pubConfig.sCode) {
          return [];
        }
        return res.data.map((item: any) => {
          item.goodsSkus = item.goodsSkus.map((v: any) => ({
            ...v,
            currency: item.currency,
          }));
          return {
            label: item.vendor_name,
            value: item.vendor_id,
            data: item,
            // disabled: item.is_existed_vendor,
          };
        });
      },
      editable: isEdit ? false : undefined,
    },
    {
      title: '合作状态', // 供应商合作状态
      dataIndex: 'vendor_status',
      valueEnum: dicList?.VENDOR_COOPERATION_STATUS || {},
      width: 100,
      editable: false,
    },
    {
      title: '采购价',
      dataIndex: 'price',
      valueType: 'digit',
      formItemProps: {
        rules: [pubRequiredRule],
      },
      fieldProps: {
        min: 0,
        controls: false,
        precision: 2,
      },
      width: 100,
    },
    {
      title: '包邮区域',
      dataIndex: 'free_shipping',
      ellipsis: true,
      width: 210,
      renderFormItem: (_, { record }: any) => (
        <Shipment dicList={dicList} record={record} value={[2, '333']} />
      ),
      render: (_, record) =>
        record.free_shipping == 1 ? '不包邮' : record?.free_shipping_region || '-',
    },
    {
      title: '交期',
      dataIndex: 'delivery_day',
      valueType: 'digit',
      formItemProps: {
        rules: [pubRequiredRule],
      },
      fieldProps: {
        min: 0,
        controls: false,
        precision: 0,
      },
      width: 100,
    },
    {
      title: '采购状态',
      dataIndex: 'purchase_status',
      valueEnum: dicList?.GOODS_SKU_PURCHASE_STATUS || {},
      editable: false,
      width: 100,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      align: 'center',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            editableRowSet(record);
            isEditSet(true);
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];
  return (
    <>
      <Modal
        style={{ top: 20 }}
        width={1400}
        title={'供应商设置'}
        open={open}
        onCancel={() => {
          setEditableRowKeys([]);
          editableRowSet(null);
          openSet(false);
        }}
        destroyOnClose={true}
        footer={null}
      >
        <EditableProTable
          rowKey={'id'}
          size={'small'}
          bordered
          editableFormRef={editableFormRef}
          actionRef={actionRef}
          columns={columns}
          request={async () => {
            const res = await findPartsVendorAllByGoodsId({ goods_id: selectedRow.id });
            if (res?.code == pubConfig.sCode) {
              return { data: res.data, success: true };
            }
            pubMsg(res.message);
            return [];
          }}
          recordCreatorProps={{
            creatorButtonText: '添加供应商',
            onClick: () => isEditSet(false),
            record: () => {
              return { id: Date.now() };
            },
          }}
          editable={{
            editableKeys,
            onSave: async (rowKey, data) => {
              const postData: any = {
                id: '', //供应商配件商品id
                vendor_id: data.vendor_id,
                vendor_name: data.vendor_name,
                goods_sku_id: data.goods_sku_id,
                price: data.price,
                delivery_day: data.delivery_day,
                free_shipping: Array.isArray(data?.free_shipping) ? data?.free_shipping[0] : 2, // 默认不包邮
                free_shipping_region: Array.isArray(data?.free_shipping)
                  ? data?.free_shipping[1]
                  : '',
              };
              let api = insertPartsGoodsSkuVendor;
              // is Edit
              if (editableRow?.id) {
                api = updatePartsGoodsSkuVendor;
                postData.id = editableRow?.id;
              } else {
                delete postData.id;
              }
              console.log(postData, 'post data');
              const res = await api(postData);
              if (res && res.code == pubConfig.sCode) {
                editableRowSet(null);
                pubMsg(res.message, 'success');
              } else {
                pubMsg(res.message);
              }
              actionRef.current?.reload();
            },
            onChange: setEditableRowKeys,
            actionRender: (row, config, dom) => [dom.save, dom.cancel],
          }}
        />
      </Modal>
    </>
  );
};
export default VendorSet;

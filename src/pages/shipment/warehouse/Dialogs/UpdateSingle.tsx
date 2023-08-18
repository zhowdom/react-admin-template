import {
  ProFormSelect,
  ModalForm,
  ProFormRadio,
  ProFormDependency,
} from '@ant-design/pro-components';
import { useEffect, useRef, useState, useMemo } from 'react';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import {
  orderDeliveryGoodSkuWarehouseInset,
  orderDeliveryGoodSkuWarehouseUpdate,
} from '@/services/pages/shipment';
import { optionsDeliveryWarehouse } from '../index';
import type { ProFormInstance } from '@ant-design/pro-components';
import { findCategoryToValidVendor } from '@/services/pages/cooperateProduct';

// 单个添加发货仓
const Component: React.FC<{
  open: boolean;
  openSet: any;
  reload: any;
  dicList: any;
  initialValues?: Record<string, any>;
  warehouse: Record<string, any>[];
  warehouseSet: any;
  deleteItem: any;
  goods_sku_id?: string;
}> = ({ dicList, reload, open = false, openSet, initialValues, goods_sku_id, warehouse }) => {
  const formRef: any = useRef<ProFormInstance>();
  const [optionsWarehouse, optionsWarehouseSet] = useState<any[]>([]);
  useEffect(() => {
    if (initialValues?.platform_code) {
      optionsDeliveryWarehouse({ platform_code: initialValues?.platform_code }).then((res) =>
        optionsWarehouseSet(res),
      );
    } else {
      optionsWarehouseSet([]);
    }
  }, [initialValues]);
  const optionsWarehouseFormat = useMemo(
    () =>
      optionsWarehouse.map((o) => ({
        ...o,
        disabled: o.disabled || warehouse.find((w) => w.delivery_warehouse_id == o.value),
      })),
    [optionsWarehouse, warehouse],
  );
  return (
    <ModalForm
      title={initialValues?.id ? '编辑 - 仓库' : '添加 - 仓库'}
      visible={open}
      onVisibleChange={openSet}
      labelAlign="right"
      labelCol={{ flex: '0 0 120px' }}
      layout="horizontal"
      width={initialValues?.id ? 430 : 600}
      formRef={formRef}
      modalProps={{
        destroyOnClose: true,
      }}
      initialValues={initialValues}
      onFinish={async (values) => {
        let api = orderDeliveryGoodSkuWarehouseInset;
        if (initialValues?.id) {
          values.id = initialValues.id;
          api = orderDeliveryGoodSkuWarehouseUpdate;
        }
        values.goods_sku_id = goods_sku_id;
        const res = await api(values);
        if (res?.code == pubConfig.sCode) {
          optionsWarehouseSet([]);
          pubMsg(res?.message, 'success');
          if (reload) {
            reload(res?.data || {});
          }
          return true;
        }
        pubMsg(res?.message);
        return false;
      }}
    >
      <ProFormRadio.Group
        label="发货平台"
        name={'platform_code'}
        radioType={'button'}
        valueEnum={dicList?.ORDER_DELIVERY_WAREHOUSE || {}}
        rules={[pubRequiredRule]}
        readonly={!!initialValues?.id}
        fieldProps={{
          onChange: async (e) => {
            formRef.current?.setFieldsValue({
              delivery_warehouse_id: null,
              delivery_warehouse_name: '',
              return_warehouse_id: null,
              return_warehouse_name: '',
            });
            const res = await optionsDeliveryWarehouse({ platform_code: e.target.value });
            if (res) optionsWarehouseSet(res);
          },
        }}
      />
      <ProFormDependency name={['platform_code']}>
        {({ platform_code }) => {
          if (platform_code) {
            return (
              <>
                {platform_code == 'VENDOR' ? (
                  <ProFormSelect
                    label={'供应商'}
                    name={'delivery_warehouse_id'}
                    rules={[pubRequiredRule]}
                    readonly={!!initialValues?.id}
                    fieldProps={{
                      labelInValue: true,
                      showSearch: true,
                    }}
                    request={async (params) => {
                      const res = await findCategoryToValidVendor({ ...params, goods_sku_id });
                      if (res?.code == pubConfig.sCode) {
                        return res.data.map((item: any) => ({
                          label: item.vendor_name,
                          value: item.vendor_id,
                          disabled:
                            item.disabled ||
                            warehouse.find((w: any) => w.delivery_warehouse_id == item.vendor_id),
                        }));
                      }
                      return [];
                    }}
                    transform={(val) => {
                      return {
                        delivery_warehouse_id: val?.value,
                        delivery_warehouse_name: val?.label,
                      };
                    }}
                  />
                ) : (
                  <ProFormSelect
                    label={'发货仓库'}
                    name={'delivery_warehouse_id'}
                    rules={[pubRequiredRule]}
                    readonly={!!initialValues?.id}
                    fieldProps={{
                      labelInValue: true,
                      options: optionsWarehouseFormat,
                    }}
                    transform={(val) => {
                      return {
                        delivery_warehouse_id: val?.value,
                        delivery_warehouse_name: val?.label,
                      };
                    }}
                  />
                )}
                {platform_code == 'YUNCANG' ? (
                  <ProFormSelect
                    label={'退货仓库'}
                    name={'return_warehouse_id'}
                    fieldProps={{
                      labelInValue: true,
                      options: optionsWarehouse,
                    }}
                    transform={(val) => {
                      return {
                        return_warehouse_id: val?.value,
                        return_warehouse_name: val?.label,
                      };
                    }}
                  />
                ) : null}
              </>
            );
          }
          return null;
        }}
      </ProFormDependency>
      <ProFormSelect
        label={'打包策略'}
        name={'package_strategy'}
        valueEnum={dicList?.ORDER_DELIVERY_PACKAGE_STRATEGY || {}}
        convertValue={(val) => (val ? val + '' : '')}
        rules={[pubRequiredRule]}
      />
    </ModalForm>
  );
};
export default Component;

import React, { useState, useRef } from 'react';
import { ModalForm, ProFormSelect, ProFormText, ProFormInstance } from '@ant-design/pro-components';
import { singleOrBatchSetStore } from '@/services/pages/shipment/warehousecN';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

// 设置发货仓设置
const Dialog: React.FC<{ data: any; reload: any; dicList: any; QIMEN_YUNCANG_MAP: any; YUNCANG_MAP: any }> = ({ data, reload, dicList, QIMEN_YUNCANG_MAP, YUNCANG_MAP }: any) => {
  const [send_kind_selected, setSend_kind_selected] = useState<any>(data.send_kind)
  const formRef = useRef<ProFormInstance>();

  const requiredRule = { required: true, message: '必填项' };
  const handleSendKind = (val: any) => {
    setSend_kind_selected(val);
    if (val == 5 || val == 6) {
      formRef.current?.setFieldsValue({
        cloud_warehouse_id: '',
        return_cloud_warehouse_id: '',
      });
    }
  }

  return (
    <ModalForm
      title={'发货仓设置'}
      trigger={<a>发货仓设置</a>}
      width={500}
      layout={'horizontal'}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 18 }}
      formRef={formRef}
      onOpenChange={async (visible: boolean) => {
        if (visible) {
          setTimeout(() => {
            formRef.current?.setFieldsValue({
              sku_id: data?.id,
              send_kind: data?.send_kind,
              cloud_warehouse_id: data?.cloud_warehouse_id,
              return_cloud_warehouse_id: data?.return_cloud_warehouse_id,
            });
            setSend_kind_selected(data?.send_kind)
          }, 200)
        }
      }}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false
      }}
      onFinish={async (values) => {
        const res: any = await singleOrBatchSetStore({
          goodsSkuChangeList: [values]
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false
        } else {
          pubMsg('操作成功', 'success');
          if (typeof reload) reload();
          // formRef.current?.resetFields();
          return true
        }
      }}
    >
      <ProFormText label={'商品名称'} initialValue={data.sku_name} readonly >{data.sku_name}</ProFormText>
      <ProFormText name={'sku_id'} noStyle hidden />
      <ProFormSelect
        label={'配送方式'}
        name={'send_kind'}
        rules={[requiredRule]}
        fieldProps={{
          showSearch: true,
          onChange: async (val: any) => {
            handleSendKind(val)
          }
        }}
        valueEnum={dicList?.SYS_SEND_KIND}
      />
      {
        send_kind_selected == 5 || send_kind_selected == 6 ? (
          <>
            <ProFormSelect
              label={'发货仓'}
              name={'cloud_warehouse_id'}
              rules={send_kind_selected == 5 || send_kind_selected == 6 ? [requiredRule] : []}
              fieldProps={{
                showSearch: true,
              }}
              options={send_kind_selected == 5 ? YUNCANG_MAP : (send_kind_selected == 6 ? QIMEN_YUNCANG_MAP : [])}
            />
            <ProFormSelect
              label={'退货仓'}
              name={'return_cloud_warehouse_id'}
              rules={send_kind_selected == 5 || send_kind_selected == 6 ? [requiredRule] : []}
              fieldProps={{ showSearch: true }}
              options={send_kind_selected == 5 ? YUNCANG_MAP : (send_kind_selected == 6 ? QIMEN_YUNCANG_MAP : [])}
            />
          </>
        ) : ''
      }

    </ModalForm>
  );
};

export default Dialog
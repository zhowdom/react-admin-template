import { EditableProTable, ProFormText } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { useState } from 'react';
import { goodsSkuFindById, updateDeliveryDay } from '@/services/pages/cooperateProduct';
// 修改供应商交期
const UpdateDeliveryDay: React.FC<{
  title?: string;
  trigger?: React.ReactElement;
  id: string;
}> = ({ title, trigger, id }) => {
  const [editableKeys, editableKeysSet] = useState([]);
  // 获取商品详情
  const getData = async () => {
    const res = await goodsSkuFindById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return {};
    }
    editableKeysSet(res.data.skuVendorsList.map((item: any) => item.id));
    return res.data;
  };
  return (
    <ModalForm
      title={title || '修改交期'}
      trigger={trigger || <a>修改交期</a>}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      grid
      request={getData}
      onFinish={async (values: any) => {
        // console.log(values, 'values');
        const res = await updateDeliveryDay(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '更新成功!', 'success');
        return true;
      }}
    >
      <ProFormText readonly label={'商品名称'} name={'sku_name'} />
      <EditableProTable
        name={'skuVendorsList'}
        bordered
        size="small"
        rowKey="id"
        editable={{
          editableKeys,
        }}
        recordCreatorProps={false}
        columns={[
          {
            title: '供应商',
            dataIndex: 'vendor_name',
            align: 'center',
            editable: false,
          },
          {
            title: '修改前交期 / 天',
            dataIndex: 'delivery_day',
            align: 'center',
            editable: false,
          },
          {
            title: '修改后交期 / 天',
            dataIndex: 'new_delivery_day',
            align: 'center',
            valueType: 'digit',
            formItemProps: {
              rules: [pubRequiredRule],
            },
            fieldProps: {
              precision: 0,
              min: 1,
            },
          },
        ]}
      />
    </ModalForm>
  );
};
export default UpdateDeliveryDay;

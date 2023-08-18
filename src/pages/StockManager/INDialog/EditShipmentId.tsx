import { ModalForm, ProFormText } from '@ant-design/pro-form';
import './index.less';

import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { updateShipmentId } from '@/services/pages/stockManager';

export default (props: any) => {
  const { shipment_id, id } = props;
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="修改货件号"
      trigger={<a>修改货件号</a>}
      className="item10"
      labelAlign="right"
      labelCol={{ flex: '150px' }}
      wrapperCol={{ span: 16 }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      initialValues={{
        shipment_id,
      }}
      width={520}
      onFinish={async (values: any) => {
        console.log(values);

        const res = await updateShipmentId({
          shipment_id: values?.shipment_id,
          order_id: id,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('修改成功!', 'success');
          props.reload();
          return true;
        }
      }}
    >
      <ProFormText label={'货件号(Shipment ID)'} name={'shipment_id'} rules={[pubRequiredRule]} />
    </ModalForm>
  );
};

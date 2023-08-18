import { Modal } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useRef } from 'react';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { update } from '@/services/pages/SettingManage';

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  initialValues?: any;
}> = ({ trigger, reload, initialValues }) => {
  const formRef = useRef<ProFormInstance>();

  return (
    <ModalForm
      title={'修改标签名'}
      trigger={trigger || <a type="primary">修改标签名</a>}
      labelAlign="right"
      labelCol={{ flex: '0 0 70px' }}
      layout="horizontal"
      width={500}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        const postData = {
          ...values,
        };
        const res = await update(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '操作成功', 'success');
        if (reload) reload();
        return true;
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
      initialValues={initialValues}
    >
      <ProFormText name="id" label="id" hidden />
      <ProFormText
        colProps={{ span: 24 }}
        name="labelName"
        label="标签名"
        fieldProps={{ maxLength: 20 }}
        rules={[pubRequiredRule]}
      />
      <ProFormTextArea
        colProps={{ span: 24 }}
        label={'描述'}
        name={'remark'}
        fieldProps={{ maxLength: 200 }}
      />
    </ModalForm>
  );
};
export default Component;

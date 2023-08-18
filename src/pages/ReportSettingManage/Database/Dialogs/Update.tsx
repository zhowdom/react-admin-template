import { useRef } from 'react';
import { Button, message, Modal } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { insert } from '@/services/pages/database';

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
}> = ({ title, trigger, reload }) => {
  const formRef = useRef<ProFormInstance>();

  return (
    <ModalForm
      title={title || '新增 - 数据库 '}
      trigger={trigger || <Button type="primary">新增</Button>}
      labelAlign="right"
      labelCol={{ flex: '0 0 80px' }}
      layout="horizontal"
      width={600}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        const res = await insert(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        message.success(res?.message || '操作成功');
        reload();
        return true;
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
    >
      <ProFormText
        colProps={{ span: 12 }}
        name="database"
        label="名称"
        fieldProps={{ maxLength: 100 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 12 }}
        name="host"
        label="地址"
        fieldProps={{ maxLength: 100 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 12 }}
        name="port"
        label="端口"
        fieldProps={{ maxLength: 100 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 12 }}
        name="username"
        label="用户名"
        fieldProps={{ maxLength: 100 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 12 }}
        name="password"
        label="密码"
        fieldProps={{ maxLength: 100 }}
        rules={[pubRequiredRule]}
      />
      <ProFormTextArea
        colProps={{ span: 24 }}
        label={'备注'}
        placeholder={'请输入备注说明'}
        name={'remarks'}
        rules={[pubRequiredRule]}
      />
    </ModalForm>
  );
};
export default Component;

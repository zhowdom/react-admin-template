import { Button, Modal } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormRadio, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { tcInsert, tcUpdate } from '@/services/pages/storageManage';

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  dicList: any;
  initialValues?: any;
}> = ({ title, trigger, reload, initialValues }) => {
  const formRef = useRef<ProFormInstance>();

  return (
    <ModalForm
      title={title || '新增 - 中转仓 '}
      trigger={trigger || <Button type="primary">新增</Button>}
      labelAlign="right"
      labelCol={{ flex: '0 0 120px' }}
      layout="horizontal"
      width={688}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        let api = tcInsert;
        if (initialValues?.id) {
          values.id = initialValues.id;
          api = tcUpdate;
        }
        const res = await api(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '操作成功', 'success');
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
      initialValues={
        initialValues
          ? { ...initialValues, status: initialValues.status.toString() }
          : { status: '1' }
      }
    >
      <ProFormText
        colProps={{ span: 24 }}
        name="tc_name"
        label="TC(中转仓名称)"
        fieldProps={{ maxLength: 20 }}
        rules={[pubRequiredRule]}
      />
      <ProFormTextArea
        colProps={{ span: 24 }}
        label={'详细地址'}
        placeholder={'请输入中转仓地址'}
        name={'address'}
        fieldProps={{ maxLength: 200 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 24 }}
        name="contacts"
        label="联系人"
        fieldProps={{ maxLength: 20 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 24 }}
        name="phone"
        label="联系电话"
        fieldProps={{ maxLength: 16 }}
        rules={[pubRequiredRule]}
      />
      <ProFormRadio.Group
        colProps={{ span: 24 }}
        name="status"
        label="状态"
        rules={[pubRequiredRule]}
        options={[
          { label: '启用', value: '1' },
          { label: '禁用', value: '0' },
        ]}
      />
    </ModalForm>
  );
};
export default Component;

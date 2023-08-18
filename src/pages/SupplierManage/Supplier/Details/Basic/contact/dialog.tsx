import { useRef } from 'react';
import { Modal } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormSelect,ProFormRadio } from '@ant-design/pro-form';

const Dialog = (props: any) => {
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };
  const formRef = useRef<ProFormInstance>();
  const handleOk = () => {
    formRef?.current?.submit();
  };
  // 新增或修改联系人
  const updateForm = (values: any) => {
    const postData = {
      ...values,
      id: props.state.dialogForm?.id,
      tempId: props.state.dialogForm?.tempId,
    };
    props.updateTableAction(postData);
  };
  return (
    <Modal
      width={480}
      title={props.state.dialogForm?.id ? '编辑联系人' : '新增联系人'}
      visible={props.state.isModalVisible}
      onOk={handleOk}
      onCancel={props.handleClose}
      destroyOnClose
    >
      <ProForm
        formRef={formRef}
        onFinish={async (values) => {
          updateForm(values);
        }}
        labelAlign="left"
        {...formItemLayout}
        submitter={false}
        initialValues={props.state.dialogForm}
        layout="horizontal"
      >
        <ProFormText
          name="name"
          label="姓名"
          placeholder="请输入姓名"
          rules={[
            { required: true, message: '请输入姓名' },
            {
              pattern: /^(?=.*\S).+$/,
              message: '请输入姓名',
            },
          ]}
        />
        <ProFormSelect
          name="position"
          label="职位"
          placeholder="请选择职位"
          rules={[{ required: true, message: '请选择职位' }]}
          valueEnum={props?.dicList?.VENDOR_CONTACT_TYPE}
        />
        <ProFormText
          name="telephone"
          label="电话"
          placeholder="请输入电话"
          rules={[
            { required: true, message: '请输入电话' },
            { pattern: /^[1][3,4,5,7,8,9][0-9]{9}$/, message: '请输入正确格式手机号' },
          ]}
        />
        <ProFormText
          name="we_chat"
          label="微信"
          placeholder="请输入微信"
          rules={[{ pattern: /^[a-zA-Z][a-zA-Z\d_-]{5,19}$/, message: '请输入正确格式微信号' }]}
        />
        <ProFormText
          name="qq"
          label="QQ"
          placeholder="请输入QQ"
          rules={[{ pattern: /[1-9][0-9]{4,10}/, message: '请输入正确格式QQ号' }]}
        />
        <ProFormRadio.Group
          placeholder="请选择是否为默认联系人"
          rules={[{ required: true, message: '请选择是否为默认联系人' }]}
          valueEnum={props.dicList.SC_YES_NO}
          name="is_default"
          label="默认联系人"
          radioType="button"
          fieldProps={{
            buttonStyle:"solid"
          }}
        />

      </ProForm>
    </Modal>
  );
};
export default Dialog;

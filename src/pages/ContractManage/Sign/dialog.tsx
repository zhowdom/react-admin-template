import { useRef, useState } from 'react';
import { Modal } from 'antd';
// import { ProFormSelect } from '@ant-design/pro-form';
import { ProFormInstance, ProFormSelect, ProFormDependency } from '@ant-design/pro-form';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { pubMsg, pubConfig } from '@/utils/pubConfig';
import { updateById, insert } from '@/services/pages/sign';

const Dialog = (props: any) => {
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const handleOk = () => {
    formRef?.current?.submit();
  };
  // 新增或修改主体
  const updateForm = async (postData: any) => {
    let api = insert;
    if (props.state?.dialogForm?.id) {
      api = updateById;
    }
    const res = await api({ ...postData, id: props.state.dialogForm?.id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    const msg = props.state.dialogForm?.id ? '编辑成功' : '新增成功';
    pubMsg(msg, 'success');
    props.handleClose();
  };
  return (
    <Modal
      width={600}
      title={props.state.dialogForm?.id ? '编辑主体' : '新增主体'}
      visible={props.state.isModalVisible}
      onOk={handleOk}
      onCancel={props.handleClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
      okText={loading ? '提交中' : '确定'}
    >
      <ProForm
        formRef={formRef}
        onFinish={async (values) => {
          console.log(values);
          setLoading(true);
          updateForm(values);
        }}
        labelAlign="right"
        {...formItemLayout}
        submitter={false}
        initialValues={props.state.dialogForm}
        layout="horizontal"
      >
        <ProFormText
          name="client_corp_name"
          label="主体名称"
          placeholder="请填写主体名称"
          rules={[
            { required: true, message: '请填写主体名称' },
            {
              pattern: /^(?=.*\S).+$/,
              message: '请填写主体名称',
            },
          ]}
        />
        <ProFormSelect
          name="abroad"
          label="公司类型"
          valueEnum={props?.dicList?.SYS_ABROAD}
          placeholder="请选择公司类型"
          rules={[{ required: true, message: '请选择公司类型' }]}
          fieldProps={{
            onChange: (vid) => {
              console.log(vid);
              if (vid == 2) {
                formRef?.current?.setFieldsValue({
                  export_qualification: '2',
                });
              }
            },
          }}
        />
        <ProFormDependency name={['abroad']}>
          {({ abroad }) => (
            <ProFormSelect
              name="export_qualification"
              label="是否具有出口资质"
              valueEnum={props?.dicList?.VENDOR_SIGNING_EXPORT_QUALIFICATION}
              placeholder="请选择是否具有出口资质"
              readonly={abroad == 2}
              rules={[{ required: true, message: '请选择是否具有出口资质' }]}
            />
          )}
        </ProFormDependency>

        {/* <ProFormSelect
          placeholder="请选择是否默认"
          rules={[{ required: true, message: '请选择是否默认' }]}
          options={[
            {
              value: '1',
              label: '是',
            },
            {
              value: '0',
              label: '否',
            },
          ]}
          name="is_default"
          label="是否默认"
        /> */}
        {/* <ProFormSelect
          placeholder="请选择状态"
          rules={[{ required: true, message: '请选择状态' }]}
          options={[
            {
              value: '1',
              label: '启用',
            },
            {
              value: '0',
              label: '禁用',
            },
          ]}
          name="status"
          label="状态"
        /> */}
      </ProForm>
    </Modal>
  );
};
export default Dialog;

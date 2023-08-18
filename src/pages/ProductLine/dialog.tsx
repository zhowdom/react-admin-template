import { useRef, useState } from 'react';
import { Modal } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import type { FormType } from '@/types/productLine';
import { connect } from 'umi';
import { pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const { dispatch } = props;
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ProFormInstance>();
  const formItemLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 16 },
  };
  const handleOk = () => {
    formRef?.current?.submit();
  };
  // 新增或修改产品线
  const updateForm = (postData: FormType) => {
    dispatch({
      type: 'productLine/updateFormAction',
      payload: {
        id: postData.id,
        business_scope: postData.business_scope,
        name: postData.name,
        parent_id: postData.parent_id,
      },
      callback: (data: boolean) => {
        setLoading(false);
        if (data) {
          props.handleClose();
          pubMsg(postData.id ? '编辑成功' : '新增成功', 'success');
        }
      },
    });
  };
  return (
    <Modal
      width={500}
      title={props?.state?.dialogForm?.id ? '编辑供应商产品线分组' : '新增供应商产品线分组'}
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
          setLoading(true);
          const id = props?.state?.dialogForm?.id;
          let postData;
          if (id) {
            postData = {
              ...values,
              name: values.name,
              parent_id: 0,
              id,
            };
          } else {
            postData = {
              ...values,
              name: values.name,
              parent_id: 0,
            };
          }

          updateForm(postData);
        }}
        labelAlign="right"
        {...formItemLayout}
        submitter={false}
        initialValues={props.state.dialogForm}
        layout="horizontal"
      >
        <ProFormText
          name="name"
          label="产品线名称"
          placeholder="请输入产品线名称"
          rules={[{ required: true, message: '请输入产品线名称' }]}
        />
        <ProFormSelect
          placeholder="请选择产品线类型"
          rules={[{ required: true, message: '请选择产品线类型' }]}
          options={[
            {
              value: 'CN',
              label: '国内',
            },
            {
              value: 'IN',
              label: '跨境',
            },
          ]}
          name="business_scope"
          label="产品线类型"
        />
      </ProForm>
    </Modal>
  );
};
export default connect(({ productLine }: { productLine: Record<string, unknown> }) => ({
  productLine,
}))(Dialog);

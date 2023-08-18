import { useRef } from 'react';
import { Modal, Space, Row, Col } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormTextArea, ProFormDependency } from '@ant-design/pro-form';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';

const Dialog = (props: any) => {
  const { cityData2 } = props?.common;
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
      width={660}
      title={props.state.dialogForm?.id ? '编辑地址' : '新增地址'}
      open={props.state.isModalVisible}
      onOk={handleOk}
      onCancel={props.handleClose}
      destroyOnClose
    >
      <ProForm
        formRef={formRef}
        onFinish={async (values) => {
          updateForm(values);
        }}
        labelAlign="right"
        {...formItemLayout}
        submitter={false}
        initialValues={props.state.dialogForm}
        layout="horizontal"
      >
        <ProFormSelect
          placeholder="请选择地址类型"
          rules={[{ required: true, message: '请选择地址类型' }]}
          valueEnum={props?.dicList?.VENDOR_ADDRESS_TYPE}
          name="type"
          label="地址类型"
        />
        <ProFormSelect
          placeholder="请选择是否为默认地址"
          rules={[{ required: true, message: '请选择是否为默认地址' }]}
          valueEnum={props?.dicList?.SC_YES_NO}
          name="is_default"
          label="默认地址"
        />
        <ProForm.Item required label={'详细地址'}>
          <Space>
            <ProFormSelect
              name={'provinces_name'}
              noStyle
              width={'sm'}
              placeholder={'选择省份'}
              rules={[{ required: true, message: '' }]}
              fieldProps={{
                onChange: () => formRef?.current?.setFieldsValue({ city_name: '' }),
                options:
                  cityData2 &&
                  cityData2.map((item: any) => ({
                    label: item.label,
                    value: item.label,
                  })),
              }}
            />
            <ProFormDependency name={['provinces_name']}>
              {({ provinces_name }) => {
                const selectedProvince =
                  (cityData2 && cityData2.find((item: any) => item.label === provinces_name)) || {};
                const cityList =
                  selectedProvince && selectedProvince.children
                    ? selectedProvince.children.map((item: any) => ({
                      label: item.label,
                      value: item.label,
                    }))
                    : [];
                return (
                  <ProFormSelect
                    noStyle
                    name={'city_name'}
                    width={'sm'}
                    placeholder={'选择城市'}
                    fieldProps={{ options: cityList }}
                    rules={[{ required: true, message: '' }]}
                  />
                );
              }}
            </ProFormDependency>
          </Space>
        </ProForm.Item>
        <Row>
          <Col span={6} />
          <Col span={16}>
            <ProFormTextArea
              wrapperCol={{ span: 24 }}
              label=""
              name="address"
              placeholder="请输入供应商详细地址"
              rules={[{ required: true, message: '请输入供应商详细地址' }]}
            />
          </Col>
        </Row>
      </ProForm>
    </Modal>
  );
};
export default Dialog;

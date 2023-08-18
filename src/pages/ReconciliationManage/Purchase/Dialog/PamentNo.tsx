import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { accountStatementOrderRejectPayment } from '@/services/pages/reconciliationPurchase';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const formRef = useRef<ProFormInstance>();
  props.pamentNoModel.current = {
    open: (data?: any) => {
      setIsModalVisible(true);
      if (data) {
        setTimeout(() => {
          formRef?.current?.setFieldsValue({ id: data.id });
        }, 200);
      }
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    if (!val) props.handleClose(true);
  };
  // 提交
  const saveSubmit = async (val: any) => {
    setLoading(true);
    const res = await accountStatementOrderRejectPayment(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('驳回成功！', 'success');
      modalClose(false);
    }
    setLoading(false);
  };

  return (
    <Modal
      width={600}
      title="付款驳回"
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          labelAlign="right"
          labelWrap
          submitter={false}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
        >
          <ProFormText name="id" label="ID" hidden />
          <ProFormTextArea
            name="reason"
            label="驳回原因"
            placeholder="请输入付款驳回原因"
            rules={[{ required: true, message: '请输入付款驳回原因' }]}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default Dialog;

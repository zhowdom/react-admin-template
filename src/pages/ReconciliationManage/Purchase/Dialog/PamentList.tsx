import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { accountStatementOrderBatchPayment } from '@/services/pages/reconciliationPurchase';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const formRef = useRef<ProFormInstance>();
  props.pamentListModel.current = {
    open: (ids?: any) => {
      setIsModalVisible(true);
      if (ids) {
        setTimeout(() => {
          formRef?.current?.setFieldsValue({ ids: ids });
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
    const res = await accountStatementOrderBatchPayment(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功！', 'success');
      modalClose(false);
    }
    setLoading(false);
  };

  return (
    <Modal
      width={600}
      title="批量确认付款"
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
          <ProFormText name="ids" label="IDs" hidden />
          <ProFormTextArea name="remark" label="备注" placeholder="请输入备注" />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default Dialog;

import { useState, useRef } from 'react';
import { Modal, Spin, Form } from 'antd';
import { history } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { accountStatementOrderPayment } from '@/services/pages/reconciliationPurchase';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { priceValue } from '@/utils/filter';
import { IsGrey } from '@/utils/pubConfirm';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detail, setDetail] = useState<any>({});

  const formRef = useRef<ProFormInstance>();
  props.pamentModel.current = {
    open: (data?: any) => {
      setIsModalVisible(true);
      if (data) {
        setDetail(data);
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
    const res = await accountStatementOrderPayment(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功！', 'success');
      modalClose(false);
      history.goBack();
    }
    setLoading(false);
  };

  return (
    <Modal
      width={600}
      title="确认付款"
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
          <Form.Item label="付款公司">{detail?.main_name}</Form.Item>
          <Form.Item label="支付金额">{IsGrey ? '' : priceValue(detail?.amount)}</Form.Item>
          <ProFormTextArea name="remark" label="备注" placeholder="请输入备注" />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default Dialog;

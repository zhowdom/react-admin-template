import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import { connect, history } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import {
  batchPayment,
  purchaseOrderApproval,
  purchaseOrderInitiateAnApplication,
  purchaseOrderPayment,
  updatePurchaseOrder,
} from '@/services/pages/reconciliationAskAction';
import moment from 'moment';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [modalType, setModalType] = useState<any>({});

  const formRef = useRef<ProFormInstance>();
  props.aduitNoModel.current = {
    open: (id?: any, type?: any, required?: any, values?: any) => {
      const data = {
        ...values,
        requirement_pay_time: moment(values?.requirement_pay_time).format('YYYY-MM-DD 00:00:00'),
      };
      setIsModalVisible(true);
      setIsRequired(required);
      if (id) {
        switch (type) {
          case 'approve':
            setModalType({
              type: type,
              title: '是否确认通过审批？',
            });
            break;
          case 'refuse':
            setModalType({
              type: type,
              title: '是否确认驳回？',
            });
            break;
          case 'payment':
            setModalType({
              type: type,
              title: '是否确定已经付款？',
            });
            break;
          case 'saveAudit':
            setModalType({
              type: type,
              title: '是否确认申请审批？',
              values: data,
            });
            break;
          case 'batchPayment':
            setModalType({
              type: type,
              title: '是否确定已经付款？',
            });
            break;
        }
        setTimeout(() => {
          formRef?.current?.setFieldsValue({ id: id });
        }, 200);
      }
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val?: any) => {
    setIsModalVisible(false);
    props.handleClose(val);
  };
  // 提交
  const saveSubmit = async (val: any) => {
    setLoading(true);
    val.operate = modalType?.type;
    let res: any = null;
    if (modalType?.type == 'approve' || modalType?.type == 'refuse') {
      val.reason = val.remark;
      res = await purchaseOrderApproval(val);
    } else if (modalType?.type == 'payment') {
      res = await purchaseOrderPayment(val);
    } else if (modalType?.type == 'saveAudit') {
      res = await updatePurchaseOrder(modalType?.values);
    } else if (modalType.type === 'batchPayment') {
      res = await batchPayment({ ...val, ids: val?.id?.split(',') });
    }
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      if (modalType?.type == 'saveAudit') {
        const resp = await purchaseOrderInitiateAnApplication({ id: val.id, remark: val?.remark });
        if (resp?.code != pubConfig.sCode) {
          pubMsg(resp?.message);
          return;
        } else {
          pubMsg('提交成功！', 'success');
          modalClose(true);
          history.goBack();
          return;
        }
      }
      pubMsg('提交成功！', 'success');
      modalClose(true);
      if (modalType.type != 'batchPayment') {
        history.goBack();
      }
    }
    setLoading(false);
  };

  return (
    <Modal
      width={600}
      title={modalType?.title}
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={() => modalClose()}
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
          layout="horizontal"
        >
          <ProFormText name="id" label="ID" hidden />
          <ProFormTextArea
            name="remark"
            label="备注"
            placeholder={`请输入备注`}
            rules={[{ required: isRequired, message: `请输入备注` }]}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

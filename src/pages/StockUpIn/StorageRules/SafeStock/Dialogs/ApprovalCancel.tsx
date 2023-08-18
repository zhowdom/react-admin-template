import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { pubConfig, pubModal, pubMsg } from '@/utils/pubConfig';
import { shippingMethodApprovalTerminate } from '@/services/pages/link';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const formRef = useRef<ProFormInstance>();

  props.approvalCancelModel.current = {
    open: (type: any, data?: any) => {
      setIsModalVisible(true);
      setModalType(type);
      if (type == 'list') {
        // 批量
        setTimeout(() => {
          formRef?.current?.setFieldsValue({
            ids: data,
          });
        }, 200);
      } else {
        setTimeout(() => {
          formRef?.current?.setFieldsValue({
            ids: [data.id],
          });
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
    console.log(val);
    const newData = JSON.parse(JSON.stringify(val));
    pubModal(`是否确定撤销选中SKU的审核？`)
      .then(async () => {
        setLoading(true);
        const res = await shippingMethodApprovalTerminate({
          ...newData,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          setLoading(false);
          return;
        }
        pubMsg('设置成功!', 'success');
        modalClose(false);
        setLoading(false);
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  return (
    <Modal
      width={600}
      title={modalType == 'list' ? '批量撤销' : '撤销'}
      open={isModalVisible}
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
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          submitter={false}
          layout="horizontal"
        >
          <ProFormText name="ids" hidden />
          <ProFormTextArea
            name="approval_remarks"
            label="撤销原因"
            placeholder="请输入撤销原因"
            rules={[{ required: true, message: '请输入撤销原因' }]}
            formItemProps={{
              style: { margin: '10px 0 4px' },
            }}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default Dialog;

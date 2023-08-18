import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { revokeToNew } from '@/services/pages/purchaseOrder';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const { type, title, reload, _ref } = props;
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const formRef = useRef<ProFormInstance>();
  _ref.current = {
    open: (id: string) => {
      setTimeout(() => {
        formRef?.current?.setFieldsValue({ id });
      }, 200);
      setIsModalVisible(true);
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val?: any) => {
    setIsModalVisible(false);
    if (val) reload();
  };
  // 提交
  const saveSubmit = async (val: any) => {
    setLoading(true);
    let res: any;
    if (type == 'reback') {
      // 退回到新建状态
      res = await revokeToNew(val);
    }
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功！', 'success');
      modalClose(true);
    }
    setLoading(false);
  };

  return (
    <Modal
      width={600}
      title={title}
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
            name="remarks"
            label={`原因`}
            placeholder="请输入原因"
            rules={[{ required: true, message: '请输入原因' }]}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default Dialog;

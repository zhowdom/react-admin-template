import { useState, useRef } from 'react';
import { Modal, Form, Spin, Button } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { vendorFeedbackFindById } from '@/services/pages/supplier';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const formRef = useRef<ProFormInstance>();

  // 详情
  const getDetail = async (id: any) => {
    setLoading(true);
    const res = await vendorFeedbackFindById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setDetail(res?.data);
    }
    setLoading(false);
  };
  props.complaintDetailModel.current = {
    open: (data?: any) => {
      setIsModalVisible(true);
      getDetail(data?.id);
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
  return (
    <Modal
      width={800}
      title={'反馈详情'}
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
      className="pub-detail-form"
      footer={[
        <Button key="back" onClick={modalClose}>
          关闭
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          labelAlign="right"
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 14 }}
          submitter={false}
          layout="horizontal"
        >
          <Form.Item label="标题">{detail?.title}</Form.Item>
          <Form.Item label="供应商">{detail?.vendor_name}</Form.Item>
          <Form.Item label="反馈时间">{detail?.create_time}</Form.Item>
          <Form.Item label="详细描述" wrapperCol={{ span: 20 }}>
            <div style={{ background: '#f8f8f8', padding: '5px 15px' }}>
              <pre>{detail?.content}</pre>
            </div>
          </Form.Item>
          <Form.Item label="附件">
            <ShowFileList data={detail?.attach_files} isShowDownLoad={true} />
          </Form.Item>
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default Dialog;

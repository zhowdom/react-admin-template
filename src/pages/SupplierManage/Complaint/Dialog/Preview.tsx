import { useState } from 'react';
import { Modal, Button } from 'antd';
import './style.less';

const Dialog = (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detail, setDetail] = useState<any>({});

  props.previewModel.current = {
    open: (data?: any) => {
      setIsModalVisible(true);
      setDetail(data);
      console.log(data);
    },
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    if (!val) props.handleClose(true);
  };
  return (
    <Modal
      width={800}
      title={'公告预览'}
      visible={isModalVisible}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      className="pub-detail-form"
      footer={[
        <Button key="back" onClick={modalClose}>
          关闭
        </Button>,
      ]}
    >
      <div className="complaint">
        <div className="complaint-title">{detail?.title}</div>
        <div className="complaint-time">{detail?.update_time}</div>
        <div
          className="complaint-content"
          dangerouslySetInnerHTML={{ __html: detail?.content }}
        ></div>
      </div>
    </Modal>
  );
};

export default Dialog;

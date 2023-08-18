import { useState } from 'react';
import { Modal } from 'antd';

const Dialog = (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示
  const [fileUrl, setFileUrl] = useState(); // 图片URL
  if (props.showBigVideoModel) {
    props.showBigVideoModel.current = {
      open: (file: any) => {
        setIsModalVisible(true);
        setFileUrl(file.access_url);
      },
    };
  }
  // 关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };
  return (
    <Modal
      width={800}
      title="媒体查看"
      visible={isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
    >
      <video width="100%" controls autoPlay>
        <source src={fileUrl} type="video/mp4" />
        您的浏览器不支持 HTML5 video 标签。
      </video>
    </Modal>
  );
};
export default Dialog;

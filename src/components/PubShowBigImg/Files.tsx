import { useState } from 'react';
import { Modal } from 'antd';
// import { pubConfig } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  props.showBigFilesModel.current = {
    open: (data: any) => {
      const btn = document.createElement('a');
      btn.href = data.access_url;
      btn.target = '_blank';
      btn.download = data.name || '文件下载';
      btn.click();
    },
  };
  // 关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };
  return (
    <Modal
      width={800}
      title={false}
      visible={isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
    >
      文件查看
    </Modal>
  );
};
export default Dialog;

import { useState } from 'react';
import { Modal } from 'antd';

const Dialog = (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示
  props.showSkuModel.current = {
    open: (data: any) => {
      setIsModalVisible(true);
      console.log(data);
    },
  };
  // 关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };
  return (
    <Modal
      width={800}
      title="SKU"
      visible={isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
    >
      SKU
    </Modal>
  );
};
export default Dialog;

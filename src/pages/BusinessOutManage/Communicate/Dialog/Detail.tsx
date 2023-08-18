import { useState } from 'react';
import { Modal } from 'antd';
import CommunicateDetail from '@/components/BusinessOut/CommunicateDetail';

const Dialog = (props: any) => {
  const [state, setState] = useState({
    isModalVisible: false, // 弹窗显示
    id: '', // 沟通ID
  });
  props.detailModel.current = {
    open: (id: any) => {
      setState((pre: any) => {
        return {
          ...pre,
          id: id,
          isModalVisible: true,
        };
      });
    },
  };
  // 关闭
  const modalClose = () => {
    setState((pre: any) => {
      return {
        ...pre,
        isModalVisible: false,
      };
    });
  };
  return (
    <Modal
      width={800}
      title="沟通记录详情"
      visible={state.isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
      maskClosable={false}
    >
      <CommunicateDetail id={state.id} />
    </Modal>
  );
};
export default Dialog;

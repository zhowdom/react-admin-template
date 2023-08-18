import { useState } from 'react';
import { Modal, Divider } from 'antd';
import ProForm from '@ant-design/pro-form';
import BusinessOutDetail from '@/components/BusinessOut/BusinessOutDetail';
import BusinessExamineDetail from '@/components/BusinessOut/BusinessExamineDetail';

const Dialog = (props: any) => {
  const [state, setState] = useState({
    isModalVisible: false, // 弹窗显示
    id: '', // 出差ID
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

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 },
  };
  return (
    <Modal
      width={800}
      title="出差记录详情"
      visible={state.isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
      maskClosable={false}
    >
      <ProForm
        submitter={false}
        layout="horizontal"
        className="pub-detail-form"
        {...formItemLayout}
      >
        <BusinessOutDetail id={state.id} />
        <Divider orientation="left" orientationMargin="0">
          审核详情
        </Divider>
        <BusinessExamineDetail id={state.id} />
      </ProForm>
    </Modal>
  );
};
export default Dialog;

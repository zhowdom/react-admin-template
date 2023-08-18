import { useState } from 'react';
import { Modal, Tabs } from 'antd';
import CommunicateDetail from '@/components/BusinessOut/CommunicateDetail';
import BusinessExamineDetail from '@/components/BusinessOut/BusinessExamineDetail';

const { TabPane } = Tabs;
const Dialog = (props: any) => {
  const [state, setState] = useState({
    isModalVisible: false, // 弹窗显示
    id: '', // 沟通ID
    source: '', // 来源
    travel_records_id: '', // 出差ID
  });
  props.detailModel.current = {
    open: (data: any) => {
      console.log(data);
      setState((pre: any) => {
        return {
          ...pre,
          id: data.id,
          source: data.source,
          travel_records_id: data.travel_records_id,
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
      title={state.source === 'VENDOR_TRAVEL_RECORDS' ? false : '沟通记录详情'}
      visible={state.isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
      maskClosable={false}
    >
      {state.source === 'VENDOR_TRAVEL_RECORDS' ? (
        <Tabs defaultActiveKey="1">
          <TabPane tab="沟通记录详情" key="1">
            <CommunicateDetail id={state.id} />
          </TabPane>
          <TabPane tab="审批记录" key="2">
            <BusinessExamineDetail id={state.travel_records_id} />
          </TabPane>
        </Tabs>
      ) : (
        <CommunicateDetail id={state.id} />
      )}
    </Modal>
  );
};
export default Dialog;

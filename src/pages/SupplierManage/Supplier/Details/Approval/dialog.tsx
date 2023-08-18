import { pubConfig, pubMsg } from '@/utils/pubConfig';
import ProTable from '@ant-design/pro-table';
import { Modal, Steps } from 'antd';
import { Tabs } from 'antd';
import { useState } from 'react';
import { getApprovalDetail, getApprovalProcess } from '@/services/pages/supplier';
const { TabPane } = Tabs;
const { Step } = Steps;
const Dialog = (props: any) => {
  const [process, setProcess] = useState([]);
  const columns: any[] = [
    {
      title: '修改前',
      dataIndex: 'before_value',
      align: 'center',
      render: (dom: any, record: any) => {
        return (
          <span>
            {record.item_name}: {record.before_value || ''}
          </span>
        );
      },
    },
    {
      title: '修改后',
      dataIndex: 'after_value',
      align: 'center',
      render: (dom: any, record: any) => {
        return (
          <span>
            {record.item_name}: {record.after_value || ''}
          </span>
        );
      },
    },
  ];
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      approval_history_id: props.id,
    };
    const res = await getApprovalDetail(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 获取审批流程
  const getProcessAction = async (): Promise<any> => {
    const postData = {
      approval_history_id: props.id,
    };
    const res = await getApprovalProcess(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    setProcess(res?.data || []);
  };
  const callback = (key: any) => {
    if (key == 2) {
      getProcessAction();
    }
  };
  return (
    <Modal
      width={800}
      visible={props.isModalVisible}
      destroyOnClose
      footer={false}
      title={false}
      onCancel={props.handleClose}
      maskClosable={false}
    >
      <Tabs defaultActiveKey="1" onChange={callback}>
        <TabPane tab="审批详情" key="1">
          <ProTable
            columns={columns}
            pagination={{}}
            options={false}
            tableAlertRender={false}
            tableAlertOptionRender={false}
            request={getListAction}
            search={false}
            rowKey="id"
            dateFormatter="string"
            bordered
            toolBarRender={false}
          />
        </TabPane>
        <TabPane tab="审批流程" key="2">
          <Steps progressDot current={3} direction="vertical">
            {process?.map((item: any) => {
              return (
                <Step
                  title="审批人"
                  subTitle={item.approval_user_name}
                  description={item.approval_status_name}
                  key={item.id}
                />
              );
            })}
          </Steps>
        </TabPane>
      </Tabs>
    </Modal>
  );
};
export default Dialog;

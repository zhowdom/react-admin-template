import { useState } from 'react';
import { Modal, Spin } from 'antd';
import { connect } from 'umi';
import ProTable from '@ant-design/pro-table';
import { approvalDetailHistory } from '@/services/pages/purchasePlan';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [list, setList] = useState([]);

  const columns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      width: 120,
      align: 'center',
    },

    {
      title: '状态',
      dataIndex: 'approval_status_name',
      align: 'center',
    },
    {
      title: '备注信息',
      dataIndex: 'remark',
      align: 'center',
    },
    {
      title: '操作时间',
      dataIndex: 'approval_time',
      align: 'center',
    },
    {
      title: '操作人',
      dataIndex: 'approval_user_name',
      align: 'center',
    },
  ];
  // 获取表格数据
  const getListAction = async (id: any): Promise<any> => {
    setLoading(true);
    const res = await approvalDetailHistory({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setList(res?.data || []);
    }
    setLoading(false);
  };

  props.auditListModel.current = {
    open: (id?: any) => {
      setIsModalVisible(true);
      if (id) {
        getListAction(id);
      }
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
      title="审批记录"
      open={isModalVisible}
      footer={false}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <ProTable
          columns={columns}
          pagination={false}
          options={false}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          dataSource={list}
          search={false}
          rowKey="id"
          dateFormatter="string"
          bordered
          toolBarRender={false}
        />
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

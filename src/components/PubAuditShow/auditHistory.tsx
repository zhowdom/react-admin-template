import { useState, useRef } from 'react';
import { Modal } from 'antd';
import { connect } from 'umi';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableHistoryListItem } from './data';
import { sysApprovalDetailHistory } from '@/services/base';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { ProFormInstance } from '@ant-design/pro-form';

const Dialog = (props: any) => {
  const { common } = props;
  console.log(common);
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示
  const [formParams, setFormParams] = useState({});

  const formRef = useRef<ProFormInstance>();

  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    console.log(1);
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await sysApprovalDetailHistory(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    return {
      data: res?.code == pubConfig.sCode ? res.data.records : [],
      success: res?.code == pubConfig.sCode,
      total: res?.data?.total || 0,
    };
  };

  props.pubAuditHistoryModel.current = {
    open: (id: any) => {
      setIsModalVisible(true);
      setFormParams({ approval_history_id: [id] });
    },
  };
  // 关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };
  const initForm = {
    showSizeChanger: false,
  };
  const columns: ProColumns<TableHistoryListItem>[] = [
    {
      title: '操作人',
      dataIndex: 'approval_user_name',
      hideInSearch: true,
      width: 120,
      align: 'center',
    },
    {
      title: '审批状态',
      dataIndex: 'approval_status_name',
      hideInSearch: true,
      width: 100,
      align: 'center',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '操作时间',
      dataIndex: 'create_time',
      width: 150,
      hideInSearch: true,
      align: 'center',
    },
  ];

  return (
    <Modal
      width={700}
      title="审批记录"
      visible={isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
      maskClosable={false}
    >
      <>
        <ProTable<TableHistoryListItem>
          columns={columns}
          search={false}
          options={false}
          formRef={formRef}
          bordered
          params={formParams}
          tableAlertRender={false}
          dateFormatter="string"
          request={getList}
          rowKey="id"
          size="small"
          className="p-table-0"
          pagination={initForm}
        />
      </>
    </Modal>
  );
};
export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

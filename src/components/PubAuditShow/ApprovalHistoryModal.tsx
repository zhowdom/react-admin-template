import React from 'react';
import ProTable from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-table';
import type { TableHistoryListItem } from './data';
import { ModalForm } from '@ant-design/pro-form';
// import { sysApprovalDetailHistory } from '@/services/base';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { approvalDetailHistory } from '@/services/pages/productLine';
/*审批日志历史列表弹框*/
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
const getList = async (params: any): Promise<any> => {
  const postData = {
    ...params,
    current_page: params?.current,
    page_size: params?.pageSize,
  };
  const res = await approvalDetailHistory(postData);
  if (res?.code != pubConfig.sCode) {
    pubMsg(res?.message);
    return;
  }
  return {
    data: res?.code == pubConfig.sCode ? res.data : [],
    success: res?.code == pubConfig.sCode,
    total: res?.data?.total || 0,
  };
};
const ApprovalHistoryModal: React.FC<{ id: string[]; title: any }> = ({ id, title }: any) => {
  return (
    <ModalForm<any>
      title={title || '审批日志'}
      trigger={<a>审批日志</a>}
      submitter={false}
      modalProps={{ destroyOnClose: true }}
    >
      <ProTable<any>
        columns={columns}
        search={false}
        options={false}
        bordered
        params={{ id }}
        pagination={false}
        tableAlertRender={false}
        dateFormatter="string"
        request={getList}
        rowKey="id"
        size="small"
        className="p-table-0"
      />
    </ModalForm>
  );
};
export default ApprovalHistoryModal;

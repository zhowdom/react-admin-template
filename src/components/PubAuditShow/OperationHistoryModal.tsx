import React from 'react';
import ProTable from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-table';
import type { TableHistoryListItem } from './data';
import { ModalForm } from '@ant-design/pro-form';
import { sysBusinessOperationHistory } from '@/services/base';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
/*审批日志历史列表弹框*/
const columns: ProColumns<TableHistoryListItem>[] = [
  {
    title: '操作时间',
    dataIndex: 'create_time',
    width: 150,
    hideInSearch: true,
    align: 'center',
  },
  {
    title: '操作类型',
    dataIndex: 'remarks',
    hideInSearch: true,
    align: 'center',
  },
  {
    title: '操作人',
    dataIndex: 'create_user_name',
    hideInSearch: true,
    width: 120,
    align: 'center',
  },
];
const getList = async (params: any): Promise<any> => {
  const postData = {
    ...params,
    current_page: params?.current,
    page_size: params?.pageSize,
  };
  console.log(33);
  const res = await sysBusinessOperationHistory(postData);
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
const OperationHistoryModal: React.FC<{ id: string[]; title?: string }> = ({ id, title }: any) => {
  return (
    <ModalForm<any>
      title={title ? title : '操作日志'}
      trigger={<a>{title ? title : '操作日志'}</a>}
      submitter={false}
      key={Date.now()}
      modalProps={{ destroyOnClose: true }}
    >
      <ProTable<any>
        columns={columns}
        search={false}
        options={false}
        bordered
        params={{ businessId: id }}
        pagination={{
          showSizeChanger: true,
        }}
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
export default OperationHistoryModal;

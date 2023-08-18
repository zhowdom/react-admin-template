import ProTable from '@ant-design/pro-table';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { approvalDetailHistory } from '@/services/pages/purchaseOrder';

const ProcessLog = (props: any) => {
  // 获取表格数据
  const getListAction = async (): Promise<any> => {
    const postData = {
      id: props?.items?.id,
    };
    const res = await approvalDetailHistory(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data || [],
      success: true,
    };
  };
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

  return (
    <ProTable
      options={false}
      columns={columns}
      pagination={false}
      request={getListAction}
      search={false}
      rowKey="id"
      dateFormatter="string"
      headerTitle={false}
      bordered
    />
  );
};
export default ProcessLog;

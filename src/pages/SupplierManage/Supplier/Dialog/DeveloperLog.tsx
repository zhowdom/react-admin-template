import ProTable from '@ant-design/pro-table';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { getTransferHistory } from '@/services/pages/supplier';
const DeveloperChange = (props: any) => {
  // 获取表格数据
  const getListAction = async (): Promise<any> => {
    const postData = {
      vendorId: props.id,
    };
    const res = await getTransferHistory(postData);
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
      title: '转让前开发',
      dataIndex: 'from_user_name',
      align: 'center',
    },
    {
      title: '转让后开发',
      dataIndex: 'to_user_name',
      align: 'center',
    },
    {
      title: '转让时间',
      dataIndex: 'create_time',
      align: 'center',
    },
  ];

  return (
    <>
      <ProTable
        columns={columns}
        pagination={false}
        request={getListAction}
        search={false}
        rowKey="id"
        bordered
        dateFormatter="string"
        headerTitle={false}
        toolBarRender={false}
      />
    </>
  );
};
export default DeveloperChange;

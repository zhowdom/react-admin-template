import ProTable from '@ant-design/pro-table';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { getLogList } from '@/services/pages/supplier';

export default (props: any) => {
  return (
    <ProTable
      request={async (params): Promise<any> => {
        const postData = {
          ...params,
          business_id: props?.id,
          current_page: params?.current,
          page_size: params?.pageSize,
        };
        const res = await getLogList(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        }
        return {
          data: res?.data?.records || [],
          success: true,
          total: res?.data?.total || 0,
        };
      }}
      pagination={{}}
      options={false}
      bordered
      size="small"
      search={false}
      columns={[
        {
          title: '操作时间',
          dataIndex: 'create_time',
          align: 'center',
        },
        {
          title: '修改前',
          dataIndex: 'before_value',
          align: 'center',
          render: (dom: any, record: any) => {
            return (
              <span>
                {record.item_name}: {record.before_value}
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
                {record.item_name}: {record.after_value}
              </span>
            );
          },
        },
        {
          title: '操作类型',
          dataIndex: 'operation_type',
          align: 'center',
          render: (_: any, record: any) => {
            return pubFilter(props?.dicList?.SYNC_OPERATION_TYPE, record?.operation_type) || '-';
          },
        },
        {
          title: '操作人',
          dataIndex: 'create_user_name',
          align: 'center',
        },
      ]}
    />
  );
};

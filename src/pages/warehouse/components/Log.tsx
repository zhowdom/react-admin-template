import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
// import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示

const Component: React.FC<{
  dicList: any;
  business_id: any;
  trigger?: any;
  title?: any;
  api: any; // 接口方法
}> = ({ business_id, dicList, trigger, title, api }) => {
  return (
    <ModalForm
      title={title || '变更日志(历史)'}
      trigger={trigger || <a>日志</a>}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={false}
      width={1200}
    >
      <ProTable
        request={async (): Promise<any> => {
          const res = await api({ business_id });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            return {
              data: [],
              total: 0,
              success: false,
            };
          }
          return {
            data: res?.data?.records || [],
            total: res?.data?.total || 0,
            success: true,
          };
        }}
        search={false}
        options={false}
        bordered
        size="small"
        cardProps={{ bodyStyle: { padding: 0 } }}
        rowKey={'id'}
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
              return pubFilter(dicList?.SYNC_OPERATION_TYPE, record?.operation_type) || '-';
            },
          },
          {
            title: '操作人',
            dataIndex: 'create_user_name',
            align: 'center',
          },
          /*{
            title: '附件',
            dataIndex: 'sys_files',
            render: (_: any, record: any) => {
              return record?.sys_files?.length ? (
                <ShowFileList
                  data={record.sys_files || []}
                  isShowDownLoad={true}
                  listType="text-line"
                />
              ) : (
                '-'
              );
            },
          },*/
        ]}
      />
    </ModalForm>
  );
};
export default Component;

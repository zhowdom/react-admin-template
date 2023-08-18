import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Component: React.FC<{
  dicList: any;
  business_id: any;
  trigger?: any;
  title?: any;
  api: any; // 接口方法
}> = ({ business_id, trigger, title, api }) => {
  return (
    <ModalForm
      title={title || '变更日志(历史)查看'}
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
            data: res?.data || [],
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
            title: 'No.',
            dataIndex: 'index',
            valueType: 'index',
            align: 'center',
            width: 60,
          },
          {
            title: '修改人',
            dataIndex: 'create_user_name',
            align: 'center',
            width: 90,
          },
          {
            title: '修改时间',
            dataIndex: 'create_time',
            align: 'center',
            width: 146,
          },
          {
            title: '操作类型',
            dataIndex: 'type',
            align: 'center',
            width: 90,
          },
          {
            title: '修改前',
            dataIndex: 'before_change',
          },
          {
            title: '修改后',
            dataIndex: 'after_change',
          },
        ]}
      />
    </ModalForm>
  );
};
export default Component;

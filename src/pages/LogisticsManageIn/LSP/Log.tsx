import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { getLogisticsVendorLogs } from '@/services/pages/logisticsManageIn/lsp';

export default (props: any) => {
  const { business_id, dicList } = props;
  return (
    <ModalForm
      title="日志"
      trigger={<a> {props.trigger}</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={{
        searchConfig: {
          submitText: '确认',
          resetText: '关闭',
        },
        submitButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
      width={1200}
    >
      <ProTable
        request={async (params: any): Promise<any> => {
          const postData = {
            ...params,
            business_id,
            current_page: params?.current,
            page_size: params?.pageSize,
          };
          const res = await getLogisticsVendorLogs(postData);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          }
          return {
            data: res?.data?.records || [],
            success: true,
            total: res?.data?.total || 0,
          };
        }}
        options={false}
        bordered
        size="small"
        pagination={{
          showSizeChanger: true,
          className: 'modal-pagi',
        }}
        search={false}
        columns={[
          {
            title: '操作类型',
            dataIndex: 'operation_type',
            align: 'center',
            render: (_: any, record: any) => {
              return pubFilter(dicList?.SYNC_OPERATION_TYPE, record?.operation_type) || '-';
            },
          },

          {
            title: '操作前',
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
            title: '操作后',
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
            title: '操作人(账号)',
            dataIndex: 'create_user_name',
            align: 'center',
          },
          {
            title: '操作时间',
            dataIndex: 'create_time',
            align: 'center',
          },
        ]}
      />
    </ModalForm>
  );
};

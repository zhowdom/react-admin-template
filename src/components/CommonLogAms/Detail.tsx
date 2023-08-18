import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubMsg } from '@/utils/pubConfig';
import { auditLogDetailPage } from '@/services/base';

export default (props: any) => {
  const { createId, auditLogId } = props;
  return (
    <ModalForm
      title="操作日志详情"
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
      width={1000}
    >
      <ProTable
        request={async (): Promise<any> => {
          const res = await auditLogDetailPage({
            auditLogId,
            createId,
          });
          if (res?.code != '0') {
            pubMsg(res?.message);
          }
          return {
            data: res.data || [],
            success: true,
            total: res?.data?.length || 0,
          };
        }}
        cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
        options={false}
        bordered
        size="small"
        pagination={false}
        scroll={{ y: 'calc(70vh - 80px)' }}
        search={false}
        columns={[
          {
            title: '序号',
            valueType: 'index',
            align: 'center',
            width: 70,
          },
          {
            title: '操作内容',
            dataIndex: 'propertyName',
            align: 'left',
            width: 130,
          },

          {
            title: '操作前',
            dataIndex: 'beforeValue',
            align: 'left',
          },
          {
            title: '操作后',
            dataIndex: 'afterValue',
            align: 'left',
          },
        ]}
      />
    </ModalForm>
  );
};

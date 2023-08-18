import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubMsg } from '@/utils/pubConfig';
import { batchSyncResult } from '@/services/pages/order';
import { Button, Modal } from 'antd';
import { getUuid } from '@/utils/pubConfirm';

export default (props: any) => {
  return (
    <ModalForm
      title="订单同步查看"
      trigger={<Button> {props.trigger || '订单同步查看'}</Button>}
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
        style={{ marginTop: '-15px' }}
        request={async (params: any): Promise<any> => {
          const res = await batchSyncResult({ ...params, pageIndex: params.current });
          if (res?.code != '0') {
            pubMsg(res?.message);
          }
          return {
            success: true,
            data:
              res?.data?.list?.map((v: any) => {
                return {
                  ...v,
                  tempId: getUuid(),
                };
              }) || [],
            total: res?.data?.total || 0,
          };
        }}
        bordered
        size="small"
        search={false}
        options={{ reload: true, setting: false }}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 50,
        }}
        rowKey="tempId"
        columns={[
          {
            title: 'NO.',
            dataIndex: 'index',
            valueType: 'index',
            width: 80,
          },
          {
            title: '店铺',
            dataIndex: 'shopName',
            hideInSearch: true,
            align: 'center',
          },
          {
            title: '订单号',
            dataIndex: 'platformNo',
          },
          {
            title: '创建时间',
            dataIndex: 'createTime',
          },
          {
            title: '完成时间',
            dataIndex: 'finishTime',
          },
          {
            title: '同步耗时',
            dataIndex: 'cost',
          },
          {
            title: '状态',
            dataIndex: 'processStatusDesc',
            align: 'left',
            render: (_: any, record: any) => (
              <span style={{ color: record.processStatus == 'Error' ? '#ff4d4f' : '#282828' }}>
                {record.processStatusDesc}
              </span>
            ),
          },
          {
            title: '操作',
            width: 100,
            align: 'center',
            valueType: 'option',
            fixed: 'right',
            render: (_: any, record: any) =>
              record.processStatus == 'Error'
                ? [
                    <a
                      key="view"
                      onClick={() => {
                        Modal.warning({
                          title: '原因',
                          content: record.remark,
                          width: 1000,
                        });
                      }}
                    >
                      查看
                    </a>,
                  ]
                : '-',
          },
        ]}
      />
    </ModalForm>
  );
};

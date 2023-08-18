import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { findReviewHistory } from '@/services/pages/link';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示

export default (props: any) => {
  return (
    <ModalForm
      title="开发日志"
      trigger={<a>开发日志</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={false}
      width={1200}
    >
      <ProTable
        request={async (): Promise<any> => {
          const res = await findReviewHistory({ id: props?.id });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          }
          return {
            data: res?.data || [],
            success: true,
          };
        }}
        options={false}
        bordered
        size="small"
        search={false}
        columns={[
          {
            title: '变更时间',
            dataIndex: 'review_result_time',
          },
          {
            title: '变更前阶段',
            dataIndex: 'life_cycle',
            render: (_: any, record: any) => {
              return (
                pubFilter(props?.dicList.LINK_MANAGEMENT_LIFE_CYCLE, record?.life_cycle) || '-'
              );
            },
          },
          {
            title: '变更后阶段',
            dataIndex: 'review_life_cycle',
            render: (_: any, record: any) => {
              return (
                pubFilter(props?.dicList.LINK_MANAGEMENT_LIFE_CYCLE, record?.review_life_cycle) ||
                '-'
              );
            },
          },
          {
            title: '评审原因',
            dataIndex: 'reason',
          },
          {
            title: '评审备注',
            dataIndex: 'remarks',
          },
          {
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
          },
        ]}
      />
    </ModalForm>
  );
};

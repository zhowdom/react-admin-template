import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { findReviewHistory } from '@/services/pages/link';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示
import './index.less';

export default (props: any) => {
  const preStyle: any = {
    marginBottom: 0,
    fontFamily: 'Arial, Helvetica, sans-serif',
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.85)',
  };
  return (
    <ModalForm
      className="reviewLog"
      title={props?.title ? props.title : '评审日志'}
      trigger={<a>{props?.title ? props?.title : '评审日志'}</a>}
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
            title: '评审类型',
            dataIndex: 'type',
            render: (_: any, record: any) => {
              return record.type == 0 ? (
                '链接评审'
              ) : (
                <>
                  <div>产品评审</div>
                  <div>{record.goods_code}</div>
                </>
              );
            },
          },
          {
            title: '发起评审时间',
            dataIndex: 'create_time',
            render: (_: any, record: any) =>
              record.create_time ? (
                <>
                  <div>{record.create_time}</div>
                  <div>{record.create_user_name}</div>
                </>
              ) : (
                '-'
              ),
          },
          {
            title: '评审确认时间',
            dataIndex: 'review_result_time',
            render: (_: any, record: any) =>
              record.review_result_time ? (
                <>
                  <div>{record.review_result_time}</div>
                  <div>{record.review_result_create_user_name}</div>
                </>
              ) : (
                '-'
              ),
          },
          {
            title: '评审前',
            dataIndex: 'before_msg',
            render: (dom: any, record: any) => {
              return <pre style={preStyle}>{record.before_msg}</pre>;
            },
          },
          {
            title: '评审后',
            dataIndex: 'after_msg',
            render: (dom: any, record: any) => {
              return <pre style={preStyle}>{record.after_msg}</pre>;
            },
          },

          {
            title: '评审说明',
            dataIndex: 'remarks',
          },
          {
            title: '附件',
            dataIndex: 'sys_files',
            width: 200,
            render: (_: any, record: any) => {
              return record?.sys_files?.length ? (
                <ShowFileList data={record.sys_files || []} listType="text" />
              ) : (
                '-'
              );
            },
          },
          {
            title: '评审状态',
            dataIndex: 'status',
            align: 'left',
            width: 100,
            render: (_: any, record: any) => (
              <>{pubFilter(props?.dicList?.LINK_MANAGEMENT_REVIEW_STATUS, record.status)}</>
            ),
          },
        ]}
      />
    </ModalForm>
  );
};

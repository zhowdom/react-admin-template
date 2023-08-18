import ProTable, { ActionType } from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import { Access, useAccess } from 'umi';
import { Popconfirm } from 'antd';
import { useRef } from 'react';
import { deleteRecord, pageRecord } from '@/services/pages/deposit';

export default (props: any) => {
  const { receipt_no } = props;
  const actionRef: any = useRef<ActionType>();
  const access = useAccess();
  // 删除
  const deleteRecordA = async (receipt_no_T: string, id: string) => {
    const res = await deleteRecord({ receipt_no: receipt_no_T, id });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      return;
    }
    pubMsg('操作成功!', 'success');
    actionRef?.current?.reload();
  };
  return (
    <ModalForm
      title="收款记录"
      trigger={<a> 收款记录</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      className="reviewLog"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
        className: 'collectionLog'
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
        actionRef={actionRef}
        request={async (params): Promise<any> => {
          const res = await pageRecord({
            current_page: params?.current,
            page_size: params?.pageSize,
            receipt_no,
          });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          }
          return {
            data: res?.data?.records || [],
            success: true,
            total: res?.data?.total || 0,
          };
        }}
        pagination={{
          showSizeChanger: true,
        }}
        options={false}
        bordered
        size="small"
        search={false}
        columns={[
          {
            title: '实际收款时间',
            dataIndex: 'actual_receipt_time',
            align: 'center',
            onCell: (record: any) => ({ className: record?.del_flag && 'isDelete' }),
          },
          {
            title: '确认收款人',
            dataIndex: 'confirm_receipter_name',
            align: 'center',
            onCell: (record: any) => ({ className: record?.del_flag && 'isDelete' }),
          },
          {
            title: '收款金额',
            dataIndex: 'receive_amount',
            align: 'center',
            onCell: (record: any) => ({ className: record?.del_flag && 'isDelete' }),
          },
          {
            title: '备注',
            dataIndex: 'remark',
            align: 'center',
            width: 200,
            onCell: (record: any) => ({ className: record?.del_flag && 'isDelete' }),
          },
          {
            title: '收款凭证',
            dataIndex: 'fileInfoList',
            width: 200,
            render: (_: any, record: any) => {
              return record?.fileInfoList?.length ? (
                <ShowFileList data={record.fileInfoList || []} listType="text" />
              ) : (
                '-'
              );
            },
            onCell: (record: any) => ({ className: record?.del_flag && 'isDelete' }),
          },
          {
            title: '系统操作时间',
            dataIndex: 'confirm_receipt_time',
            align: 'center',
            onCell: (record: any) => ({ className: record?.del_flag && 'isDelete' }),
          },
          {
            title: '操作',
            key: 'option',
            width: 100,
            align: 'center',
            valueType: 'option',
            onCell: (record: any) => ({ className: record?.del_flag && 'isDelete' }),
            render: (_: any, row: any) =>
              row?.del_flag
                ? [<span key="del">已删除</span>]
                : [
                    <Access key="delete" accessible={access.canSee('scm_deposit_record_delete')}>
                      <Popconfirm
                        key="delete"
                        title="确定删除吗?"
                        onConfirm={async () => deleteRecordA(row?.receipt_no, row?.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <a style={{ color: 'red' }}>删除</a>
                      </Popconfirm>
                    </Access>,
                  ],
          },
        ]}
      />
    </ModalForm>
  );
};

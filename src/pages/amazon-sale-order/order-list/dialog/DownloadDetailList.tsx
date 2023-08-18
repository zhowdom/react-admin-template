//新增明细导出任务
import {
  calculationTaskList,
  calculationTaskCancel,
} from '@/services/pages/SCM_SALES_IN_Manage/orderStatistics';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Alert, Modal, Popconfirm } from 'antd';
import { useModel } from 'umi';
import { useRef, useState } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const DownloadDetailList: React.FC<{
  title?: any;
  trigger?: any;
}> = ({ title, trigger }) => {
  const actionRef: any = useRef<ActionType>(null);
  const { initialState } = useModel('@@initialState');
  const [open, openSet] = useState(false);
  const columns: ProColumns<any>[] = [
    {
      title: 'NO.',
      valueType: 'index',
      width: 40,
      align: 'center',
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
    },
    {
      title: '店铺',
      dataIndex: 'shopName',
    },
    {
      title: '查询条件',
      dataIndex: 'searchParams',
      render: (_, record: any) => (
        <>
          {record?.categoryNames ? <div>产品线: {record?.categoryNames}</div> : null}
          {record?.skus ? <div>sku: {record?.skus}</div> : null}
          <div>日期: {record?.taskStartTime + '~' + record?.taskEndTime}</div>
        </>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 86,
      align: 'center',
      valueType: 'dateTime',
    },
    {
      title: '完成时间',
      dataIndex: 'completeTime',
      width: 86,
      align: 'center',
      valueType: 'dateTime',
    },
    {
      title: '计算耗时',
      dataIndex: 'computingTime',
      width: 80,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'taskStatus',
      width: 80,
      align: 'center',
      valueEnum: {
        1: {
          text: '未处理',
          status: 'default',
        },
        2: {
          text: '处理中',
          status: 'processing',
        },
        3: {
          text: '待下载',
          status: 'success',
        },
        4: {
          text: '已取消',
          status: 'warning',
        },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 80,
      render: (_, record: any) => (
        <>
          {[1].includes(record.taskStatus) ? (
            <Popconfirm
              title={'确定取消?'}
              onConfirm={async () => {
                const res = await calculationTaskCancel({ id: record.id });
                if (res?.code == pubConfig.sCodeOrder) {
                  pubMsg('取消成功', 'success');
                  actionRef.current.reload();
                } else {
                  pubMsg(res?.message || '取消失败, 服务器错误');
                }
              }}
            >
              <Button type={'link'}>取消</Button>
            </Popconfirm>
          ) : null}
          {[3].includes(record?.taskStatus) ? (
            <Button download href={record?.linkUrl} target={'_blank'} type={'link'}>
              {record?.linkUrl ? '下载' : '-'}
            </Button>
          ) : null}
        </>
      ),
    },
  ];
  return (
    <>
      <Button onClick={() => openSet(true)} type={'primary'}>
        {trigger || '下载明细'}
      </Button>
      <Modal
        onCancel={() => openSet(false)}
        open={open}
        title={title || '下载明细'}
        width={1200}
        destroyOnClose
        footer={false}
      >
        <Alert
          style={{ marginBottom: 20 }}
          message={
            '提示：由于数据较多，计算量较大，为避免上班时多度消耗服务器资源，对其他同事造成影响，所以明细数据会在下班时段进行计算，可对计算完成的数据进行导出；'
          }
        />
        <ProTable
          actionRef={actionRef}
          columns={columns}
          options={{
            reload: true,
            setting: false,
            density: false,
          }}
          search={false}
          pagination={false}
          cardProps={{ bodyStyle: { padding: 0 } }}
          params={{ createUserId: initialState?.currentUser?.id }}
          request={async (params) => {
            const res = await calculationTaskList(params);
            if (res?.code == pubConfig.sCodeOrder) {
              return {
                data: res.data || [],
                success: true,
              };
            } else {
              return {
                success: false,
                data: [],
              };
            }
          }}
        />
      </Modal>
    </>
  );
};
export default DownloadDetailList;

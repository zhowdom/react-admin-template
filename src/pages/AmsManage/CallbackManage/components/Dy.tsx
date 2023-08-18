import { useAccess } from 'umi';
import { useRef, useState } from 'react';
import { Button, Modal, Popconfirm } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import { pubAlert, pubConfig, pubModal, pubMsg } from '@/utils/pubConfig';
import { douyin, douyinCallBackCompensate } from '@/services/pages/callback';

const Page = () => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [selectedRowKeys, selectedRowKeysSet] = useState<any[]>([]);
  // 查看回调
  const info = (text: any, width: number, title: string) => {
    Modal.info({
      title: title || '查看信息',
      content: <div>{text}</div>,
      okText: '关闭',
      width,
      onOk() {
        console.log('ok');
      },
    });
  };
  const compensateAction = async (data: any[]) => {
    const res = await douyinCallBackCompensate(data);
    if (res.code == '0') {
      pubMsg('操作成功!', 'success');
      selectedRowKeysSet([]);
      actionRef?.current?.clearSelected();
      actionRef?.current?.reload();
    } else {
      pubMsg(res?.message);
    }
  };
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '批次号',
      dataIndex: 'batchNo',
      width: 110,
    },
    {
      title: '防伪签名',
      dataIndex: 'eventSign',
      width: 250,
    },
    {
      title: '请求body',
      dataIndex: 'requestBody',
      align: 'center',
      render: (_: any, record: any) => (
        <a
          onClick={() => {
            info(record.requestBody, 1200, '请求body');
          }}
        >
          查看
        </a>
      ),
      width: 100,
    },
    {
      title: '订单id',
      dataIndex: 'orderId',
      width: 180,
    },
    {
      title: '消息体',
      dataIndex: 'msgBody',
      width: 100,
      align: 'center',
      render: (_: any, record: any) => (
        <a
          onClick={() => {
            info(record.msgBody, 1200, '消息体');
          }}
        >
          查看
        </a>
      ),
    },
    {
      title: '消息种类',
      dataIndex: 'tag',
      width: 100,
    },
    {
      title: '消息唯一标示id',
      dataIndex: 'msgId',
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 80,
      valueEnum: {
        SIGN_ERROR: {
          text: '签名异常',
        },
        WAIT_DEAL: {
          text: '待消费',
        },
        SUCCESS: {
          text: '消费成功',
        },
        FAIL: {
          text: '消费失败',
        },
      },
    },
    {
      title: '回调信息',
      dataIndex: 'callBackMessege',
      width: 100,
      align: 'center',
      render: (_: any, record: any) => (
        <a
          onClick={() => {
            info(record.callBackMessege, 1200, '回调信息');
          }}
        >
          查看
        </a>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 130,
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 100,
      align: 'center',
      valueType: 'option',
      hideInTable: !access.canSee('order_callbackCompensate'),
      fixed: 'right',
      render: (_: any, row: any) => [
        <Popconfirm
          key="compensate"
          title="确定操作吗?"
          onConfirm={async () => compensateAction([row.id])}
          okText="确定"
          cancelText="取消"
        >
          <a>回调补偿 </a>
        </Popconfirm>,
      ],
    },
  ];
  return (
    <ProTable
      bordered
      columns={columns}
      actionRef={actionRef}
      options={{ fullScreen: true, setting: false }}
      pagination={{
        showSizeChanger: true,
      }}
      headerTitle={
        <Button
          type="primary"
          ghost
          onClick={() => {
            if (!selectedRowKeys.length) {
              pubAlert('请勾选数据');
              return;
            }
            pubModal(`确定批量回调补偿吗`)
              .then(async () => {
                compensateAction(selectedRowKeys);
              })
              .catch(() => {
                console.log('点击了取消');
              });
          }}
        >
          批量回调补偿
        </Button>
      }
      form={{
        ignoreRules: false,
      }}
      formRef={formRef}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      request={async (params: any) => {
        const formData = {
          ...params,
          pageIndex: params.current,
        };
        const res = await douyin(formData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return {
            success: false,
            data: [],
            total: 0,
          };
        }
        return {
          success: true,
          data: res?.data?.list || [],
          total: res?.data?.total || 0,
        };
      }}
      rowSelection={{
        preserveSelectedRowKeys: true,
        selectedRowKeys,
        onChange: (keys) => {
          selectedRowKeysSet(keys);
        },
      }}
      rowKey="id"
      dateFormatter="string"
      scroll={{ x: 1600 }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      search={{ labelWidth: 120, defaultCollapsed: false }}
    />
  );
};

export default Page;

import { useAccess } from 'umi';
import { useRef, useState } from 'react';
import { Button, Modal, Popconfirm } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import { pubAlert, pubConfig, pubModal, pubMsg } from '@/utils/pubConfig';
import { qimen, qimenCallBackCompensate } from '@/services/pages/callback';

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
    const res = await qimenCallBackCompensate(data);
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
      title: '回调方法',
      dataIndex: 'method',
      width: 100,
    },
    {
      title: '货主编码',
      dataIndex: 'customerId',
      width: 100,
    },
    {
      title: '回调信息',
      dataIndex: 'callBackMessege',
      width: 100,
      align: 'center',
    },

    {
      title: '回调主体',
      dataIndex: 'body',
      width: 80,
      render: (_: any, record: any) => (
        <a
          onClick={() => {
            info(record.body, 1200, '回调主体');
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
      fixed: 'right',
      hideInTable: !access.canSee('order_callbackCompensate'),
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
      options={{ fullScreen: true, setting: false }}
      scroll={{ x: 1600 }}
      formRef={formRef}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      request={async (params: any) => {
        const formData = {
          ...params,
          pageIndex: params.current,
        };
        const res = await qimen(formData);
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
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      search={{ labelWidth: 120, defaultCollapsed: false }}
    />
  );
};

export default Page;

import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { connect, Link, useModel, useRequest } from 'umi';
import React, { useRef, useState } from 'react';
import { Button, Menu, Popconfirm } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { MailOutlined } from '@ant-design/icons';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  deleteListItemsUser,
  getListUser,
  setRead,
  setReadAll,
} from '@/services/pages/notification';
import { countUnread } from '@/services/pages/notification';
import { useAccess, Access } from 'umi';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Page: React.FC = () => {
  // model下发数据
  // const { dispatch, common } = props;
  // const {dicList} = common;
  // 页面状态
  const { setInitialState } = useModel('@@initialState');
  const [type, setType] = useState('');
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [selectedRowsState, setSelectedRows] = useState<any>([]);
  // 获取消息条数
  const [count, setCount] = useState<any>();
  // 表格操作方法
  const requestTableList = async (params: any): Promise<any> => {
    const res = await getListUser({
      ...params,
      page_size: params.pageSize,
      current_page: params.current,
    });
    if (res && res.code == pubConfig.sCode) {
      setCount({
        message: res.data.message,
        notify: res.data.notify,
        notice: res.data.notice,
      });
      return {
        success: true,
        data: res.data.records,
        total: res.data.total,
      };
    }
  };
  // 更新顶部未读消息数量
  const { run: runRefreshUnreadCount } = useRequest(countUnread, {
    manual: true,
    onSuccess(unreadMsgCount: any) {
      setInitialState((s: any) => ({ ...s, unreadMsgCount }));
    },
  });
  // keepAlive页面激活钩子函数
  useActivate(() => {
    if (actionRef?.current) actionRef?.current?.reload();
  });
  // 表格配置
  type TableListItem = {
    id: number | string;
    type: string;
    title: string;
    receiver_type: number;
    content: string;
    receiver_user_list: Record<string, any>;
  };
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '所属分类',
      dataIndex: 'type',
      align: 'center',
      hideInSearch: true,
      valueEnum: {
        0: { text: '消息' },
        1: { text: '通知' },
        2: { text: '公告' },
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '接收时间',
      dataIndex: 'create_time',
      align: 'center',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '发布时间',
      dataIndex: 'create_time',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            time_start: `${value[0]}`,
            time_end: `${value[1]}`,
          };
        },
      },
    },
    {
      title: '状态',
      dataIndex: 'read_status',
      align: 'center',
      valueEnum: {
        0: { text: '未读', status: 'success' },
        1: { text: '已读', status: 'default' },
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 120,
      align: 'center',
      valueType: 'option',
      render: (_, row) => [
        <Link to={`/notification/display?type=user&id=${row.id}`} key="detail">
          查看
        </Link>,
      ],
    },
  ];

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <ProTable<TableListItem>
        tableStyle={{ minHeight: '520px' }}
        columns={columns}
        request={requestTableList}
        formRef={formRef}
        actionRef={actionRef}
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
        tableRender={(_, dom) => (
          <div style={{ display: 'flex', width: '100%', background: ' #ffffff' }}>
            <Menu
              selectedKeys={[type]}
              onSelect={(e) => setType(e.key)}
              style={{ width: 180 }}
              defaultOpenKeys={['menu1']}
              openKeys={['menu1']}
              mode="inline"
              onOpenChange={() => setType('')}
            >
              <Menu.SubMenu
                key="menu1"
                title={
                  <span>
                    <MailOutlined />
                    <span>
                      {count
                        ? `全部消息(${Number(
                            Number(count.message) + Number(count.notify) + Number(count.notice),
                          )})`
                        : '全部消息'}
                    </span>
                  </span>
                }
              >
                <Menu.Item key="0">{count ? `消息(${count.message})` : '消息'}</Menu.Item>
                <Menu.Item key="1">{count ? `通知(${count.notify})` : '通知'}</Menu.Item>
                <Menu.Item key="2">{count ? `公告(${count.notice})` : '公告'}</Menu.Item>
              </Menu.SubMenu>
            </Menu>
            <div style={{ flex: 1 }}>{dom}</div>
          </div>
        )}
        rowKey="id"
        params={{
          type,
        }}
        dateFormatter="string"
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        toolbar={{
          actions: [
            <Access key="ssButton" accessible={access.canSee('notification_readAll')}>
              <Button
                onClick={async () => {
                  const res = await setReadAll();
                  if (res) {
                    if (res.code == pubConfig.sCode) {
                      pubMsg(res.message, 'success');
                      setSelectedRows([]);
                      actionRef.current?.reloadAndRest?.();
                      runRefreshUnreadCount({});
                    } else {
                      pubMsg(res.message);
                    }
                  } else {
                    pubMsg('服务异常, 标成失败');
                  }
                }}
              >
                全部标成已读
              </Button>
            </Access>,
          ],
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项 &nbsp;&nbsp;
            </div>
          }
        >
          <Access key="readButton" accessible={access.canSee('notification_read')}>
            <Button
              onClick={async () => {
                const res = await setRead({
                  id: selectedRowsState.map((item: any) => item.id).toString(),
                });
                if (res) {
                  if (res.code == pubConfig.sCode) {
                    pubMsg(res.message, 'success');
                    setSelectedRows([]);
                    actionRef.current?.reloadAndRest?.();
                    runRefreshUnreadCount({});
                  } else {
                    pubMsg(res.message);
                  }
                } else {
                  pubMsg('服务异常, 标记失败');
                }
              }}
            >
              批量标成已读
            </Button>
          </Access>
          <Access key="delButton" accessible={access.canSee('notification_delete')}>
            <Popconfirm
              title="确定删除选中的内容?"
              onConfirm={async () => {
                const res = await deleteListItemsUser({
                  id: selectedRowsState.map((item: any) => item.id).toString(),
                });
                if (res) {
                  if (res.code == pubConfig.sCode) {
                    pubMsg(res.message, 'success');
                    setSelectedRows([]);
                    actionRef.current?.reloadAndRest?.();
                  } else {
                    pubMsg(res.message);
                  }
                } else {
                  pubMsg('服务异常, 删除失败');
                }
              }}
              okText="确定"
              cancelText="取消"
            >
              <Button danger>批量删除</Button>
            </Popconfirm>
          </Access>
        </FooterToolbar>
      )}
    </PageContainer>
  );
};

// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

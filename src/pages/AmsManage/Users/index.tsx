import { PageContainer } from '@ant-design/pro-layout';
import { Access, connect, useAccess } from 'umi';
import { useRef } from 'react';
import { Button, Popconfirm, Space, Switch, Tag } from 'antd';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  getUserList,
  deleteCusUser,
  disableCusUser,
  syncDingUser,
} from '@/services/pages/AmsManage/users';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import Update from './Update';
import { pubModal } from '@/utils/pubConfig';
import UserDetail from './UserDetail';
import ChangeRole from './ChangeRole';

const Account = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  console.log(dicList.ams_user_type);
  const access = useAccess();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      account: params?.name,
      pageIndex: params?.current,
      pageSize: params?.pageSize,
    };

    const res = await getUserList(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.list || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 搜索清除前后空格
  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();

  // 启用禁用数据
  const updateStatusAction = (val: any, id: string) => {
    console.log(val);
    pubModal(`是否${val ? '启用' : '停用'}此应用？`)
      .then(async () => {
        const res = await disableCusUser({ userId: id });
        if (res?.code != pubConfig.sCodeOrder) {
          pubMsg(res?.message);
          return;
        }
        pubMsg('操作成功!', 'success');
        ref?.current?.reload();
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 删除
  const deleteUser = async (id: string) => {
    const res = await deleteCusUser({ userId: id });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      return;
    }
    pubMsg('操作成功!', 'success');
    ref?.current?.reload();
  };
  // keepAlive页面激活钩子函数
  useActivate(() => {
    ref?.current?.reload();
  });
  // 表格配置
  const columns: any[] = [
    {
      title: (_: any, type: string) => {
        return type === 'table' ? '姓名' : '姓名/账号';
      },
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '职位',
      dataIndex: 'position',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '昵称',
      dataIndex: 'nickName',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '账号',
      dataIndex: 'account',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <Space size={5}>
          <>{record.account}</> {record.appType == '3' && <Tag color="blue"> 钉钉 </Tag>}
        </Space>
      ),
    },
    {
      title: '钉钉id',
      dataIndex: 'dingdingId',
      align: 'center',
    },
    {
      title: '账户类型',
      dataIndex: 'appType',
      align: 'center',
      valueType: 'select',
      hideInTable: true,
      fieldProps: {
        placeholder: '请选择类型',
      },
      initialValue: '3',
      valueEnum: dicList?.ams_user_type || {},
    },
    {
      title: '状态',
      dataIndex: 'disable',
      valueType: 'select',
      fieldProps: selectProps,
      hideInSearch: true,
      align: 'center',
      render: (_, record) => {
        return access.canSee('ams_user_disable') ? (
          <Switch
            onChange={(val) => updateStatusAction(val, record.id)}
            checkedChildren="启用"
            unCheckedChildren="停用"
            checked={record.disable == '1' ? true : false}
          />
        ) : (
          <>
            {record.disable == '1' && <Tag color="green">启用</Tag>}
            {record.disable == '0' && <Tag color="red">停用</Tag>}
          </>
        );
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 220,
      align: 'center',
      valueType: 'option',
      hideInTable: !access.canSee('account_reset'),
      render: (_: any, row: any) => [
        <Access key="detail" accessible={access.canSee('ams_user_findById')}>
          <UserDetail id={row.id} trigger={<a>查看详情</a>} />
        </Access>,
        <Access key="edit" accessible={access.canSee('ams_user_edit')}>
          <Update id={row.id} trigger={<a>编辑</a>} reload={() => ref?.current?.reload()} />
        </Access>,
        <Access key="role" accessible={access.canSee('ams_user_authRole')}>
          <ChangeRole id={row.id} reload={() => ref?.current?.reload()} trigger={<a>授权角色</a>} />
        </Access>,
        <Access key="delete" accessible={access.canSee('ams_user_delete')}>
          <Popconfirm
            key="delete"
            title={`是否确认删除-${row.name}？`}
            onConfirm={async () => deleteUser(row.id)}
            okText="确定"
            cancelText="取消"
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </Access>,
      ],
    },
  ];
  const getDingUser = () => {
    pubModal(`是否确定同步钉钉部门和用户信息？`)
      .then(async () => {
        const res = await syncDingUser({});
        if (res?.code != pubConfig.sCodeOrder) {
          pubMsg(res?.message);
          return;
        }
        ref?.current?.reload();
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable<TableListItem>
          columns={columns}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          bordered
          actionRef={ref}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          rowKey="id"
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          dateFormatter="string"
          headerTitle={
            <Access key="edit" accessible={access.canSee('ams_ding_syns')}>
              <Button
                type="primary"
                onClick={() => {
                  getDingUser();
                }}
              >
                同步钉钉部门和用户
              </Button>
            </Access>
          }
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(
  ({ account, common }: { account: Record<string, unknown>; common: Record<string, unknown> }) => ({
    account,
    common,
  }),
)(Account);
export default ConnectPage;

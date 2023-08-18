import { PageContainer } from '@ant-design/pro-layout';
import { Access, connect, useAccess, history } from 'umi';
import { useRef,useState } from 'react';
import { Button, Popconfirm, Space, Switch, Tag,Tooltip } from 'antd';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  getRoleList,
  roleUpdateStatus,
  roleDelete,
} from '@/services/pages/AmsManage/roles';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useActivate } from 'react-activation';
import AddRoles from './AddRoles';
import { pubModal } from '@/utils/pubConfig';
import RoleUserDetail from './RoleUserDetail';
import ExportRoleMenu from './ExportRoleMenu';

const Account = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  console.log(dicList.ams_user_type);
  const [selectRows, setSelectRows] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const access = useAccess();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      account: params?.name,
      pageIndex: params?.current,
      pageSize: params?.pageSize,
    };

    const res = await getRoleList(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.list || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();

  // 启用禁用数据
  const updateStatusAction = (val: any, id: string) => {
    console.log(val);
    pubModal(`是否${val ? '启用' : '停用'}此角色？`)
      .then(async () => {
        const res = await roleUpdateStatus({ id: id });
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
  const deleteRoles = async (id: string) => {
    const res = await roleDelete({ roleId: id });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      return;
    }
    pubMsg('操作成功!', 'success');
    ref?.current?.reload();
  };
  // 分配权限
  const changePermission = (data: any, type: any) => {
    history.push(`/ams/roles/roleDetail?id=${data.id}&name=${data.name}&type=${type}`);
  };
  // 查看权限
  const showPermission = (data: any) => {
    history.push(`/ams/roles/roleMenuDetail?id=${data.id}&name=${data.name}`);
  };
  // 分配用户
  const changeUser = (data: any) => {
    history.push(`/ams/roles/roleUser?id=${data.id}&name=${data.name}`);
  };
  // 批量编辑角色权限
  const editRolesPromiss = () => {
    history.push(`/ams/roles/editRolesPromiss?data=${selectedItems.map((v: any) => v.code).join(',')}`);
  };

  // keepAlive页面激活钩子函数
  useActivate(() => {
    ref?.current?.reload();
  });
  // 表格配置
  const columns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      hideInSearch: true,
      align: 'center',
      width: 60,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      align: 'center',
      width: 180,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      align: 'center',
      width: 180,
    },
    {
      title: '描述',
      dataIndex: 'remark',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInSearch: true,
      align: 'center',
      width: 90,
      render: (_: any, record: any) => {
        return access.canSee('ams_role_statusUpdate') ? (
          <Switch
            onChange={(val) => updateStatusAction(val, record.id)}
            checkedChildren="启用"
            unCheckedChildren="停用"
            checked={record.status == 'y' ? true : false}
          />
        ) : (
          <>
            {record.status == 'y' && <Tag color="green">启用</Tag>}
            {record.status == 'n' && <Tag color="red">停用</Tag>}
          </>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'options',
      align: 'center',
      hideInSearch: true,
      render: (_: any, row: any) => (
        <Space>
          <Access key="role_edit" accessible={row.status == 'y' && access.canSee('ams_role_edit')}>
            <AddRoles rowData={row} trigger={<a>编辑角色</a>} reload={() => ref?.current?.reload()} />
          </Access>
          <Access key="role_user_detail" accessible={access.canSee('ams_role_user_detail')}>
            <RoleUserDetail rowData={row} trigger={<a>查看用户</a>} />
          </Access>

          <Access key="role_detail" accessible={access.canSee('ams_role_detail')}>
            <a onClick={() => changePermission(row, '1')}>分配权限</a>
          </Access>
          <Access key="role_detail_apply" accessible={access.canSee('ams_role_detail_apply')}>
            <a onClick={() => changePermission(row, '2')}>申请操作权限</a>
          </Access>
          <Access key="role_user" accessible={access.canSee('ams_role_user')}>
            <a onClick={() => changeUser(row)}>分配用户</a>
          </Access>
          <Access key="role_menu_detail" accessible={access.canSee('ams_role_menu_detail')}>
            <a onClick={() => showPermission(row)}>查看权限</a>
          </Access>
          <Access key="role_delete" accessible={row.status == 'y' && access.canSee('ams_role_delete')}>
            <Popconfirm
              key="delete"
              title={`是否确认删除-${row.name}？`}
              onConfirm={async () => deleteRoles(row.id)}
              okText="确定"
              cancelText="取消"
            >
              <a style={{ color: 'red' }}>删除</a>
            </Popconfirm>
          </Access>
        </Space>
      )
    },
  ];
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
          rowSelection={{
            selectedRowKeys: selectRows,
            onChange: (selectedRowKeys: any, rowItems: any) => {
              setSelectRows(selectedRowKeys);
              setSelectedItems(rowItems);
            },
          }}
          headerTitle={
            <Space>
              <Access key="ams_role_add" accessible={access.canSee('ams_role_add')}>
                <AddRoles
                  trigger={<Button type="primary">添加角色</Button>}
                  reload={() => ref?.current?.reload()}
                />
              </Access>
              <Access key="role_menu_export" accessible={access.canSee('ams_role_menu_export')}>
                <ExportRoleMenu
                  trigger={<Button >菜单角色导出</Button>}
                />
              </Access>
              <Access key="edit_role_permiss" accessible={access.canSee('ams_edit_role_permiss')}>
                <Button type="primary" onClick={() => editRolesPromiss()} >批量编辑角色权限</Button>
                <Tooltip placement="top" title={(
                  <>
                  <div> 1、直接点击该按钮，需在跳转页面选择需要操作的权限和角色 </div>
                  <div> 2、勾选列表角色，再点击该按钮，会将勾选角色已有的权限显示在跳转页面 </div>
                  </>
                )}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </Access>
            </Space>
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

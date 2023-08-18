import { PageContainer } from '@ant-design/pro-layout';
import { connect, Access, useAccess } from 'umi';
import { useEffect, useState } from 'react';
import { Button, Popconfirm, Tag, Table, Space } from 'antd';
import { listPage, deleteMenu } from '@/services/pages/AmsManage/menus';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import AddMenus from './AddMenus';
import AddButton from './AddButton';
import FindRoleUser from './FindRoleUser';
import SetFunction from './SetFunction';
import MenuText from './MenuText';
import './style.less';

const Page = () => {
  const access = useAccess();
  const [menuData, setMenuData] = useState([])
  const [openRowKeys, setOpenRowKeys] = useState([])

  // 递归
  const changeMenu = (data: any) => {
    return data.map((v: any) => {
      let isAddButton = false; // 是否能添加按钮
      let isAddMenu = false; // 是否能添加按钮
      if (!v.children) {
        isAddButton = true;
        isAddMenu = true;
      }
      if (v.children && v.children[0].type == 2) {
        isAddButton = true;
      }
      if (v.children && v.children[0].type == 1) {
        isAddMenu = true;
      }
      const newChildren = v.children ? changeMenu(v.children) : null;
      return {
        ...v,
        isAddButton,
        isAddMenu,
        children: newChildren,
      };
    });
  };

  // 获取表格数据
  const getList = async (): Promise<any> => {
    const postData = {
      appId: "1626436189152845826",
    };
    const res = await listPage(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    const newD: any = []
    res?.data.forEach((v: any) => {
      newD.push(v.id)
      if (v.children && v.children.length) {
        v.children.forEach((k: any) => {
          newD.push(k.id)
        });
      }
    });
    // console.log(newD)
    setOpenRowKeys(newD)
    setMenuData(changeMenu(res?.data || []))
  };
  useEffect(() => {
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 删除
  const deleteApp = async (id: string) => {
    const res = await deleteMenu({ menuId: id });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      return;
    }
    pubMsg('操作成功!', 'success');
    getList();
  };
  // 表格配置
  const columns: any[] = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      render: (_: any, record: any) => (<MenuText text={record.name}/>),
    },
    {
      title: '路径',
      dataIndex: 'routeUrl',
      // render: (_: any, record: any) => record.type == 1 ? record.routeUrl : '',
      render: (_: any, record: any) => (<MenuText text={record.type == 1 ? record.routeUrl : ''}/>),
    },
    {
      title: '类型',
      dataIndex: 'tag',
      align: 'center',
      width: 60,
      render: (_: any, record: any) => (
        <>
          {record.type == 1 && <Tag color="blue">菜单</Tag>}
          {record.type == 2 && <Tag color="green">按钮</Tag>}
        </>
      ),
    },
    {
      title: '前端code',
      dataIndex: 'path',
      render: (_: any, record: any) => (<MenuText text={record.path}/>),
    },
    {
      title: '排序',
      dataIndex: 'menuOrder',
      width: 50,
      align: 'center',
    },
    {
      title: '操作',
      align: 'center',
      width: 320,
      dataIndex: 'options',
      render: (_: any, record: any) => (
        <Space>
          <Access key="ams_menus_add" accessible={record.type == '1' && record.isAddMenu && access.canSee('ams_menus_add')}>
            <AddMenus data={record} type={'add'} trigger={<a>添加子菜单</a>} reload={() => getList()} />
          </Access>
          <Access key="ams_menusButton_add" accessible={record.type == '1' && record.isAddButton && access.canSee('ams_menusButton_add')}>
            <AddButton data={record} type={'add'} trigger={<a>添加按钮</a>} reload={() => getList()} />
          </Access>
          <Access key="ams_menus_edit" accessible={record.type == '1' && access.canSee('ams_menus_edit')}>
            <AddMenus data={record} type={'edit'} trigger={<a>编辑菜单</a>} reload={() => getList()} />
          </Access>
          <Access key="ams_menusButton_edit" accessible={record.type == '2' && access.canSee('ams_menusButton_edit')}>
            <AddButton data={record} type={'edit'} trigger={<a>编辑按钮</a>} reload={() => getList()} />
          </Access>
          <Access key="ams_menus_saveFunction" accessible={record.type == '2' && access.canSee('ams_menus_saveFunction')}>
            <SetFunction data={record} trigger={<a>绑定接口</a>} reload={() => getList()} />
          </Access>
          <Access key="ams_find_role_user" accessible={record.type == '2' && access.canSee('ams_find_role_user')}>
            <FindRoleUser data={record} trigger={<a>查询角色/用户</a>} reload={() => getList()} />
          </Access>
          <Access key="ams_menus_delete" accessible={(!record.children || !record.children.length) && record.type == '1' && access.canSee('ams_menus_delete')}>
            <Popconfirm
              key="delete"
              title="确定删除吗?"
              onConfirm={async () => deleteApp(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <a style={{ color: 'red' }}>删除</a>
            </Popconfirm>
          </Access>
          <Access key="ams_menusButton_delete" accessible={record.type == '2' && access.canSee('ams_menus_delete')}>
            <Popconfirm
              key="delete"
              title="确定删除吗?"
              onConfirm={async () => deleteApp(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <a style={{ color: 'red' }}>删除按钮</a>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <div className='ams-menus'>
        <div className='ams-menus-header'>
          <Access key="menus_add" accessible={access.canSee('ams_menus_add')}>
            <AddMenus type={'add'} trigger={<Button type="primary">添加一级菜单</Button>} reload={() => getList()} />
          </Access>
        </div>
        {
          menuData.length && openRowKeys.length ? (
            <Table
              columns={columns}
              dataSource={menuData}
              pagination={false}
              rowKey='id'
              expandable={{
                defaultExpandedRowKeys: openRowKeys,
              }}
            />
          ) : ''
        }

      </div>
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(
  ({ common }: { common: Record<string, unknown> }) => ({
    common,
  }),
)(Page);
export default ConnectPage;

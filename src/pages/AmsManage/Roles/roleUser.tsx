import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { Button, Card, Spin, Tag, } from 'antd';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { connect, history, } from 'umi';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import {
  setUserToRole,
  getUserList,
  getUserRoleByUserIdAndRoleId,
} from '@/services/pages/AmsManage/roles';
import './roleUser.less';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';

const Page: FC<Record<string, any>> = (props) => {
  const { common } = props;
  const { dicList } = common;
  const role_id = history?.location?.query?.id;
  const [loading, setLoading] = useState(false);
  const [hasdRole, setHasdRole] = useState<any>([])

  // 递归取子ID
  const getMenuIds = (data: any, ids?: any) => {
    let newIds = ids || [];
    data.forEach((v: any) => {
      if (v.children) {
        newIds.push(v.id);
        newIds = getMenuIds(v.children, newIds);
      } else {
        newIds.push(v.id);
      }
    });
    return newIds;
  };

  // 递归
  const changeMenu = (data: any, parentIds?: any) => {
    const newData: any = [];
    data.forEach((item: any) => {
      let newChildren = null; // 子级菜单
      const buttonList: any = []; // 子级按钮
      const buttonIds: any = []; // 全选用 子级按钮的所有ID
      let cids: any = []; // 所有的子级ID，不加自己
      const pids: any = parentIds.concat([item.id]); // 所有的父级ID。加自己
      if (item.children) {
        cids = getMenuIds(item.children);
        if (item.children[0].type == 2) {
          newChildren = null;
          item.children.forEach((s: any) => {
            buttonList.push({
              ...s,
              allIds: item.children.map((k: any) => k.id),
            });
            buttonIds.push(s.id);
          });
        }
        if (item.children[0].type == 1) {
          newChildren = changeMenu(item.children, pids);
        }
      }
      newData.push({
        ...item,
        children: newChildren,
        parentIds: pids,
        childrenAllId: cids,
        newIds: [...new Set([...pids, ...cids])],
        buttonList,
        buttonIds,
      });
    });
    return newData;
  };
  // 获取角色已有的人
  const getRoleUser = async () => {
    setLoading(true);
    const res = await getUserRoleByUserIdAndRoleId({ roleId: role_id });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    setHasdRole(res.data.users || []);
    setLoading(false);
  };
  // 获取所有的人

  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      pageIndex: params?.current,
      pageSize: params?.pageSize,
      appType: "3",
      name: params.key || '',
      account: params.key || '',
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


  useEffect(() => {
    getRoleUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // 选择人
  const chosedUser = (data: any) => {
    if (data.status == '0') return pubMsg('不能选择离职人员！');
    const newD = JSON.parse(JSON.stringify(hasdRole));
    newD.push(data);
    setHasdRole(newD);

  };
  // 删除人
  const deleteUser = (data: any) => {
    const newD = hasdRole.filter((v: any) => v.id != data.id);
    setHasdRole(newD);
  };


  // 提交
  const submit = async () => {
    setLoading(true);
    const res = await setUserToRole({
      roleId: role_id,
      userIds: hasdRole.map((v: any) => v.id).join(','),
    });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    pubMsg('操作成功!', 'success');
    history.push('/ams/roles')
  };

  // 表格配置
  const columns: any[] = [
    {
      title: '账号',
      dataIndex: 'account',
      align: 'center',
      width: 160,
      render: (_: any, row: any) => (
        <>
          {row?.account} <Tag v-if="row.appType == '3'" color="blue">钉钉</Tag>
        </>
      ),
    },
    {
      title: '职位',
      dataIndex: 'position',
      align: 'center',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'options',
      width: 60,
      align: 'center',
      render: (_: any, row: any) => (
        <a onClick={() => deleteUser(row)}>删除</a>
      ),
    },
  ];
  const columns1: any[] = [
    {
      title: '账号',
      dataIndex: 'account',
      align: 'center',
      width: 170,
      hideInSearch: true,
      render: (_: any, row: any) => (
        <>
          {row?.account} <Tag v-if="row.appType == '3'" color="blue">钉钉</Tag>
        </>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '姓名/账号',
      dataIndex: 'key',
      align: 'center',
      hideInTable: true,
    },
    {
      title: '职位',
      dataIndex: 'position',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      hideInSearch: true,
      render: (_: any, row: any) => (
        <>
          {row.status == '1' && <Tag color="green">在职</Tag>}
          {row.status == '0' && <Tag color="red">离职</Tag>}
        </>
      ),
    },
    {
      title: '账户类型',
      dataIndex: 'appType',
      align: 'center',
      valueType: 'select',
      hideInTable: true,
      initialValue: '3',
      valueEnum: dicList?.ams_user_type || {},
    },
    {
      title: '操作',
      dataIndex: 'options',
      width: 60,
      align: 'center',
      hideInSearch: true,
      render: (_: any, row: any) => (
        hasdRole.find((k: any) => k.id == row.id) ? (<a className='list-green'><CheckCircleOutlined /></a>) : (<a onClick={() => chosedUser(row)}>选择</a>)
      ),
    },
  ];
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      footer={[
        <Button
          icon={<ArrowLeftOutlined />}
          key={'backBtn'}
          onClick={() => history.push('/ams/roles')}
        >
          返回
        </Button>,
        <Button
          key={'saveBtn'}
          type="primary"
          onClick={() => submit()}
        >
          保存
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Card bordered={false} title={`角色分配用户 --【${history?.location?.query?.name}】`}>

          <div className="changeRoleUser">
            <div className="changeRoleUser-user">
              <div className="changeRoleUser-title">已选择的用户</div>
              <div className="changeRoleUser-body">
                <ProTable
                  columns={columns}
                  options={false}
                  pagination={false}
                  bordered
                  dataSource={hasdRole}
                  rowKey="id"
                  size='small'
                  search={false}
                  dateFormatter="string"
                  className="p-table-0"
                />
              </div>

            </div>
            <div className="changeRoleUser-all">
              <div className="changeRoleUser-title">全部用户</div>
              <div className="changeRoleUser-body-all">
                <ProTable
                  rowKey="id"
                  columns={columns1}
                  options={false}
                  bordered
                  defaultSize={'small'}
                  search={{ className: 'light-search-form', defaultCollapsed: false }}
                  dateFormatter="string"
                  request={getListAction}
                />
              </div>

            </div>
          </div>

        </Card>
      </Spin>
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

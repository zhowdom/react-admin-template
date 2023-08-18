/*数据库配置管理  @zhujing 2022-07-01*/
import { Access, connect, useAccess } from 'umi';
import { useRef } from 'react';
import { message, Popconfirm } from 'antd';
import { useActivate } from 'react-activation';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import Update from './Dialogs/Update';
import { getList, remove } from '@/services/pages/database';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Page: React.FC<{ common?: any }> = () => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  const removeById = async (id: string) => {
    const res = await remove(id);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return false;
    }
    message.success(res?.message || '删除成功');
    actionRef?.current?.reload();
    return true;
  };
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '名称',
      dataIndex: 'database',
      align: 'center',
    },
    {
      title: '地址',
      dataIndex: 'host',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '端口',
      dataIndex: 'port',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '密码',
      dataIndex: 'password',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      width: 80,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (_: any, record: any) => [
        <Access key="edit" accessible={access.canSee('database_add')}>
          <Popconfirm title={'确定删除?'} onConfirm={() => removeById(record?.id)}>
            <a>删除</a>
          </Popconfirm>
        </Access>,
      ],
    },
  ];
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable
        bordered
        columns={columns}
        actionRef={actionRef}
        pagination={{
          showSizeChanger: true,
        }}
        formRef={formRef}
        request={async (params: any) => {
          const res = await getList(params);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          let data = res?.data || [];
          if (params.database) {
            data = data.filter((item: any) => item.database.indexOf(params.database) > -1);
          }
          return {
            success: true,
            data,
          };
        }}
        rowKey="id"
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
        dateFormatter="string"
        headerTitle={'数据库管理'}
        toolBarRender={() => [
          <Access key="edit" accessible={access.canSee('stock_up_capacity_add')}>
            <Update reload={actionRef?.current?.reload} />
          </Access>,
        ]}
        scroll={{ x: 800 }}
        sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
        showSorterTooltip={false}
        options={{ fullScreen: true, setting: false }}
      />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

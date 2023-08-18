import { PageContainer } from '@ant-design/pro-layout';
import { connect, useAccess } from 'umi';
import ProTable from '@ant-design/pro-table';
import type { ActionType } from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import { useRef } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';
import { getTokenList, tokenDelete } from '@/services/pages/AmsManage/token';
import { Popconfirm } from 'antd';

const Token = (props: any) => {
  console.log(7777);
  const { common } = props;
  const { dicList } = common;
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const access = useAccess();
  console.log(dicList.ams_app_name);
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      pageIndex: params?.current,
      pageSize: params?.pageSize,
      clientId: 'liyi99',
    };

    const res = await getTokenList(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data || [],
      success: true,
      total: res?.total || 0,
    };
  };

  // keepAlive页面激活钩子函数
  useActivate(() => {
    ref?.current?.reload();
  });
  // 删除
  const deleteAction = async (data: any) => {
    const res = await tokenDelete({ token: data.tokenValue });
    if (res.code == '0') {
      pubMsg('删除成功!', 'success');
      ref?.current?.reload();
    } else {
      pubMsg(res?.message);
    }
  };
  // 表格配置
  const columns: any[] = [
    {
      title: '账户名',
      dataIndex: 'username',
      align: 'center',
      hideInTable: true,
    },
    {
      title: 'Token的值',
      dataIndex: 'tokenValue',
      align: 'center',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '到期时间',
      dataIndex: 'expiration',
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
      title: '所属应用',
      dataIndex: 'clientId',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '授权类型',
      dataIndex: 'grantType',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '账号类型',
      dataIndex: 'accountType',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'options',
      align: 'center',
      width: 100,
      hideInSearch: true,
      hideInTable: !access.canSee('ams_tokens_remove'),
      render: (_: any, record: any) => (
        <Popconfirm
          key="delete"
          title="确定删除吗?"
          onConfirm={async () => deleteAction(record)}
          okText="确定"
          cancelText="取消"
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>
      ),
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
          rowKey={(record: any) => record.id + record.expiration}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          dateFormatter="string"
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(
  ({ common }: { account: Record<string, unknown>; common: Record<string, unknown> }) => ({
    common,
  }),
)(Token);
export default ConnectPage;

import { Access, useAccess } from 'umi';
import { useEffect, useRef, useState } from 'react';
import { Space } from 'antd';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import { getAppSelectAll, getMethodsList } from '@/services/pages/AmsManage/comFunction';
import FindButton from './FindButton';
import AddButtonFunction from './AddButtonFunction';

const Page: React.FC<{ common: any }> = () => {
  const access = useAccess();
  const [tabsList, tabsListSet] = useState([]);
  const [tabActiveKey, tabActiveKeySet] = useState();
  const [appId, appIdSet] = useState();
  const getApps = () => {
    getAppSelectAll({}).then((res) => {
      if (res.code == pubConfig.sCodeOrder) {
        const list = res?.data?.list?.filter((k: any) => k.code != 'common') || [];
        tabsListSet(
          list?.map((v: any) => {
            return {
              tab: v.name,
              key: v.id,
            };
          }),
        );
        tabActiveKeySet(res?.data?.list?.[0]?.id);
        appIdSet(res?.data?.list?.[0]?.id);
      } else {
        pubMsg(res?.message);
      }
    });
  };

  useEffect(() => {
    getApps();
  }, []);
  const getListAction = async (params: any): Promise<any> => {
    console.log(params, 'params');
    if (!appId) return;
    const postData = {
      ...params,
      pageIndex: params?.current,
      pageSize: params?.pageSize,
    };
    const res = await getMethodsList(postData);
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
  const actionRef = useRef<ActionType>();
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  // 表格配置
  const columns: ProColumns[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: '应用名称',
      dataIndex: 'appName',
      hideInSearch: true,
    },
    {
      title: 'controller名称',
      dataIndex: 'controllerName',
    },
    {
      title: '方法名',
      dataIndex: 'methodName',
    },
    {
      title: '方法包路径',
      dataIndex: 'controllerPath',
    },
    {
      title: '方法调用路径',
      dataIndex: 'methodUrl',
    },
    {
      title: '操作',
      align: 'center',
      width: 140,
      dataIndex: 'options',
      hideInSearch: true,
      render: (_, row) => [
        <Access key="detail" accessible={access.canSee('ams_comFunction_find_button')}>
          <FindButton trigger={<a>{`查询按钮 (${row?.menuCount || 0})`}</a>} id={row.id} />
        </Access>,
      ],
    },
  ];
  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
        tabActiveKey={tabActiveKey}
        tabList={tabsList}
        onTabChange={(val: any) => {
          tabActiveKeySet(val);
          appIdSet(val);
        }}
      >
        <ProTable
          params={{ appId }}
          rowKey="id"
          actionRef={actionRef}
          formRef={formRef}
          columns={columns}
          options={{ fullScreen: true, setting: false }}
          sticky={{ offsetScroll: 32, offsetHeader: 48 }}
          bordered
          headerTitle={
            <Access key="detail" accessible={access.canSee('ams_comfunction_fas_add')}>
              <AddButtonFunction reload={() => actionRef?.current?.reload()} />
            </Access>
          }
          defaultSize={'small'}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          dateFormatter="string"
          request={getListAction}
        />
      </PageContainer>
    </>
  );
};

export default Page;

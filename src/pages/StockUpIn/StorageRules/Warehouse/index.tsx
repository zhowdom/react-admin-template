/*跨境平台仓库管理列表页  @zhujing 2022-06-24*/
import { Access, connect, useAccess } from 'umi';
import { useRef } from 'react';
import { useActivate } from 'react-activation';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import Update from './Dialogs/Update';
import * as api from '@/services/pages/stockUpIn/warehouse';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetPlatformList } from '@/utils/pubConfirm';
// import Log from '../../Components/Log';

const Page: React.FC<{ common: any }> = ({ common }) => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });

  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '平台',
      dataIndex: 'platform_id',
      valueType: 'select',
      request: () => pubGetPlatformList({ business_scope: 'IN' }),
      hideInTable: true,
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '站点',
      dataIndex: 'site',
      align: 'center',
      width: 80,
      valueEnum: common?.dicList?.SYS_PLATFORM_SHOP_SITE || [],
    },
    {
      title: '仓库名称',
      dataIndex: 'warehousing_name',
      align: 'center',
      width: 90,
    },
    {
      title: '仓库代码',
      dataIndex: 'warehousing_code',
      align: 'center',
      hideInSearch: true,
      width: 90,
    },
    {
      title: '仓库状态',
      dataIndex: 'status',
      valueType: 'select',
      align: 'center',
      hideInSearch: true,
      fieldProps: { showSearch: true },
      valueEnum: common?.dicList?.SYS_ENABLE_STATUS || {},
      width: 90,
    },
    {
      title: '仓库类型',
      dataIndex: 'warehousing_type',
      align: 'center',
      hideInSearch: true,
      valueEnum: common?.dicList?.CROSS_PLATFORM_WAREHOUSING_TYPE || {},
      width: 90,
    },
    {
      title: '仓库地址',
      dataIndex: 'address',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '邮编',
      dataIndex: 'zip_code',
      align: 'center',
      hideInSearch: true,
      width: 90,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => [
        <Access key="edit" accessible={access.canSee('stock_up_warehouse_edit')}>
          <Update
            initialValues={record}
            title={'编辑'}
            trigger={<a>编辑</a>}
            reload={actionRef?.current?.reload}
            dicList={common.dicList}
          />
        </Access>,
        // <Access key="log" accessible={access.canSee('stock_up_warehouse_log')}>
        //   <Log
        //     key={'log'}
        //     trigger={<a>日志</a>}
        //     api={api.changeFieldHistory}
        //     business_id={record.id}
        //     dicList={common?.dicList}
        //   />
        // </Access>,
      ],
    },
  ];
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable
        bordered
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        pagination={{
          showSizeChanger: true,
        }}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={async (params: any) => {
          const formData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
          };
          const res = await api.getList(formData);
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
            data: res?.data?.records || [],
            total: res?.data?.total || 0,
          };
        }}
        rowKey="id"
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
        dateFormatter="string"
        headerTitle={
          <Access key="add" accessible={access.canSee('stock_up_warehouse_add')}>
            <Update reload={actionRef?.current?.reload} dicList={common.dicList} />
          </Access>
        }
        scroll={{ x: 1300 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
      />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

import { PageContainer } from '@ant-design/pro-layout';
import { connect, Access, useAccess } from 'umi';
import React, { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { getList, sysChangeFieldHistory } from '@/services/pages/rateSetting';
import AddOrUpdate from './components/AddOrUpdate';
import { Statistic } from 'antd';
import Log from '../Log';

const Page = (props: any) => {
  const access = useAccess();
  const { common } = props;
  const { dicList } = common;
  const SC_CURRENCY: any = dicList?.SC_CURRENCY
    ? JSON.parse(JSON.stringify(dicList?.SC_CURRENCY))
    : {};
  delete SC_CURRENCY.CNY;
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await getList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });
  const columns: ProColumns<any>[] = [
    {
      title: '币种',
      dataIndex: 'currency',
      align: 'center',
      valueType: 'select',
      valueEnum: SC_CURRENCY || {},
    },
    {
      title: '汇率',
      dataIndex: 'exchange_rate',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <Statistic
          value={record?.exchange_rate}
          valueStyle={{ fontWeight: 400, fontSize: '14px' }}
          precision={4}
        />
      ),
    },

    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 230,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      className: 'wrap',
      render: (text: any, record: any) => {
        return [
          <Access key="add" accessible={access.canSee('rate_setting_edit')}>
            <AddOrUpdate
              trigger="编辑"
              initialValues={record}
              dicList={dicList}
              reload={() => {
                ref?.current?.reload();
              }}
            />
          </Access>,
          <Access key="detail" accessible={access.canSee('rate_setting_log')}>
            <Log
              trigger="日志"
              id={record?.id}
              dicList={dicList}
              title="汇率"
              api={sysChangeFieldHistory}
            />
          </Access>,
        ];
      },
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
        <ProTable
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          scroll={{ x: 1500 }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          rowKey="id"
          dateFormatter="string"
          headerTitle="汇率设置"
          revalidateOnFocus={false}
          toolBarRender={() => [
            <Access key="add" accessible={access.canSee('rate_setting_add')}>
              <AddOrUpdate
                trigger="添加币种"
                dicList={dicList}
                reload={() => {
                  ref?.current?.reload();
                }}
              />
            </Access>,
          ]}
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

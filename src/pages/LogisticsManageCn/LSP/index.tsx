import { PageContainer } from '@ant-design/pro-layout';
import { connect, Access, useAccess } from 'umi';
import React, { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import AddOrUpdate from './components/AddOrUpdate';
import { getCompanyList } from '@/services/pages/logisticsManageIn/company';
import { Space } from 'antd';

const Page = (props: any) => {
  const access = useAccess();
  const { common } = props;
  const { dicList } = common;
  console.log(common?.dicList, common?.dicList?.LOGISTICS_EXPRESS_STATUS);
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      business_scope: 'CN',
    };
    const res = await getCompanyList(postData);
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
      title: '物流商名称',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '物流商代码',
      dataIndex: 'code',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '合作状态',
      dataIndex: 'status',
      align: 'center',
      valueType: 'select',
      valueEnum: common?.dicList?.LOGISTICS_EXPRESS_STATUS || {},
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
      width: 180,
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
          <Access key="add" accessible={access.canSee('scm_logisticsLsp_edit_cn')}>
            <AddOrUpdate
              trigger="编辑"
              initialValues={record}
              dicList={dicList}
              reload={() => {
                ref?.current?.reload();
              }}
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
          search={{ defaultCollapsed: false, labelWidth: 'auto' }}
          sticky={{ offsetHeader: 48 }}
          rowKey="id"
          dateFormatter="string"
          headerTitle={
            <Space>
              <Access key="add" accessible={access.canSee('scm_logisticsLsp_add_cn')}>
                <AddOrUpdate
                  trigger="新增物流商"
                  dicList={dicList}
                  reload={() => {
                    ref?.current?.reload();
                  }}
                />
              </Access>
            </Space>
          }
          revalidateOnFocus={false}
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

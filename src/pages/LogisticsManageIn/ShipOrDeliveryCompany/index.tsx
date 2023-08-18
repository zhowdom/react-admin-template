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
import ImportBtn from '@/components/ImportBtn';

const Page = (props: any) => {
  const access = useAccess();
  const { common } = props;
  const { dicList } = common;
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      business_scope: 'IN',
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
      title: '跨境船公司/快递公司',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      valueType: 'select',
      valueEnum: common?.dicList?.SYS_ENABLE_STATUS || {},
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
          <Access key="add" accessible={access.canSee('scm_logistics_company_edit')}>
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
          defaultSize={'small'}
          rowKey="id"
          dateFormatter="string"
          headerTitle={
            <Space>
              <Access key="add" accessible={access.canSee('scm_logistics_company_add')}>
                <AddOrUpdate
                  trigger="新增跨境船公司/快递公司"
                  dicList={dicList}
                  reload={() => {
                    ref?.current?.reload();
                  }}
                />
              </Access>
              <Access
                key="scm_logistics_company_export"
                accessible={access.canSee('scm_logistics_company_export')}
              >
                <ImportBtn
                  btnText={'导入'}
                  reload={() => ref?.current?.reload()}
                  business_type={'LOGISTICS_EXPRESS'}
                  templateCode={'LOGISTICS_EXPRESS'}
                  importHandle={'/sc-scm/logisticsExpress/importFile'}
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

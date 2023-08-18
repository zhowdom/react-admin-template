import { PageContainer } from '@ant-design/pro-layout';
import { connect, Access, useAccess, useAliveController, history } from 'umi';
import React, { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { getList } from '@/services/pages/InitQuotation';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import Log from './Log';
import { getLspList } from '@/services/pages/logisticsManageIn/lsp';
import { pubGetUserList } from '@/utils/pubConfirm';
import ImportBtn from '@/components/ImportBtn';

const Page = (props: any) => {
  const access = useAccess();
  const { common } = props;
  const { dicList } = common;
  const { dropScope } = useAliveController();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      platform_id: params.category_data ? params.category_data[0] : '', //平台
      shop_site: params.category_data ? params.category_data[1] : '', //站点
    };
    const res = await getLspList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });
  // 获取人
  const pubGetUserListAction = async (v: any): Promise<any> => {
    const res: any = await pubGetUserList(v);
    console.log(res);
    return res?.map((item: any) => ({ ...item, value: item.value })) || [];
  };
  const columns: ProColumns<any>[] = [
    {
      title: '物流商名称',
      dataIndex: 'name',
      align: 'center',
      order: 6,
      width: 350,
    },
    {
      title: '物流商代码',
      dataIndex: 'code',
      align: 'center',
      order: 5,
    },
    {
      title: '合作状态',
      dataIndex: 'status',
      align: 'center',
      valueType: 'select',
      valueEnum: common?.dicList.LOGISTICS_STATUS,
      render: (_, record) => {
        return pubFilter(common?.dicList?.LOGISTICS_STATUS, record?.status) ?? '-';
      },
      order: 2,
    },
    {
      title: '结算币种',
      dataIndex: 'currency',
      align: 'center',
      hideInTable: true,
      valueType: 'select',
      valueEnum: common?.dicList.SC_CURRENCY,
      order: 4,
    },
    {
      title: '结算方式',
      order: 3,
      dataIndex: 'pay_method',
      valueType: 'select',
      align: 'center',
      valueEnum: common?.dicList.LOGISTICS_PAY_METHOD,
      render: (_: any, record: any) =>
        pubFilter(dicList?.LOGISTICS_PAY_METHOD, record?.pay_method) ?? '-',
    },
    {
      title: '联系人',
      dataIndex: 'contacts_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '联系电话',
      dataIndex: 'contacts_phone',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      align: 'center',
      order: 2,
      request: pubGetUserListAction,
      valueType: 'select',
      fieldProps: selectProps,
      search: {
        transform(value) {
          return {
            create_user_id: value,
          };
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      valueType: 'dateRange',
      order: 1,
      width: '180px',
      search: {
        transform(value) {
          return {
            start_create_time: `${value[0]} 00:00:00`,
            end_create_time: `${value[1]} 23:59:59`,
          };
        },
      },
      render: (_: any, record: any) => record.create_time || '-',
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
          <Access key="add" accessible={access.canSee('scm_lsp_edit')}>
            <a
              onClick={() => {
                dropScope(`/logistics-manage-in/lsp-edit`);
                setTimeout(() => {
                  history.push(`/logistics-manage-in/lsp-edit?id=${record.id}`);
                }, 200);
              }}
            >
              编辑
            </a>
          </Access>,
          <Access key="detail" accessible={access.canSee('scm_lsp_detail')}>
            <a
              onClick={() => {
                dropScope(`/logistics-manage-in/lsp-detail`);
                setTimeout(() => {
                  history.push(`/logistics-manage-in/lsp-detail?id=${record.id}`);
                }, 200);
              }}
            >
              详情
            </a>
          </Access>,
          <Access key="log" accessible={access.canSee('scm_lsp_log')}>
            <Log
              key="log"
              api={getList}
              business_id={record.id}
              dicList={common?.dicList}
              trigger="日志"
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
          search={{ className: 'light-search-form', defaultCollapsed: false, labelWidth: 85 }}
          scroll={{ x: 1500 }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          rowKey="id"
          dateFormatter="string"
          headerTitle={
            <Space>
              <Access key="add" accessible={access.canSee('scm_lsp_add')}>
                <Button
                  onClick={() => {
                    dropScope(`/logistics-manage-in/lsp-add`);
                    setTimeout(() => {
                      history.push(`/logistics-manage-in/lsp-add`);
                    }, 200);
                  }}
                  ghost
                  type="primary"
                  icon={<PlusOutlined />}
                >
                  新增物流商
                </Button>
              </Access>
              <Access key="scm_lsp_export" accessible={access.canSee('scm_lsp_export')}>
                <ImportBtn
                  btnText={'导入'}
                  reload={() => ref?.current?.reload()}
                  business_type={'LOGISTICS_VENDOR'}
                  templateCode={'LOGISTICS_VENDOR'}
                  importHandle={'/sc-scm/logisticsVendor/importFile'}
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

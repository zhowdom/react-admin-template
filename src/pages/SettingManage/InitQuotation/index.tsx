import { PageContainer } from '@ant-design/pro-layout';
import { connect, Access, useAccess } from 'umi';
import React, { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { getList, sysChangeFieldHistory } from '@/services/pages/InitQuotation';
import Log from '../Log';
import AddOrUpdate from './components/AddOrUpdate';
import PlatSite from '@/components/PubForm/PlatSite';

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
      platform_id: params.category_data ? params.category_data[0] : '', //平台
      shop_site: params.category_data ? params.category_data[1] : '', //站点
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
      title: '平台/站点',
      dataIndex: 'category_data',
      hideInTable: true,
      renderFormItem: (_, rest, form) => {
        return (
          <PlatSite
            dicList={dicList}
            back={(v: any) => {
              form.setFieldsValue({ category_data: v });
            }}
          />
        );
      },
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '站点',
      dataIndex: 'shop_site',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        pubFilter(dicList.FIRST_TRANSPORT_QUOTE_SHOP_SITE, record?.shop_site),
    },
    {
      title: '运输方式',
      dataIndex: 'shipping_method',
      align: 'center',
      valueType: 'select',
      valueEnum: common?.dicList?.FIRST_TRANSPORT_QUOTE_SHIPPING_METHOD || {},
    },
    {
      title: '产品类型',
      dataIndex: 'product_type',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        pubFilter(dicList.STORAGE_FEE_BELONG_CLASSIFY, record?.product_type),
    },
    {
      title: '整柜价格',
      dataIndex: 'fcl_price',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '拼柜价格',
      dataIndex: 'lcl_price',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '报价币种',
      dataIndex: 'currency',
      align: 'center',
      valueType: 'select',
      hideInSearch: true,
      valueEnum: common?.dicList?.SC_CURRENCY || {},
    },
    {
      title: '创建时间',
      width: 200,
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
      sorter: (a: any, b: any) => a.time - b.time,
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      align: 'center',
      hideInSearch: true,
      width: 160,
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
          <Access
            key="add"
            accessible={record.approval_status != 1 && access.canSee('init_quotation_edit')}
          >
            <AddOrUpdate
              trigger="编辑"
              initialValues={record}
              dicList={dicList}
              reload={() => {
                ref?.current?.reload();
              }}
            />
          </Access>,
          <Access key="detail" accessible={access.canSee('init_quotation_log')}>
            <Log
              trigger="日志"
              id={record?.id}
              dicList={dicList}
              title="报价"
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
          headerTitle="头程报价"
          revalidateOnFocus={false}
          toolBarRender={() => [
            <Access key="add" accessible={access.canSee('init_quotation_add')}>
              <AddOrUpdate
                trigger="添加报价"
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

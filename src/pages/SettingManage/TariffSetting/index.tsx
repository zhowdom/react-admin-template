import { PageContainer } from '@ant-design/pro-layout';
import { connect, Access, useAccess } from 'umi';
import React, { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { getList, sysChangeFieldHistory } from '@/services/pages/tariffSetting';
import Log from '../Log';
import AddOrUpdate from './components/AddOrUpdate';
import ProductLine from '@/components/PubForm/ProductLine';
import { add } from '@/utils/pubConfirm';
import './components/index.less';
import { Statistic } from 'antd';

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
      business_scope: params.category_data ? params.category_data[0] : '', //业务范畴
      category_id: params.category_data ? params.category_data[1] : '', //产品线
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
      title: '站点',
      dataIndex: 'shop_site',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        pubFilter(dicList.FIRST_TRANSPORT_QUOTE_SHOP_SITE, record?.shop_site),
    },
    {
      title: '产品线',
      dataIndex: 'category_name',
      hideInSearch: true,
      align: 'center',
      renderText: (text, record: any) =>
        record.business_scope && text
          ? `${pubFilter(dicList?.SYS_BUSINESS_SCOPE, record.business_scope)}-${text}`
          : '-',
    },
    {
      title: '产品线',
      dataIndex: 'category_data',
      hideInTable: true,
      order: 10,
      renderFormItem: (_, rest, form) => {
        return (
          <ProductLine
            defaultValue="IN"
            readonly
            back={(v: any) => {
              form.setFieldsValue({ category_data: v });
            }}
          />
        );
      },
    },
    {
      title: '基础税率',
      dataIndex: 'base_tariff',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <Statistic
          value={record.base_tariff}
          precision={2}
          suffix="%"
          valueStyle={{ fontWeight: 400, fontSize: '14px' }}
        />
      ),
    },
    {
      title: '加征关税',
      dataIndex: 'levy_tariff',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <Statistic
          value={record.levy_tariff}
          precision={2}
          suffix="%"
          valueStyle={{ fontWeight: 400, fontSize: '14px' }}
        />
      ),
    },
    {
      title: '额外税率',
      dataIndex: 'additional_tariff',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <Statistic
          value={record.additional_tariff}
          precision={2}
          suffix="%"
          valueStyle={{ fontWeight: 400, fontSize: '14px' }}
        />
      ),
    },
    {
      title: '增值税率',
      dataIndex: 'vat_rate_tariff',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <Statistic
          value={record.vat_rate_tariff}
          precision={2}
          suffix="%"
          valueStyle={{ fontWeight: 400, fontSize: '14px' }}
        />
      ),
    },
    {
      title: '总关税率',
      dataIndex: 'rate',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <Statistic
          value={add(
            add(record.base_tariff, record.additional_tariff),
            add(record.levy_tariff, record.vat_rate_tariff),
          )}
          precision={2}
          suffix="%"
          valueStyle={{ fontWeight: 400, fontSize: '14px' }}
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
          <Access key="edit" accessible={access.canSee('tariff_setting_edit')}>
            <AddOrUpdate
              trigger="编辑"
              initialValues={record}
              dicList={dicList}
              reload={() => {
                ref?.current?.reload();
              }}
            />
          </Access>,
          <Access key="detail" accessible={access.canSee('tariff_setting_log')}>
            <Log
              trigger="日志"
              id={record?.id}
              dicList={dicList}
              title="税率"
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
          search={{
            className: 'light-search-form disabled-search-styled',
            defaultCollapsed: false,
          }}
          scroll={{ x: 1500 }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          rowKey="id"
          dateFormatter="string"
          headerTitle="关税设置"
          revalidateOnFocus={false}
          toolBarRender={() => [
            <Access key="add" accessible={access.canSee('tariff_setting_add')}>
              <AddOrUpdate
                trigger="添加产品线"
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

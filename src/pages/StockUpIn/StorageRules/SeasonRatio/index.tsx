/*淡旺季销售系数  @zhujing 2022-06-24*/
import { Access, connect, useAccess } from 'umi';
import { useRef, useState } from 'react';
import { useActivate } from 'react-activation';
import { Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-form';
import Update from './Dialogs/Update';
import { getList, changeFieldHistory } from '@/services/pages/stockUpIn/seasonRatio';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import Log from './Dialogs/Log';
import ExportBtn from '@/components/ExportBtn';
import ImportBtn from '@/components/ImportBtn';
import { pubProLineList } from '@/utils/pubConfirm';
import { freeListLinkManagementSku } from '@/services/base';
import { uniqBy } from 'lodash';
import { pubGetPlatformList } from '@/utils/pubConfirm';

const Page: React.FC<{ common: any }> = ({ common }) => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [exportForm, exportFormSet] = useState({});
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
      request: () => pubGetPlatformList({ business_scope: 'IN'}),
      fieldProps: { showSearch: true },
      width: 120,
    },
    {
      title: '产品线',
      dataIndex: 'category_id',
      valueType: 'select',
      request: () => pubProLineList({ business_scope: 'IN' }),
      fieldProps: { showSearch: true },
      width: 120,
    },
    {
      title: '站点',
      dataIndex: 'site',
      width: 60,
      fieldProps: {
        showSearch: true,
        filterOption: (input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        },
      },
      valueEnum: common?.dicList?.SYS_PLATFORM_SHOP_SITE || {},
    },
    {
      title: '店铺SKU',
      dataIndex: 'sku',
      valueType: 'select',
      fieldProps: { showSearch: true },
      request: () =>
        freeListLinkManagementSku({
          sku_type: '1',
        }).then((res: any) => {
          if (res.code == pubConfig.sCode) {
            if (res?.data) {
              return uniqBy(res.data, 'shop_sku_code').map((item: any) => ({
                ...item,
                label: `${item?.shop_sku_code}`,
                value: item?.shop_sku_code,
                key: `${item?.id}&&${item?.shop_sku_code}`,
              }));
            }
            return [];
          }
          return [];
        }),
      width: 130,
    },
    {
      title: '年度增长率',
      dataIndex: 'growth_rate',
      align: 'right',
      hideInSearch: true,
      width: 130,
      render(_: any) {
        return _ != '-' ? `${_}%` : _;
      },
    },
    {
      title: '1月',
      dataIndex: 'january',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '2月',
      dataIndex: 'february',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '3月',
      dataIndex: 'march',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '4月',
      dataIndex: 'april',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '5月',
      dataIndex: 'may',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '6月',
      dataIndex: 'june',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '7月',
      dataIndex: 'july',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '8月',
      dataIndex: 'august',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '9月',
      dataIndex: 'september',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '10月',
      dataIndex: 'october',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '11月',
      dataIndex: 'november',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '12月',
      dataIndex: 'december',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => [
        <Access
          key="edit"
          accessible={
            (!record.sku && access.canSee('stock_up_seasonRatio_edit')) ||
            (record.sku && access.canSee('stock_up_seasonRatio_edit_sku'))
          }
        >
          <Update
            initialValues={record}
            title={'修改'}
            trigger={<a>修改</a>}
            reload={actionRef?.current?.reload}
            dicList={common.dicList}
          />
        </Access>,
        <Access key="log" accessible={access.canSee('stock_up_seasonRatio_log')}>
          <Log
            trigger={<a>日志</a>}
            api={changeFieldHistory}
            business_id={record.id}
            dicList={common?.dicList}
          />
        </Access>,
      ],
    },
  ];
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable
        bordered
        className="seasonRatio"
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={async (params: any) => {
          const formData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
          };
          exportFormSet(formData);
          const res = await getList(formData);
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
          <Space>
            <Access
              accessible={
                access.canSee('stock_up_seasonRatio_add') ||
                access.canSee('stock_up_seasonRatio_add_sku')
              }
            >
              <Update title={'新增'} reload={actionRef?.current?.reload} dicList={common.dicList} />
            </Access>
            {/*导入*/}
            <Access accessible={access.canSee('scm_stock_up_seasonRatio_import')}>
              <ImportBtn
                btnText={'导入产品线系数'}
                reload={() => actionRef?.current?.reload()}
                business_type={'SEASON_SALE_RATIO'}
                templateCode={'SEASON_SALE_RATIO'}
                importHandle={'/sc-scm/seasonSaleRatio/ratioImport'}
              />
            </Access>
            <Access accessible={access.canSee('scm_stock_up_seasonRatio_import_sku')}>
              <ImportBtn
                btnText={'导入店铺SKU系数'}
                reload={() => actionRef?.current?.reload()}
                business_type={'SEASON_SALE_RATIO_SKU'}
                templateCode={'SEASON_SALE_RATIO_SKU'}
                importHandle={'/sc-scm/seasonSaleRatio/ratioImportSku'}
              />
            </Access>
            {/*导出*/}
            <Access accessible={access.canSee('scm_stock_up_seasonRatio_export')}>
              <ExportBtn
                exportForm={exportForm}
                exportHandle={'/sc-scm/seasonSaleRatio/ratioExport'}
              />
            </Access>
          </Space>
        }
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        expandable={{
          expandedRowClassName: () => 'pa-0',
          expandedRowRender: (record: any) => (
            <ProTable
              className={'margin-1'}
              rowKey={'id'}
              bordered
              showHeader={false}
              columns={[{ dataIndex: 'expandable', width: 48, align: 'center' }, ...columns]}
              dataSource={record?.childList || []}
              pagination={false}
              search={false}
              options={false}
              cardProps={{ bodyStyle: { padding: 0 } }}
            />
          ),
          rowExpandable: (record: any) => record?.childList && !!record?.childList.length,
        }}
      />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

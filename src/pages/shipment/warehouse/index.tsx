import { Access, connect, useAccess } from 'umi';
import React, { useMemo, useRef, useState } from 'react';
import { useActivate } from 'react-activation';
import { Space, Pagination } from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ProCoreActionType, ProFormInstance } from '@ant-design/pro-components';
import Update from './Dialogs/Update';
import EditArea from './Dialogs/EditArea';
import {
  orderDeliveryGoodSkuWarehousePage,
  orderDeliveryWarehousePage,
  regionArea,
} from '@/services/pages/shipment';
import { getList as getVendorList } from '@/services/pages/supplier';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { flatData } from '@/utils/filter';
import ExportBtn from '@/components/ExportBtn';
import CommonLogAms from '@/components/CommonLogAms';
// import Log from '../../Components/Log';
// 获取发货仓库
export const optionsDeliveryWarehouse = async (
  params: any,
  disabledItem: boolean = true,
  dicList?: any,
) => {
  const res: any = await orderDeliveryWarehousePage({
    current_page: 1,
    page_size: 999,
    ...params,
  });
  if (res?.code == pubConfig.sCode) {
    return res?.data?.records.map((item: any) => ({
      label: dicList
        ? pubFilter(dicList, item.platform_code) + '-' + item.warehouse_name
        : item.warehouse_name,
      value: item.id,
      disabled: disabledItem ? item.status == '0' : false,
    }));
  }
  return [];
};
export const getAreas = async () => {
  const res = await regionArea();
  if (res?.code == pubConfig.sCode) {
    return res.data?.map((item: any) => ({
      label: item.area_name,
      value: item.area_name,
      options: item?.provinceList.map((p: any) => ({
        label: p.province_name,
        value: p.id,
      })),
    }));
  }
  return [];
};
const Page: React.FC<{ common: any }> = ({ common }) => {
  const actionRef: any = useRef<ProCoreActionType>();
  const formRef: any = useRef<ProFormInstance>();
  const _refL: any = useRef();
  const access = useAccess();
  const [exportForm, exportFormSet] = useState({});
  const [pagination, paginationSet] = useState({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [open, openSet] = useState(false);
  const [selectedData, selectedDataSet] = useState({});
  const [tabActiveKey, tabActiveKeySet] = useState('21');
  // 是否是款式, 非配件
  const isGood = useMemo(() => tabActiveKey.split('')[1] == '1', [tabActiveKey]);
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });

  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        title: isGood ? '款式名称' : '配件名称',
        dataIndex: 'sku_name',
        width: 230,
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
      },
      {
        title: isGood ? '款式编码' : '配件编码',
        dataIndex: 'sku_code',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
      },
      {
        title: 'ERP编码',
        dataIndex: 'erp_sku',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
      },
      {
        title: '商品条码',
        dataIndex: 'bar_code',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
      },
      {
        title: '发货平台',
        dataIndex: ['goodSkuWarehouseList', 'platform_code'],
        fieldProps: {
          showSearch: true,
          onChange: () => {
            formRef.current.setFieldsValue({
              goodSkuWarehouseList: { delivery_warehouse_name: '' },
            });
          },
        },
        valueEnum: common?.dicList?.ORDER_DELIVERY_WAREHOUSE || {},
        search: {
          transform: (val) => ({ platform_code: val }),
        },
      },
      {
        title: '发货仓',
        dataIndex: ['goodSkuWarehouseList', 'delivery_warehouse_name'],
        valueType: 'select',
        dependencies: ['goodSkuWarehouseList', 'platform_code'],
        request: async (params: any) => {
          if (params.platform_code == 'VENDOR') {
            const res = await getVendorList({
              ...params,
              page_size: 999,
              current_page: 1,
            });
            if (res?.code == pubConfig.sCode) {
              return res.data?.records?.map((item: any) => ({
                label: item.name,
                value: item.id,
              }));
            }
            return [];
          } else {
            return optionsDeliveryWarehouse(
              params,
              false,
              common?.dicList?.ORDER_DELIVERY_WAREHOUSE || {},
            );
          }
        },
        fieldProps: { showSearch: true },
        search: {
          transform: (val) => ({ delivery_warehouse_id: val }),
        },
      },
      {
        title: '退货仓',
        dataIndex: ['goodSkuWarehouseList', 'return_warehouse_name'],
        dependencies: ['goodSkuWarehouseList', 'platform_code'],
        request: (params) =>
          optionsDeliveryWarehouse(params, false, common?.dicList?.ORDER_DELIVERY_WAREHOUSE || {}),
        fieldProps: { showSearch: true },
        search: {
          transform: (val) => ({ return_warehouse_id: val }),
        },
      },
      {
        title: '打包策略',
        dataIndex: ['goodSkuWarehouseList', 'package_strategy'],
        fieldProps: { showSearch: true },
        valueEnum: common?.dicList?.ORDER_DELIVERY_PACKAGE_STRATEGY || {},
        search: {
          transform: (val) => ({ package_strategy: val }),
        },
      },
      {
        title: '操作',
        width: 140,
        align: 'center',
        valueType: 'option',
        fixed: 'right',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        render: (_, record: any) => [
          <Access key="edit" accessible={access.canSee('order_warehouse_edit')}>
            <a
              onClick={() => {
                selectedDataSet(record);
                openSet(true);
              }}
            >
              发货仓配置
            </a>
          </Access>,
          <Access key="log" accessible={access.canSee('order_warehouse_log')}>
            <a
              onClick={() => {
                _refL.current.visibileChange(
                  true,
                  record?.goods_sku_id,
                  'SCM_ORDER_DELIVERY_GOOD_SKU_WAREHOUSE',
                );
              }}
            >
              日志
            </a>
          </Access>,
        ],
      },
    ],
    [common, tabActiveKey],
  );
  return (
    <PageContainer
      header={{ title: false, breadcrumb: {} }}
      className="pubPageTabs page-adAdmin-amazon"
      tabList={[
        { tab: '已配置款式', key: '21' },
        { tab: '未配置款式', key: '11' },
        { tab: '已配置配件', key: '22' },
        { tab: '未配置配件', key: '12' },
      ]}
      tabActiveKey={tabActiveKey}
      onTabChange={(val) => {
        pagination.current = 1;
        tabActiveKeySet(val);
        formRef.current?.submit()
      }}
    >
      <ProTable
        headerTitle={'发货仓配置'}
        rowKey={(record: any) => record.goods_sku_id + record?.goodSkuWarehouseList?.id}
        bordered
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        pagination={false}
        options={{ fullScreen: true, setting: false }}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        params={{
          current: pagination.current,
          pageSize: pagination.pageSize,
        }}
        onSubmit={() => {
          pagination.current = 1;
        }}
        request={async (params: any) => {
          const postData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
            binding_warehouse: tabActiveKey.split('')[0], // 是否绑定仓(1:未绑定，2:已绑定)
            sku_type: tabActiveKey.split('')[1], // 1:款式(商品), 2:配件(赠品, 备品)
          };
          exportFormSet(postData);
          const res = await orderDeliveryGoodSkuWarehousePage(postData);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          let dataFlat: any[] = [];
          if (res?.data?.records?.length) {
            dataFlat = flatData(res.data.records, 'goodSkuWarehouseList', '', false);
          }
          // console.log(dataFlat, 'dataFlat');
          paginationSet({
            ...pagination,
            current: res?.data.current_page,
            total: res?.data?.total || 0,
          });
          return {
            success: true,
            data: dataFlat || [],
            total: res.data?.total || 0,
          };
        }}
        dateFormatter="string"
        toolBarRender={() => [
          <Space key={'tools'}>
            {access.canSee('order_warehouse_add-batch') ? (
              /*批量添加仓库*/
              <Update reload={actionRef?.current?.reload} dicList={common?.dicList || {}} />
            ) : null}
            {access.canSee('order_warehouse_edit-batch') ? (
              /*批量调整配送区域*/
              <Update
                type={'area'}
                reload={actionRef?.current?.reload}
                dicList={common?.dicList || {}}
              />
            ) : null}
            {access.canSee('order_warehouse_export') ? (
              /*导出*/
              <ExportBtn
                exportForm={exportForm}
                exportHandle={'/sc-scm/orderDeliveryGoodSkuWarehouse/export'}
              />
            ) : null}
          </Space>,
        ]}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        showSorterTooltip={false}
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
      />
      {/*ProTable合并单元格分页bug, 需要自定义分页*/}
      <div
        className="custom-pagination"
        style={{
          position: 'sticky',
          padding: '1px 24px',
          borderTop: '1px solid #e9e9e9',
          bottom: 0,
          right: 0,
          zIndex: 2,
          width: '100%',
          textAlign: 'right',
          background: '#fff',
        }}
      >
        <Pagination
          showTotal={(total: number) => `总共${total}条`}
          onChange={(current, pageSize) => {
            if (pagination.pageSize == pageSize) {
              paginationSet({ ...pagination, current, pageSize });
            } else {
              paginationSet({ ...pagination, current: 1, pageSize });
            }
          }}
          showSizeChanger
          size={'small'}
          {...pagination}
        />
      </div>
      {/*发货仓配置*/}
      <EditArea
        dictList={common?.dicList || {}}
        reload={actionRef?.current?.reload}
        data={selectedData}
        open={open}
        openSet={openSet}
      />
      <CommonLogAms dicList={common?.dicList} _ref={_refL} />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

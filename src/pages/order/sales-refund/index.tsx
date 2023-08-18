import { Access, connect, useAccess } from 'umi';
import React, { useMemo, useRef, useState } from 'react';
import { Button, Popconfirm, Space, Tabs } from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ProCoreActionType, ProFormInstance } from '@ant-design/pro-components';
import { listPage, exportExcel, sycnExchange, cancelExchange } from '@/services/pages/order/sales-refund';
import {expressList, getVendorList, orderDeliveryWarehousePage} from '@/services/pages/order/delivery-order';
import { pubAlert, pubConfig, pubModal, pubMsg } from '@/utils/pubConfig';
import ExportBtn from '@/components/ExportBtn';
import InWarehouse from './components/InWarehouse';
import QualityTesting from './components/QualityTesting';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import SkuTable from './components/SkuTable';
import ExpressDetail from './components/ExpressDetail';
import Log from './components/Log';
import {findSelectGoodsSku} from "@/services/base";
// 获取库房退货仓库
export const optionsDeliveryWarehouse = async (params: any, disabledItem: boolean = true) => {
  const res: any = await orderDeliveryWarehousePage({
    current_page: 1,
    page_size: 999,
    ...params,
  });
  if (res?.code == pubConfig.sCode) {
    return res?.data?.records.map((item: any) => ({
      label: item.warehouse_name,
      value: item.id,
      disabled: disabledItem ? item.status == '0' : false,
    }));
  }
  return [];
};
// 状态tab
const tabS = {
  YUNCANG: [
    {
      label: '全部',
      key: null,
    },
    {
      label: '未入库',
      key: '-300,-200,-2,-1,0',
    },

    {
      label: '已完成',
      key: '1',
    },
    {
      label: '已取消',
      key: '2,3,4',
    },
  ],
  QIMEN_YUNCANG: [
    {
      label: '全部',
      key: null,
    },
    {
      label: '未入库',
      key: 'NEW',
    },

    {
      label: '已完成',
      key: 'FINISH',
    },
    {
      label: '已取消',
      key: 'CANCEL',
    },
  ],
  HUIYE: [
    {
      label: '全部',
      key: null,
    },
    {
      label: '未入库',
      key: 'NEW',
    },
    {
      label: '已入库',
      key: 'WAREHOUSING',
    },
    {
      label: '已完成',
      key: 'FINISH',
    },
    {
      label: '已取消',
      key: 'CANCEL',
    },
  ],
  VENDOR: [
    {
      label: '全部',
      key: null,
    },
    {
      label: '未入库',
      key: 'NEW',
    },
    {
      label: '已入库',
      key: 'WAREHOUSING',
    },
    {
      label: '已完成',
      key: 'FINISH',
    },
    {
      label: '已取消',
      key: 'CANCEL',
    },
  ],
};
const cacheKey = window.location.pathname + '-tabActiveKey'
const Page: React.FC<{ common: any }> = ({ common }) => {
  const actionRef: any = useRef<ProCoreActionType>();
  const formRef: any = useRef<ProFormInstance>();
  const access = useAccess();
  const [exportForm, exportFormSet] = useState({});
  const [tabActiveKey, tabActiveKeySet] = useState(sessionStorage.getItem(cacheKey) || 'YUNCANG');
  const [tabActiveKeyStatus, tabActiveKeyStatusSet] = useState<any>(null);
  const [selectedRowKeys, selectedRowKeysSet] = useState<any[]>([]);
  const [selectedRowData, selectedRowDataSet] = useState<any[]>([]);
  const [tabListStatus, tabListStatusSet] = useState<any[]>(tabS[tabActiveKey]);
  // 平台tab
  const [tabList] = useState<any[]>([
    {
      tab: '万里牛云仓',
      key: 'YUNCANG',
    },
    {
      tab: '奇门云仓',
      key: 'QIMEN_YUNCANG',
    },
    {
      tab: '库房',
      key: 'HUIYE',
    },
    {
      tab: '供应商',
      key: 'VENDOR',
    },
  ]);

  // 取消销退单
  const cancelExchangeAction = async (data: any) => {
    if (!data?.length) {
      pubAlert('请勾选需要取消的数据！');
      return;
    }
    const wData = data?.filter((v: any) =>
      ['已入库', '已完成', '已取消'].includes(v.exchangeStatusName),
    );
    if (wData?.length) {
      const orders = wData.map((v: any) => v.returnOrderCode).join('、');
      pubAlert(`销退单 ${orders} 状态不是“未入库”，不可取消`);
      return;
    } else {
      pubModal('确定取消吗? 销退单号:' + data.map((v: any) => v.returnOrderCode))
        .then(async () => {
          const res = await cancelExchange(data.map((v: any) => v.id));
          if (res?.code != pubConfig.sCodeOrder) {
            pubMsg(res?.message);
          } else {
            pubMsg('操作成功', 'success');
            actionRef?.current?.reload();
          }
        })
        .catch(() => {
          console.log('点击了取消');
        });
    }
  };
  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        title: '收货状态',
        dataIndex: 'exchangeStatusName',
        hideInSearch: true,
      },
      {
        title: 'ERP单号',
        dataIndex: 'erpNo',
      },
      {
        title: '平台单号',
        dataIndex: 'platformNo',
      },

      {
        title: '销退单号',
        dataIndex: 'returnOrderCode',
      },
      tabActiveKey == 'VENDOR'
        ? {
          title: '退货仓库',
          dataIndex: 'storageName',
          key: 'vendor',
          valueType: 'select',
          fieldProps: {showSearch: true},
          request: async (params) => {
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
          },
          search: {
            transform: (val) => ({storageId: val}),
          },
        }
        : {
          title: '退货仓库',
          dataIndex: 'storageName',
          key: 'qita',
          valueType: 'select',
          fieldProps: {showSearch: true},
          params: {platform_code: tabActiveKey},
          request: (params) => optionsDeliveryWarehouse(params, false),
          search: {
            transform: (val) => ({storageId: val}),
          },
        },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 128,
        align: 'center',
        valueType: 'dateRange',
        search: {
          transform: (val) => ({createTimes: val}),
        },
        render: (_, record) => record.createTime || '-'
      },
      {
        title: '推单时间',
        dataIndex: 'pushTime',
        width: 128,
        align: 'center',
        hideInSearch: true,
      },
      {
        title: '入库时间',
        dataIndex: 'finishTime',
        width: 128,
        align: 'center',
        hideInSearch: true,
      },

      {
        title: '快递公司',
        dataIndex: 'logisticsName',
        hideInSearch: true,
      },
      {
        title: '承运商',
        dataIndex: 'logisticsCode',
        hideInTable: true,
        valueType: 'select',
        fieldProps: { showSearch: true },
        request: async (params) => {
          const res = await expressList({
            ...params,
            page_size: 999,
            current_page: 1,
          });
          if (res?.code == pubConfig.sCode) {
            return res.data?.records?.map((item: any) => ({
              label: item.express_short,
              value: item.express_code,
            }));
          }
          return [];
        },
      },
      {
        title: '款式',
        dataIndex: 'goodsSkuId',
        hideInTable: true,
        valueType: 'select',
        fieldProps: {
          placeholder: '输入款式名称或者编码',
          showSearch: true,
        },
        request: async () => {
          const res = await findSelectGoodsSku({
            business_scope: 'CN',
            sku_type: '1',
            current_page: 1,
            page_size: 9999,
          })
          if (res.code == pubConfig.sCode) {
            return res?.data?.records?.map((val: any) => ({
              label: `${val?.sku_code}(${val?.sku_name})`,
              value: `${val?.id}`,
            })) || [];
          }
          return []
        },
      },
      {
        title: '快递单号',
        dataIndex: 'expressCode',
        hideInSearch: true,
        render: (_: any, record: any) =>
          access.canSee('order_salesRefund_expressDetail') && record.expressCode ? (
            <ExpressDetail title={'物流详情'} platform={tabActiveKey} expressCodes={[record.expressCode]} currentCode={record.expressCode} />
          ) : (
            record.expressCode ?? '-'
          ),
      },
      {
        title: '平台销退单号',
        dataIndex: 'returnOrderId',
        width: 110,
        hideInSearch: true,
      },
      {
        title: '款式编码',
        dataIndex: 'skuCode',
        hideInSetting: true,
        hideInSearch: true,
        width: '100px',
        onCell: () => ({ colSpan: 6, style: { padding: 0 } }),
        className: 'p-table-inTable noBorder',
        render: (_, record: any) => (
          <SkuTable
            data={record?.deliveryPackageItems?.length ? record?.deliveryPackageItems : [{}]}
          />
        ),
      },
      {
        title: '款式名称',
        dataIndex: 'skuName',
        hideInSearch: true,
        hideInSetting: true,
        width: '100px',
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '退货数量',
        dataIndex: 'planQty',
        hideInSearch: true,
        hideInSetting: true,
        width: '100px',
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '总入库数量',
        dataIndex: 'quantity',
        hideInSearch: true,
        hideInSetting: true,
        width: '100px',
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '良品数量',
        dataIndex: 'zpActualQty',
        hideInSetting: true,
        hideInSearch: true,
        width: '100px',
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '次品数量',
        dataIndex: 'ccActualQty',
        hideInSearch: true,
        hideInSetting: true,
        width: '100px',
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '操作',
        width: 110,
        align: 'center',
        valueType: 'option',
        fixed: 'right',
        render: (_, record: any) => <Space wrap>
          <Access
            key="sync"
            accessible={
              ['YUNCANG'].includes(tabActiveKey) && access.canSee('order_salesRefund_cloud_sync')
            }
          >
            <Popconfirm
              key="sync"
              title="确定同步吗?"
              onConfirm={async () => {
                const res = await sycnExchange([record.returnOrderCode]);
                if (res?.code != pubConfig.sCodeOrder) {
                  pubMsg(res?.message);
                } else {
                  pubMsg('操作成功', 'success');
                  actionRef?.current?.reload();
                }
              }}
              okText="确定"
              cancelText="取消"
            >
              <a>同步</a>
            </Popconfirm>
          </Access>
          <Access
            key="cancel"
            accessible={
              access.canSee('order_salesRefund_cancel') &&
              ['新建', '待处理'].includes(record.exchangeStatusName)
            }
          >
            <a
              onClick={() => {
                cancelExchangeAction([record]);
              }}
            >
              取消
            </a>
          </Access>
          <Access
            key="inW"
            accessible={
              ['VENDOR'].includes(tabActiveKey) &&
              ['已入库', '新建'].includes(record.exchangeStatusName) &&
              access.canSee('order_salesRefund_InWarehouse')
            }
          >
            <InWarehouse title={'入库'} reload={actionRef?.current?.reload} key="ware" dataSource={record} />
          </Access>
          <Access
            key="qu"
            accessible={
              ['VENDOR'].includes(tabActiveKey) &&
              ['已入库'].includes(record.exchangeStatusName) &&
              access.canSee('order_salesRefund_QualityTesting')
            }
          >
            <QualityTesting title={'质检'} reload={actionRef?.current?.reload} key="qua" dataSource={record} />
          </Access>
          <Access accessible={access.canSee('order_salesRefund_log')}>
            <Log title={'日志'} dataSource={record} />
          </Access>
        </Space>
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [common, tabActiveKey],
  );
  // 3. 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1800, tabActiveKey, 2);
  return (
    <PageContainer
      header={{ title: false, breadcrumb: {} }}
      tabList={tabList}
      tabActiveKey={tabActiveKey}
      onTabChange={(val) => {
        if (window.isLoadingData) return
        sessionStorage.setItem(cacheKey, val)
        tabActiveKeySet(val);
        tabActiveKeyStatusSet(null);
        tabListStatusSet(tabS[val]);
        formRef.current?.resetFields();
        formRef.current?.submit();
      }}
    >
      <Tabs
        style={{ paddingLeft: 24 }}
        items={tabListStatus}
        onChange={(val) => {
          if (window.isLoadingData) return
          tabActiveKeyStatusSet(val)
          formRef.current?.submit();
        }}
        activeKey={tabActiveKeyStatus}
        key={tabActiveKey}
      />
      <ProTable
        rowKey={(record: any) => record.id}
        bordered
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        className="sales-refund"
        rowSelection={{
          preserveSelectedRowKeys: true,
          selectedRowKeys,
          onChange: (keys, rows) => {
            selectedRowKeysSet(keys);
            selectedRowDataSet(rows);
          },
        }}
        {...ColumnSet}
        request={async (params: any) => {
          const postData = {
            ...params,
            platformWarehouseCode: tabActiveKey,
            exchangeStatus: tabActiveKeyStatus,
            pageIndex: params.current,
            pageSize: params.pageSize,
          };
          exportFormSet(postData);
          window.isLoadingData = true
          const res = await listPage(postData);
          window.isLoadingData = false
          if (res?.code != pubConfig.sCodeOrder) {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          return {
            success: true,
            data: res?.data?.list || [],
            total: res.data?.total || 0,
          };
        }}
        dateFormatter="string"
        headerTitle={
          <Space key={'tools'}>
            <Access key="log" accessible={access.canSee('order_salesRefund_export')}>
              <ExportBtn
                exportForm={{
                  ...exportForm,
                  exportConfig: { columns: ColumnSet.customExportConfig },
                }}
                exportHandle={exportExcel}
              />
            </Access>
            <Access key="batchCancel" accessible={access.canSee('order_salesRefund_cancel_batch')}>
              <Button
                onClick={() => {
                  cancelExchangeAction(selectedRowData);
                }}
              >
                取消
              </Button>
            </Access>
          </Space>
        }
        sticky={{ offsetHeader: 48, offsetScroll: 36 }}
        defaultSize={'small'}
        showSorterTooltip={false}
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
      />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

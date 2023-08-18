import {Access, connect, useAccess} from 'umi';
import React, {useMemo, useRef, useState} from 'react';
import {Space, Tabs, Button, Tag} from 'antd';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import type {ProColumns, ProCoreActionType, ProFormInstance} from '@ant-design/pro-components';
import {
  getVendorList,
  listPage,
  orderDeliveryWarehousePage,
  batchReturnBack,
  pushDeliveryToPlatform,
  expressList,
} from '@/services/pages/order/delivery-order';
import {listPage as listPageRefund} from '@/services/pages/order/sales-refund';
import {pubAlert, pubConfig, pubModal, pubMsg} from '@/utils/pubConfig';
import ExportBtn from '@/components/ExportBtn';
import ImportBtn from '@/components/ImportBtn';
import {flatData} from '@/utils/filter';
import ModalDetail from './ModalDetail';
import CreateIntercept from './CreateIntercept';
import CreateTransform from './CreateTransform';
import ExpressDetail from '../sales-refund/components/ExpressDetail';
import {findSelectGoodsSku} from "@/services/base";

// 获取发货仓库
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

// 嵌套表格
const ExpandedTable: React.FC<{ data: any; expanded: boolean; platform: string }> = ({data, expanded, platform}) => {
  const [packageList, packageListSet] = useState([]);
  const expandedColumn = useMemo(() => {
    let tempColumns: ProColumns<any>[] = [
      {title: '款式编码', dataIndex: ['goodsSku', 'sku_code']},
      {title: '款式名称', dataIndex: ['goodsSku', 'sku_name']},
      {title: '发货数量', dataIndex: 'planQty'},
    ];
    if (packageList?.length) {
      tempColumns = [
        {
          title: '快递公司',
          dataIndex: 'logisticsName',
          onCell: (record: any) => ({rowSpan: record.rowSpan1}),
        },
        {
          title: '快递单号',
          dataIndex: 'expressCode',
          onCell: (record: any) => ({rowSpan: record.rowSpan1}),
          render: (_: any, record: any) =>
            record.expressCode ? (
              <ExpressDetail
                platform={platform}
                expressCodes={[packageList.map((item: any) => item.expressCode)]}
                currentCode={record.expressCode}
              />
            ) : (
              record.expressCode ?? '-'
            ),
        },
        {title: '款式编码', dataIndex: ['goodsSku', 'sku_code']},
        {title: '款式名称', dataIndex: ['goodsSku', 'sku_name']},
        {title: '发货数量', dataIndex: 'planQty'},
        {
          title: '拦截状态',
          dataIndex: 'interceptStatusName',
          onCell: (record: any) => ({rowSpan: record.rowSpan1}),
        },
        {
          title: '拦截原因',
          dataIndex: 'interceptRemark',
          onCell: (record: any) => ({rowSpan: record.rowSpan1}),
        },
        {
          title: '拦截结果',
          dataIndex: 'interceptFailureRemark',
          onCell: (record: any) => ({rowSpan: record.rowSpan1}),
        },
      ];
    }
    return tempColumns;
  }, [packageList]);
  return (
    <ProTable
      style={{maxWidth: packageList?.length ? '100%' : 600}}
      cardProps={{bodyStyle: {background: '#fbfbfb', padding: 0}}}
      rowKey={(record: any) => record.id + record.itemCode}
      columns={expandedColumn}
      params={{
        deliveryCode: data.deliveryCode,
        platformWarehouseCode: data.platformWarehouseCode,
        flag: true,
        expanded,
      }}
      request={async (params: any) => {
        if (!params?.expanded) {
          return {
            success: true,
            data: [],
          };
        }
        const res: any = await listPageRefund({...params, pageIndex: 1, pageSize: 999});
        if (res?.code == pubConfig.sCodeOrder && res.data?.list?.length) {
          packageListSet(res.data?.list || []);
          return {
            success: true,
            data: flatData(res.data?.list || [], 'deliveryPackageItems'),
          };
        }
        return {
          success: true,
          data: data?.deliveryItems || [],
        };
      }}
      headerTitle={false}
      search={false}
      options={false}
      pagination={false}
      bordered
    />
  );
};

const cacheKey = window.location.pathname + '-tabActiveKey'
const Page: React.FC<{ common: any }> = ({common}) => {
  const actionRef: any = useRef<ProCoreActionType>();
  const formRef: any = useRef<ProFormInstance>();
  const access = useAccess();
  const [selectedRowKeys, selectedRowKeysSet] = useState<any[]>([]);
  const [selectedRows, selectedRowsSet] = useState<any[]>([]);
  const [detailOpen, detailOpenSet] = useState(false);
  const [selectedData, selectedDataSet] = useState<Record<string, any>>({});
  const [exportForm, exportFormSet] = useState({});
  const [tabActiveKey, tabActiveKeySet] = useState(sessionStorage.getItem(cacheKey) || 'HUIYE');
  const [tabActiveKeyStatus, tabActiveKeyStatusSet] = useState('');
  const [openCreateIntercept, openCreateInterceptSet] = useState(false);
  const [openCreateTransform, openCreateTransformSet] = useState(false);
  const [createType, createTypeSet] = useState<'refund' | 'intercept'>('intercept');
  const [defaultIdType, defaultIdTypeSet] = useState<'ERP_NO' | 'PLATFORM_NO' | 'DELIVERY_NO' | 'LBX_NO' | 'SHIP_NO'>('DELIVERY_NO')
  const [defaultIds, defaultIdsSet] = useState('')
  const tabList = useMemo(() => {
    /*
     * CAINIAO:菜鸟仓, HUIYE:库房, JD:京东仓, QIMEN_YUNCANG:奇门云仓, VENDOR:供应商, YUNCANG:万里牛云仓
     * */
    const dic = common?.dicList?.ORDER_DELIVERY_WAREHOUSE || {};
    const tempList = {...dic};
    return Object.keys(tempList).map((key) => ({tab: tempList[key].text, key}));
  }, [common]);
  const tabListStatus = useMemo(() => {
    const tempList = [
      {
        label: '全部',
        key: '',
      },
      {
        label: '未发货',
        key: '2',
      },
      {
        label: '已发货',
        key: '3',
      },
      {
        label: '仓内拦截',
        key: '4',
      },
      {
        label: '仓外拦截',
        key: '5',
      },
      {
        label: '指定时间发货',
        key: '6',
      },
      {
        label: '异常配送单',
        key: '11',
      },
    ]
    return ['QIMEN_YUNCANG'].includes(tabActiveKey) ? tempList : tempList.filter(item => item.key != '5')
  }, [tabActiveKey])
  const statusEnum = useMemo(() => {
    switch (tabActiveKey) {
      case 'CAINIAO':
        return 'ORDER_CAINIAO_DELIVERY_STATUS';
      case 'HUIYE':
        return 'ORDER_OWN_DELIVERY_STATUS';
      case 'JD':
        return 'ORDER_JD_DELIVERY_STATUS';
      case 'QIMEN_YUNCANG':
        return 'ORDER_QIMEN_DELIVERY_STATUS';
      case 'VENDOR':
        return 'ORDER_VENDOR_DELIVERY_STATUS';
      case 'YUNCANG':
        return 'ORDER_WANLINIU_DELIVERY_STATUS';
      default:
        return 'CAINIAO'
    }
  }, [tabActiveKey])

  // 退回到新建
  const returnBackToNew = async (data: any) => {
    if (!data?.length) {
      pubAlert('请勾选需要退回的数据！');
      return;
    }
    pubModal('确定退回到新建吗?')
      .then(async () => {
        const res = await batchReturnBack(data);
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
  };

  // 同步
  const synchroRow = async (id: any) => {
    pubModal('确定同步数据吗?')
      .then(async () => {
        const res = await pushDeliveryToPlatform({id: id});
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
  };

  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        title: '配送单号',
        dataIndex: 'deliveryCode',
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
        title: '仓库订单号',
        dataIndex: 'deliveryOrderId',
      },
      {
        title: '平台状态',
        dataIndex: 'platformStatus',
        hideInSearch: true,
      },
      {
        title: 'ERP订单状态',
        dataIndex: 'orderStatusName',
        hideInSearch: true,
        width: 90,
      },
      tabActiveKey == 'VENDOR'
        ? {
          title: '供应商',
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
          title: '发货仓库',
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
        title: '发货状态',
        dataIndex: 'deliveryStatus',
        width: 80,
        valueEnum: common?.dicList[statusEnum] || {},
      },
      {
        title: '承运商',
        dataIndex: 'logisticsCode',
        width: 80,
        hideInTable: true,
        valueType: 'select',
        fieldProps: {showSearch: true},
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
        title: '异常标记',
        dataIndex: 'tagTypeName',
        hideInSearch: true,
        render: (_, record) => {
          if (record.tagTypeName) {
            return <Space wrap size={'small'}>
              {record.tagTypeName.split(',').map((t: string) => <Tag key={t} color={'red'}>{t}</Tag>)}
            </Space>
          }
          return '-'
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 135,
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
        width: 135,
        align: 'center',
        valueType: 'dateRange',
        hideInSearch: true,
        search: {
          transform: (val) => ({pushTimes: val}),
        },
        render: (_, record) => record.pushTime || '-'
      },
      {
        title: '要求发货日期',
        dataIndex: 'requestDeliveryTime',
        width: 135,
        align: 'center',
        valueType: 'dateRange',
        search: {
          transform: (val) => ({requestDeliveryTimes: val}),
        },
        render: (_, record) => record.requestDeliveryTime || '-'
      },
      {
        title: '实际发货时间',
        dataIndex: 'sendTime',
        width: 135,
        align: 'center',
        valueType: 'dateRange',
        search: {
          transform: (val) => ({sendTimes: val}),
        },
        render: (_, record) => record.sendTime || '-'
      },
      {
        title: '操作',
        width: 190,
        align: 'center',
        valueType: 'option',
        fixed: 'right',
        render: (_, record: any) => <Space wrap>
          {/*CAINIAO:菜鸟仓, HUIYE:库房, JD:京东仓, QIMEN_YUNCANG:奇门云仓, VENDOR:供应商, YUNCANG:万里牛云仓*/}
          <Access accessible={access.canSee('order_delivery_detail')}>
            <a
              onClick={() => {
                detailOpenSet(true);
                selectedDataSet(record);
              }}
            >
              详情
            </a>
          </Access>
          <Access accessible={access.canSee('order_delivery_intercept')}>
            <a
              onClick={() => {
                defaultIdsSet(record.deliveryCode)
                defaultIdTypeSet('DELIVERY_NO')
                createTypeSet('intercept');
                openCreateInterceptSet(true);
              }}
            >
              拦截
            </a>
          </Access>
          <Access
            accessible={
              access.canSee('order_delivery_refund')
              && (
                ['QIMEN_YUNCANG', 'YUNCANG'].includes(tabActiveKey) ||
                ['HUIYE', 'VENDOR',].includes(tabActiveKey) && record.deliveryStatus == 'SENT'
              )
            }
          >
            <a
              onClick={() => {
                defaultIdsSet(record.deliveryCode)
                defaultIdTypeSet('DELIVERY_NO')
                createTypeSet('refund');
                openCreateInterceptSet(true);
              }}
            >
              销退
            </a>
          </Access>
          <Access accessible={access.canSee('order_delivery_transform')}>
            <a
              onClick={() => {
                openCreateTransformSet(true);
                selectedDataSet(record);
              }}
            >
              转仓
            </a>
          </Access>
          <Access
            key="returnBack"
            accessible={
              ['HUIYE', 'VENDOR'].includes(tabActiveKey) &&
              record?.deliveryStatus == 'EXPORTED' &&
              access.canSee('order_delivery_returnNew')
            }
          >
            <a
              onClick={() => {
                returnBackToNew([record?.id]);
              }}
            >
              退回到新建
            </a>
          </Access>
          <Access key="synchroRow" accessible={!['HUIYE', 'VENDOR', 'QIMEN_YUNCANG'].includes(tabActiveKey) && access.canSee('order_delivery_synchro')}>
            <a
              onClick={() => {
                synchroRow(record?.id);
              }}
            >
              同步
            </a>
          </Access>
        </Space>
      },
    ],
    [common, tabActiveKey],
  );

  return (
    <PageContainer
      header={{title: false, breadcrumb: {}}}
      tabList={tabList}
      tabActiveKey={tabActiveKey}
      onTabChange={(val) => {
        if (window.isLoadingData) return
        sessionStorage.setItem(cacheKey, val)
        tabActiveKeySet(val);
        tabActiveKeyStatusSet('')
        formRef.current?.resetFields();
        formRef.current?.submit();
      }}
    >
      <Tabs style={{paddingLeft: 24}} items={tabListStatus} activeKey={tabActiveKeyStatus} onChange={(val) => {
        if (window.isLoadingData) return
        tabActiveKeyStatusSet(val)
        formRef.current?.submit();
      }}/>
      <ProTable
        headerTitle={'配送单列表'}
        rowKey={(record: any) => record.id}
        bordered
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        options={{fullScreen: true, setting: false}}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={async (params: any) => {
          const postData = {
            ...params,
            platformWarehouseCode: tabActiveKey,
            deliveryTab: tabActiveKeyStatus,
            pageIndex: params.current,
          };
          // 数据字典不一致
          if (params.platform_code) {
            if (params.platform_code == 'WLN') {
              postData.platformWarehouseCode = 'YUNCANG';
            } else {
              postData.platformWarehouseCode = 'QIMEN_YUNCANG';
            }
            delete postData.platform_code;
          }
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
        toolBarRender={() => [
          <Space key={'tools'}>
            {access.canSee('order_delivery_export') ? (
              /*导出*/
              <ExportBtn exportForm={exportForm} exportHandle={'/order-service/delivery/export'}/>
            ) : null}
            {access.canSee('order_delivery_exportDelivery') &&
            ['HUIYE', 'VENDOR', 'CAINIAO'].includes(tabActiveKey) ? (
              <ExportBtn
                btnText={'导出配送单'}
                exportForm={exportForm}
                exportHandle={`/order-service/delivery/${
                  ['CAINIAO'].includes(tabActiveKey) ? 'exportDeliveryCainiao' : 'exportDeliveryOwn'
                }`}
              />
            ) : null}
            {access.canSee('order_delivery_import') &&
            ['HUIYE', 'VENDOR', 'CAINIAO'].includes(tabActiveKey) ? (
              <ImportBtn
                noTransform={true}
                btnText={'上传物流信息'}
                templateCode={`${
                  ['CAINIAO'].includes(tabActiveKey)
                    ? 'DELIVERY_CAINIAO_LOGISTICS_IMPORT'
                    : 'DELIVERY_OWN_LOGISTICS_IMPORT'
                }`}
                reload={actionRef.current?.reload}
                importHandle={`/order-service/delivery/${
                  ['CAINIAO'].includes(tabActiveKey)
                    ? 'importLogisticsCainiao'
                    : ['VENDOR'].includes(tabActiveKey)
                      ? 'importLogisticsVendor'
                      : 'importLogisticsOwn'
                }`}
              />
            ) : null}
            {access.canSee('order_delivery_interceptBatch') ? (
              <Button
                type={'primary'}
                onClick={() => {
                  defaultIdsSet('')
                  defaultIdTypeSet('DELIVERY_NO')
                  createTypeSet('intercept');
                  openCreateInterceptSet(true);
                }}
              >
                拦截
              </Button>
            ) : null}
            {access.canSee('order_delivery_refundBatch') &&
            !['CAINIAO', 'JD'].includes(tabActiveKey) ? (
              <Button
                type={'primary'}
                onClick={() => {
                  defaultIdsSet('')
                  defaultIdTypeSet('DELIVERY_NO')
                  createTypeSet('refund');
                  openCreateInterceptSet(true);
                }}
              >
                销退
              </Button>
            ) : null}
            {access.canSee('order_delivery_transformBatch') ? (
              <Button
                type={'primary'}
                onClick={() => {
                  openCreateTransformSet(true);
                  selectedDataSet({});
                }}
              >
                转仓
              </Button>
            ) : null}
          </Space>,
        ]}
        scroll={{x: 1900}}
        sticky={{offsetHeader: 48, offsetScroll: 36}}
        defaultSize={'small'}
        showSorterTooltip={false}
        search={{defaultCollapsed: false, className: 'light-search-form'}}
        expandable={{
          expandedRowRender: (record, index, indent, expanded) => (
            <ExpandedTable platform={tabActiveKey} expanded={expanded} data={record}/>
          ),
        }}
        rowSelection={{
          fixed: 'left',
          selectedRowKeys,
          onChange: (keys: any[], rows: any[]) => {
            selectedRowKeysSet(keys);
            selectedRowsSet(rows);
          },
        }}
      />
      {/*详情*/}
      <ModalDetail openCreateInterceptSet={openCreateInterceptSet}
                   createTypeSet={createTypeSet}
                   defaultIdTypeSet={defaultIdTypeSet}
                   defaultIdsSet={defaultIdsSet}
                   tabActiveKey={tabActiveKey}
                   open={detailOpen}
                   openSet={detailOpenSet}
                   data={selectedData}/>
      {/*拦截和销退*/}
      <CreateIntercept
        type={createType}
        defaultIds={defaultIds}
        defaultIdType={defaultIdType}
        selectedRowsPage={selectedRows}
        reload={() => {
          selectedRowKeysSet([]);
          selectedRowsSet([]);
          actionRef?.current?.reload();
        }}
        dicList={common?.dicList}
        open={openCreateIntercept}
        openSet={openCreateInterceptSet}
        platformWarehouseCode={tabActiveKey}
      />
      {/*转仓*/}
      <CreateTransform
        selectedData={selectedData}
        selectedRowsPage={selectedRows}
        reload={() => {
          selectedRowKeysSet([]);
          selectedRowsSet([]);
          actionRef?.current?.reload();
        }}
        dicList={common?.dicList}
        open={openCreateTransform}
        openSet={openCreateTransformSet}
        platformWarehouseCode={tabActiveKey}
      />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({common}: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

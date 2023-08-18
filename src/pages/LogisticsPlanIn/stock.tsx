import React, { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import { Button, Popconfirm, Popover, Space, Upload } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import '../StockManager/style.less';
import * as api from '@/services/pages/stockManager';
import * as api1 from '@/services/pages/logisticsPlanIn';
import {
  divide,
  pubAllGoodsSkuBrand,
  pubBeforeUpload,
  pubBlobDownLoad,
  pubGetSysPortList,
  pubGetVendorList,
} from '@/utils/pubConfirm';
import { baseFileUpload } from '@/services/base';
import { pubAlert, pubConfig, pubMsg, pubFilter, pubModal } from '@/utils/pubConfig';
import { UploadOutlined } from '@ant-design/icons';
import { Access, connect, useAccess } from 'umi';
import WeekTimeSearch from '@/components/PubForm/WeekTimeSearch';
import PubWeekRender from '@/components/PubWeekRender';
import PortStorageModal from '../StockManager/INDialog/PortStorageModal';
import { PageContainer } from '@ant-design/pro-layout';
import PlatStore from '@/components/PubForm/PlatStore';
import CutOffTime from '@/pages/StockManager/INDialog/CutOffTime';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import CreateLogisticsOrder from '../StockManager/INDialog/CreateLogisticsOrder';
import CommonLog from '@/components/CommonLog';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import OrderSearch from './components/OrderSearch';
import './index.less';
import PersonSearch from './components/PersonSearch';
import Claim from './components/Claim';
import Detail from './components/Detail';
import ExportBtn from '@/components/ExportBtn';
import CitySearch from './components/CitySearch';
import {
  exportPackingDetails,
  exportS,
  logisticsPlanPage,
  logisticsPlanStatusCount,
  updateConfirm,
} from '@/services/pages/logisticsPlanIn';
import moment from 'moment';

const cacheTabKey = 'LogisticsPlanInStock'; // tab缓存
const In: React.FC<{ common: any; history?: any }> = ({ common }) => {
  const { dicList } = common;
  const access = useAccess();
  const formRef = useRef<ProFormInstance>(); // 页面查询条件
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, selectedRowKeysSet] = useState<any[]>([]);
  const [selectedRowData, selectedRowDataSet] = useState<any[]>([]);
  const [upLoading, setUpLoading] = useState({
    batchImportPortStorage: false,
    batchImportSendTopPlatform: false,
    batchImportShelfInfo: false,
    exportBookingBumber: false,
    batchImportlogistics: false,
    batchImportRequiredWarehousingTime: false,
  });
  const [downLoading, setDownLoading] = useState({
    WarehousingOrder: false,
    SentPlatformIn: false,
    PortWarehousingIn: false,
    ShipmentInfoIn: false,
    logisticsIn: false,
    WarehousingTime: false,
    PackingDetails: false,
  });
  const [pageSize, setPageSize] = useState<any>(20);
  const [tabList, setTabList] = useState([]);
  const [tabStatus, setTabStatus] = useState<any>(
    window.sessionStorage.getItem(cacheTabKey) || 'all',
  );
  const [exportForm, setExportForm] = useState<any>({});
  // 搜索清除前后空格
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
  // 激活页面请求列表
  useActivate(() => {
    if (actionRef?.current) actionRef?.current?.reload();
  });

  // 导出excel
  const downLoadExcel = async (apiUrl: string, myFileName: string, loading: string) => {
    setDownLoading({ ...downLoading, [loading]: true });
    const res: any = await api1[apiUrl]({
      ...exportForm,
      selected_id: selectedRowKeys,
    });
    setDownLoading({ ...downLoading, [loading]: false });
    const type = res?.response?.headers.get('content-type');
    if (type === 'application/json') {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res?.response?.headers.get('content-disposition');
      let fileName = `${myFileName}.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
  };

  // 导入
  const handleUpload = async (data: any, type: string) => {
    // loading开始
    setUpLoading({ ...upLoading, [type]: true });
    const res = await baseFileUpload({
      file: data.file,
      business_type: 'WAREHOUSING_ORDER',
    });
    if (res?.code != pubConfig.sCode) {
      pubAlert(res?.message);
      setUpLoading({ ...upLoading, [type]: false });
      return;
    }
    const resData = await api[type](res.data[0]);
    if (
      [
        'exportBookingBumber',
        'batchImportShelfInfo',
        'batchImportRequiredWarehousingTime',
      ].includes(type)
    ) {
      let fileName = '';
      if (type == 'exportBookingBumber') {
        fileName = '订舱信息导出';
      } else if (type == 'batchImportShelfInfo') {
        fileName = '货件信息';
      } else if (type == 'batchImportRequiredWarehousingTime') {
        fileName = '批量修改要求入仓时间';
      }
      pubBlobDownLoad(resData, fileName, () => {
        setUpLoading({ ...upLoading, [type]: false });
        actionRef?.current?.reload();
      });
    } else {
      if (resData && resData?.code != pubConfig.sCode) {
        pubMsg(resData?.message);
        setUpLoading({ ...upLoading, [type]: false });
        return;
      }
      setUpLoading({ ...upLoading, [type]: false });
      pubMsg('操作成功！', 'success');
      actionRef?.current?.reload();
    }
  };
  //信息修改已确认
  const confirmEditInfo = async (orderNos: any[]) => {
    const res = await updateConfirm({ order_no: orderNos.join(',') });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功', 'success');
      selectedRowKeysSet([]);
      selectedRowDataSet([]);
      actionRef?.current?.reload();
    }
  };
  // table配置
  const columns: any[] = [
    {
      title: 'PMC负责人',
      dataIndex: 'pmc_name',
      align: 'center',
      width: 100,
      hideInSearch: true,
      render: (_: any, record: any) => record?.planDetailList?.[0]?.pmc_name ?? '-',
    },

    {
      title: '计划出货周期',
      dataIndex: 'cycle_time',
      align: 'center',
      width: 110,
      order: 18,
      renderFormItem: (_, rest, form) => {
        return (
          <WeekTimeSearch
            callBack={(v: any) => {
              form.setFieldsValue({ cycle_time: [v?.week, v.start, v.end] });
            }}
          />
        );
      },
      render: (_: any, record: any) => (
        <PubWeekRender
          option={{
            cycle_time: record?.planDetailList?.[0]?.cycle_time,
            begin: record?.planDetailList?.[0]?.shipment_begin_cycle_time,
            end: record?.planDetailList?.[0]?.shipment_end_cycle_time,
          }}
        />
      ),
    },
    {
      title: '入库单号',
      dataIndex: 'order_no',
      align: 'center',
      width: 100,
      order: 14,
      hideInSearch: true,
    },
    {
      title: '入库单状态',
      dataIndex: 'approval_status',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.WAREHOUSING_ORDER_IN_STATUS, record.approval_status) || '-';
      },
      width: 90,
    },
    {
      title: '采购负责人',
      dataIndex: 'purchase_name',
      align: 'center',
      hideInSearch: true,
      width: 90,
    },
    {
      title: '物流负责人',
      dataIndex: 'principal_name',
      align: 'center',
      hideInSearch: true,
      width: 90,
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      hideInSearch: true,
      width: 90,
    },
    {
      title: '店铺',
      dataIndex: 'shop_name',
      align: 'center',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '平台店铺',
      dataIndex: 'plat_store',
      order: 4,
      align: 'center',
      renderFormItem: () => {
        return <PlatStore business_scope="IN" />;
      },
      hideInTable: true,
      search: {
        transform: (val: any) => ({ platform_id: val?.[0], shop_id: val?.[1] }),
      },
    },
    {
      title: '站点',
      dataIndex: 'shop_site',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => pubFilter(dicList.SYS_PLATFORM_SHOP_SITE, record?.shop_site),
    },
    {
      title: '品牌',
      dataIndex: 'brand_id',
      align: 'center',
      width: 90,
      hideInSearch: true,
      valueType: 'select',
      request: async () => {
        const res = await pubAllGoodsSkuBrand();
        return res;
      },
    },
    {
      title: '中文品名',
      dataIndex: 'name_cn',
      align: 'center',
      width: 160,
      order: 10,
    },
    {
      title: '英文品名',
      dataIndex: 'name_en',
      align: 'center',
      order: 9,
    },
    {
      title: (
        <>
          SKU生命周期
          <br />
          (SKU销售状态)
        </>
      ),
      dataIndex: 'life_cycle',
      align: 'center',
      hideInSearch: true,
      width: 110,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.GOODS_LIFE_CYCLE, record.life_cycle) || '-';
      },
    },
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku_code',
      order: 8,
      align: 'center',
      width: 100,
    },

    {
      title: '发货数量',
      dataIndex: 'delivery_plan_current_num',
      align: 'center',
      width: 90,
      hideInSearch: true,
    },
    {
      title: '箱数',
      dataIndex: 'num',
      width: 90,
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => record?.box_num ?? '-',
    },
    {
      title: '每箱数量',
      dataIndex: 'pics',
      align: 'center',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '长(cm)',
      dataIndex: 'length',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: (
        <>
          <div>总体积</div>
          <div>（m³）</div>
        </>
      ),
      dataIndex: 'total_volume',
      align: 'center',
      hideInSearch: true,
      renderText: (text: any) => text && divide(text, 1000000).toFixed(3),
    },
    {
      title: '单箱重量(kg)',
      dataIndex: 'unit_weight',
      align: 'center',
      hideInSearch: true,
    },

    {
      title: (
        <>
          <div>总重量</div>
          <div>（kg）</div>
        </>
      ),
      dataIndex: 'total_weight',
      align: 'center',
      hideInSearch: true,
      renderText: (text: any) => text && divide(text, 1000).toFixed(3),
    },
    {
      title: '货件号(Shipment ID)',
      dataIndex: 'shipment_id',
      order: 11,
      hideInTable: true,
    },
    {
      title: '货件号',
      dataIndex: 'shipment_id',
      align: 'center',
      width: 110,
      hideInSearch: true,
    },
    {
      title: '追踪号',
      dataIndex: 'reference_id',
      align: 'center',
      width: 110,
      hideInSearch: true,
    },
    {
      title: '平台目的仓',
      dataIndex: 'warehouse_name',
      order: 12,
      hideInTable: true,
    },
    {
      title: '平台目的仓库',
      dataIndex: 'warehouse_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_id',
      order: 6,
      hideInTable: true,
      fieldProps: selectProps,
      valueType: 'select',
      request: async (v: any) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
    },
    {
      title: '供应商名称',
      dataIndex: 'vendor_name',
      align: 'center',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '供应商出货城市',
      dataIndex: 'shipment_city',
      align: 'center',
      width: 100,
      order: 5,
      renderText: (text: any, record: any) => record?.vendor_province_city ?? '-',
      renderFormItem: () => <CitySearch cityData2={common.cityData2} />,
      search: {
        transform: (val: any) => ({ shipment_province: val?.[0], shipment_city: val?.[1] }),
      },
    },
    {
      title: '供应商货好时间',
      dataIndex: 'delivery_time',
      align: 'center',
      width: 120,
      render: (_: any, record: any) => record.delivery_time ?? '-',
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (val: any) => ({
          begin_delivery_time: val[0] && moment(val[0]).format('YYYY-MM-DD'),
          end_delivery_time: val[1] && moment(val[1]).format('YYYY-MM-DD'),
        }),
      },
      order: 16,
    },
    {
      title: '退税抬头',
      dataIndex: 'tax_refund_company',
      align: 'center',
      width: 180,
      render: (_: any, record: any) => record?.tax_refund_company_name ?? '-',
    },
    {
      title: '计划运输方式',
      dataIndex: 'shipping_method',
      align: 'center',
      hideInSearch: true,
      valueEnum: dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || {},
      onCell: (record: any) => ({
        style: {
          background:
            record.logistics_update_confirm_status == 0 ||
              record.logistics_update_confirm_status == 2
              ? '#ffccc7'
              : '',
        },
      }),
    },
    {
      title: '要求物流入仓时间',
      dataIndex: 'required_warehousing_time',
      valueType: 'dateRange',
      render: (_: any, record: any) => <span>{record.required_warehousing_time ?? '-'}</span>,
      onCell: (record: any) => ({
        style: {
          background:
            record.logistics_update_confirm_status == 1 ||
              record.logistics_update_confirm_status == 2
              ? '#ffccc7'
              : '',
        },
      }),
      width: 100,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (val: any) => ({
          begin_required_warehousing_time: val[0] && moment(val[0]).format('YYYY-MM-DD'),
          end_required_warehousing_time: val[1] && moment(val[1]).format('YYYY-MM-DD'),
        }),
      },
      order: 17,
    },
    {
      title: '跨境起运港仓库',
      dataIndex: 'harbor_id',
      align: 'center',
      order: 7,
      valueType: 'select',
      request: async () => {
        const res: any = await pubGetSysPortList({ type: 1, status: 1 });
        return res || [];
      },
      render: (_: any, record: any) => record?.port_name ?? '-',
      hideInSearch: !['all', '2', '10', '5', '6', '7', '3', '4'].includes(tabStatus),
    },
    {
      title: '截仓时间',
      dataIndex: 'closing_time',
      align: 'center',
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (val: any) => ({
          begin_closing_time: val[0] && moment(val[0]).format('YYYY-MM-DD'),
          end_closing_time: val[1] && moment(val[1]).format('YYYY-MM-DD'),
        }),
      },
      order: 15,
      hideInSearch: !['all', '2', '10', '5', '6', '7', '3', '4'].includes(tabStatus),
    },
    {
      title: '',
      dataIndex: 'orderSearch',
      hideInTable: true,
      renderFormItem: () => <OrderSearch />,
      search: {
        transform: (val: any) => ({
          delivery_plan_no: val?.[0] == 'delivery_no' ? val?.[1] : null,
          order_no: val?.[0] == 'stock_no' ? val?.[1] : null,
          booking_number: val?.[0] == 'sh_no' ? val?.[1] : null,
        }),
      },
      fieldProps: {},
      order: 14,
    },
    {
      title: '',
      dataIndex: 'personSearch',
      hideInTable: true,
      renderFormItem: () => <PersonSearch />,
      search: {
        transform: (val: any) => ({
          pmc_id: val?.[0] == 'pmc' ? val?.[1] : null,
          purchase_id: val?.[0] == 'cg' ? val?.[1] : null,
          principal_id: val?.[0] == 'wl' ? val?.[1] : null,
        }),
      },
      fieldProps: {},
      order: 13,
    },
    {
      title: '订舱号',
      dataIndex: 'booking_number',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '是否关联跨境物流单',
      dataIndex: 'is_in_logistics_order',
      align: 'center',
      order: 3,
      hideInTable: true,
      valueType: 'select',
      valueEnum: dicList?.SC_YES_NO || {},
      hideInSearch: !['all', '7'].includes(tabStatus),
    },
    {
      title: '跨境物流单号',
      dataIndex: 'in_logistics_order_no',
      align: 'center',
      order: 2,
      hideInTable: true,
      hideInSearch: !['all', '7'].includes(tabStatus),
    },
    {
      title: '操作',
      fixed: 'right',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 120,
      render: (_, record: any) => {
        return (
          <Space direction={'vertical'} size={0}>
            {/*编辑物流信息*/}
            {access.canSee('scm_logisticsPlanIn_stock_editLogistics') &&
              [2].includes(Number(record.approval_status)) && (
                <Detail
                  id={record.order_id}
                  warehousing_order_in_id={record.warehousing_order_in_id}
                  people={{
                    pmc_name: record?.planDetailList.length
                      ? record?.planDetailList[record?.planDetailList?.length - 1].pmc_name
                      : null,
                    purchase_name: record?.purchase_name,
                    principal_name: record?.principal_name,
                  }}
                  ids={{
                    shipment_id: record.shipment_id,
                    reference_id: record.reference_id,
                  }}
                  dicList={common.dicList}
                  access={access}
                  isEdit={true}
                  reload={actionRef?.current?.reload}
                  title={<a key="detail">编辑物流信息</a>}
                />
              )}
            {/* 详情 */}
            {access.canSee('scm_logisticsPlanIn_stock_detail') ? (
              <Detail
                id={record.order_id}
                warehousing_order_in_id={record.warehousing_order_in_id}
                people={{
                  pmc_name: record?.planDetailList.length
                    ? record?.planDetailList[record?.planDetailList?.length - 1].pmc_name
                    : null,
                  purchase_name: record?.purchase_name,
                  principal_name: record?.principal_name,
                }}
                ids={{
                  shipment_id: record.shipment_id,
                  reference_id: record.reference_id,
                }}
                isDetail={true}
                dicList={common.dicList}
                access={access}
                reload={actionRef?.current?.reload}
                title={<a key="detail">详情</a>}
              />
            ) : null}
            {typeof record.logistics_update_confirm_status == 'number' &&
              [0, 1, 2].includes(record.logistics_update_confirm_status) &&
              access.canSee('scm_logisticsPlanIn_stock_modifyConfirm') &&
              [1, 2, 10, 5, 6].includes(Number(record.approval_status)) && (
                <Popconfirm
                  key="delete"
                  title="确定操作吗?"
                  onConfirm={async () => confirmEditInfo([record.order_no])}
                  okText="确定"
                  cancelText="取消"
                >
                  <a>修改已确认</a>
                </Popconfirm>
              )}

            {[2].includes(Number(record.approval_status)) &&
              access.canSee('scm_logisticsPlanIn_stock_noticeDelivery') && (
                <Popconfirm
                  title={
                    <div>
                      确定需通知采购发货?
                      <br />
                      注意: 请确保货件和物流信息的必填信息已填写
                    </div>
                  }
                  onConfirm={async () => {
                    const res = await api.notifyPurchaseDelivery({ ids: record.order_id });
                    if (res.code == pubConfig.sCode) {
                      pubMsg(res?.message, 'success');
                      actionRef.current?.reload();
                      return true;
                    } else {
                      pubMsg(`提交失败: ${res.message}`);
                      return false;
                    }
                  }}
                  okText="确定"
                  cancelText="取消"
                >
                  <a>通知采购发货</a>
                </Popconfirm>
              )}
            {/*修改送货信息*/}
            {[10, 5, 6].includes(Number(record.approval_status)) &&
              access.canSee('scm_logisticsPlanIn_stock_editShippingInfo') && (
                <CutOffTime
                  dataSource={{ ...record, id: record.order_id }}
                  reload={actionRef.current?.reload}
                  harbor={record.harbor}
                  closing_time={record.closing_time}
                />
              )}
            {/*国内港口入库*/}
            {[6].includes(Number(record.approval_status)) &&
              access.canSee('scm_logisticsPlanIn_stock_portWarehousing') && (
                <PortStorageModal
                  reload={actionRef?.current?.reload}
                  dataSource={{
                    ...record,
                    orderSkuList: [{ specificationList: record.specificationList }],
                  }}
                />
              )}
            {/* 退回至国内在途 */}
            {[7].includes(Number(record.approval_status)) &&
              access.canSee('scm_logisticsPlanIn_stock_toCnOnWay') && (
                <Popconfirm
                  title="确定需退回?"
                  onConfirm={async () => {
                    const res = await api.returnToCnTransit({ order_no: record.order_no });
                    if (res.code == pubConfig.sCode) {
                      pubMsg(res?.message, 'success');
                      actionRef.current?.reload();
                      return true;
                    } else {
                      pubMsg(`提交失败: ${res.message}`);
                      return false;
                    }
                  }}
                  okText="确定"
                  cancelText="取消"
                >
                  <a>退回至国内在途</a>
                </Popconfirm>
              )}
            {/* 操作日志 */}
            {access.canSee('scm_logisticsPlanIn_stock_handleLog') && (
              <CommonLog
                api={api.getOperationHistory}
                business_no={record.order_no}
                dicList={common?.dicList}
              />
            )}
          </Space>
        );
      },
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 2300);
  // 获取状态及数据统计
  const statusCountAction = async () => {
    const res: any = await logisticsPlanStatusCount({});
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const tabs = res.data.map((v: any) => {
        return {
          key: v.key,
          tab: `${v.name} (${v.count})`,
        };
      });
      setTabList(tabs);
    }
  };
  // 切换tabs时
  const changeTabs = async (key: any) => {
    setTabStatus(key);
    window.sessionStorage.setItem(cacheTabKey, key);
    setPageSize(20);
  };
  // 通知采购发货 - 批量
  const notifyPurchaseDelivery = async () => {
    const res = await api.notifyPurchaseDelivery({ ids: selectedRowKeys.toString() });
    if (res.code == pubConfig.sCode) {
      pubMsg(res?.message, 'success');
      actionRef.current?.reload();
      selectedRowKeysSet([]);
      selectedRowDataSet([]);
      return true;
    } else {
      pubMsg(`操作失败, ${res.message}`);
      return false;
    }
  };
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      fixedHeader
      tabActiveKey={tabStatus || 'all'}
      className="pubPageTabs logisticsPlanIn"
      tabList={tabList}
      onTabChange={changeTabs}
    >
      <ProTable<any>
        size={'small'}
        actionRef={actionRef}
        formRef={formRef}
        bordered
        rowKey="order_id"
        pagination={{
          showSizeChanger: true,
          pageSize,
          onChange: (page, size) => {
            setPageSize(size);
          },
        }}
        params={{ tabStatus }}
        dateFormatter="string"
        request={async (params) => {
          selectedRowKeysSet([]);
          selectedRowDataSet([]);
          const postData = {
            ...params,
            business_scope: 'IN',
            current_page: params.current,
            page_size: params.pageSize,
            logistics_plan_status: tabStatus == 'all' ? null : tabStatus, //状态
            shipment_begin_cycle_time: params?.cycle_time?.[1] || null, //下单时间-开始
            shipment_end_cycle_time: params?.cycle_time?.[2] || null, //下单时间-结束
            cycle_time: params?.cycle_time?.[0] || null,
            harbor_id: !['all', '2', '10', '5', '6', '7', '3', '4'].includes(tabStatus)
              ? null
              : params?.harbor_id,
            closing_time: !['all', '2', '10', '5', '6', '7', '3', '4'].includes(tabStatus)
              ? null
              : params?.closing_time,
            is_in_logistics_order: !['all', '7'].includes(tabStatus)
              ? null
              : params?.is_in_logistics_order,
            in_logistics_order_no: !['all', '7'].includes(tabStatus)
              ? null
              : params?.in_logistics_order_no,
          };
          const res = await logisticsPlanPage(postData);
          setExportForm(postData);
          statusCountAction();
          const data = res.data?.records?.map((v: any) => ({
            ...v,
            box_num: v.num,
          }));
          if (res && res.code == pubConfig.sCode) {
            return {
              total: res.data?.total || 0,
              data: data || [],
              success: true,
            };
          }
          return {
            total: 0,
            data: [],
            success: false,
          };
        }}
        columns={columns}
        search={{ labelWidth: 120, className: 'light-search-form', defaultCollapsed: false }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        rowSelection={{
          selectedRowKeys,
          onChange: (rowKeys: any, rowItems: any) => {
            selectedRowKeysSet(rowKeys);
            selectedRowDataSet(rowItems);
          },
          fixed: 'left',
        }}
        tableAlertRender={false}
        headerTitle={
          <Space>
            {/* 物流负责人认领 */}
            <Access
              key="Claim"
              accessible={
                ['1', '2', '10', '5', '6'].includes(tabStatus) &&
                access.canSee('scm_logisticsPlanIn_stock_claims')
              }
            >
              <Claim
                dicList={common?.dicList}
                dataSource={selectedRowData}
                disabled={!selectedRowData?.length}
                selectedRowDataSet={selectedRowDataSet}
                selectedRowKeysSet={selectedRowKeysSet}
                reload={actionRef.current?.reload}
              />
            </Access>
            <Access
              key="confirm"
              accessible={
                ['101'].includes(tabStatus) &&
                access.canSee('scm_logisticsPlanIn_stock_modifyConfirmB')
              }
            >
              <Button
                type="primary"
                ghost
                disabled={!selectedRowData?.length}
                size="small"
                onClick={() => {
                  pubModal(undefined, '确定批量操作吗?')
                    .then(async () => {
                      confirmEditInfo(selectedRowData?.map((v: any) => v.order_no));
                    })
                    .catch(() => {
                      console.log('点击了取消');
                    });
                }}
              >
                信息修改已确认
              </Button>
            </Access>
            <Access
              key="notifyPurchase"
              accessible={
                [2].includes(Number(tabStatus)) &&
                access.canSee('scm_logisticsPlanIn_stock_noticeDeliveryB')
              }
            >
              <Popconfirm
                title={
                  <div>
                    确定需批量通知采购发货?
                    <br />
                    注意: 所选入库单请确保货件和物流信息的必填信息已完整填写
                  </div>
                }
                onConfirm={notifyPurchaseDelivery}
                okText="确定"
                cancelText="取消"
                disabled={!selectedRowData?.length}
              >
                <Button size={'small'} type="primary" disabled={!selectedRowKeys.length}>
                  通知采购发货(批量)
                </Button>
              </Popconfirm>
            </Access>
            <Access
              key="logisticsImportB"
              accessible={
                access.canSee('scm_logisticsPlanIn_stock__logisticsImportB') &&
                ['all', '1', '2'].includes(tabStatus)
              }
            >
              <Popover
                key="logisticsImportB"
                title={'需要下载导入模板 ?'}
                content={
                  <Button
                    type={'link'}
                    loading={downLoading.ShipmentInfoIn}
                    onClick={() => {
                      downLoadExcel(
                        'exportLogisticsInfoIn',
                        '跨境-导入物流信息(模板)',
                        'ShipmentInfoIn',
                      );
                    }}
                  >
                    跨境-导入物流信息(模板)Excel文件下载
                  </Button>
                }
              >
                <Upload
                  key={'logisticsImportB'}
                  beforeUpload={(file: any) =>
                    pubBeforeUpload({
                      file,
                      acceptType: ['xls', 'xlsx'], // 上传限制 非必填
                    })
                  }
                  accept=".xls,.xlsx" // 打开时，默认显示的文件类型 非必填
                  showUploadList={false}
                  customRequest={(data) => handleUpload(data, 'batchImportlogistics')}
                >
                  <Button
                    size={'small'}
                    icon={<UploadOutlined />}
                    type="primary"
                    loading={upLoading.batchImportShelfInfo}
                    ghost
                  >
                    物流信息导入(批量)
                  </Button>
                </Upload>
              </Popover>
            </Access>
            <Access
              key="portWarehousingB"
              accessible={
                access.canSee('scm_logisticsPlanIn_stock_portWarehousingB') &&
                ['6'].includes(tabStatus)
              }
            >
              <Popover
                key="portWarehousingB"
                title={'需要下载导入模板 ?'}
                content={
                  <Button
                    type={'link'}
                    loading={downLoading.PortWarehousingIn}
                    onClick={() => {
                      downLoadExcel(
                        'exportPortWarehousingIn',
                        '跨境-导入港口入库(模板)',
                        'PortWarehousingIn',
                      );
                    }}
                  >
                    跨境-导入港口入库(模板)Excel文件下载
                  </Button>
                }
              >
                <Upload
                  key={'portWarehousingB'}
                  beforeUpload={(file: any) =>
                    pubBeforeUpload({
                      file,
                      acceptType: ['xls', 'xlsx'], // 上传限制 非必填
                    })
                  }
                  accept=".xls,.xlsx" // 打开时，默认显示的文件类型 非必填
                  showUploadList={false}
                  customRequest={(data) => handleUpload(data, 'batchImportPortStorage')}
                >
                  <Button
                    size={'small'}
                    icon={<UploadOutlined />}
                    type="primary"
                    loading={upLoading.batchImportShelfInfo}
                    ghost
                  >
                    国内港口入库(批量)
                  </Button>
                </Upload>
              </Popover>
            </Access>
            {/* 创建物流单 */}
            <Access
              key="createLogisticsOrde"
              accessible={
                ['7'].includes(tabStatus) &&
                access.canSee('scm_logisticsPlanIn_stock_createLogisticsOrder')
              }
            >
              <CreateLogisticsOrder
                dicList={common?.dicList}
                dataSource={selectedRowData?.map((v: any) => ({
                  ...v,
                  orderSkuList: [{ specificationList: v.specificationList, difference_num: v?.difference_num }],
                  vendor_signing_name: v.tax_refund_company_name,
                  id: v.order_id,
                }))}
                from="logPlan"
                disabled={!selectedRowData?.length}
                selectedRowDataSet={selectedRowDataSet}
                selectedRowKeysSet={selectedRowKeysSet}
                reload={actionRef.current?.reload}
              />
            </Access>
          </Space>
        }
        {...ColumnSet}
        toolBarRender={() => [
          <Space key="space">
            {access.canSee('scm_logisticsPlanIn_stock_exportDetails') && (
              <ExportBtn
                exportHandle={exportPackingDetails}
                btnText="装箱明细导出"
                exportForm={{
                  ...exportForm,
                  export_config: { columns: ColumnSet.customExportConfig },
                  selected_id: selectedRowKeys,
                }}
              />
            )}
            {access.canSee('scm_logisticsPlanIn_stock_export') && (
              <ExportBtn
                exportHandle={exportS}
                btnText="跨境物流计划(入库单)导出"
                exportForm={{
                  ...exportForm,
                  export_config: { columns: ColumnSet.customExportConfig },
                  selected_id: selectedRowKeys,
                }}
              />
            )}
          </Space>,
        ]}
      />
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(In);
export default ConnectPage;

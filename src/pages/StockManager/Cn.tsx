/*国内平台入库*/
import React, { useEffect, useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableListItem, TableListPagination } from './data';
import { useActivate } from 'react-activation';
import { Button, Modal, Popconfirm, Popover, Space, Tabs, Upload } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import './style.less';
import * as api from '@/services/pages/stockManager';
import {
  pubBeforeUpload,
  pubGetPlatformList,
  pubGetStoreList,
  pubBlobDownLoad,
} from '@/utils/pubConfirm';
import {
  baseFileUpload,
  getVendorList,
} from '@/services/base';
import { getSysPlatformWarehousingPage, batchClearSelectVendor } from '@/services/pages/storageManage';
import { pubAlert, pubConfig, pubFilter, pubModal, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import SupplierModal from './SupplierModal';
import ListInnerTable from './ListInnerTable';
import { Access, connect, useAccess } from 'umi';
import SyncedModal from './Dialog/SyncedModal';
import AutomaticPlatformsNum from './Dialog/AutomaticPlatformsNum'; // 自动入库
import WeekTimeSearch from '@/components/PubForm/WeekTimeSearch';
import PubWeekRender from '@/components/PubWeekRender';
import EditDrawer from './CNDialog/EditDrawer';
import CreateAccessories from './CNDialog/CreateAccessories';
import AppointmentModal from './CNDialog/AppointmentModal';
import ChangeWarehousingTime from './CNDialog/ChangeWarehousingTime';
import UpdatePlatformModal from './CNDialog/UpdatePlatformModal';
import ExpandedRowRender from './CNDialog/ExpandedRowRender';
import ChangeSendGoods from './CNDialog/ChangeSendGoods';
import StockOrderDetail from '@/components/Reconciliation/StockOrderDetail';
import { PageContainer } from '@ant-design/pro-layout';
import ViewLogSupplier from '@/components/ViewLogSupplier';
import CommonLog from '@/components/CommonLog';
import SelectDependency from '@/components/PubForm/SelectDependency';
import ImportBtn from '@/components/ImportBtn';
import useCustomColumnSet from "@/hooks/useCustomColumnSet";

// 搜索清除前后空格, 本地搜索过滤
const selectProps = {
  showSearch: true,
};
const colSpanSet = { value: 7 }; // 内嵌表格跨行数量

// 获取供应商列表下拉
export const getVendor = async (v: any): Promise<any> => {
  const res = await getVendorList({
    current_page: 1,
    page_size: 1000,
    key_word: v?.keyWords?.replace(/(^\s*)/g, '') || '',
  });
  if (res?.code != pubConfig.sCode) {
    pubMsg(res?.message);
    return [];
  } else {
    return res?.data?.records
      .filter((item: any) => item.vendor_status == '1' || item.vendor_status == '4')
      .map((item: any) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
  }
};

// 下载箱唛/出货清单
const exportPdf = async (data: any, apiMethod: any) => {
  const res: any = await api[apiMethod]({ id: data.id });
  const type = res.response.headers.get('content-type');
  if (type?.indexOf('application/json') > -1) {
    pubMsg(res?.message);
  } else {
    const blob = new Blob([res.data], {
      type: 'application/pdf;chartset=UTF-8',
    });
    const objectURL = URL.createObjectURL(blob);
    const btn = document.createElement('a');
    const fileData = res.response.headers.get('content-disposition');
    let fileName =
      apiMethod === 'exportBoxLabel'
        ? `(${data.order_no})箱唛.pdf`
        : `(${data.order_no})出货清单.pdf`;
    if (fileData) {
      fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
    }
    btn.download = fileName;
    btn.href = objectURL;
    btn.click();
    URL.revokeObjectURL(objectURL);
  }
};
const cacheTabKeyTop = 'StockManagerCnTop';
const cacheTabKey = 'StockManagerCn';
// 页面主体
const Cn: React.FC<{ common: any }> = ({ common }) => {
  const formRef = useRef<ProFormInstance>(); // 页面查询条件
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, selectedRowKeysSet] = useState<any[]>([]);
  const [selectedRowData, selectedRowDataSet] = useState<any[]>([]);
  const [upLoading, setUpLoading] = useState(false);
  const [waybillLoading, setWaybillLoading] = useState(false);
  const [downLoading, setDownLoading] = useState({
    WarehousingOrder: false,
    WarehousingOrderCn: false,
    WarehousingImportWaybill: false,
  });
  const [pageSize, setPageSize] = useState<any>(20);
  const [tableKey, tableKeySet] = useState(1);
  const [topTabList, setTopTabList] = useState<any>([]);
  const [topSTabList, setSTabList] = useState<any>([]);
  const [pId, setPId] = useState<any>(window.sessionStorage.getItem(cacheTabKeyTop) || 0);
  const [tabStatus, setTabStatus] = useState(window.sessionStorage.getItem(cacheTabKey) || '1');
  const access = useAccess();
  const [exportForm, setExportForm] = useState<any>({});
  const pObj = {
    '1552846034395881473': '云仓',
    '1531560417090879489': '天猫',
    '1532170842660691969': '京东POP',
    '1531896104457621506': '京东FCS',
    '1580120899712675841': '汇业仓',
    '1532170822712582145': '京东自营',
  };
  const onStatusClick = (key: any) => {
    setPageSize(20);
    setTabStatus(key);
    window.sessionStorage.setItem(cacheTabKey, key);
  };

  // 获取店铺
  const pubGetStoreListAction = async (data: any): Promise<any> => {
    const res: any = await pubGetStoreList(data);
    return res;
  };
  // 激活页面请求列表
  useActivate(() => {
    if (actionRef?.current) actionRef?.current?.reload();
  });
  // 导出excel
  const downLoadExcel = async (apiUrl: string, myFileName: string, loading: string) => {
    setDownLoading({ ...downLoading, [loading]: true });
    exportForm.selected_order_id = selectedRowKeys;
    exportForm.platform_code =
      pObj[pId] == '云仓' ? 'YUN_CANG' : pObj[pId] == '汇业仓' ? 'HUI_YE_CANG' : null;
    const res: any = await api[apiUrl](exportForm);
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
  // 合并入库单
  const mergeOrder = async () => {
    if (selectedRowKeys?.length < 2) {
      return pubAlert(`操作失败, 勾选两个以上才可以操作合并`, '', 'warning');
    }
    const orderIds = selectedRowData?.reduce((pre: any, cur: any) => {
      const curSkus = cur.orderSkuList.map((v: any) => v.order_id);
      return [...pre, ...curSkus];
    }, []);
    const res = await api.mergeOrder({ ids: orderIds.toString() });
    if (res.code == pubConfig.sCode) {
      selectedRowKeysSet([]);
      selectedRowDataSet([]);
      Modal.info({
        title: '结果提示',
        content: res.message,
      });
      tableKeySet(Date.now);
      actionRef.current?.reload();
    } else {
      pubMsg(`操作失败, ${res.message}`);
    }
  };
  // 拆分入库单
  const cancelMergeOrder = async () => {
    const res = await api.cancelMergeOrder({ ids: selectedRowKeys.toString() });
    if (res.code == pubConfig.sCode) {
      pubMsg(res?.message, 'success');
      selectedRowKeysSet([]);
      selectedRowDataSet([]);
      tableKeySet(Date.now);
      actionRef.current?.reload();
    } else {
      pubMsg(`操作失败, ${res.message}`);
    }
  };
  // 同步至供应商和平台
  const synchVendor = async (id?: string | number) => {
    const postData = {
      ids: id || selectedRowKeys.toString(),
      platform_code:
        pObj[pId] == '云仓' ? 'YUN_CANG' : pObj[pId] == '汇业仓' ? 'HUI_YE_CANG' : null,
    };
    const res = await api.synchVendor(postData);
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
  // 删除入库单
  const deleteByOrderNoAction = async (order_no: string) => {
    const res = await api.deleteByOrderNo({
      order_no,
      platform_code:
        pObj[pId] == '云仓' ? 'YUN_CANG' : pObj[pId] == '汇业仓' ? 'HUI_YE_CANG' : null,
    });
    if (res.code == pubConfig.sCode) {
      pubMsg(res?.message, 'success');
      actionRef.current?.reload();
      return true;
    } else {
      pubMsg(`操作失败, ${res.message}`);
      return false;
    }
  };
  // 导入
  const handleUpload = async (data: any, loading: (isLoading: boolean) => void) => {
    // loading开始
    loading(true);
    const res = await baseFileUpload({
      file: data.file,
      business_type: 'WAREHOUSING_ORDER',
    });
    if (res?.code != pubConfig.sCode) {
      pubAlert(res?.message);
      loading(false);
      return;
    }
    const resData =
      loading == setUpLoading
        ? await api.batchImportPlatformWarehousing({
          sysFile: res?.data?.[0],
          business_scope: 'CN',
          platform_id: pId,
        })
        : await api.batchImportWaybill(res?.data?.[0]);

    const fileName = loading == setUpLoading ? '导入入库信息' : '导入物流信息';
    pubBlobDownLoad(resData, fileName, (success: boolean) => {
      loading(false);
      if (success) {
        actionRef?.current?.reload();
      };
    });
  };
  // 撤回
  const handleWithdraw = async (id: string, remarks: string = '') => {
    const res = await api.withdraw({ id, withdraw_msg: remarks });
    if (res.code == pubConfig.sCode) {
      pubMsg(res?.message, 'success');
      actionRef.current?.reload();
      return true;
    } else {
      pubMsg(`提交失败: ${res.message}`);
      return false;
    }
  }
  // 清空供应商
  const clearVendor: any = (ids: any) => {
    pubModal('是否确定清空选中入库单的供应商信息？')
      .then(async () => {
        const res = await batchClearSelectVendor({ orderNos: ids.join(',') });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        pubMsg('操作成功！', 'success');
        setTimeout(() => {
          actionRef.current?.reload();
        }, 100);
      })
      .catch(() => {
        console.log('点了取消');
      });
  };
  // table配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '入库单类型',
      dataIndex: 'warehousing_type',
      hideInTable: true,
      valueType: 'select',
      valueEnum: common?.dicList?.WAREHOUSING_ORDER_WAREHOUSING_TYPE || {},
    },
    {
      title: '状态',
      dataIndex: 'approval_status',
      align: 'center',
      order: 15,
      width: 100,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return (
          <div>
            {pubFilter(common?.dicList?.WAREHOUSING_ORDER_STATUS, record?.approval_status)}
            {record.sync_status == 1 && record.approval_status == 6 ? (
              <Popover
                content={<div>{record?.sync_fail_reason}</div>}
                title="失败原因"
                trigger="hover"
              >
                <div style={{ color: '#ff0000', cursor: 'point' }}>自动收货失败</div>
              </Popover>
            ) : (
              ''
            )}
            {
              /*供应商已查看*/
              record.vendorViewList &&
                record.vendorViewList.length &&
                [2].includes(Number(record.approval_status)) ? (
                <ViewLogSupplier dataSource={record.vendorViewList} />
              ) : null
            }
          </div>
        );
      },
    },
    {
      title: '出货周期',
      width: 95,
      dataIndex: 'cycle_time',
      align: 'center',
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
            cycle_time: record.cycle_time,
            begin: record.shipment_begin_cycle_time,
            end: record.shipment_end_cycle_time,
          }}
        />
      ),
    },
    {
      title: '入库单号',
      dataIndex: 'order_no',
      order: 14,
      width: 120,
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      order: 12,
      hideInSearch: true,
      hideInTable: ['云仓', '汇业仓'].includes(pObj[pId]),
      width: 80,
    },
    {
      title: '店铺',
      width: 100,
      dataIndex: 'shop_id',
      align: 'center',
      order: 11,
      valueType: 'select',
      dependencies: ['platform_id'],
      params: { pId },
      request: async (v: any) => {
        return pubGetStoreListAction({
          business_scope: 'CN',
          platform_id: v.pId,
        });
      },
      hideInTable: ['天猫', '京东POP', '云仓', '汇业仓'].includes(pObj[pId]),
      hideInSearch: ['天猫', '京东POP', '云仓', '汇业仓'].includes(pObj[pId]),
      fieldProps: selectProps,
      render: (_: any, record: any) => record?.shop_name || '-',
    },
    {
      title: '平台入库单号',
      dataIndex: 'platform_warehousing_order_no',
      align: 'center',
      fieldProps: {
        placeholder: '输入多个用逗号隔开',
      },
      search: {
        transform: (value: any) => ({ platform_warehousing_order_no: value.replace('，', ',') }),
      },
      order: 13,
      hideInTable: ['汇业仓'].includes(pObj[pId]),
      hideInSearch: ['汇业仓'].includes(pObj[pId]),
      width: 100,
    },
    {
      title: '仓库类型',
      dataIndex: 'platform_warehousing_type',
      hideInSearch: true,
      hideInTable: !['云仓'].includes(pObj[pId]),
      width: 90,
      valueEnum: common?.dicList?.SYS_PLATFORM_WAREHOUSING_PLATFORM || {},
    },
    {
      title: '仓库',
      dataIndex: 'warehouse_id',
      ellipsis: true,
      order: 11,
      hideInSearch: !['云仓'].includes(pObj[pId]),
      hideInTable: !['云仓'].includes(pObj[pId]),
      render: (_: any, record: any) => record?.warehouse_name || '-',
      initialValue: [null, null],
      renderFormItem: () => (
        <SelectDependency
          valueEnum={common?.dicList?.SYS_PLATFORM_WAREHOUSING_PLATFORM || {}}
          requestUrl={'/sc-scm/orderDeliveryWarehouse/page'}
          requestParam={'platform_code'}
          placeholder={['类型', '仓库选择']}
        />
      ),
      search: {
        transform: (v) => ({ platform_warehousing_type: v[0], warehouse_id: v[1] }),
      },
      width: 100,
    },
    {
      title: '仓库',
      ellipsis: true,
      width: 90,
      dataIndex: 'warehouse_id',
      order: 11,
      hideInTable: !['汇业仓'].includes(pObj[pId]),
      hideInSearch: !['汇业仓'].includes(pObj[pId]),
      fieldProps: { showSearch: true },
      params: { pId },
      request: async () => {
        const res = await getSysPlatformWarehousingPage({
          current_page: 1,
          page_size: 999,
          platform_id: pId, // 区域
        });
        if (res && res.code == pubConfig.sCode) {
          return res.data.records.map((item: any) => ({
            ...item,
            label: item.warehousing_name,
            value: item.id,
          }));
        }
        return [];
      },
      render: (_: any, record: any) => record?.warehouse_name || '-',
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      hideInTable: true,
      order: 10,
      width: 140,
    },
    {
      title: 'SKU',
      dataIndex: 'stock_no',
      hideInTable: true,
      order: 9,
      width: 110,
    },
    {
      title: '供应商(代码)',
      dataIndex: 'vendor_id',
      align: 'center',
      request: getVendor,
      debounceTime: 300,
      fieldProps: selectProps,
      order: 8,
      width: 160,
      render: (_: any, record: any) => (
        <Space direction={'vertical'}>
          {record.vendor_name ? `${record.vendor_name}(${record.vendor_code})` : ''}
          <Space>
            {(record.approval_status == 1 || record.approval_status == 4) &&
              access.canSee('stockManager_updateOrderVendor_cn') ? (
              <SupplierModal
                dataSource={record}
                actionRef={actionRef}
                type={'cn'}
                dicList={common.dicList}
              />
            ) : null}
            {(record.vendor_name && record.approval_status == 1) &&
              access.canSee('scm_stockManager_clearVendor_cn') ? (
              <a key="clearVendor_cn" onClick={() => clearVendor([record.order_no])}>清空供应商</a>
            ) : null}
          </Space>
        </Space>
      ),
    },
    /*合并字段 orderSkuList*/
    {
      title: '商品名称',
      hideInSetting: true,
      className: 'p-table-inTable noBorder',
      dataIndex: 'sku_name',
      align: 'center',
      onCell: () => ({ colSpan: 6, style: { padding: 0 } }),
      render: (_, record: any) => {
        /*计算默认箱数：箱数为 0 并且无备用箱规时, 设置默认 箱数*/
        const recordComputed = {
          ...record,
          orderSkuList: record.orderSkuList.map((sku: any) => ({
            ...sku,
            specificationList: sku.specificationList.map((specification: any) => ({
              ...specification,
              num:
                sku?.specificationList.length > 1 || specification.num
                  ? specification.num
                  : Number(Number(sku.delivery_plan_current_num / specification.pics).toFixed(0)),
            })),
          })),
        };
        return (
          <ProForm initialValues={recordComputed} submitter={false} className="inner-form">
            <ProForm.Item noStyle name={'orderSkuList'}>
              <ListInnerTable
                recordS={{ ...record, tc_warehouse_contacts: record?.tc_contacts }}
                colSpanSet={colSpanSet}
                showHeader={false}
                readonly={true}
                type={'cn'}
                plat={pObj[pId]}
                value={recordComputed.orderSkuList}
                reload={actionRef.current?.reload}
                tableKey={tableKey}
                tableKeySet={Function.prototype}
                dicList={common.dicList}
                warehousing_type={record.warehousing_type}
                hideSpec={true}
                from="page"
                common={common}
              />
            </ProForm.Item>
          </ProForm>
        );
      },
      width: 160,
      hideInSearch: true,
    },
    {
      title: 'SKU',
      hideInSetting: true,
      dataIndex: 'num',
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: 120,
      hideInSearch: true,
    },
    {
      title: '商品条码',
      hideInSetting: true,
      dataIndex: 'bar_code',
      align: 'center',
      width: 120,
      hideInSearch: true,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '计划发货数量(总)',
      hideInSetting: true,
      dataIndex: 'num',
      align: 'center',
      width: 90,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '计划发货数量(本次)',
      hideInSetting: true,
      dataIndex: 'delivery_plan_current_num',
      align: 'center',
      width: 90,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <div style={{ width: '68px' }}>
            箱规
            <br />
            (每箱数量)
          </div>
          <div style={{ width: '60px' }}>箱数</div>
        </div>
      ),
      hideInSetting: true,
      dataIndex: 'specificationList',
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: 200,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '发货数量',
      hideInSetting: true,
      dataIndex: 'numTotal',
      align: 'center',
      width: 90,
      hideInSearch: true,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      render: (_: any, record: any) => {
        return (
          <span>
            {record.specificationList &&
              record.specificationList.reduce(
                (previousValue: any, currentValue: any) =>
                  previousValue + currentValue.pics * currentValue.num,
                0,
              )}
          </span>
        );
      },
    },
    {
      title: '实际入库数量',
      tooltip: '国内平台入库单实际入库数量，可能是从一个或者多个采购单扣减，然后入国内平台仓库，具体请查看入库单详情',
      hideInSetting: true,
      dataIndex: 'warehousing_num',
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: 90,
      hideInSearch: true,
    },
    {
      title: '平台入库异常',
      hideInSetting: true,
      dataIndex: 'difference_num',
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: 90,
      hideInSearch: true,
    },
    /*合并字段 orderSkuList 结束*/
    {
      title: '实际入库时间',
      dataIndex: 'warehousing_time',
      align: 'center',
      width: 110,
      order: 3,
      valueType: 'dateRange',
      render: (_, record: any) => record.warehousing_time,
      search: {
        transform(value) {
          return {
            begin_warehousing_time: value[0],
            end_warehousing_time: value[1],
          };
        },
      },
      sorter: (a: any, b: any) =>
        new Date(a.required_warehousing_time).getTime() -
        new Date(b.required_warehousing_time).getTime(),
    },
    {
      title: '收货区域',
      dataIndex: 'warehouse_area',
      align: 'center',
      width: 90,
      hideInTable: ['云仓', '汇业仓'].includes(pObj[pId]),
      hideInSearch: ['云仓', '汇业仓'].includes(pObj[pId]),
    },
    {
      title: '采购单号',
      dataIndex: 'purchase_order_no',
      hideInTable: true,
    },
    {
      title: '是否入库异常',
      dataIndex: 'warehousing_exception_type',
      hideInTable: true,
      valueEnum: {
        '3': '平台入库正常',
        '4': '平台入库异常',
        '5': '异常已处理',
      },
    },
    {
      title: '同步失败入库单',
      dataIndex: 'sync_status',
      hideInTable: true,
      valueEnum: {
        '0': '自动收货成功',
        '1': '自动收货失败',
      },
    },
    {
      title: '收货仓库',
      dataIndex: 'warehouse_name',
      align: 'center',
      hideInSearch: true,
      hideInTable: ['云仓', '汇业仓'].includes(pObj[pId]),
      width: 100,
    },
    {
      title: '平台预约单号',
      dataIndex: 'platform_appointment_order_no',
      align: 'center',
      hideInSearch: true,
      hideInTable: ['云仓', '汇业仓'].includes(pObj[pId]),
      width: 100,
    },
    {
      title: '预计入库时间',
      dataIndex: 'platform_appointment_time',
      align: 'center',
      width: 110,
      order: 4,
      valueType: 'dateRange',
      render: (_, record: any) => record.platform_appointment_time,
      search: {
        transform(value) {
          return {
            begin_platform_appointment_time: value[0],
            end_platform_appointment_time: value[1],
          };
        },
      },
      sorter: (a: any, b: any) =>
        new Date(a.platform_appointment_time).getTime() -
        new Date(b.platform_appointment_time).getTime(),
    },
    {
      title: '要求平台入库时间',
      dataIndex: 'required_warehousing_time',
      align: 'center',
      width: 90,
      order: 5,
      valueType: 'dateRange',
      render: (_, record: any) => record.required_warehousing_time,
      search: {
        transform(value) {
          return {
            begin_required_warehousing_time: value[0],
            end_required_warehousing_time: value[1],
          };
        },
      },
      sorter: (a: any, b: any) =>
        new Date(a.required_warehousing_time).getTime() -
        new Date(b.required_warehousing_time).getTime(),
    },
    {
      title: '运单号',
      dataIndex: 'logistics_order_no',
      align: 'center',
      hideInSearch: true,
      width: 100,
      hideInTable: !['云仓', '汇业仓'].includes(pObj[pId]),
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      align: 'center',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      order: 6,
      width: 120,
      valueType: 'dateRange',
      search: {
        transform(value) {
          return {
            begin_create_time: `${value[0]} 00:00:00`,
            end_create_time: `${value[1]} 23:59:59`,
          };
        },
      },
      hideInTable: true,
    },
    {
      title: '操作',
      fixed: 'right',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 145,
      render: (_, record: any) => {
        const readonly =
          pObj[pId] !== '云仓'
            ? Number(record.approval_status) != 1 && Number(record.approval_status) != 4
            : Number(record.approval_status) != 1;

        return (
          /*新建:1 已同步:2 撤回中:3 已撤回:4 国内在途:6 已入库:9*/
          <Space direction={'vertical'} size={0}>
            {readonly && access.canSee('stockManager_view_detail_cn') && (
              <StockOrderDetail
                recordS={{ ...record, tc_warehouse_contacts: record?.tc_contacts }}
                id={record.id}
                from="stock"
                dicList={common.dicList}
                common={common}
                access={access}
                reload={actionRef?.current?.reload}
                tableKeySet={Function.prototype}
                title={<a key="detail">详情</a>}
                isParts={record.isParts}
              />
            )}
            {/*编辑*/}
            {access.canSee('stockManager_updateWarehousingOrder_cn') &&
              !readonly &&
              !record.isParts && (
                <EditDrawer
                  dataSource={{ ...record, tc_warehouse_contacts: record?.tc_contacts }}
                  common={common}
                  reload={actionRef?.current?.reload}
                  tableKeySet={Function.prototype}
                  access={access}
                  plat={pObj[pId]}
                />
              )}
            {/*配件入库单编辑*/}
            {access.canSee('stockManager_updateWarehousingOrder_cn') &&
              !readonly &&
              record.isParts && (
                <CreateAccessories
                  dataSource={{ ...record, tc_warehouse_contacts: record?.tc_contacts }}
                  common={common}
                  reload={actionRef?.current?.reload}
                  tableKeySet={Function.prototype}
                  access={access}
                  plat={pObj[pId]}
                  pId={pId}
                  trigger={<a>编辑</a>}
                />
              )}

            {/*手动入库*/}
            {[6].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_updatePlatformsNum_cn') ? (
              <UpdatePlatformModal
                pId={pId}
                dataSource={record}
                reload={actionRef?.current?.reload}
                tableKeySet={Function.prototype}
              />
            ) : (
              ''
            )}
            {[6].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_automaticPlatformsNum_cn') &&
              record.platform_warehousing_type !== 'QIMEN' ? (
              <AutomaticPlatformsNum
                title="自动入库"
                dataSource={record}
                reload={actionRef?.current?.reload}
              />
            ) : (
              ''
            )}
            {/*修改预约信息*/}
            {[6, 2].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_updateAppointment_cn') &&
              pObj[pId] !== '云仓' ? (
              <AppointmentModal
                dataSource={record}
                reload={actionRef?.current?.reload}
                tableKeySet={Function.prototype}
              />
            ) : (
              ''
            )}
            {/*{[9].includes(Number(record.approval_status)) ? <FreightModal dataSource={record} /> : ''}*/}

            {[1].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_synchVendor_cn') ? (
              <Popconfirm
                key={'sync'}
                title={pObj[pId] === '云仓' ? '确定同步至供应商和仓库?' : '确定同步至供应商和平台?'}
                onConfirm={async () => synchVendor(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <a>{pObj[pId] === '云仓' ? '同步至供应商和仓库' : '同步至供应商和平台'}</a>
              </Popconfirm>
            ) : (
              ''
            )}
            {[1].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_delete_cn') ? (
              <Popconfirm
                title="确定删除?"
                onConfirm={async () => deleteByOrderNoAction(record.order_no)}
                okText="确定"
                cancelText="取消"
              >
                <a>删除</a>
              </Popconfirm>
            ) : (
              ''
            )}
            {/*云仓需要填写原因v1.2.3*/}
            {([2, 6].includes(Number(record.approval_status)) ||
              (pObj[pId] == '云仓' && record.approval_status == '6')) &&
              access.canSee('stockManager_withdraw_cn') && <>
                {
                  pObj[pId] == '云仓'
                    ? <ModalForm title={'撤回'}
                      width={600}
                      trigger={<a>撤回</a>}
                      onFinish={async ({ remarks }) => {
                        return pubModal('入库单撤回后将被作废，确定要撤回吗？', '提示').then(() => handleWithdraw(record.id, remarks))
                      }}>
                      <ProFormTextArea label={'撤回原因'} name={'remarks'} rules={[pubRequiredRule]} fieldProps={{ maxLength: 200 }} />
                    </ModalForm>
                    : <Popconfirm
                      title="确定需撤回?"
                      onConfirm={() => handleWithdraw(record.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <a>撤回</a>
                    </Popconfirm>
                }
              </>
            }
            {[3].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_withdraw_cn') ? (
              <Popconfirm
                title="确定取消撤回?"
                onConfirm={async () => {
                  const res = await api.cancelWithdraw({ id: record.id });
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
                <a>取消撤回</a>
              </Popconfirm>
            ) : (
              ''
            )}

            {[2].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_SyncedGoods_cn') ? (
              <SyncedModal
                title={'已发货'}
                dataSource={record}
                reload={actionRef?.current?.reload}
                access={access}
                type="CN"
              />
            ) : (
              ''
            )}
            {/* 操作日志 */}
            {access.canSee('scm_stockManager_log_cn') && (
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
  const customKey = window.location.pathname.replace(/\/$/, '') + pId; // 兼容旧的key
  const ColumnSet = useCustomColumnSet(columns, 3200, pId, 3, [], customKey);
  // 获取平台
  const pubGetPlatformListAction = async (): Promise<any> => {
    const res: any = await pubGetPlatformList();
    const data = res.filter((v: any) => v?.business_scope == 'CN');
    setTopTabList([
      ...data.map((v: any, index: number) => {
        if (index === 0 && !pId) {
          setPId(v.value);
          window.sessionStorage.setItem(cacheTabKeyTop, v.value);
        }
        return {
          key: v.value,
          tab: v.label,
        };
      }),
    ]);
    return data;
  };
  useEffect(() => {
    pubGetPlatformListAction();
  }, []);
  // 获取状态及数据统计
  const statusCountAction = async () => {
    const res: any = await api.statusCount({ business_scope: 'CN', platform_id: pId });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const tabs = res.data.map((v: any) => {
        return {
          key: v.key,
          label: `${v.name} (${v.count})`,
        };
      });
      setSTabList(tabs);
    }
  };
  useEffect(() => {
    formRef?.current?.submit();
  }, [tabStatus, pageSize, pId]);
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      fixedHeader
      tabActiveKey={pId}
      className="pubPageTabs"
      tabList={topTabList}
      onTabChange={(key: any) => {
        setPageSize(20);
        formRef.current?.setFieldsValue({
          warehouse_id: null,
          shop_id: null,
        });
        setPId(key == -1 ? null : key);
        window.sessionStorage.setItem(cacheTabKeyTop, key == -1 ? 0 : key);
        setTabStatus('1');
        window.sessionStorage.setItem(cacheTabKey, '1');
      }}
    >
      <div className="status-tab" style={{ paddingBottom: 0 }}>
        <Tabs
          defaultActiveKey="1"
          items={topSTabList}
          onChange={onStatusClick}
          activeKey={tabStatus}
        />
      </div>
      {pId && (
        <ProTable<TableListItem, TableListPagination>
          size={'small'}
          actionRef={actionRef}
          formRef={formRef}
          bordered
          rowKey={'id'}
          key={tableKey}
          pagination={{
            showSizeChanger: true,
            pageSize,
            onChange: (page, size) => {
              setPageSize(size);
            },
          }}
          dateFormatter="string"
          request={async (params: any) => {
            const postData = {
              ...params,
              current_page: params.current,
              page_size: params.pageSize,
              approval_status: tabStatus == 'all' ? null : tabStatus,
              platform_id: pId,
              business_scope: 'CN',
              shipment_begin_cycle_time: params?.cycle_time?.[1] || null, //下单时间-开始
              shipment_end_cycle_time: params?.cycle_time?.[2] || null, //下单时间-结束
              cycle_time: params?.cycle_time?.[0] || null,
              warehousing_type:
                params?.warehousing_type || params?.warehousing_type == '0'
                  ? Number(params.warehousing_type)
                  : null,
            };
            setExportForm(postData);
            statusCountAction();
            const res = await api.getList(postData);
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              return {
                total: 0,
                data: [],
                success: false,
              };
            }
            res?.data?.records.forEach((v: any) => {
              v.isParts = v?.orderSkuList?.every((i: any) => i.order_type == 2); // 配件入库单
              v.hasParts = v?.orderSkuList?.some((i: any) => i.order_type == 2); // 配件入库单或合并单包括配件单
              v?.orderSkuList?.forEach((item: any) => {
                item.stock_no ||= item.sku_code;
              });
            });
            selectedRowKeysSet([]);
            selectedRowDataSet([]);
            return {
              data: res?.data?.records || [],
              success: true,
              total: res?.data?.total || 0,
            };
          }}
          columns={columns}
          search={{ labelWidth: 127, className: 'light-search-form', defaultCollapsed: false }}
          {...ColumnSet}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          expandable={{
            expandedRowRender: (record: any) => (
              <ExpandedRowRender dataSource={record} exportPdf={exportPdf} />
            ),
            fixed: 'left',
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (rowKeys: any, rowItems: any) => {
              selectedRowKeysSet(rowKeys);
              selectedRowDataSet(rowItems);
            },
          }}
          tableAlertRender={false}
          headerTitle={
            <Space>
              <Access
                key="acc"
                accessible={
                  !['京东FCS', '京东自营'].includes(pObj[pId]) &&
                  access.canSee('scm_stockManager_createPartsOrder_cn')
                }
              >
                <CreateAccessories
                  dataSource={{}}
                  common={common}
                  reload={actionRef?.current?.reload}
                  tableKeySet={Function.prototype}
                  access={access}
                  plat={pObj[pId]}
                  pId={pId}
                />
              </Access>

              <Access
                key="concat"
                accessible={access.canSee('stockManager_mergeOrder_cn') && pObj[pId] !== '汇业仓'}
              >
                <Button
                  size={'small'}
                  type="primary"
                  disabled={!selectedRowKeys.length}
                  onClick={mergeOrder}
                  title={'说明：新建状态下相同平台,供应商,入库地址,要求入库时间的入库单才可以合并'}
                >
                  合并入库单
                </Button>
              </Access>
              <Access
                key="split"
                accessible={access.canSee('stockManager_mergeOrder_cn') && pObj[pId] !== '汇业仓'}
              >
                <Button
                  size={'small'}
                  type="primary"
                  disabled={!selectedRowKeys.length}
                  onClick={cancelMergeOrder}
                >
                  拆分入库单
                </Button>
              </Access>
              <Access key="sync" accessible={access.canSee('stockManager_synchVendor_cn')}>
                <Button
                  size={'small'}
                  type="primary"
                  disabled={!selectedRowKeys.length}
                  onClick={() => synchVendor()}
                >
                  {pObj[pId] === '云仓' ? '同步至供应商和仓库' : '同步至供应商和平台'}
                </Button>
              </Access>

              <Popover
                title={'批量操作'}
                content={
                  <>
                    <Access key="import" accessible={access.canSee('stockManager_import_cn')}>
                      <div style={{ marginBottom: '10px' }}>
                        <Upload
                          beforeUpload={(file: any) =>
                            pubBeforeUpload({
                              file,
                              acceptType: ['xls', 'xlsx'], // 上传限制 非必填
                            })
                          }
                          accept=".xls,.xlsx" // 打开时，默认显示的文件类型 非必填
                          key="upLoad"
                          showUploadList={false}
                          customRequest={(val) => handleUpload(val, setUpLoading)}
                        >
                          <Button
                            size={'small'}
                            icon={<UploadOutlined />}
                            type="primary"
                            disabled={upLoading}
                            loading={upLoading}
                          >
                            批量导入入库信息
                          </Button>
                        </Upload>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <Button
                          size={'small'}
                          loading={downLoading.WarehousingOrderCn}
                          onClick={() => {
                            downLoadExcel(
                              'exportWarehousingOrderCn',
                              '国内-导入入库单(模板)',
                              'WarehousingOrderCn',
                            );
                          }}
                        >
                          国内-导入入库单(模板)Excel文件下载
                        </Button>
                      </div>
                    </Access>

                    <Access
                      key="batchButton"
                      accessible={access.canSee('stockManager_importOrderNumber_cn')}
                    >
                      <div style={{ marginBottom: '10px' }}>
                        <Upload
                          beforeUpload={(file: any) =>
                            pubBeforeUpload({
                              file,
                              acceptType: ['xls', 'xlsx'], // 上传限制 非必填
                            })
                          }
                          accept=".xls,.xlsx" // 打开时，默认显示的文件类型 非必填
                          key="upLoad"
                          showUploadList={false}
                          customRequest={(val) => handleUpload(val, setWaybillLoading)}
                        >
                          <Button
                            size={'small'}
                            icon={<UploadOutlined />}
                            type="primary"
                            disabled={waybillLoading}
                            loading={waybillLoading}
                          >
                            导入物流信息
                          </Button>
                        </Upload>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <Button
                          size={'small'}
                          loading={downLoading.WarehousingImportWaybill}
                          onClick={() => {
                            downLoadExcel(
                              'exportWarehousingImportWaybill',
                              '导入物流信息(模板)',
                              'WarehousingImportWaybill',
                            );
                          }}
                        >
                          导入物流信息(模板)Excel文件下载
                        </Button>
                      </div>
                    </Access>
                  </>
                }
              >
                <Button size={'small'} icon={<UploadOutlined />} type="primary" ghost>
                  批量操作
                </Button>
              </Popover>

              <Access
                key="ChangeWarehousingTime"
                accessible={
                  pId == '1552846034395881473' &&
                  access.canSee('stockManager_changeWareHousingTime')
                }
              >
                <ChangeWarehousingTime
                  disabled={!selectedRowKeys.length}
                  reload={actionRef?.current?.reload}
                  selectedRowKeys={selectedRowKeys}
                  selectedRowData={selectedRowData}
                />
              </Access>
              <Access
                key="delButton"
                accessible={
                  access.canSee('scm_stockManager_delete_batch_cn') &&
                  ['1'].includes(tabStatus)
                }
              >
                <Popconfirm
                  title="确定删除选中的内容?"
                  onConfirm={async () => {
                    const res = await api.deleteByOrderNos({
                      order_no: selectedRowData?.map((v: any) => v.order_no),
                    });
                    if (res) {
                      if (res.code == pubConfig.sCode) {
                        pubMsg(res.message, 'success');
                        selectedRowKeysSet([]);
                        selectedRowDataSet([]);
                        actionRef?.current?.reload();
                      } else {
                        pubMsg(res.message);
                      }
                    } else {
                      pubMsg('服务异常, 删除失败');
                    }
                  }}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button disabled={!selectedRowKeys.length} size="small" type="primary">
                    批量删除
                  </Button>
                </Popconfirm>
              </Access>
              <Access
                key="clearVendor_list"
                accessible={
                  access.canSee('scm_stockManager_clearVendor_list_cn') &&
                  ['1'].includes(tabStatus)
                }
              >
                <Button
                  size={'small'}
                  type="primary"
                  disabled={!selectedRowKeys.length}
                  onClick={() => clearVendor(selectedRowData.map(v => v.order_no))}
                >
                  批量清空供应商
                </Button>
              </Access>
              <Access
                key="stockManager_changesendgoods_cn"
                accessible={
                  access.canSee('scm_stockManager_changesendgoods_cn') &&
                  ['2'].includes(tabStatus)
                }
              >
                <ChangeSendGoods
                  reload={actionRef?.current?.reload}
                  selectedRowKeys={selectedRowKeys}
                  selectedRowData={selectedRowData}
                  trigger={(
                    <Button size={'small'} type="primary" disabled={!selectedRowKeys.length}>批量操作已发货</Button>
                  )} />
              </Access>
            </Space>
          }
          toolbar={{
            actions: [
              <Access
                key="updatePlatformsNum_cn_batch"
                accessible={access.canSee('stockManager_updatePlatformsNum_cn_batch') &&
                  ['6'].includes(tabStatus) &&
                  pId == '1532170822712582145'}
              >
                <ImportBtn
                  btnText={'批量手动入库(京东自营)'}
                  reload={() => actionRef?.current?.reload()}
                  business_type={'JD_OPERATE_MANUAL_WAREHOUSING'}
                  templateCode={'JD_OPERATE_MANUAL_WAREHOUSING'}
                  importHandle={'/sc-scm/warehousingOrder/importJdOperateManualWarehousing'}
                />
              </Access>,
              <Access
                key="exportButton"
                accessible={access.canSee('stockManager_exportWarehousingOrder_cn')}
              >
                <Button
                  loading={downLoading.WarehousingOrder}
                  size={'small'}
                  icon={<DownloadOutlined />}
                  ghost
                  type="primary"
                  key="export"
                  onClick={() => {
                    downLoadExcel('exportWarehousingOrder', '国内入库单明细', 'WarehousingOrder');
                  }}
                >
                  采购入库明细导出
                </Button>
              </Access>,
            ],
          }}
          rowClassName={(record: any) => {
            let unNormal = false;
            if (record?.orderSkuList && record.orderSkuList.length) {
              unNormal = record.orderSkuList.some((item: any) => !!item?.difference_num);
            }
            return unNormal ? 'emphasise-row' : '';
          }}
        />
      )}
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Cn);
export default ConnectPage;

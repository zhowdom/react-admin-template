/*跨境平台入库*/
import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from './data';
import { useActivate } from 'react-activation';
import { Button, Popconfirm, Popover, Space, Upload, Tooltip } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import './style.less';
import * as api from '@/services/pages/stockManager';
import {
  divide,
  pubBeforeUpload,
  pubDownloadSysImportTemplate,
  pubGetColumnsState,
  pubGetSigningList,
  pubRefreshColumnList,
  pubBlobDownLoad,
} from '@/utils/pubConfirm';
import { baseFileUpload, customColumnDelete, customColumnSet } from '@/services/base';
import { batchClearSelectVendor } from '@/services/pages/storageManage';
import { pubAlert, pubConfig, pubMsg, pubModal, pubFilter } from '@/utils/pubConfig';
import { scrollByColumn } from '@/utils/filter';
import { history } from 'umi';
import {
  DownloadOutlined,
  UploadOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import SupplierModal from './SupplierModal';
import { getVendor } from './Cn';
import { Access, connect, useAccess } from 'umi';
import SyncedModal from './Dialog/SyncedModal';
import AutomaticPlatformsNum from './Dialog/AutomaticPlatformsNum'; // 自动入库
import WeekTimeSearch from '@/components/PubForm/WeekTimeSearch';
import PubWeekRender from '@/components/PubWeekRender';
import EditDrawer from './INDialog/EditDrawer';
import EditDrawerLogistics from './INDialog/EditDrawerLogistics';
import StockOrderDetail_IN from '@/components/Reconciliation/StockOrderDetail_IN';
import PortStorageModal from './INDialog/PortStorageModal';
import SynchPlatformStorageModal from './INDialog/SynchPlatformStorageModal';
import { PageContainer } from '@ant-design/pro-layout';
import PlatStore from '@/components/PubForm/PlatStore';
import CutOffTime from '@/pages/StockManager/INDialog/CutOffTime';
import HandleUnNormal from '@/pages/StockManager/Dialog/HandleUnNormal';
import ViewLogSupplier from '@/components/ViewLogSupplier';
import { useModel } from 'umi';
import CloseExceptionApplyModal from '@/pages/StockManager/INDialog/CloseExceptionApplyModal';
import EditShipmentId from './INDialog/EditShipmentId';
import CreateLogisticsOrder from './INDialog/CreateLogisticsOrder';
import CommonLog from '@/components/CommonLog';
import moment from 'moment';

// 搜索清除前后空格, 本地搜索过滤
const selectProps = {
  showSearch: true,
};
/*---组件集合---*/
// 修改预约信息弹框
/*const FreightModal: React.FC<{ dataSource: any }> = ({ dataSource }) => {
  return (
    <ModalForm
      title="到港运费"
      layout={'inline'}
      width={500}
      trigger={<a type={'link'}>{'到港运费'}</a>}
      onFinish={async (values: any) => {
        const res = await api.addShippingFee({ ...values, id: dataSource.id });
        if (res.code == pubConfig.sCode) {
          pubMsg(res?.message, 'success');
          actionRef.current?.reload();
          return true;
        } else {
          pubMsg(`提交失败: ${res.message}`);
          return false;
        }
      }}
      formRef={formRef1}
      onVisibleChange={async (visible: boolean) => {
        if (!visible) {
          formRef1?.current?.resetFields();
        }
      }}
    >
      <ProFormSelect
        name="currency"
        label={'币别'}
        placeholder="币别"
        valueEnum={common.dicList.SC_CURRENCY}
        rules={rulesRequired}
        initialValue={dataSource.currency || 'CNY'}
        readonly
      />
      <ProFormDigit
        fieldProps={{ precision: 2 }}
        name={'fee'}
        label={'运费'}
        rules={rulesRequired}
      />
    </ModalForm>
  );
};*/

// 页面主体
const cacheTabKey = 'StockManagerIn'; // tab缓存
const In: React.FC<{ common: any; history?: any }> = ({ common }) => {
  const access = useAccess();
  const formRef = useRef<ProFormInstance>(); // 页面查询条件
  const actionRef = useRef<ActionType>();
  // const formRef1 = useRef<ProFormInstance>(); // 弹框form
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
    window.sessionStorage.getItem(cacheTabKey) || '1',
  );
  const [exportForm, setExportForm] = useState<any>({});

  // 激活页面请求列表
  useActivate(() => {
    if (actionRef?.current) actionRef?.current?.reload();
  });

  // 导出excel
  const downLoadExcel = async (apiUrl: string, myFileName: string, loading: string) => {
    setDownLoading({ ...downLoading, [loading]: true });
    if (apiUrl != 'exportWarehousingOrder') {
      exportForm.selected_order_id = selectedRowKeys;
      exportForm.selected_id = selectedRowKeys;
    }
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

  // 同步至供应商和平台
  const synchVendor = async (id?: string) => {
    let ids = selectedRowKeys.toString();
    if (id) ids = id;
    const res = await api.synchVendor({ ids });
    if (res.code == pubConfig.sCode) {
      pubMsg(res?.message, 'success');
      actionRef.current?.reload();
      selectedRowKeysSet([]);
      selectedRowDataSet([]);
    } else {
      pubMsg(`操作失败, ${res.message}`);
    }
  };
  // 通知供应商发货至港口
  const notifyVendor = async () => {
    const res = await api.notifyVendor({ ids: selectedRowKeys.toString() });
    if (res.code == pubConfig.sCode) {
      pubMsg(res?.message, 'success');
      actionRef.current?.reload();
      selectedRowKeysSet([]);
      selectedRowDataSet([]);
    } else {
      pubMsg(`操作失败, ${res.message}`);
    }
  };
  // 通知采购发货 - 批量
  const notifyPurchaseDelivery = async () => {
    const res = await api.notifyPurchaseDelivery({ ids: selectedRowKeys.toString() });
    if (res.code == pubConfig.sCode) {
      pubMsg(res?.message, 'success');
      actionRef.current?.reload();
      selectedRowKeysSet([]);
      return true;
    } else {
      pubMsg(`操作失败, ${res.message}`);
      return false;
    }
  };
  // 删除入库单
  const deleteByOrderNoAction = async (order_no: string) => {
    const res = await api.deleteByOrderNo({ order_no });
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
    if (['exportBookingBumber', 'batchImportShelfInfo', 'batchImportRequiredWarehousingTime'].includes(type)) {
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
        }, 200);
      })
      .catch(() => {
        console.log('点了取消');
      });
  };
  // table配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '状态',
      dataIndex: 'approval_status',
      align: 'center',
      order: 11,
      width: 110,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return (
          <div>
            {pubFilter(common?.dicList?.WAREHOUSING_ORDER_IN_STATUS, record.approval_status)}
            {record.sync_status == 1 ? (
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
                [2, 10, 5].includes(Number(record.approval_status)) ? (
                <ViewLogSupplier dataSource={record.vendorViewList} />
              ) : null
            }
          </div>
        );
      },
    },
    {
      title: '出货周期',
      dataIndex: 'cycle_time',
      align: 'center',
      width: 110,
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
      align: 'center',
      width: 100,
      order: 14,
      // fieldProps: { placeholder: '输入多个用逗号分隔' },
      // search: {
      //   transform: (value: any) => ({ order_no: value.replace('，', ',') }),
      // },
    },
    {
      title: '运输方式',
      dataIndex: 'shipping_method',
      align: 'center',
      width: 100,
      valueEnum: common?.dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || {},
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      hideInSearch: true,
      width: 90,
    },
    // {
    //   title: '店铺',
    //   dataIndex: 'shop_id',
    //   align: 'center',
    //   valueType: 'select',
    //   request: async () => {
    //     const res: any = await pubGetStoreList({ business_scope: 'IN' });
    //     return res;
    //   },
    //   render: (_: any, record: any) => record?.shop_name || '-',
    //   fieldProps: selectProps,
    //   order: 10,
    // },
    {
      title: '店铺',
      dataIndex: 'plat_store',
      order: 10,
      align: 'center',
      width: 100,
      render: (_: any, record: any) => record?.shop_name || '-',
      renderFormItem: (_, rest, form) => {
        return (
          <PlatStore
            business_scope="IN"
            back={(v: any) => {
              form.setFieldsValue({ plat_store: v });
            }}
          />
        );
      },
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      order: 9,
      align: 'center',
      width: 260,
    },
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      order: 8,
      align: 'center',
      width: 100,
    },
    {
      title: '供应商(代码)',
      dataIndex: 'vendor_id',
      align: 'center',
      width: 180,
      request: getVendor,
      debounceTime: 300,
      fieldProps: selectProps,
      order: 7,
      render: (_: any, record: any) => (
        /*选择供应商*/
        <Space direction={'vertical'}>
          {record.vendor_name ? `${record.vendor_name}(${record.vendor_code})` : ''}
          <Space>
            {access.canSee('stockManager_updateOrderVendor_in') &&
              (record.approval_status == 1 || record.approval_status == 4) ? (
              <SupplierModal
                dataSource={record}
                actionRef={actionRef}
                type={'in'}
                dicList={common.dicList}
              />
            ) : null}
            {(record.vendor_name && record.approval_status == 1) &&
              access.canSee('scm_stockManager_clearVendor_in') ? (
              <a key="clearVendor_in" onClick={() => clearVendor([record.order_no])}>清空供应商</a>
            ) : null}
          </Space>
        </Space>
      ),
    },
    {
      title: (
        <div>
          计划发货数量
          <br />
          (本次)
        </div>
      ),
      dataIndex: 'delivery_plan_current_num',
      align: 'center',
      width: 110,
      hideInSearch: true,
    },
    {
      title: '发货数量',
      dataIndex: 'picsTotal',
      align: 'center',
      width: 90,
      hideInSearch: true,
      render: (_: any, record: any) => {
        // 箱规计算出来为0, 默认取父的本次计划发货数量
        return (
          <span>
            {(record?.orderSkuList[0]?.specificationList &&
              record.orderSkuList[0]?.specificationList.reduce(
                (previousValue: any, currentValue: any) =>
                  previousValue + currentValue.pics * currentValue.num,
                0,
              )) ||
              record.delivery_plan_current_num}
          </span>
        );
      },
    },
    {
      title: '国内入库箱数',
      dataIndex: 'arrival_actual_num',
      align: 'center',
      width: 80,
      hideInSearch: true,
      render: (_: any, record: any) => {
        let total = 0;
        record?.orderSkuList.forEach((sku: any) => {
          const num = sku?.specificationList.reduce((previousValue: any, currentValue: any) => {
            return previousValue + (currentValue.arrival_actual_num === null? 0: currentValue.arrival_actual_num);
          }, 0);
          total = total + num;
        });
        return total;
      },
    },
    {
      title: '国内入库数量',
      tooltip: '跨境平台入库单国内已入库数量，即到港数量，可能是从一个或者多个采购单扣减，然后发往港口入库，具体请查看入库单详情',
      dataIndex: 'arrival_num',
      align: 'center',
      width: 80,
    },
    {
      title: '国内入库异常',
      dataIndex: 'difference_num',
      align: 'center',
      width: 100,
      render: (_, record: any) => (
        <HandleUnNormal
          dataSource={record.orderSkuList[0]}
          reload={actionRef.current?.reload}
          type={'in'}
        />
      ),
      hideInSearch: true,
    },
    {
      title: (
        <div>
          入库数量
          <Tooltip
            placement="top"
            title={() => (
              <span>
                货件closed状态，系统自动同步货件入库数量，入库单完成入库，状态变成已入库；
                <br />
                货件处于其他状态，系统不能判断是否已经入库完成，需要等货件变成closed状态才能更新入库数量；
                <br />
                如果确认已完全入库，可以手工入库；
              </span>
            )}
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
          <br />
          (平台仓)
        </div>
      ),
      dataIndex: 'warehousing_num',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: (
        <div>
          平台货件状态
          <Tooltip
            placement="top"
            title={() => (
              <span>
                亚马逊货件状态包括：
                <br />
                working
                <br />
                shipped
                <br />
                in-transit
                <br />
                delivered
                <br />
                checked-in
                <br />
                receiving
                <br />
                closed
                <br />
                cancelled
                <br />
                deleted
                <br />
                error
                <br />
                ready-to-ship
                <br />
                沃尔玛货件状态包括：
                <br />
                Pending Shipment Details
                <br />
                Awaiting Delivery
                <br />
                Receiving in Progress
                <br />
                Closed
                <br />
                Cancelled
                <br />
                入库中数量，还没有完结，数量会变动，数据参考用
              </span>
            )}
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
          <br />
          (入库中数量)
        </div>
      ),
      dataIndex: 'platform_received_num',
      align: 'center',
      width: 120,
      hideInSearch: true,
      hideInTable: !['all', '8', '11', '12', '9'].includes(tabStatus),
      render: (_: any, record: any) => {
        return (
          <div>
            {record.platform_shipment_status}
            <br />
            {record.platform_received_num ? (
              <span>
                (
                <i style={{ fontStyle: 'normal', color: '#ff0000' }}>
                  {record.platform_received_num}
                </i>
                )
              </span>
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      title: '入库异常数量',
      dataIndex: 'warehousing_exception_num',
      align: 'center',
      width: 80,
      /*全部、跨境在途、平台入库中、平台入库异常、平台已入库 需要显示*/
      hideInTable: !['all', '8', '9', '11', '12'].includes(tabStatus),
      render: (_: any, record: any) => {
        return record.warehousing_exception_num ? (
          <Space direction={'vertical'}>
            {record.warehousing_exception_num}
            <CloseExceptionApplyModal
              readonly
              type={'approval'}
              dicList={common?.dicList}
              dataSource={record}
            />
          </Space>
        ) : (
          '-'
        );
      },
    },
    {
      title: '箱数',
      dataIndex: 'numTotal',
      width: 90,
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return (
          <span>
            {record?.orderSkuList[0]?.specificationList &&
              record.orderSkuList[0]?.specificationList.reduce(
                (previousValue: any, currentValue: any) => previousValue + Number(currentValue.num),
                0,
              )}
          </span>
        );
      },
    },
    {
      title: (
        <div>
          总体积
          <br />
          (m³)
        </div>
      ),
      dataIndex: 'total_volume',
      align: 'center',
      width: 80,
      hideInSearch: true,
      renderText: (text: any) => text && divide(text, 1000000).toFixed(3),
    },
    {
      title: (
        <div>
          总重
          <br />
          (kg)
        </div>
      ),
      dataIndex: 'total_weight',
      align: 'center',
      width: 80,
      hideInSearch: true,
      renderText: (text: any) => text && divide(text, 1000).toFixed(3),
    },
    {
      title: (
        <div>
          货件号
          <br />
          (Shipment ID)
        </div>
      ),
      dataIndex: 'shipment_id',
      align: 'center',
      width: 110,
    },
    {
      title: (
        <div>
          追踪号
          <br />
          (Reference ID)
        </div>
      ),
      dataIndex: 'reference_id',
      align: 'center',
      width: 110,
      hideInSearch: true,
    },
    {
      title: (
        <div>
          供应商出库时间
          <br />
          (货好时间)
        </div>
      ),
      dataIndex: 'delivery_time',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '出货城市',
      dataIndex: 'shipment_city',
      align: 'center',
      width: 100,
      hideInSearch: true,
      renderText: (text: any, record: any) =>
        record.shipment_city && `${record.shipment_province}-${record.shipment_city}`,
    },
    {
      title: '跨境起运港仓库',
      dataIndex: 'harbor_name',
      align: 'center',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '订舱号',
      dataIndex: 'booking_number',
      align: 'center',
      width: 100,
    },
    {
      title: '平台目的仓',
      dataIndex: 'warehouse_name',
      align: 'center',
      width: 100,
    },

    {
      title: '退税抬头',
      dataIndex: 'tax_refund_company_name',
      align: 'center',
      width: 180,
      hideInSearch: true,
    },
    {
      title: '采购单号',
      dataIndex: 'purchase_order_no',
      hideInTable: true,
      width: 100,
    },
    {
      title: '是否入库异常',
      dataIndex: 'warehousing_exception_type',
      hideInTable: true,
      valueEnum: {
        '1': '国内入库正常',
        '2': '国内入库异常',
        '5': '国内异常已处理',
        '3': '平台入库正常',
        '4': '平台入库异常',
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
      title: '退税主体',
      dataIndex: 'tax_refund_company',
      valueType: 'select',
      align: 'center',
      hideInTable: true,
      fieldProps: selectProps,
      request: async (v) => {
        const res: any = await pubGetSigningList({
          key_word: v?.keyWords,
          export_qualification: 1,
        });
        return res;
      },
    },
    {
      title: '是否关联跨境物流单',
      dataIndex: 'is_in_logistics_order',
      valueType: 'select',
      hideInTable: true,
      valueEnum: common?.dicList?.SC_YES_NO || {},
    },
    {
      title: (_, type: string) => {
        return type === 'table' ? '跨境物流单' : '跨境物流单号';
      },
      dataIndex: 'in_logistics_order_no',
      align: 'center',
      width: 110,
      render: (_: any, record: any) => {
        return (
          <div className="order-wrapper">
            {access.canSee('scm_logisticsOrder_detail') ? (
              <a
                onClick={() => {
                  history.push(
                    `/logistics-manage-in/logistics-order-detail?id=${record.in_logistics_order_id
                    }&timeStamp=${new Date().getTime()}&from=stock`,
                  );
                }}
              >
                {record.in_logistics_order_no}
              </a>
            ) : (
              <span className="c-order">{record.in_logistics_order_no}</span>
            )}
          </div>
        );
      },
    },
    {
      title: '货件处理状态',
      dataIndex: 'shipment_process_status',
      valueType: 'select',
      width: 100,
      valueEnum: common?.dicList?.WAREHOUSING_SHIPMENT_PROCESS_STATUS || {},
      hideInTable: true,
      /*全部、跨境在途、平台入库中、平台入库异常、平台已入库 需要显示*/
      hideInSearch: !['all', '8', '9', '11', '12'].includes(tabStatus),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      width: 100,
      order: 6,
      valueType: 'dateRange',
      render: (_, record: any) => record.create_time,
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
      title: '供应商出库时间',
      dataIndex: 'delivery_time',
      align: 'center',
      width: 180,
      order: 5,
      valueType: 'dateRange',
      render: (_, record: any) => record.delivery_time,
      search: {
        transform(value) {
          return {
            begin_delivery_time: value[0],
            end_delivery_time: value[1],
          };
        },
      },
      hideInTable: true,
    },
    {
      title: '到港入库时间',
      dataIndex: 'closing_time',
      align: 'center',
      width: 100,
      order: 5,
      valueType: 'dateRange',
      render: (_, record: any) => record.closing_time,
      search: {
        transform(value) {
          return {
            begin_arrival_time: value[0],
            end_arrival_time: value[1],
          };
        },
      },
      hideInTable: true,
    },
    {
      title: '实际入库时间',
      dataIndex: 'warehousing_time',
      align: 'center',
      width: 100,
      order: 5,
      valueType: 'dateRange',
      search: {
        transform(value) {
          return {
            begin_warehousing_time: value[0],
            end_warehousing_time: value[1],
          };
        },
      },
      hideInTable: true,
    },
    {
      title: '要求物流入仓时间',
      dataIndex: 'required_warehousing_time',
      align: 'center',
      width: 100,
      hideInSearch: true,
      sorter: true,
      showSorterTooltip: false,
    },
    {
      title: '预计入仓时间',
      dataIndex: 'platform_appointment_time',
      align: 'center',
      width: 100,
      hideInSearch: true,
      sorter: true,
      showSorterTooltip: false,
    },
    {
      title: '实际入仓时间',
      dataIndex: 'actual_warehouse_date',
      align: 'center',
      width: 100,
      hideInSearch: true,
      sorter: true,
      showSorterTooltip: false,
    },
    {
      title: '实际平台入库时间',
      tooltip: '因接口无法获取平台真实实际入库时间，此时间为供应链系统同步获取平台入库数量的时间，供应链系统每天都会同步平台收货数量和状态',
      dataIndex: 'warehousing_time',
      align: 'center',
      width: 100,
      hideInSearch: true,
      sorter: true,
      showSorterTooltip: false,
    },
    {
      title: '操作',
      fixed: 'right',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 120,
      render: (_, record: any) => {
        const readonly = ![1].includes(Number(record.approval_status));
        return (
          /*[
              {
                  "key": "all",
                  "name": "全部",
              },
              {
                  "key": "1",
                  "name": "新建",
              },
              {
                  "key": "2",
                  "name": "已同步(待放舱)",
              },
              {
                  "key": "10",
                  "name": "已放舱",
              },
              {
                  "key": "5",
                  "name": "已通知发货",
              },
              {
                  "key": "6",
                  "name": "国内在途",
              },
              {
                  "key": "7",
                  "name": "国内已入库",
              },
              {
                  "key": "8",
                  "name": "跨境在途",
              },
              {
                  "key": "9",
                  "name": "平台已入库",
              },
              {
                  "key": "3",
                  "name": "撤回中",
              },
              {
                  "key": "4",
                  "name": "已撤回",
              }
          ]*/
          <Space direction={'vertical'} size={0}>
            {readonly && access.canSee('stockManager_view_detail_in') ? (
              <StockOrderDetail_IN
                id={record.id}
                from="stock"
                dicList={common.dicList}
                access={access}
                reload={actionRef?.current?.reload}
                title={<a key="detail">详情</a>}
              />
            ) : null}
            {/*编辑货件信息*/}
            {[1, 2, 4].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_updateShelfInfo_in') ? (
              <EditDrawer dataSource={record} reload={actionRef?.current?.reload} common={common} />
            ) : null}
            {/*编辑物流信息*/}
            {record.shipment_province &&
              access.canSee('stockManager_updateInboundLogistics_in') &&
              [2, 4].includes(Number(record.approval_status)) ? (
              // 当编辑过货件信息后，才出现编辑物流信息
              <EditDrawerLogistics
                dataSource={record}
                reload={actionRef?.current?.reload}
                common={common}
              />
            ) : null}

            {[1].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_synchVendor_in') ? (
              <Popconfirm
                title="确定需同步至供应商?"
                onConfirm={async () => synchVendor(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <a>同步至供应商</a>
              </Popconfirm>
            ) : (
              ''
            )}
            {[1, 4].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_delete_in') ? (
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
            {/*国内港口入库*/}
            {[6].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_batchImportPortStorage_in') ? (
              <PortStorageModal dataSource={record} reload={actionRef?.current?.reload} />
            ) : (
              ''
            )}
            {/*手动入库*/}
            {[8].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_updatePlatformsNum_in') ? (
              <SynchPlatformStorageModal dataSource={record} reload={actionRef?.current?.reload} />
            ) : (
              ''
            )}

            {[8, 11, 12].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_automaticPlatformsNum_in') ? (
              <AutomaticPlatformsNum
                title="自动入库"
                dataSource={record}
                reload={actionRef?.current?.reload}
              />
            ) : (
              ''
            )}
            {[2].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_notifyPurchase_in') ? (
              <Popconfirm
                title={
                  <div>
                    确定需通知采购发货?
                    <br />
                    注意: 请确保货件和物流信息的必填信息已填写
                  </div>
                }
                onConfirm={async () => {
                  const res = await api.notifyPurchaseDelivery({ ids: record.id });
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
            ) : (
              ''
            )}
            {[10].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_notifyShipping_in') ? (
              <Popconfirm
                title="确定需通知供应商发货?"
                onConfirm={async () => {
                  const res = await api.notifyShipping({ id: record.id });
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
                <a>通知供应商发货</a>
              </Popconfirm>
            ) : (
              ''
            )}
            {/*修改截仓时间*/}
            {[5, 6, 10].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_cutOffTimeChange_in') ? (
              <CutOffTime
                dataSource={record}
                reload={actionRef.current?.reload}
                harbor={record.harbor}
                closing_time={record.closing_time}
              />
            ) : null}
            {[2, 10, 5, 6].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_withdraw_in') ? (
              <Popconfirm
                title="确定需撤回?"
                onConfirm={async () => {
                  const res = await api.withdraw({ id: record.id });
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
                <a>撤回</a>
              </Popconfirm>
            ) : (
              ''
            )}
            {[3].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_withdraw_in') ? (
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

            {[5].includes(Number(record.approval_status)) &&
              access.canSee('stockManager_SyncedGoods_in') ? (
              <SyncedModal
                title={'已发货'}
                dataSource={record}
                reload={actionRef?.current?.reload}
                access={access}
                type="IN"
              />
            ) : (
              ''
            )}
            {/*货件关闭申请, 跨境在途 和 平台入库中 实际开船时间ATD距离今天 > 80天就可以申请关闭*/}
            {([12].includes(Number(record.approval_status)) ||
              ([8, 11].includes(Number(record.approval_status)) &&
                record?.atd_date &&
                moment().diff(moment(record?.atd_date), 'days') > 80)) &&
              [0, 3].includes(Number(record.shipment_process_status)) &&
              access.canSee('stockManager_close_exception_in_apply') ? (
              <CloseExceptionApplyModal
                type={'apply'}
                dicList={common?.dicList}
                dataSource={record}
                reload={actionRef?.current?.reload}
              />
            ) : (
              ''
            )}
            {/*关闭异常入库单, 实际开船时间ATD距离今天 > 80天就可以申请关闭*/}
            {([12].includes(Number(record.approval_status)) ||
              ([8, 11].includes(Number(record.approval_status)) &&
                record?.atd_date &&
                moment().diff(moment(record?.atd_date), 'days') > 80)) &&
              [1].includes(Number(record.shipment_process_status)) &&
              access.canSee('stockManager_close_exception_in') ? (
              <CloseExceptionApplyModal
                type={'approval'}
                dicList={common?.dicList}
                dataSource={record}
                reload={actionRef?.current?.reload}
              />
            ) : (
              ''
            )}
            {/* 修改货件号 */}
            {[8].includes(Number(record.approval_status)) &&
              access.canSee('scm_stockManager_edit_shipmentId_in') && (
                <EditShipmentId
                  shipment_id={record.shipment_id}
                  id={record.id}
                  reload={actionRef?.current?.reload}
                />
              )}
            {[7].includes(Number(record.approval_status)) &&
              access.canSee('scm_stockManager_back_in') && (
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
            {access.canSee('scm_stockManager_log_in') && (
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
  // 列配置
  const defaultScrollX = 3400;
  const persistenceKey = window.location.pathname.replace(/\/$/, '');
  const { initialState, setInitialState } = useModel('@@initialState');
  const customColumnSetting = initialState?.currentUser?.customColumnSetting?.find(
    (item: any) => item.code == persistenceKey,
  );
  const [columnsState, columnsStateSet] = useState<any>(
    pubGetColumnsState(columns, customColumnSetting),
  );
  const [scrollX, scrollXSet] = useState<any>(scrollByColumn(columnsState) || defaultScrollX);
  const [loadingCustomColumn, loadingCustomColumnSet] = useState<any>(false);
  // 获取状态及数据统计
  const statusCountAction = async () => {
    const res: any = await api.statusCount({ business_scope: 'IN' });
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

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      fixedHeader
      tabActiveKey={tabStatus || 'all'}
      className="pubPageTabs"
      tabList={tabList}
      onTabChange={changeTabs}
    >
      <ProTable<any>
        size={'small'}
        actionRef={actionRef}
        formRef={formRef}
        bordered
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          pageSize,
          onChange: (page, size) => {
            setPageSize(size);
          },
        }}
        params={{ tabStatus }}
        dateFormatter="string"
        request={async (params, sort) => {
          // console.log(sort)
          let sortList: any = { order_no: 'desc' };
          Object.keys(sort).forEach((key: any) => {
            sortList = {};
            sortList[key] = sort[key] == 'ascend' ? 'asc' : 'desc';
          });
          // console.log(sortList)
          const postData = {
            ...params,
            business_scope: 'IN',
            current_page: params.current,
            page_size: params.pageSize,
            approval_status: tabStatus == 'all' ? null : tabStatus, //状态
            platform_id: params.plat_store ? params.plat_store?.[0] : null, // 平台
            shop_id: params.plat_store ? params.plat_store?.[1] : null, // 店铺
            shipment_begin_cycle_time: params?.cycle_time?.[1] || null, //下单时间-开始
            shipment_end_cycle_time: params?.cycle_time?.[2] || null, //下单时间-结束
            cycle_time: params?.cycle_time?.[0] || null,
            sortList,
          };
          const res = await api.inPage(postData);
          setExportForm(postData);
          statusCountAction();
          if (res && res.code == pubConfig.sCode) {
            return {
              total: res.data?.total || 0,
              data: res.data?.records || [],
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
        scroll={{ x: scrollX || defaultScrollX }}
        columnsState={{
          value: columnsState,
          onChange: (stateMap: any) => {
            columnsStateSet(stateMap);

            setTimeout(() => {
              scrollXSet(scrollByColumn(stateMap, 3) || defaultScrollX);
            }, 500);
          },
        }}
        options={{
          setting: {
            checkedReset: false,
            extra: (
              <>
                {customColumnSetting?.id ? (
                  <a
                    style={{ marginLeft: '4px' }}
                    onClick={() => {
                      customColumnDelete({ customColumnId: customColumnSetting?.id }).then(() => {
                        pubRefreshColumnList(initialState, setInitialState);
                      });
                      columnsStateSet(pubGetColumnsState(columns));
                      scrollXSet(defaultScrollX);
                    }}
                  >
                    重置
                  </a>
                ) : null}
                <Button
                  size={'small'}
                  type={'primary'}
                  icon={<SaveOutlined />}
                  loading={loadingCustomColumn}
                  onClick={() => {
                    loadingCustomColumnSet(true);
                    customColumnSet({
                      id: customColumnSetting?.id || '',
                      code: persistenceKey,
                      json: JSON.stringify(columnsState),
                      isNotice: 'n',
                    })
                      .then((res) => {
                        if (res?.code == '0') pubMsg('保存成功!', 'success');
                        pubRefreshColumnList(initialState, setInitialState);
                      })
                      .finally(() => {
                        loadingCustomColumnSet(false);
                      });
                  }}
                >
                  保存
                </Button>
              </>
            ),
          },
        }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
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
            <Access key="synchVendor" accessible={access.canSee('stockManager_synchVendor_in')}>
              <Button
                size={'small'}
                type="primary"
                disabled={!selectedRowKeys.length}
                onClick={() => synchVendor()}
              >
                同步至供应商
              </Button>
            </Access>
            <Access
              key="notifyVendor"
              accessible={
                [10].includes(Number(tabStatus)) && access.canSee('stockManager_notifyVendor_in')
              }
            >
              <Button
                size={'small'}
                type="primary"
                disabled={!selectedRowKeys.length}
                onClick={notifyVendor}
              >
                通知供应商发货至港口
              </Button>
            </Access>
            <Access
              key="notifyPurchase"
              accessible={
                [2].includes(Number(tabStatus)) && access.canSee('stockManager_notifyPurchase_in')
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
                disabled={!selectedRowKeys.length}
              >
                <Button size={'small'} type="primary" disabled={!selectedRowKeys.length}>
                  通知采购发货
                </Button>
              </Popconfirm>
            </Access>
            <Popover
              title={'物流批量操作'}
              content={
                <>
                  <Access
                    key="import"
                    accessible={access.canSee('stockManager_batchImportPortStorage_in')}
                  >
                    <p>
                      <Upload
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
                          loading={upLoading.batchImportPortStorage}
                          ghost
                        >
                          国内港口入库(批量导入)
                        </Button>
                      </Upload>
                    </p>
                    <p>
                      <Button
                        size={'small'}
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
                    </p>
                  </Access>
                  <Access
                    key="batchButton"
                    accessible={access.canSee('stockManager_batchImportlogistics_in')}
                  >
                    <p>
                      <Upload
                        key={'batchImportlogistics'}
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
                          loading={upLoading.batchImportlogistics}
                          ghost
                        >
                          批量导入物流信息
                        </Button>
                      </Upload>
                    </p>
                    <p>
                      <Button
                        loading={downLoading.logisticsIn}
                        size={'small'}
                        onClick={() => {
                          downLoadExcel(
                            'exportLogisticsIn',
                            '跨境-导入物流信息(模板)',
                            'logisticsIn',
                          );
                        }}
                      >
                        跨境-导入物流信息(模板)Excel文件下载
                      </Button>
                    </p>
                  </Access>
                </>
              }
            >
              <Button size={'small'} icon={<UploadOutlined />} type="primary" ghost>
                物流批量操作
              </Button>
            </Popover>
            <Access
              key="createLogisticsOrde"
              accessible={
                ['all', '7'].includes(tabStatus) &&
                access.canSee('scm_stockManager_createLogisticsOrder_in')
              }
            >
              <CreateLogisticsOrder
                dicList={common?.dicList}
                dataSource={selectedRowData}
                disabled={!selectedRowData?.length}
                selectedRowDataSet={selectedRowDataSet}
                selectedRowKeysSet={selectedRowKeysSet}
                reload={actionRef.current?.reload}
              />
            </Access>
            <Access
              key="delButton"
              accessible={
                access.canSee('scm_stockManager_delete_batch_in') && ['1', '4'].includes(tabStatus)
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
                access.canSee('scm_stockManager_clearVendor_list_in') &&
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
              key="exportRequiredWarehousingTime"
              accessible={['all', '1', '2', '10', '5', '3', '4'].includes(tabStatus) && access.canSee('stockManager_batchImportRequiredWarehousingTime_in')}
            >
              <Popover
                key="exportRequiredWarehousingTimePop"
                title={'需要下载导入模板 ?'}
                content={
                  <Button
                    type={'link'}
                    loading={downLoading.WarehousingTime}
                    onClick={() => {
                      downLoadExcel(
                        'exportRequiredWarehousingTime',
                        '批量修改要求入仓时间(模板)',
                        'WarehousingTime',
                      );
                    }}
                  >
                    批量修改要求入仓时间(模板)Excel文件下载
                  </Button>
                }
              >
                <Upload
                  key={'batchImportRequiredWarehousingTime'}
                  beforeUpload={(file: any) =>
                    pubBeforeUpload({
                      file,
                      acceptType: ['xls', 'xlsx'], // 上传限制 非必填
                    })
                  }
                  accept=".xls,.xlsx" // 打开时，默认显示的文件类型 非必填
                  showUploadList={false}
                  customRequest={(data) => handleUpload(data, 'batchImportRequiredWarehousingTime')}
                >
                  <Button
                    size={'small'}
                    icon={<UploadOutlined />}
                    type="primary"
                    loading={upLoading.batchImportRequiredWarehousingTime}
                    ghost
                  >
                    批量修改要求入仓时间
                  </Button>
                </Upload>
              </Popover>
            </Access>
          </Space>
        }
        toolbar={{
          actions: [
            <Access
              key="exportButton"
              accessible={access.canSee('stockManager_exportWarehousingOrder_in')}
            >
              <Button
                loading={downLoading.WarehousingOrder}
                size={'small'}
                icon={<DownloadOutlined />}
                ghost
                type="primary"
                key="export"
                onClick={() => {
                  downLoadExcel('exportWarehousingOrderIn', '跨境入库单明细', 'WarehousingOrder');
                }}
              >
                采购入库明细导出
              </Button>
            </Access>,
            <Access key="export" accessible={access.canSee('stockManager_exportBookingNumber_in')}>
              <Popover
                key="batchImportShelfInfoPop"
                title={'需要下载导入模板 ?'}
                content={
                  <Button
                    type={'link'}
                    onClick={() => {
                      pubDownloadSysImportTemplate(
                        'WAREHOUSING_ORDER_BOOKING_NUMBER',
                        '跨境-订舱信息(模板)',
                      );
                    }}
                  >
                    跨境-订舱信息(模板)Excel文件下载
                  </Button>
                }
              >
                <Upload
                  beforeUpload={(file: any) =>
                    pubBeforeUpload({ file, acceptType: ['xls', 'xlsx'] })
                  }
                  accept=".xls,.xlsx"
                  showUploadList={false}
                  customRequest={(data) => handleUpload(data, 'exportBookingBumber')}
                >
                  <Button
                    size={'small'}
                    icon={<DownloadOutlined />}
                    type="primary"
                    loading={upLoading.exportBookingBumber}
                    ghost
                  >
                    订舱信息导出
                  </Button>
                </Upload>
              </Popover>
            </Access>,

            <Access
              key="exportButton"
              accessible={['1', '2'].includes(tabStatus) && access.canSee('stockManager_exportPackingDetails_in')}
            >
              <Button
                loading={downLoading.PackingDetails}
                size={'small'}
                icon={<DownloadOutlined />}
                ghost
                type="primary"
                key="export"
                onClick={() => {
                  downLoadExcel('exportPackingDetails', '装箱明细', 'PackingDetails');
                }}
              >
                装箱明细导出
              </Button>
            </Access>,
            <Access
              key="batchImportShelfInfo"
              accessible={access.canSee('stockManager_batchImportShelfInfo_in')}
            >
              <Popover
                key="batchImportShelfInfoPop"
                title={'需要下载导入模板 ?'}
                content={
                  <Button
                    type={'link'}
                    loading={downLoading.ShipmentInfoIn}
                    onClick={() => {
                      downLoadExcel(
                        'exportShipmentInfoIn',
                        '跨境-导入货件信息(模板)',
                        'ShipmentInfoIn',
                      );
                    }}
                  >
                    跨境-导入货件信息(模板)Excel文件下载
                  </Button>
                }
              >
                <Upload
                  key={'batchImportShelfInfo'}
                  beforeUpload={(file: any) =>
                    pubBeforeUpload({
                      file,
                      acceptType: ['xls', 'xlsx'], // 上传限制 非必填
                    })
                  }
                  accept=".xls,.xlsx" // 打开时，默认显示的文件类型 非必填
                  showUploadList={false}
                  customRequest={(data) => handleUpload(data, 'batchImportShelfInfo')}
                >
                  <Button
                    size={'small'}
                    icon={<UploadOutlined />}
                    type="primary"
                    loading={upLoading.batchImportShelfInfo}
                    ghost
                  >
                    批量导入货件信息
                  </Button>
                </Upload>
              </Popover>
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
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(In);
export default ConnectPage;

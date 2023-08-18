import { PageContainer } from '@ant-design/pro-layout';
import { connect, history, Link, useAccess, Access, useModel } from 'umi';
import React, { useState, useRef } from 'react';
import { Button, Space, Statistic, Tag, Tooltip } from 'antd';
import { TableDropdown } from '@ant-design/pro-table';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { DownloadOutlined, QuestionCircleOutlined, SaveOutlined } from '@ant-design/icons';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  getList,
  orderSubmit,
  agree,
  exportExcel,
  syncVendor,
  exportPdf,
  disableReconciliation,
  enableReconciliation,
  statusCount,
  deleteById,
} from '@/services/pages/purchaseOrder';
import { pubAlert, pubConfig, pubMsg, pubModal, pubFilter } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import Dialog from './components/dialog';
import DialogSigning from './components/dialogSigning';
import DialogSigningR from './components/dialogSigningR';
import {
  IsGrey,
  pubGetColumnsState,
  pubGetUserList,
  pubGetVendorList,
  pubRefreshColumnList,
} from '@/utils/pubConfirm';
import AuditOptions from './components/AuditOptions';
import './components/index.less';
import ConfirmModal from './components/ConfirmModal';
import RangeTimeSearchScm from '@/components/PubForm/RangeTimeSearchScm';
import { computedColumnConfig, scrollByColumn } from '@/utils/filter';
import { customColumnDelete, customColumnSet } from '@/services/base';
import DetailsTable from './components/DetailsTable';
import './components/index.less';
import moment from 'moment';

const Order = (props: any) => {
  const access = useAccess();
  const { common } = props;
  const { dicList } = common;
  const [tempKey, setTempKey] = useState(new Date().getTime());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSigning, setModalSigning] = useState(false);
  const [modalSigningData, setModalSigningData] = useState<any>({});
  const [modalSigningR, setModalSigningR] = useState(false);
  const [modalSigningDataR, setModalSigningDataR] = useState<any>({});
  const [titleKey, setTitleKey] = useState('');
  const [selectRows, setSelectRows] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState<any>();
  const [exportForm, setExportForm] = useState<any>({});
  const [tabList, setTabList] = useState([{ key: -1, tab: '全部' }]);
  const [tabStatus, setTabStatus] = useState('2');
  const [pageSize, setPageSize] = useState<any>(20);
  const ref: any = useRef<ActionType>();
  const _ref: any = useRef();
  const [loading, setLoading] = useState({
    skuLoading: false,
    deliveryLoading: false,
    confirmLoading: false,
    orderLoading: false,
    poZipLoading: false
  });
  // 获取状态及数据统计
  const statusCountAction = async () => {
    const res: any = await statusCount({});
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
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      approval_status: tabStatus == 'all' ? null : tabStatus, //状态
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    delete postData.time;
    statusCountAction();
    const res = await getList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    setSelectRows([]);
    setSelectedItems([]);
    ref?.current?.clearSelected();
    setExportForm(postData);
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

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
  const formRef: any = useRef<ProFormInstance>();
  // 提交审核
  const orderSubmitAction = async (id: any[]) => {
    pubModal('确定提交审核?')
      .then(async () => {
        setLoading((values: any) => {
          return { ...values, confirmLoading: true };
        });
        const ids = id.join(',');
        const res: any = await orderSubmit({ id: ids });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('提交成功', 'success');
          ref?.current?.reload();
        }
        setLoading((values: any) => {
          return { ...values, confirmLoading: false };
        });
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 审核通过
  const agreeAction = async (orderId: any[]) => {
    pubModal('确定审批通过?')
      .then(async () => {
        setLoading((values: any) => {
          return { ...values, confirmLoading: true };
        });
        const ids = orderId.join(',');
        const res: any = await agree({ id: ids });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功', 'success');
          ref?.current?.reload();
        }
        setLoading((values: any) => {
          return { ...values, confirmLoading: false };
        });
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };

  // 导出采购单pdf
  const downLoadPdf = async (id: any[], isView?: boolean) => {
    const params = {
      id: id.join(','),
    };
    const res: any = await exportPdf(params);
    const type = res.response.headers.get('content-type');
    if (type.indexOf('application/json') > -1) {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], {
        type: 'application/pdf;chartset=UTF-8',
      });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `采购单.pdf`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      if (!isView) btn.download = fileName;
      btn.target = '_blank';
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
  };
  // 同步到供应商
  const syncVendorAction = async (id: any[]) => {
    pubModal('确定同步至供应商吗?')
      .then(async () => {
        const ids = id.join(',');
        const res: any = await syncVendor({ id: ids });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('同步成功', 'success');
          ref?.current?.reload();
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 删除
  const handleDelete = async (id: string) => {
    pubModal('确定删除吗?')
      .then(async () => {
        const res: any = await deleteById({ id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('删除成功', 'success');
          ref?.current?.reload();
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 创建配件采购单
  const addPartsOrder = () => {
    history.push(`/purchase-manage/add-parts-order`);
  };

  // keepAlive页面激活钩子函数
  useActivate(() => {
    setTempKey(new Date().getTime());
    ref?.current?.reload();
  });
  // 表格配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '采购单号',
      dataIndex: 'order_no',
      align: 'center',
      order: 20,
      render: (_: any, record: any) => {
        return (
          <div className="order-wrapper">
            {access.canSee('purchase_order_detail') ? (
              <Link to={`/purchase-manage/order-detail?id=${record.id}`}>
                <span
                  className="c-order"
                  style={{
                    margin: record.approval_status === '8' ? '8px 0' : 0,
                  }}
                >
                  {record.order_no}
                </span>
              </Link>
            ) : (
              <span className="c-order">{record.order_no}</span>
            )}
          </div>
        );
      },
    },
    {
      title: '采购类型',
      dataIndex: 'order_type',
      align: 'center',
      valueType: 'select',
      valueEnum: dicList?.PURCHASE_ORDER_TYPE,
      render: (_, record: any) => {
        const item = dicList?.PURCHASE_ORDER_TYPE;
        const key = record?.order_type;
        return [<span key="order_type">{item?.[key]?.text || '-'}</span>];
      },
      order: 19,
    },
    {
      title: '采购单状态',
      dataIndex: 'approval_status',
      align: 'center',
      order: 5,
      hideInSearch: true,
      width: 100,
      render: (_, record: any) => {
        const item = dicList?.PURCHASE_APPROVAL_STATUS;
        const key = record?.approval_status;
        return (
          <div className="order-wrapper">
            {record?.purchaseOrderChangeHistory?.approval_status === '8' &&
              access.canSee('purchase_order_update_detail') && (
                <Link
                  to={`/purchase-manage/update-detail?type=detail&id=${record?.purchaseOrderChangeHistory?.id}`}
                >
                  <Tag color="red">已变更</Tag>
                </Link>
              )}
            <span
              key="approval_status"
              style={{
                display: 'block',
                margin: record.change_order_approval_status === 8 ? '10px 0' : 0,
              }}
            >
              {record.approval_status === '11' && access.canSee('purchase_order_update_detail') ? (
                <Link
                  to={`/purchase-manage/update-detail?type=detail&id=${record?.purchaseOrderChangeHistory?.id}`}
                >
                  {item?.[key]?.text}
                </Link>
              ) : (
                item?.[key]?.text || '-'
              )}
            </span>
          </div>
        );
      },
    },
    {
      title: '供应商名称',
      dataIndex: 'vendor_name',
      hideInSearch: true,
    },
    {
      title: '采购主体',
      dataIndex: 'main_name',
      hideInSearch: true,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_id',
      hideInTable: true,
      params: { tempKey },
      valueType: 'select',
      order: 18,
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
      debounceTime: 300,
      fieldProps: selectProps,
    },
    {
      title: '采购员',
      dataIndex: 'purchaser_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '采购员',
      dataIndex: 'purchaser_id',
      align: 'center',
      valueType: 'select',
      request: async (v) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
      fieldProps: selectProps,
      order: 17,
      hideInTable: true,
    },

    {
      title: (
        <>
          采购金额
          <Tooltip placement="top" title="采购金额=【采购数量*采购单价】汇总">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'amount',
      hideInSearch: true,
      align: 'center',
      render: (_, record: any) => {
        return !IsGrey ? [
          <span key="status">
            <Statistic
              value={record?.amount}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
              precision={2}
            />
          </span>,
        ] : '-';
      },
    },
    {
      title: (
        <>
          采购运费
          <Tooltip placement="top" title="采购运费=【已入库数量*入库均摊运费】汇总">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'freight_amount',
      hideInSearch: true,
      align: 'center',
      render: (_, record: any) => {
        return  !IsGrey ? [
          <span key="status">
            <Statistic
              value={record?.freight_amount}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
              precision={2}
            />
          </span>,
        ] : '-';
      },
    },
    {
      title: (
        <>
          采购单扣款
          <Tooltip placement="top" title="采购单扣款=添加的采购单扣款">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'deduction',
      hideInSearch: true,
      align: 'center',
      render: (_, record: any) => {
        return !IsGrey ? [
          <span key="status">
            <Statistic
              value={record?.deduction}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
              precision={2}
            />
          </span>,
        ] : '-';
      },
    },
    {
      title: (
        <>
          采购单总金额
          <Tooltip placement="top" title="采购单总金额=采购金额+采购运费-采购单扣款">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'total_amount',
      hideInSearch: true,
      align: 'center',
      render: (_, record: any) => {
        return  !IsGrey ? [
          <span key="status">
            <Statistic
              value={record?.total_amount}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
              precision={2}
            />
          </span>,
        ] : '-';
      },
    },
    {
      title: (
        <>
          已付金额
          <Tooltip placement="top" title="已付金额=已结算金额（实际已支付金额）">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'payment_amount',
      hideInSearch: true,
      align: 'center',
      render: (_, record: any) => {
        return  !IsGrey? [
          <span key="status">
            <Statistic
              value={record?.payment_amount}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
              precision={2}
            />
          </span>,
        ] : '-';
      },
    },
    {
      title: (
        <>
          未付金额
          <Tooltip placement="top" title="未付金额=采购单总金额-已付金额">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'payable_amount',
      hideInSearch: true,
      align: 'center',
      render: (_, record: any) => {
        return  !IsGrey ? [
          <span key="status">
            <Statistic
              value={record?.payable_amount}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
              precision={2}
            />
          </span>,
        ] : '-';
      },
    },
    {
      title: '结算币种',
      dataIndex: 'currency',
      align: 'center',
      valueEnum: dicList?.SC_CURRENCY,
      order: 14,
      render: (_, record: any) => {
        const item = dicList?.SC_CURRENCY;
        const key = record?.currency;
        return [<span key="currency">{item?.[key]?.text || '-'}</span>];
      },
    },
    {
      title: '付款状态',
      dataIndex: 'pay_status',
      align: 'center',
      valueType: 'select',
      valueEnum: dicList?.PURCHASE_PAY_STATUS,
      render: (_, record: any) => {
        const item = dicList?.PURCHASE_PAY_STATUS;
        const key = record?.pay_status;
        return [<span key="pay_status">{item?.[key]?.text || '-'}</span>];
      },
      fieldProps: {
        showSearch: true,
        mode: 'multiple',
      },
      search: {
        transform: (value: any) => ({ pay_status_array: value }),
      },
      order: 11,
    },
    {
      title: '采购单入库异常',
      dataIndex: 'warehousing_exception_type',
      align: 'center',
      valueType: 'select',
      valueEnum: dicList?.PURCHASE_WAREHOUS_EXCEPTION_TYPE,
      fieldProps: selectProps,
      hideInTable: true,
      order: 12,
    },
    {
      title: '入库状态',
      dataIndex: 'delivery_status',
      align: 'center',
      valueType: 'select',
      valueEnum: dicList?.PURCHASE_DELIVERY_STATUS,
      render: (_, record: any) => {
        const item = dicList?.PURCHASE_DELIVERY_STATUS;
        const key = record?.delivery_status;
        return [<span key="delivery_status">{item?.[key]?.text || '-'}</span>];
      },
      fieldProps: {
        showSearch: true,
        mode: 'multiple',
      },
      search: {
        transform: (value: any) => ({ delivery_status_array: value }),
      },
      order: 13,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
      sorter: (a: any, b: any) =>
        new Date(a.create_time).getTime() - new Date(b.create_time).getTime(),
      width: 90,
    },
    {
      title: '时间范围',
      dataIndex: 'time',
      align: 'center',
      hideInTable: true,
      order: 10,
      formItemProps: {
        noStyle: true,
        label: '',
      },
      renderFormItem: () => <RangeTimeSearchScm width={110} />,
      search: {
        transform: (val: any) => {
          if (val.type && val.dates[0]) {
            return {
              [`begin_${val.type}`]: val.dates[0] + ' 00:00:00',
              [`end_${val.type}`]: val.dates[1] + ' 23:59:59',
            };
          }
          return {};
        },
      },
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      hideInTable: true,
      order: 16,
    },
    {
      title: 'SKU',
      dataIndex: 'sku_or_stock_no',
      hideInTable: true,
      order: 15,
    },
    {
      title: '签约方式',
      dataIndex: 'manual_signing',
      valueType: 'select',
      valueEnum: common?.dicList?.PURCHASE_ORDER_MANUAL_SIGNING,
      order: 9,
      hideInTable: true,
    },
    {
      title: '业务范畴',
      dataIndex: 'business_scope',
      valueType: 'select',
      valueEnum: common?.dicList?.SYS_BUSINESS_SCOPE,
      width: 90,
      order: 8,
      align: 'center',
    },
    {
      title: '采购计划编号',
      dataIndex: 'plan_no',
      hideInTable: true,
      align: 'center',
    },
    {
      title: '操作',
      key: 'option',
      width: 100,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (_, record: any) => {
        let menus = [
          {
            key: 'edit',
            name: '编辑',
            show:
              ['1', '7', '4', '9'].includes(record.approval_status) &&
              access.canSee('purchase_order_edit'),
          },
          {
            key: 'update',
            name: '修改采购单',
            show:
              access.canSee('purchase_order_updateEdit') &&
              ['2', '3', '5'].includes(record.approval_status),
          },
          {
            key: 'change',
            name: '采购单变更',
            show: ['8'].includes(record.approval_status) && access.canSee('purchase_order_update'),
          },
          {
            key: 'sync',
            name: '同步至供应商',
            show: record.approval_status === '3' && access.canSee('purchase_order_sync'),
          },

          {
            key: 'addDeduction',
            name: '添加扣款',
            show:
              record.approval_status === '8' &&
              record.pay_status != '2' &&
              access.canSee('purchase_order_deduction'),
          },
          {
            key: 'askPayment',
            name: '采购请款',
            drawer: false,
            show: record.approval_status === '8' && access.canSee('purchase_order_ask'),
          },
          {
            key: 'downPdf',
            name: '下载采购单(pdf)',
            show: access.canSee('purchase_order_exportPdf'),
          },
          {
            key: 'downPdfView',
            name: '预览采购单',
            show: access.canSee('purchase_order_exportPdf'),
          },
          {
            key: 'orderSigning',
            name: '确认采购单已签约',
            show:
              record.approval_status === '5' &&
              record.manual_signing == '1' &&
              access.canSee('purchase_order_signing'),
          },
          {
            key: 'orderSigningR',
            name: '上传线下签约合同-R',
            show:
              record.approval_status === '5' &&
              record.r_manual_signing == 1 &&
              access.canSee('purchase_order_signing_R'),
          },
          {
            key: 'orderSigningEdit',
            name: '重新上传签约采购单',
            show:
              record.approval_status === '8' &&
              record.manual_signing == '1' &&
              access.canSee('purchase_order_signing_edit'),
          },
          {
            key: 'orderSigningEditR',
            name: '重新上传线下签约合同-R',
            show:
              record.approval_status === '8' &&
              record.r_manual_signing == 1 &&
              access.canSee('purchase_order_signing_edit_R'),
          },
          {
            key: 'orderLog',
            name: '采购单修改记录',
            show: access.canSee('purchase_order_field_history'),
          },
          {
            key: 'processLog',
            name: '状态流转记录',
            show: access.canSee('purchase_order_approval_history'),
          },
          {
            key: 'detail',
            name: '入库明细',
            show: access.canSee('purchase_order_warehousing_log'),
          },
          {
            key: 'stopCheck',
            name: '停止对账',
            message:
              '停止对账后，该供应商此采购单所有入库单，将不能生成对账单，恢复对账后，后期将按恢复时间结合账期进行对账',
            submessage: '（正常对账逻辑：入库单入库时间结合账期进行对账)',
            show:
              record.reconciliation_enable_status != '0' &&
              record.approval_status === '8' &&
              record.pay_status != '2' &&
              access.canSee('purchase_order_disableReconciliation'),
          },
          {
            key: 'turnCheck',
            name: '恢复对账',
            message: '恢复对账后，后期将按恢复时间结合账期进行对账；',
            submessage: '（正常对账逻辑：入库单入库时间结合账期进行对账）',
            show:
              record.reconciliation_enable_status === '0' &&
              access.canSee('purchase_order_enableReconciliation'),
          },
          {
            key: 'delete',
            name: '删除',
            show: access.canSee('purchase_order_delete') && record.approval_status === '9',
          },
          {
            key: 'reback',
            name: '退回到新建状态',
            show: access.canSee('purchase_order_reback_submit') && record.approval_status === '3',
          },
        ];
        menus = menus.filter((item: any) => item.show);
        menus = menus.map((item: any) => {
          return {
            ...item,
            show: item.show ? String(item.show) : undefined,
            drawer: item.drawer ? String(item.drawer) : undefined,
          };
        });
        return [
          // 查看
          <Access key="link" accessible={access.canSee('purchase_order_detail')}>
            <Link to={`/purchase-manage/order-detail?id=${record.id}`}>查看</Link>
          </Access>,
          <Access key="actionGroup" accessible={!menus?.every((v: any) => v.show == 'false')}>
            <TableDropdown
              style={{
                display: menus?.every((v: any) => v.show == 'false') ? 'none' : 'inline-block',
              }}
              key="actionGroup"
              onSelect={(key: string) => {
                const value = menus.filter((item: any) => item.key === key)?.[0];
                // 编辑
                if (key === 'edit') {
                  history.push(`/purchase-manage/order-detail?type=edit&id=${record.id}`);
                }
                // 修改采购单
                if (key === 'update') {
                  history.push(`/purchase-manage/order-detail?type=update&id=${record.id}`);
                }
                // 变更采购单
                if (key === 'change') {
                  history.push(`/purchase-manage/update-detail?type=edit&id=${record.id}`);
                }
                // 同步到供应商
                if (key === 'sync') {
                  syncVendorAction([record.id]);
                }
                // 下载采购单
                if (key === 'downPdf') {
                  downLoadPdf([record.id]);
                }
                // 下载采购单
                if (key === 'downPdfView') {
                  downLoadPdf([record.id], true);
                }
                // 确认采购单已签约 重新上传签约采购单
                if (key === 'orderSigning' || key === 'orderSigningEdit') {
                  setModalSigning(true);
                  setModalSigningData(record);
                }
                //  上传线下签约合同-R 重新上传线下签约合同-R
                if (key === 'orderSigningR' || key === 'orderSigningEditR') {
                  setModalSigningR(true);
                  setModalSigningDataR(record);
                }
                // 入库明细,添加扣款,请款,转出,记录单独弹窗组件处理
                if (
                  ['detail', 'addDeduction', 'askPayment', 'processLog', 'orderLog'].includes(key)
                ) {
                  const recordC = { ...record, drawer: value.drawer };
                  setTitleKey(key);
                  setItems(recordC);
                  setTimeout(() => {
                    setModalVisible(true);
                  }, 200);
                }
                // 停止对账,恢复对账,确认弹窗提示操作
                if (['stopCheck', 'turnCheck'].includes(key)) {
                  pubModal(
                    <div style={{ color: '#ff4d4f', padding: '20px 0' }}>
                      <p>
                        {value?.message};
                        <br />
                        {value.submessage}
                      </p>
                      <p>确定{value.name}?</p>
                    </div>,
                    value.name,
                    {
                      width: 500,
                    },
                  )
                    .then(async () => {
                      const res =
                        key === 'stopCheck'
                          ? await disableReconciliation({ id: record.id })
                          : await enableReconciliation({ id: record.id });
                      if (res?.code != pubConfig.sCode) {
                        pubMsg(res?.message);
                      } else {
                        pubMsg('操作成功', 'success');
                        ref?.current?.reload();
                      }
                    })
                    .catch(() => {
                      console.log('点击了取消');
                    });
                }
                // 删除
                if (key === 'delete') {
                  handleDelete(record.id);
                }
                if (key == 'reback') {
                  _ref?.current?.open(record.id);
                }
              }}
              menus={menus}
            />
          </Access>,
        ];
      },
    },
  ];
  // 列配置
  const defaultScrollX = 2200;
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
  // 导出excel
  const downLoad = async (key: string, subLoading: string, name: string) => {
    const formRefValue = formRef.current?.getFieldsFormatValue() || {}
    const params = {
      key,
      name,
      ...exportForm,
      ...formRefValue,
    };
    // 批量导出po单时间限制
    if (key === 'poZip') {
      if (
        !params.begin_create_time &&
        !params.begin_approval_agree_time &&
        !params.begin_signing_time
      ) {
        return pubAlert('请选择时间范围');
      } else if (
        moment(params.end_create_time).diff(moment(params.begin_create_time), 'day') > 30 ||
        moment(params.end_approval_agree_time).diff(
          moment(params.begin_approval_agree_time),
          'day',
        ) > 30 ||
        moment(params.end_signing_time).diff(moment(params.begin_signing_time), 'day') > 30
      ) {
        return pubAlert('时间最大支持 31 天,请重新选择时间范围');
      }
    }
    // 导出
    if (selectRows.length) {
      params.selected_order_id = selectRows;
    }
    params.export_config = { columns: computedColumnConfig(columns, columnsState) };
    setLoading((values: any) => {
      return { ...values, [`${subLoading}`]: true };
    });
    const res: any = await exportExcel(params);
    const type = res.response.headers.get('content-type');
    if (type && type.indexOf('application/json') > -1) {
      const json = res?.response?.json();
      if (json) {
        json.then((r: any) => {
          pubMsg('操作失败: ' + r?.message);
        });
      } else {
        pubMsg(res?.message);
      }
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `${params.name}.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }

      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
    setLoading((values: any) => {
      return { ...values, [`${subLoading}`]: false };
    });
  };
  // 弹窗关闭
  const handleClose = (cancel?: any) => {
    setModalVisible(false);
    setModalSigning(false);
    setModalSigningR(false);
    if (cancel) {
      ref?.current?.reload();
    }
  };

  // 切换tabs时
  const changeTabs = async (key: any) => {
    setTabStatus(key == 'all' ? null : key);
    setPageSize(20);
  };

  return (
    <>
      <Dialog
        dicList={dicList}
        items={items}
        titleKey={titleKey}
        isModalVisible={modalVisible}
        handleClose={handleClose}
      />
      <DialogSigning
        dicList={dicList}
        data={modalSigningData}
        isModalVisible={modalSigning}
        handleClose={handleClose}
      />
      <DialogSigningR
        dicList={dicList}
        data={modalSigningDataR}
        isModalVisible={modalSigningR}
        handleClose={handleClose}
      />

      <ConfirmModal
        title="退回到新建状态"
        _ref={_ref}
        reload={() => ref?.current?.reload()}
        type="reback"
      />
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
        <ProTable<TableListItem>
          columns={columns}
          pagination={{
            showSizeChanger: true,
            pageSize,
            onChange: (page, size) => {
              setPageSize(size);
            },
          }}
          params={{ tabStatus }}
          expandable={{
            expandedRowRender: (record: any) => (
              <DetailsTable
                order_type={record.order_type}
                dataSource={record?.purchaseOrderSkuList || []}
                tableCurrency={`(${pubFilter(common?.dicList?.SC_CURRENCY, record?.currency)})`}
                dicList={dicList}
                type="both"
                business_scope={record.business_scope}
              />
            ),
          }}
          actionRef={ref}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          rowSelection={
            access.canSee('purchase_order_submit') ||
            access.canSee('purchase_order_approval') ||
            access.canSee('purchase_order_cancel') ||
            access.canSee('purchase_order_transfer') ||
            access.canSee('purchase_order_sync') ||
            access.canSee('purchase_order_withdraw_cancelWithdraw')
              ? {
                  fixed: true,
                  onChange: (selectedRowKeys: any, rowItems: any) => {
                    setSelectedItems(rowItems);
                    setSelectRows(selectedRowKeys);
                  },
                }
              : false
          }
          scroll={{ x: scrollX || defaultScrollX }}
          columnsState={{
            value: columnsState,
            onChange: (stateMap: any) => {
              columnsStateSet(stateMap);

              setTimeout(() => {
                scrollXSet(scrollByColumn(stateMap) || defaultScrollX);
              }, 500);
            },
          }}
          options={{
            setting: {
              checkedReset: false,
              extra: (
                <>
                  <a
                    style={{ marginLeft: '4px', opacity: 0 }}
                    onClick={() => {
                      if (customColumnSetting?.id) {
                        customColumnDelete({ customColumnId: customColumnSetting?.id }).then(() => {
                          pubRefreshColumnList(initialState, setInitialState);
                        });
                      }

                      columnsStateSet(pubGetColumnsState(columns));
                      scrollXSet(defaultScrollX);
                    }}
                  >
                    重置
                  </a>
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
          rowKey="id"
          search={{ className: 'light-search-form max-112', defaultCollapsed: false }}
          dateFormatter="string"
          headerTitle={
            <Space key="space" wrap>
              <Access key="add_parts" accessible={access.canSee('scm_parts_order_add')}>
                <Button
                  ghost
                  type="primary"
                  onClick={() => {
                    addPartsOrder();
                  }}
                >
                  创建配件采购单
                </Button>
              </Access>

              <Access key="approval" accessible={access.canSee('purchase_order_submit')}>
                <Button
                  disabled={!selectRows.length}
                  onClick={() => {
                    if (selectedItems.every((item: any) => item.approval_status === '1')) {
                      orderSubmitAction(selectRows);
                    } else {
                      pubAlert('只有新建状态才可以提交审核,请重新选择采购单！');
                    }
                  }}
                >
                  提交审核
                </Button>
              </Access>
              <Access key="back" accessible={access.canSee('purchase_order_cancel_submit')}>
                <AuditOptions
                  type="cancelSubmit"
                  reload={() => ref?.current?.reload()}
                  ids={selectRows}
                  selectData={selectedItems}
                  title="撤回提交审核"
                  approval_status={['2']}
                  isOptions
                />
              </Access>
              <Access key="access" accessible={access.canSee('purchase_order_approval')}>
                <Button
                  disabled={!selectRows.length}
                  loading={loading.confirmLoading}
                  onClick={() => {
                    if (selectedItems.every((item: any) => item.approval_status === '2')) {
                      agreeAction(selectRows);
                    } else {
                      pubAlert('只有待审核状态才可以审核,请重新选择采购单！');
                    }
                  }}
                >
                  审核通过
                </Button>
              </Access>
              <Access key="reject" accessible={access.canSee('purchase_order_approval')}>
                <AuditOptions
                  type="refuse"
                  reload={() => ref?.current?.reload()}
                  ids={selectRows}
                  selectData={selectedItems}
                  title="审核不通过"
                  approval_status={['2']}
                  isOptions
                />
              </Access>
              <Access key="delete" accessible={access.canSee('purchase_order_cancel')}>
                <AuditOptions
                  type="nullify"
                  reload={() => ref?.current?.reload()}
                  ids={selectRows}
                  selectData={selectedItems}
                  title="作废"
                  approval_status={['1', '7', '4']}
                  isOptions
                />
              </Access>
              <Access key="turn" accessible={access.canSee('purchase_order_transfer')}>
                <Button
                  disabled={!selectRows.length}
                  onClick={() => {
                    if (
                      selectedItems.every(
                        (item: any) =>
                          ['3', '5', '8'].includes(item.approval_status) ||
                          item.delivery_status === '1',
                      )
                    ) {
                      setTitleKey('turn');
                      setItems(selectRows);
                      setTimeout(() => {
                        setModalVisible(true);
                      }, 200);
                    } else {
                      pubAlert(
                        '只有审核通过、待签约、已签约、部分发货状态才可以转出,请重新选择采购单！',
                      );
                    }
                  }}
                >
                  采购单转出
                </Button>
              </Access>
              <Access key="sync" accessible={access.canSee('purchase_order_sync')}>
                <Button
                  disabled={!selectRows.length}
                  onClick={() => {
                    if (
                      selectedItems.every((item: any) => ['3', '7'].includes(item.approval_status))
                    ) {
                      syncVendorAction(selectRows);
                    } else {
                      pubAlert('只有审核通过/已撤回状态才可以同步至供应商,请重新选择采购单！');
                    }
                  }}
                >
                  同步至供应商
                </Button>
              </Access>
              <Access
                key="backF"
                accessible={access.canSee('purchase_order_withdraw_cancelWithdraw')}
              >
                <AuditOptions
                  type="withdraw"
                  reload={() => ref?.current?.reload()}
                  ids={selectRows}
                  selectData={selectedItems}
                  title="从供应商撤回"
                  approval_status={['5', '8']}
                  isOptions
                />
              </Access>
              <Access
                key="cancel"
                accessible={access.canSee('purchase_order_withdraw_cancelWithdraw')}
              >
                <AuditOptions
                  type="cancelWithdraw"
                  reload={() => ref?.current?.reload()}
                  ids={selectRows}
                  selectData={selectedItems}
                  title="取消从供应商撤回"
                  approval_status={['6']}
                  isOptions
                />
              </Access>
            </Space>
          }
          toolBarRender={() => [
            <Space key="space">
              <Access key="poOrder" accessible={access.canSee('scm_purchaseOrder_downloadPo_batch')}>
                <Button
                  icon={<DownloadOutlined />}
                  ghost
                  type="primary"
                  disabled={loading.poZipLoading}
                  loading={loading.poZipLoading}
                  onClick={() => {
                    downLoad('poZip', 'poZipLoading', 'PO单');
                  }}
                >
                  批量下载PO单
                </Button>
              </Access>
              <Access key="order" accessible={access.canSee('purchase_order_export')}>
                <Button
                  icon={<DownloadOutlined />}
                  ghost
                  type="primary"
                  disabled={loading.orderLoading}
                  loading={loading.orderLoading}
                  onClick={() => {
                    downLoad('order', 'orderLoading', '采购单');
                  }}
                >
                  采购单导出
                </Button>
              </Access>
              <Access key="sku" accessible={access.canSee('purchase_order_exportSku')}>
                <Button
                  icon={<DownloadOutlined />}
                  ghost
                  type="primary"
                  key="sku"
                  disabled={loading.skuLoading}
                  loading={loading.skuLoading}
                  onClick={() => {
                    downLoad('sku', 'skuLoading', '采购明细');
                  }}
                >
                  导出采购明细
                </Button>
              </Access>
              <Access key="download" accessible={access.canSee('purchase_order_warehousing')}>
                <Button
                  ghost
                  icon={<DownloadOutlined />}
                  type="primary"
                  key="download"
                  disabled={loading.deliveryLoading}
                  loading={loading.deliveryLoading}
                  onClick={() => {
                    downLoad('delivery', 'deliveryLoading', '入库明细');
                  }}
                >
                  批量导出入库明细
                </Button>
              </Access>
            </Space>,
          ]}
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Order);
export default ConnectPage;

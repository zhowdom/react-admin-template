import { useState, useRef } from 'react';
import { Button, Space, Statistic } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useAccess, Access, history } from 'umi';
import {
  PlusOutlined,
  DownloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  getList,
  exportDeliveryPlanIn,
  statusCount,
} from '@/services/pages/deliveryPlan';
import { pubAlert, pubConfig, pubMsg } from '@/utils/pubConfig';
import { customColumnDelete, customColumnSet } from '@/services/base';
import { useActivate } from 'react-activation';
import {
  pubGetColumnsState,
  pubProLineList,
  pubRefreshColumnList,
} from '@/utils/pubConfirm';
import Dialog from './Dialog/DialogIn';
import Audit from './Dialog/Audit';
import AuditOptions from './Dialog/AuditOptions';
import OrderOptions from './Dialog/OrderOptions';
import EditStockWuliu from './Dialog/EditStockWuliu';
import WeekTimeSearch from '@/components/PubForm/WeekTimeSearch';
import PubWeekRender from '@/components/PubWeekRender';
import { PageContainer } from '@ant-design/pro-layout';
import PlatStore from '@/components/PubForm/PlatStore';
import WithCommonHandle from './WithCommonHandle';
import StockList from './Dialog/StockList';
import YcCreate from '@/pages/PurchaseManage/DeliveryPlan/Dialog/YcCreate';
import { useModel } from 'umi';
import { computedColumnConfig, scrollByColumn } from '@/utils/filter';
import ImportBtn from '@/components/ImportBtn';
import CommonLog from '@/components/CommonLog';
import { getOperationHistory } from '@/services/pages/stockManager';

const cacheKey = 'PurchaseManagerDeliveryPlanAbroadTab';
const Abroad = (props: any) => {
  const access = useAccess();
  const { orderSubmitAction, agreeAction, common } = props;
  const dicList = common?.dicList;
  const [selectRows, setSelectRows] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState<any>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [downLoadPlans, setDownLoadPlans] = useState(false);
  const [auditShow, setAuditShow] = useState(false);
  const [curId, setCurId] = useState();
  const [exportForm, setExportForm] = useState<any>({});
  const [loading, setLoading] = useState({
    skuLoading: false,
    deliveryLoading: false,
    downLoading: false,
    upLoading: false,
  });
  const [tabList, setTabList] = useState([]);
  const [tabStatus, setTabStatus] = useState<any>(window.sessionStorage.getItem(cacheKey) || '2');
  const [pageSize, setPageSize] = useState<any>(20);
  const ref: any = useRef<ActionType>();
  // 弹窗计划关闭
  const handleClose = (cancel: any) => {
    setIsModalVisible(false);
    if (!cancel) {
      ref?.current?.reload();
    }
  };
  const reload = () => {
    ref?.current?.reload();
  };
  // 新增或编辑,有id编辑,无id新增
  const toUpdate: any = (row: { id: string | undefined }) => {
    setItems(row?.id ? row : {});
    setIsModalVisible(true);
  };
  // 获取状态及数据统计
  const statusCountAction = async () => {
    const res: any = await statusCount({ business_scope: 'IN' });
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
      business_scope: 'IN',
      approval_status: tabStatus == 'all' ? null : tabStatus, //状态
      current_page: tabStatus == 2 ? 1 : params?.current,
      page_size: tabStatus == 2 ? 10000 : params?.pageSize,
      begin_warehousing_time: params.warehousing_time?.[0] || null,
      end_warehousing_time: params.warehousing_time?.[1] || null,
      begin_create_time:
        params.create_time && params.create_time[0] ? `${params.create_time[0]} 00:00:00` : null,
      end_create_time:
        params.create_time && params.create_time[1] ? `${params.create_time[1]} 23:59:59` : null,
      platform_id: params.plat_store ? params.plat_store?.[0] : null, // 平台
      shop_id: params.plat_store ? params.plat_store?.[1] : null, // 店铺
      shipment_begin_cycle_time: params?.cycle_time?.[1] || null, //下单时间-开始
      shipment_end_cycle_time: params?.cycle_time?.[2] || null, //下单时间-结束
      cycle_time: params?.cycle_time?.[0] || null,
    };
    setExportForm(postData);
    statusCountAction();
    const res = await getList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    setSelectRows([]);
    setSelectedItems([]);
    ref?.current?.clearSelected();
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const formRef = useRef<ProFormInstance>();
  // keepAlive页面激活钩子函数
  useActivate(() => {
    ref?.current?.reload();
  });

  // 操作按钮组件
  const SubmitBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_submit_in')}>
        <a
          onClick={() => {
            orderSubmitAction([record.id], reload);
          }}
        >
          提交审核
        </a>
      </Access>
    );
  };
  const CancelBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_nullify_in')}>
        <AuditOptions
          type="nullify"
          reload={() => ref?.current?.reload()}
          ids={[record.id]}
          title="作废"
        />
      </Access>
    );
  };
  // 审核后作废
  const CancelBtnA = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_nullify_approved_in')}>
        <AuditOptions
          type="nullifyApproved"
          reload={() => ref?.current?.reload()}
          ids={[record.id]}
          title="作废"
        />
      </Access>
    );
  };
  const EditBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_updateById_in')}>
        <a
          onClick={() => {
            toUpdate(record);
          }}
        >
          编辑
        </a>
      </Access>
    );
  };
  const UpdateBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_update_in')}>
        <a
          onClick={() => {
            toUpdate({ ...record, customType: 'update' });
          }}
        >
          修改
        </a>
      </Access>
    );
  };
  const ApprovalBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_agree_in')}>
        <a
          onClick={() => {
            agreeAction([record.id], reload);
          }}
        >
          审核通过
        </a>
      </Access>
    );
  };
  const RejectBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_agree_in')}>
        <AuditOptions
          type="refuse"
          reload={() => ref?.current?.reload()}
          ids={[record.id]}
          title="审核不通过"
        />
      </Access>
    );
  };
  const CreateBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_order_add_in')}>
        <YcCreate
          title={'创建入库单'}
          reload={ref?.current?.reload}
          dicList={dicList}
          dialogForm={record}
          business_scope="IN"
        />
      </Access>
    );
  };
  const HistoryBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('delivery_plan_approval_detail_history_in')}>
        <a
          onClick={() => {
            setCurId(record.id);
            setAuditShow(true);
          }}
        >
          审批信息
        </a>
      </Access>
    );
  };
  const RebackBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_reback_in')}>
        <AuditOptions
          type="terminate"
          reload={() => ref?.current?.reload()}
          ids={[record.id]}
          title="撤回"
        />
      </Access>
    );
  };
  // 表格配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '发货计划编号',
      dataIndex: 'plan_no',
      align: 'center',
      order: 9,
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'approval_status',
      align: 'center',
      valueEnum: dicList?.DELIVERY_PLAN_STATUS || {},
      order: 1,
      hideInSearch: true,
    },
    {
      title: '出货周期',
      dataIndex: 'cycle_time',
      align: 'center',
      width: 100,
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
      title: '产品线',
      dataIndex: 'category_id-in', // 前端自定义区分国内跨区, 避免缓存下拉数据互串
      valueType: 'select',
      request: () => pubProLineList({ business_scope: 'IN' }),
      fieldProps: { showSearch: true },
      hideInTable: true,
      search: {
        transform: (category_id) => ({ category_id }),
      },
    },
    {
      title: '产品线',
      dataIndex: 'category_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '商品名称',
      dataIndex: 'goods_sku_name',
      order: 5,
    },
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
      order: 4,
      width: 150,
    },
    {
      title: 'SKU销售状态',
      dataIndex: 'life_cycle',
      align: 'center',
      order: 4,
      width: 150,
      valueEnum: dicList?.LINK_MANAGEMENT_SALES_STATUS || {},
    },
    {
      title: '店铺',
      dataIndex: 'shop_name',
      align: 'center',
      order: 7,
      hideInSearch: true,
    },
    {
      title: '店铺',
      dataIndex: 'plat_store',
      order: 7,
      hideInTable: true,
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
    // {
    //   title: '店铺',
    //   dataIndex: 'shop_id',
    //   align: 'center',
    //   order: 7,
    //   valueType: 'select',
    //   request: () => pubGetStoreListAction({ business_scope: 'IN' }),
    //   fieldProps: selectProps,
    //   hideInTable: true,
    // },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      hideInSearch: true,
      order: 8,
    },
    {
      title: '运输方式',
      dataIndex: 'shipping_method',
      align: 'center',
      valueEnum: dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || {},
    },
    // {
    //   title: (
    //     <div>
    //       在途数量
    //       <br />
    //       (国内+境外)
    //     </div>
    //   ),
    //   dataIndex: 'inTransit',
    //   hideInSearch: true,
    //   align: 'center',
    //   width: 100,
    //   render: (_, record: any) => (
    //     <Statistic
    //       value={record?.inTransit || '-'}
    //       valueStyle={{ fontWeight: 400, fontSize: '14px' }}
    //     />
    //   ),
    // },
    {
      title: (
        <span>
          所有供应商
          <br />
          未交货总数
        </span>
      ),
      dataIndex: 'undelivered',
      hideInSearch: true,
      align: 'center',
      width: 100,
      render: (_, record: any) => (
        <Statistic
          value={record?.undelivered || '-'}
          valueStyle={{ fontWeight: 400, fontSize: '14px' }}
        />
      ),
    },
    {
      title: '计划发货数量',
      dataIndex: 'num',
      hideInSearch: true,
      align: 'center',
      render: (text: any, row: any) => {
        return row?.stockup_advice_id ? (
          <a
            onClick={() => {
              history.push(
                `/stock-up-in/stockUp/suggest-detail?code=${row?.stock_up_advice_code}&readonly=true`,
              );
            }}
          >
            {text}
          </a>
        ) : text ? (
          text
        ) : (
          '-'
        );
      },
    },
    {
      title: '未建入库单数量',
      dataIndex: 'no_generate_warehousing_order_num',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '已建入库单数量',
      dataIndex: 'generate_warehousing_order_num',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '要求物流入仓时间',
      dataIndex: 'warehousing_time',
      align: 'center',
      hideInSearch: true,
      sorter: (a: any, b: any) =>
        new Date(a.warehousing_time).getTime() - new Date(b.warehousing_time).getTime(),
    },
    {
      title: '要求物流入仓时间',
      dataIndex: 'warehousing_time',
      align: 'center',
      valueType: 'dateRange',
      hideInTable: true,
      order: 3,
      sorter: (a: any, b: any) =>
        new Date(a.create_time).getTime() - new Date(b.create_time).getTime(),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
      width: 160,
      sorter: (a: any, b: any) =>
        new Date(a.create_time).getTime() - new Date(b.create_time).getTime(),
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      width: 100,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      valueType: 'dateRange',
      hideInTable: true,
      order: 2,
      sorter: (a: any, b: any) =>
        new Date(a.create_time).getTime() - new Date(b.create_time).getTime(),
    },
    {
      title: '备货建议号',
      dataIndex: 'stock_up_advice_code',
      width: 100,
      align: 'center',
      render: (text: any, row: any) => {
        return row?.stockup_advice_id ? (
          <a
            onClick={() => {
              history.push(
                `/stock-up-in/stockUp/suggest-detail?code=${row?.stock_up_advice_code}&readonly=true`,
              );
            }}
          >
            {text}
          </a>
        ) : text ? (
          text
        ) : (
          '-'
        );
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 160,
      align: 'center',
      className: 'wrap',
      fixed: 'right',
      valueType: 'option',
      render: (_, record: any) => {
        const retuList: any = []
        // 1新建 2待审核 3审核通过 4审核不通过  5作废 6已生成入库单 7部分生产入库单
        if (['1'].includes(record.approval_status)) {
          retuList.push(<SubmitBtn record={record} key="submit" />)
        }
        if (['1','4','5'].includes(record.approval_status) && !record?.stock_up_advice_code) {
          retuList.push(<EditBtn record={record} key="edit" />)
        }
        if (['1','4'].includes(record.approval_status)) {
          retuList.push(<CancelBtn record={record} key="cancel" />)
        }

        if (['2'].includes(record.approval_status)) {
          retuList.push(<ApprovalBtn record={record} key="approval" />)
          retuList.push(<RejectBtn record={record} key="reject" />)
          retuList.push(<RebackBtn record={record} key="reback" />)
        }
        if (['3','7'].includes(record.approval_status)) {
          retuList.push(<CreateBtn record={record} key="create" />)
          retuList.push(<UpdateBtn record={record} key="update" />)
        }
        if (['3'].includes(record.approval_status)) {
          retuList.push(<CancelBtnA record={record} key="cancel" />)
        }
        if (['6'].includes(record.approval_status)) {
          retuList.push(
            <Access accessible={access.canSee('deliveryPlan_stockView_in')} key="stock">
              {/*查看入库单*/}
              <StockList dicList={dicList} id={record.id} business_scope="IN" />
            </Access>
          )
        }
        if (['7'].includes(record.approval_status)) {
          retuList.push(
            <Access accessible={access.canSee('deliveryPlan_stockView_in')} key="stock">
              <StockList dicList={dicList} id={record.id} business_scope="IN" />
            </Access>
          )
        }
        if (['2','3','4','5','6','7'].includes(record.approval_status)) {
          retuList.push(<HistoryBtn record={record} key="history" />)
        }
        if (['6','7'].includes(record.approval_status)) {
          retuList.push(
            <Access accessible={access.canSee('scm_deliverPlan_purchase_edit_wuliu_in')} key="purchaseEditWuliu">
              {/* 修改入库单物流信息 */}
              <EditStockWuliu
                reload={() => ref?.current?.reload()}
                planId={record.id}
                title="修改入库单物流信息"
                dicList={dicList}
              />
            </Access>
          )
        }
        retuList.push(
          <Access key="scm_deliverPlan_log" accessible={access.canSee('scm_deliverPlan_log_in')}>
            <CommonLog
              api={getOperationHistory}
              business_id={record.id}
              dicList={props?.dicList}
            />
          </Access>
        )
        return retuList;
      },
    },
  ];
  // 列配置
  const defaultScrollX = 2700;
  const persistenceKey = window.location.pathname.replace(/\/$/, '');
  const { initialState, setInitialState } = useModel('@@initialState');
  const customColumnSetting = initialState?.currentUser?.customColumnSetting?.find(
    (item: any) => item.code == persistenceKey,
  );
  const [columnsState, columnsStateSet] = useState<any>(
    pubGetColumnsState(columns, customColumnSetting),
  );
  const [scrollX, scrollXSet] = useState<any>(scrollByColumn(columnsState, 4) || defaultScrollX);
  const [loadingCustomColumn, loadingCustomColumnSet] = useState<any>(false);
  // 导出excel
  const downLoadExcel = async () => {
    if (selectRows.length) {
      exportForm.selected_order_id = selectRows;
    }
    exportForm.export_config = { columns: computedColumnConfig(columns, columnsState) };
    setDownLoadPlans(true);
    const res: any = await exportDeliveryPlanIn(exportForm);
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
      let fileName = `跨境发货计划导出.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
    setDownLoadPlans(false);
  };
  // 切换tabs时
  const changeTabs = async (key: any) => {
    setTabStatus(key == 'all' ? null : key);
    window.sessionStorage.setItem(cacheKey, key);
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
      <Audit isModalVisible={auditShow} handleClose={() => setAuditShow(false)} id={curId} />
      {/*新建发货计划弹框*/}
      <Dialog
        isModalVisible={isModalVisible}
        handleClose={handleClose}
        dicList={dicList}
        dialogForm={
          items?.id
            ? {
              ...items,
              platform_id: {
                value: items?.platform_id,
                label: items?.platform_name,
              },
              shop_id: {
                value: items?.shop_id,
                label: items?.shop_name,
              },
              goods_sku_id: `${items?.goods_sku_id}_${items?.shop_sku_code}`,
            }
            : items
        }
        business_scope="IN"
      />
      <ProTable<TableListItem>
        columns={columns}
        params={{ tabStatus }}
        pagination={
          tabStatus == 2
            ? false
            : {
              showSizeChanger: true,
              pageSize,
              onChange: (page, size) => {
                setPageSize(size);
              },
            }
        }
        scroll={{ x: scrollX || defaultScrollX }}
        columnsState={{
          value: columnsState,
          onChange: (stateMap: any) => {
            columnsStateSet(stateMap);

            setTimeout(() => {
              scrollXSet(scrollByColumn(stateMap, 4) || defaultScrollX);
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
        actionRef={ref}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        rowSelection={
          access.canSee('deliveryPlan_submit_in') ||
            access.canSee('deliveryPlan_agree_in') ||
            access.canSee('deliveryPlan_nullify_in') ||
            access.canSee('deliveryPlan_order_add_in')
            ? {
              fixed: true,
              onChange: (selectedRowKeys: any, rowItems: any) => {
                setSelectedItems(rowItems);
                setSelectRows(selectedRowKeys);
              },
            }
            : false
        }
        rowKey="id"
        search={{ className: 'light-search-form', defaultCollapsed: false, labelWidth: 109 }}
        dateFormatter="string"
        headerTitle={
          <Space key="space" wrap>
            <Access key="approval" accessible={access.canSee('deliveryPlan_submit_in')}>
              <Button
                disabled={!selectRows.length}
                onClick={() => {
                  if (selectedItems.every((item: any) => item.approval_status == '1')) {
                    orderSubmitAction(selectRows, reload);
                  } else {
                    pubAlert('只有新建状态才可以提交审核,请重新选择发货计划！');
                  }
                }}
              >
                提交审核
              </Button>
            </Access>
            <Access key="access" accessible={access.canSee('deliveryPlan_agree_in')}>
              <Button
                key="access"
                disabled={!selectRows.length}
                onClick={() => {
                  if (selectedItems.every((item: any) => item.approval_status == '2')) {
                    agreeAction(selectRows, reload);
                  } else {
                    pubAlert('只有待审核状态才可以审核,请重新选择发货计划！');
                  }
                }}
              >
                审核通过
              </Button>
            </Access>
            <Access key="reject" accessible={access.canSee('deliveryPlan_agree_in')}>
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
            {/*审批前作废*/}
            <Access
              accessible={
                access.canSee('deliveryPlan_nullify_in') && [1, 4].includes(Number(tabStatus))
              }
            >
              <AuditOptions
                type="nullify"
                reload={() => ref?.current?.reload()}
                ids={selectRows}
                selectData={selectedItems}
                title="批量作废"
                triggerBtn
              />
            </Access>
            {/*审批后作废*/}
            <Access
              accessible={
                access.canSee('deliveryPlan_nullify_approved_in') && [3].includes(Number(tabStatus))
              }
            >
              <AuditOptions
                type="nullifyApproved"
                reload={() => ref?.current?.reload()}
                ids={selectRows}
                selectData={selectedItems}
                title="批量作废"
                triggerBtn
              />
            </Access>
            <Access key="create" accessible={access.canSee('deliveryPlan_order_add_in')}>
              <OrderOptions
                type="createWarehousingByPlan"
                reload={() => ref?.current?.reload()}
                ids={selectRows}
                selectData={selectedItems}
                title="创建入库单（跨境）"
                approval_status={['3', '7']}
                business_scope="IN"
                isOptions
              />
            </Access>
            <Access accessible={access.canSee('deliveryPlan_order_add_in_merge')}>
              <OrderOptions
                isMerge
                type="createWarehousingByPlan"
                reload={() => ref?.current?.reload()}
                ids={selectRows}
                selectData={selectedItems}
                title="合并创建入库单(相同SKU)"
                approval_status={['3', '7']}
                business_scope="IN"
                isOptions
              />
            </Access>
          </Space>
        }
        toolBarRender={() => [
          <Space key="space">
            <Access key="add" accessible={access.canSee('deliveryPlan_add_in')}>
              <Button
                icon={<PlusOutlined />}
                ghost
                type="primary"
                key="sku"
                disabled={loading.skuLoading}
                loading={loading.skuLoading}
                onClick={() => {
                  toUpdate({});
                }}
              >
                添加商品发货计划
              </Button>
            </Access>
            <Access key="import" accessible={access.canSee('deliveryPlan_add_in')}>
              <ImportBtn
                btnText={'导入发货计划'}
                reload={() => ref?.current?.reload()}
                importForm={{
                  business_scope: 'IN',
                }}
                business_type={'DELIVERY_PLAY_IMPORT'}
                templateCode={'DELIVERY_PLAN_IN'}
                importHandle={'/sc-scm/deliveryPlan/import'}
              />
            </Access>

            <Access key="deliveryPlan_export" accessible={access.canSee('deliveryPlan_export_in')}>
              <Button
                icon={<DownloadOutlined />}
                ghost
                type="primary"
                disabled={downLoadPlans}
                loading={downLoadPlans}
                onClick={() => {
                  downLoadExcel();
                }}
              >
                发货计划导出
              </Button>
            </Access>
          </Space>,
        ]}
      />
    </PageContainer>
  );
};
export default WithCommonHandle(Abroad);

import { useState, useRef, useMemo, useEffect } from 'react';
import { Button, Space, Statistic, Tabs } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useAccess, Access } from 'umi';
import {
  PlusOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import DetailsTable from './Dialog/DetailsTable';
import DetailsTableEdit from './Dialog/DetailsTableEdit';
import {
  getList,
  exportDeliveryPlanCn,
  statusCount,
  exportDeliveryPlanYunCang,
  waitApprovalStatusCount,
} from '@/services/pages/deliveryPlan';
import { pubAlert, pubConfig, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import {
  pubProLineList,
} from '@/utils/pubConfirm';
import Dialog from './Dialog/DialogCN';
import Audit from './Dialog/Audit';
import AuditOptions from './Dialog/AuditOptions';
import OrderOptions from './Dialog/OrderOptions';
import WeekTimeSearch from '@/components/PubForm/WeekTimeSearch';
import PubWeekRender from '@/components/PubWeekRender';
import { PageContainer } from '@ant-design/pro-layout';
import './index.less';
import WithCommonHandle from './WithCommonHandle';
import PlatStore from '@/components/PubForm/PlatStore';
import SelectDependency from '@/components/PubForm/SelectDependency';
import StockList from './Dialog/StockList';
import YcCreate from './Dialog/YcCreate';
import useCustomColumnSet from "@/hooks/useCustomColumnSet";
import ImportBtn from '@/components/ImportBtn';
import CommonLog from '@/components/CommonLog';
import { getOperationHistory } from '@/services/pages/stockManager';

const cacheKey = 'DeliveryPlanHomeTab';
const Home = (props: any) => {
  const access = useAccess();
  const { orderSubmitAction, agreeAction, common } = props;
  const dicList: any = common?.dicList;
  const [selectRows, setSelectRows] = useState([]);
  const [platform_code, setPlatCode] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState<any>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [downLoadPlans, setDownLoadPlans] = useState(false);
  const [auditShow, setAuditShow] = useState(false);
  const [curId, setCurId] = useState();
  const [pageSize, setPageSize] = useState<any>(20);
  const [loading, setLoading] = useState({
    skuLoading: false,
    deliveryLoading: false,
    downLoading: false,
    upLoading: false,
  });
  const tmPopObj = {
    '1531560417090879489': '天猫',
    '1532170842660691969': '京东POP',
  };
  const [topTabList, topTabListSet] = useState<any>([
    {
      key: '1',
      tab: '电商平台',
      dataIndex: 'ECOMMERCE',
    },
    {
      key: '2',
      tab: '云仓',
      dataIndex: 'YUN_CANG',
    },
  ]);
  const [topSTabList, setSTabList] = useState<any>([]);
  const [tabStatus, setTabStatus] = useState<any>(window.sessionStorage.getItem(cacheKey) || '2');
  const ref: any = useRef<ActionType>();
  const [exportForm, setExportForm] = useState<any>({});
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
    // { business_scope: 'CN', platform_id: pId }
    const res: any = await statusCount({ business_scope: 'CN', platform_code });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const tabs = res.data.flatMap((v: any) => {
        return [
          {
            key: v.key,
            label: `${v.name} (${v.count})`,
          },
        ];
      });

      setSTabList(tabs);
    }
  };
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    // 获取待审核数量
    waitApprovalStatusCount().then((res) => {
      if (res?.code == pubConfig.sCode) {
        topTabListSet(
          topTabList.map((item: any) => {
            const temp = res?.data.find((item2: any) => item2.key == item.dataIndex);
            return {
              ...item,
              tab: (
                <span>
                  {temp.name}
                  <span className={'text-red'}>(待审{temp.count})</span>
                </span>
              ),
            };
          }),
        );
      } else {
        pubMsg(res?.message)
      }
    });
    const postData = {
      ...params,
      business_scope: 'CN',
      current_page: tabStatus == 2 ? 1 : params?.current,
      page_size: tabStatus == 2 ? 10000 : params?.pageSize,
      platform_code,
      platform_id: params.plat_store ? params.plat_store?.[0] : null, // 平台
      shop_id: params.plat_store ? params.plat_store?.[1] : null, // 店铺
      approval_status: tabStatus == 'all' ? null : tabStatus,
      begin_warehousing_time: params.warehousing_time?.[0] || null,
      end_warehousing_time: params.warehousing_time?.[1] || null,
      begin_create_time:
        params.create_time && params.create_time[0] ? `${params.create_time[0]} 00:00:00` : null,
      end_create_time:
        params.create_time && params.create_time[1] ? `${params.create_time[1]} 23:59:59` : null,
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

  // // 获取平台
  // const pubGetPlatformListAction = async (): Promise<any> => {
  //   const res: any = await pubGetPlatformList();
  //   const data = res.filter((v: any) => v.business_scope == 'CN');
  //   setTopTabList([
  //     ...data.map((v: any, index: number) => {
  //       if (index == 0 && !pId) {
  //         setPId(v.value);
  //       }

  //       return {
  //         key: v.value,
  //         tab: v.label,
  //       };
  //     }),
  //   ]);
  //   return data;
  // };
  // 获取店铺
  // const pubGetStoreListAction = async (data: any): Promise<any> => {
  //   const res: any = await pubGetStoreList(data);
  //   return res;
  // };
  // 搜索清除前后空格
  // const selectProps = {
  //   showSearch: true,
  //   filterOption: (input: any, option: any) => {
  //     const trimInput = input.replace(/^\s+|\s+$/g, '');
  //     if (trimInput) {
  //       return option.label.indexOf(trimInput) >= 0;
  //     } else {
  //       return true;
  //     }
  //   },
  // };
  const formRef = useRef<ProFormInstance>();
  const onStatusClick = (key: any) => {
    setTabStatus(key);
    window.sessionStorage.setItem(cacheKey, key);
    setPageSize(20);
  };
  // keepAlive页面激活钩子函数
  useActivate(() => {
    ref?.current?.reload();
  });

  // 操作按钮组件
  const SubmitBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_submit')}>
        <a
          onClick={() => {
            orderSubmitAction([record.id], reload, platform_code);
          }}
        >
          提交审核
        </a>
      </Access>
    );
  };
  // 未审核作废
  const CancelBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_nullify')}>
        <AuditOptions
          type="nullify"
          reload={() => ref?.current?.reload()}
          ids={[record.id]}
          title="作废"
          platform_code={platform_code}
        />
      </Access>
    );
  };
  // 审核后作废
  const CancelBtnA = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_nullify_approved_cn')}>
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
      <Access accessible={access.canSee('deliveryPlan_updateById')}>
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
      <Access accessible={access.canSee('deliveryPlan_update')}>
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
      <Access accessible={access.canSee('deliveryPlan_agree')}>
        <a
          onClick={() => {
            agreeAction([record.id], reload, platform_code);
          }}
        >
          审核通过
        </a>
      </Access>
    );
  };
  const RejectBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_agree')}>
        <AuditOptions
          type="refuse"
          reload={() => ref?.current?.reload()}
          ids={[record.id]}
          title="审核不通过"
          platform_code={platform_code}
        />
      </Access>
    );
  };
  const CreateBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('deliveryPlan_order_add')}>
        {!platform_code ? (
          <OrderOptions
            type="createWarehousingByPlan"
            reload={() => ref?.current?.reload()}
            ids={[record.id]}
            business_scope="CN"
            title="创建入库单"
            platform_code={platform_code}
          />
        ) : (
          <YcCreate
            title={'创建入库单'}
            reload={() => ref?.current?.reload()}
            dicList={dicList}
            dialogForm={record}
            business_scope="CN"
          />
        )}
      </Access>
    );
  };
  const HistoryBtn = ({ record }: { record: any }) => {
    return (
      <Access accessible={access.canSee('delivery_plan_approval_detail_history_cn')}>
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
      <Access accessible={access.canSee('deliveryPlan_reback')}>
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
  const columns: ProColumns<any>[] = useMemo(
    () => [
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
        dataIndex: 'category_id',
        valueType: 'select',
        request: () => pubProLineList({ business_scope: 'CN' }),
        fieldProps: { showSearch: true },
        hideInTable: true,
      },
      {
        title: '产品线',
        dataIndex: 'category_name',
        hideInSearch: true,
        width: 90,
      },
      {
        title: '商品名称',
        dataIndex: 'goods_sku_name',
        order: 5,
      },
      {
        title: 'SKU',
        dataIndex: 'stock_no',
        align: 'center',
        order: 4,
        width: 150,
      },
      {
        title: '商品条码',
        dataIndex: 'bar_code',
        align: 'center',
        hideInSearch: true,
      },
      {
        title: '生命周期',
        dataIndex: 'life_cycle',
        align: 'center',
        hideInSearch: true,
        valueEnum: dicList?.GOODS_LIFE_CYCLE || {},
      },
      {
        title: '平台',
        dataIndex: 'platform_name',
        align: 'center',
        hideInSearch: true,
        hideInTable: platform_code == 'YUN_CANG',
      },
      {
        title: '店铺',
        dataIndex: 'shop_name',
        align: 'center',
        hideInSearch: true,
        render: (_: any, record: any) => tmPopObj[record.platform_id] ?? record.shop_name,
        hideInTable: platform_code == 'YUN_CANG',
      },
      {
        title: '店铺',
        dataIndex: 'plat_store',
        hideInTable: true,
        order: 6,
        hideInSearch: platform_code == 'YUN_CANG',
        renderFormItem: (_, rest, form) => {
          return (
            <PlatStore
              initialValue={formRef?.current?.getFieldValue('plat_store')}
              isDelivery={true}
              business_scope="CN"
              back={(v: any) => {
                form.setFieldsValue({ plat_store: v });
              }}
            />
          );
        },
      },
      {
        title: '仓库类型',
        dataIndex: 'platform_warehousing_type',
        align: 'center',
        hideInSearch: true,
        hideInTable: !platform_code,
        valueEnum: dicList?.SYS_PLATFORM_WAREHOUSING_PLATFORM || {},
      },
      {
        title: '仓库',
        dataIndex: 'warehouse_id',
        align: 'center',
        order: 6,
        hideInSearch: !platform_code,
        hideInTable: !platform_code,
        render: (_: any, record: any) => record?.warehouse_name || '-',
        initialValue: [null, null],
        renderFormItem: () => (
          <SelectDependency
            valueEnum={dicList?.SYS_PLATFORM_WAREHOUSING_PLATFORM || {}}
            requestUrl={'/sc-scm/orderDeliveryWarehouse/page'}
            requestParam={'platform_code'}
            placeholder={['类型', '仓库选择']}
          />
        ),
        search: {
          transform: (v) => ({ platform_warehousing_type: v[0], warehouse_id: v[1] }),
        },
      },
      // 电商平台和云仓都不显示
      // {
      //   title: '在途数量',
      //   dataIndex: 'inTransit',
      //   hideInSearch: true,
      //   align: 'center',
      //   width: 80,
      //   render: (_, record: any) => {
      //     return [
      //       <span key="status">
      //         <Statistic
      //           value={record?.inTransit || '-'}
      //           valueStyle={{ fontWeight: 400, fontSize: '14px' }}
      //         />
      //       </span>,
      //     ];
      //   },
      // },
      {
        title: '所有供应商未交货总数',
        dataIndex: 'undelivered',
        hideInSearch: true,
        align: 'center',
        render: (_, record: any) => {
          return [
            <span key="status">
              <Statistic
                value={record?.undelivered || '-'}
                valueStyle={{ fontWeight: 400, fontSize: '14px' }}
              />
            </span>,
          ];
        },
      },
      {
        title: '计划发货数量',
        dataIndex: 'num',
        hideInSearch: true,
        align: 'center',
        width: 100,
        fixed: !platform_code ? 'right' : undefined,
        render: !platform_code
          ? (_, record: any) => {
              return [
                <DetailsTable
                  trigger={
                    <a>
                      <Statistic
                        value={record.num}
                        valueStyle={{ fontWeight: 400, fontSize: '14px', color: '#2e62e2' }}
                      />
                    </a>
                  }
                  record={record}
                  key="num"
                  id={record.id}
                  approvalStatus={record.approval_status}
                  num={record.num}
                  reload={() => ref?.current?.reload()}
                />,
                ['1', '2', '3', '7'].includes(record.approval_status) &&
                  access.canSee('deliveryPlan_distribution_warehouse') && (
                    <DetailsTableEdit
                      trigger={
                        <a className="edit-a">
                          {record.approval_status == '1' && <span>分仓</span>}
                          {['2', '3', '7'].includes(record.approval_status) && (
                            <span>修改分仓</span>
                          )}
                        </a>
                      }
                      isEdit={true}
                      record={record}
                      key="actionNum"
                      id={record.id}
                      approvalStatus={record.approval_status}
                      num={record.num}
                      reload={() => ref?.current?.reload()}
                    />
                  ),
              ];
            }
          : undefined,
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
        title: '要求平台入库时间',
        dataIndex: 'warehousing_time',
        align: 'center',
        hideInSearch: true,
        sorter: (a: any, b: any) =>
          new Date(a.warehousing_time).getTime() - new Date(b.warehousing_time).getTime(),
      },
      {
        title: '要求平台入库时间',
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
        title: '操作',
        key: 'option',
        fixed: 'right',
        width: 160,
        className: 'wrap',
        align: 'center',
        valueType: 'option',
        render: (_, record: any) => {
          const retuList: any = []
          // 1新建 2待审核 3审核通过 4审核不通过  5作废 6已生成入库单 7部分生产入库单
          if (['1'].includes(record.approval_status)) {
            retuList.push(<SubmitBtn record={record} key="submit" />)
          }
          if (['1','4','5'].includes(record.approval_status)) {
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
          if (['3'].includes(record.approval_status)) {
            retuList.push(<CreateBtn record={record} key="create" />)
            retuList.push(<UpdateBtn record={record} key="update" />)
            retuList.push(<CancelBtnA record={record} key="cancel" />)
          }

          if (['6'].includes(record.approval_status)) {
            retuList.push(
              <Access accessible={access.canSee('deliveryPlan_stockView_cn')} key="stock">
                <StockList
                  dicList={dicList}
                  key="stock"
                  id={record.id}
                  business_scope="CN"
                  plat={platform_code === 'YUN_CANG' ? '云仓' : null}
                />
              </Access>
            )
          }
          if (['7'].includes(record.approval_status)) {
            retuList.push(<UpdateBtn record={record} key="update" />)
            // 云仓 创建
            if (platform_code) {
              retuList.unshift(<CreateBtn record={record} key="create" />);
            }
            retuList.push(
              <Access accessible={access.canSee('deliveryPlan_stockView_cn')} key="stock">
                <StockList
                  dicList={dicList}
                  key="stock"
                  id={record.id}
                  business_scope="CN"
                  plat={platform_code === 'YUN_CANG' ? '云仓' : null}
                />
              </Access>
            )
          }
          if (['2','3','4','5','6','7'].includes(record.approval_status)) {
            retuList.push(<HistoryBtn record={record} key="history" />)
          }
          retuList.push(
            <Access key="scm_deliverPlan_log" accessible={access.canSee('scm_deliverPlan_log_cn')}>
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
    ],
    [platform_code, dicList],
  );
  // 自定义列 配置
  const customKey = window.location.pathname.replace(/\/$/, '') + platform_code; // 兼容旧的key
  const ColumnSet = useCustomColumnSet(columns, 3000, platform_code ,3, [], customKey);
  // 导出excel
  const downLoadExcel = async () => {
    if (selectRows.length) {
      exportForm.selected_order_id = selectRows;
    }
    exportForm.export_config = { columns: ColumnSet.customExportConfig };
    setDownLoadPlans(true);
    const res: any = !platform_code
      ? await exportDeliveryPlanCn(exportForm)
      : await exportDeliveryPlanYunCang(exportForm);
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
      let fileName = `国内发货计划导出.xls`;
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
  useEffect(() => {
    formRef?.current?.submit();
  }, [tabStatus, pageSize, platform_code]);
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      fixedHeader
      tabActiveKey={platform_code ? '2' : '1'}
      className="pubPageTabs"
      tabList={topTabList}
      onTabChange={(key: any) => {
        setPageSize(20);
        setPlatCode(key === '2' ? 'YUN_CANG' : null);
        setTabStatus('2');
      }}
    >
      <Audit isModalVisible={auditShow} handleClose={() => setAuditShow(false)} id={curId} />
      <Dialog
        pT={platform_code ? '2' : '1'}
        isModalVisible={isModalVisible}
        handleClose={handleClose}
        dicList={dicList}
        dialogForm={
          items?.id
            ? {
                ...items,
                platform_id: !platform_code
                  ? {
                      value: items?.platform_id,
                      label: items?.platform_name,
                    }
                  : items?.platform_id,
                shop_id: {
                  value: items?.shop_id,
                  label: items?.shop_name,
                },
                storage: !platform_code
                  ? null
                  : [items?.platform_warehousing_type, items?.warehouse_id],
              }
            : items
        }
        business_scope="CN"
      />
      <div className="status-tab">
        <Tabs
          defaultActiveKey="2"
          items={topSTabList}
          onChange={onStatusClick}
          activeKey={tabStatus}
        />
      </div>
      <ProTable<TableListItem>
        columns={columns}
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
        sticky={{ offsetHeader: 48, offsetScroll: 0 }}
        defaultSize={'small'}
        {...ColumnSet}
        actionRef={ref}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        rowSelection={
          access.canSee('deliveryPlan_submit') ||
          access.canSee('deliveryPlan_agree') ||
          access.canSee('deliveryPlan_nullify') ||
          access.canSee('deliveryPlan_order_add')
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
            <Access key="approval" accessible={access.canSee('deliveryPlan_submit')}>
              <Button
                disabled={!selectRows.length}
                onClick={() => {
                  if (selectedItems.every((item: any) => item.approval_status == '1')) {
                    orderSubmitAction(selectRows, reload, platform_code);
                  } else {
                    pubAlert('只有新建状态才可以提交审核,请重新选择发货计划！');
                  }
                }}
              >
                提交审核
              </Button>
            </Access>
            <Access key="access" accessible={access.canSee('deliveryPlan_agree')}>
              <Button
                key="access"
                disabled={!selectRows.length}
                onClick={() => {
                  if (selectedItems.every((item: any) => item.approval_status == '2')) {
                    agreeAction(selectRows, reload, platform_code);
                  } else {
                    pubAlert('只有待审核状态才可以审核,请重新选择发货计划！');
                  }
                }}
              >
                审核通过
              </Button>
            </Access>
            <Access key="reject" accessible={access.canSee('deliveryPlan_agree')}>
              <AuditOptions
                type="refuse"
                reload={() => ref?.current?.reload()}
                ids={selectRows}
                selectData={selectedItems}
                title="审核不通过"
                approval_status={['2']}
                isOptions
                platform_code={platform_code}
              />
            </Access>
            {/*审核前作废*/}
            <Access
              accessible={
                access.canSee('deliveryPlan_nullify') && [1, 4].includes(Number(tabStatus))
              }
            >
              <AuditOptions
                type="nullify"
                reload={() => ref?.current?.reload()}
                ids={selectRows}
                selectData={selectedItems}
                title="批量作废"
                triggerBtn
                platform_code={platform_code}
              />
            </Access>
            {/*审核后作废*/}
            <Access
              accessible={
                access.canSee('deliveryPlan_nullify_approved_cn') && [3].includes(Number(tabStatus))
              }
            >
              <AuditOptions
                type="nullifyApproved"
                reload={() => ref?.current?.reload()}
                ids={selectRows}
                selectData={selectedItems}
                title="批量作废"
                triggerBtn
                platform_code={platform_code}
              />
            </Access>
            <Access key="create" accessible={access.canSee('deliveryPlan_order_add')}>
              <OrderOptions
                type="createWarehousingByPlan"
                reload={() => ref?.current?.reload()}
                ids={selectRows}
                selectData={selectedItems}
                title="创建入库单（国内）"
                approval_status={['3', '7']}
                business_scope="CN"
                isOptions
                platform_code={platform_code}
              />
            </Access>
            <Access accessible={access.canSee('deliveryPlan_order_add_merge') && platform_code == 'YUN_CANG'}>
              <OrderOptions
                isMerge
                type="createWarehousingByPlan"
                reload={() => ref?.current?.reload()}
                ids={selectRows}
                selectData={selectedItems}
                title="合并创建入库单"
                approval_status={['3', '7']}
                business_scope="CN"
                isOptions
                platform_code={platform_code}
              />
            </Access>
          </Space>
        }
        toolBarRender={() => [
          <Space key="space">
            <Access key="add" accessible={access.canSee('deliveryPlan_add')}>
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
            <Access key="import" accessible={access.canSee('deliveryPlan_add')}>
              <ImportBtn
                btnText={'导入发货计划'}
                reload={() => ref?.current?.reload()}
                importForm={{
                  business_scope: 'CN',
                  platform_code,
                }}
                business_type={'DELIVERY_PLAY_IMPORT'}
                templateCode={platform_code === 'YUN_CANG' ? 'DELIVERY_PLAN_CN_YUNCANG' : 'DELIVERY_PLAN_CN'}
                templateForm={['',platform_code]}
                importHandle={'/sc-scm/deliveryPlan/import'}
              />
            </Access>
            <Access key="deliveryPlan_export" accessible={access.canSee('deliveryPlan_export_cn')}>
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

export default WithCommonHandle(Home);

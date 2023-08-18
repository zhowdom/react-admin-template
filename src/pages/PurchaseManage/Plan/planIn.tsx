import { PageContainer } from '@ant-design/pro-layout';
import { connect, useActivate, history } from 'umi';
import React, { useState, useRef } from 'react';
import { Button, Space, Upload, Spin, Popover, Tooltip } from 'antd';
import {
  UploadOutlined,
  LinkOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import { ProFormInstance } from '@ant-design/pro-form';
import {
  getInPlanList,
  planBatchImport,
  exportPurchasePlan,
  statusCount,
} from '@/services/pages/purchasePlan';
import { baseFileUpload, customColumnDelete, customColumnSet } from '@/services/base';
import { pubBeforeUpload, pubGetColumnsState, pubRefreshColumnList, pubBlobDownLoad } from '@/utils/pubConfirm';
import { pubConfig, pubMsg, pubFilter, pubAlert } from '@/utils/pubConfig';
import { pubDownloadSysImportTemplate } from '@/utils/pubConfirm';
import ProductLine from '@/components/PubForm/ProductLine/OnlyProLine';
import { useAccess, Access } from 'umi';
import AddPlanIn from './Dialog/AddPlanIn';
import AduitNo from './Dialog/AduitNo';
import CancelPlan from './Dialog/CancelPlan';
// import ChoseVendor from './Dialog/ChoseVendor';
import AuditList from './Dialog/AuditList';
import WeekTimeSearch from '@/components/PubForm/WeekTimeSearch';
import PubWeekRender from '@/components/PubWeekRender';
import PlatStore from '@/components/PubForm/PlatStore';
import { addOrderOne_IN } from './configFn';
import Submit from './Dialog/Submit';
import AuditOk from './Dialog/AuditOk';
import AuditBack from './Dialog/AuditBack';
import OrderModal from './Dialog/OrderModal';
import { useModel } from 'umi';
import { computedColumnConfig, scrollByColumn } from '@/utils/filter';
import './style.less';

const Account = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const [selectRows, setSelectRows] = useState([]);
  const [selectDataRows, setSelectDataRows] = useState([]);
  const [upLoading, setUpLoading] = useState(false);
  const [downLoading, setDownLoading] = useState(false);
  const [downLoadPlans, setDownLoadPlans] = useState(false);
  const [tabList, setTabList] = useState([]);
  const [tabStatus, setTabStatus] = useState<any>('2');
  const ref: any = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();
  const [exportForm, setExportForm] = useState<any>({});
  const [pageSize, setPageSize] = useState<any>(20);
  // 添加弹窗实例
  const addPlanModel = useRef();
  // const choseVendorModel = useRef();
  const auditListModel = useRef();
  // 新增弹窗 编辑弹窗
  const addPlanModelOpen: any = (row: any) => {
    const data: any = addPlanModel?.current;
    data.open(row?.id, row?.customType,row?.ordered_qty);
  };
  // 审批记录
  const auditListModelOpen: any = (id?: any) => {
    const data: any = auditListModel?.current;
    data.open(id);
  };
  // 生成多供应商采购单
  // const choseVendorModelOpen: any = (ids?: any) => {
  //   if (!ids.length) return pubMsg('请选择要操作的数据！');
  //   // const timeList = [...new Set(selectDataRows.map((v: any) => v.vendor_shipment_time))];
  //   // if (timeList.length > 1)
  //   //   return pubAlert('选择数据的 “出库时间(货好时间)” 不同，不能一起生成采购单！');
  //   const allStatus = [...new Set(selectDataRows.map((v: any) => v.status))].join(',');
  //   if (
  //     allStatus.search('1') > -1 ||
  //     allStatus.search('2') > -1 ||
  //     allStatus.search('3') > -1 ||
  //     allStatus.search('6') > -1 ||
  //     allStatus.search('7') > -1
  //   )
  //     return pubAlert('只有审批通过并且未下单完的才可以生成采购单,请重新选择采购计划！');
  //   const data: any = choseVendorModel?.current;
  //   data.open(ids.join(','));
  // };
  // 弹窗关闭
  const modalClose = (data: any) => {
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
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
    statusCountAction();
    const postData = {
      ...params,
      business_scope: 'IN', //业务范畴
      status: tabStatus == 'all' ? null : tabStatus, //状态
      begin_time: params?.time?.[0] ? params?.time?.[0] + ' 00:00:00' : null, //开始日期
      end_time: params?.time?.[1] ? params?.time?.[1] + ' 23:59:59' : null, //结束日期
      current_page: tabStatus == 2 ? 1 : params?.current,
      page_size: tabStatus == 2 ? 10000 : params?.pageSize,
      platform_id: params.plat_store ? params.plat_store?.[0] : null, // 平台
      shop_id: params.plat_store ? params.plat_store?.[1] : null, // 店铺
      required_order_begin_time: params?.cycle_time?.[1] || null, //下单时间-开始
      required_order_end_time: params?.cycle_time?.[2] || null, //下单时间-结束
      cycle_time: params?.cycle_time?.[0] || null,
    };
    setExportForm(postData);
    const res = await getInPlanList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    setSelectRows([]);
    setSelectDataRows([]);
    ref?.current?.clearSelected();
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 切换tabs时
  const changeTabs = async (key: any) => {
    setTabStatus(key == 'all' ? null : key);
    setPageSize(20);
  };
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });
  // 导入 采购计划
  const handleUpload = async (data: any) => {
    console.log(data);
    // loading开始
    setUpLoading(true);
    const res = await baseFileUpload({
      file: data.file,
      business_type: 'BATCH_IMPORT_PURCHASE_PLAN',
    });
    if (res?.code != pubConfig.sCode) {
      pubAlert(res?.message);
      setUpLoading(false);
      return;
    }
    const resData = await planBatchImport({
      business_scope: 'IN',
      sysFile: res.data[0],
    });
    setUpLoading(false);
    pubBlobDownLoad(resData, '导入结果', () => {
      ref?.current?.reload();
    });
  };
  // 下载导入模板
  const downLoadTemp = async () => {
    setDownLoading(true);
    pubDownloadSysImportTemplate('PURCHASE_PLAN_IN');
    setDownLoading(false);
  };

  // 表格配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '采购计划编号',
      dataIndex: 'plan_no',
      width: 130,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      hideInSearch: true,
      width: 100,
      render: (_: any, record: any) => {
        return pubFilter(dicList.PURCHASE_PLAN_STATUS, record.status);
      },
    },
    {
      title: '产品线',
      dataIndex: 'category_name',
      width: 150,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '产品线',
      dataIndex: 'category_ids',
      hideInTable: true,
      renderFormItem: (_, rest, form) => {
        return (
          <ProductLine
            business_scope="IN"
            back={(v: any) => {
              form.setFieldsValue({ category_ids: v });
            }}
          />
        );
      },
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      width: 200,
    },
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      width: 140,
      align: 'center',
    },
    {
      title: 'SKU销售状态',
      dataIndex: 'sales_status',
      align: 'center',
      hideInSearch: true,
      width: 80,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.LINK_MANAGEMENT_SALES_STATUS, record.sales_status) || '-';
      },
    },
    {
      title: '平台',
      dataIndex: 'platform_code',
      width: '120px',
      align: 'center',
      hideInSearch: true,
      valueEnum: props?.dicList?.SYS_PLATFORM_NAME,
      render: (_: any, record: any) => record.platform_name || '-',
    },
    {
      title: '店铺',
      dataIndex: 'plat_store',
      hideInTable: true,
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
      title: '店铺',
      dataIndex: 'shop_name',
      hideInSearch: true,
      align: 'center',
      width: 180,
    },
    {
      title: '所有供应商未交货总数',
      dataIndex: 'undelivered_qty',
      width: 100,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '在途数量',
      dataIndex: 'transit_qty',
      width: 100,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '在库数量',
      dataIndex: 'in_stock_qty',
      width: 100,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '计划下单数量',
      dataIndex: 'num',
      width: 100,
      align: 'center',
      hideInSearch: true,
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
      title: '未下单数量',
      dataIndex: 'no_order_qty',
      width: 100,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: (
        <>
          下单中数量
          <Tooltip placement="top" title="已下采购单但未签约数量">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'under_qty',
      width: 110,
      align: 'center',
      hideInSearch: true,
      hideInTable: ['1', '2', '3', '4', '7'].includes(tabStatus),
    },
    {
      title: (
        <>
          已下单数量
          <Tooltip placement="top" title="已下采购单且已签约数量">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'ordered_qty',
      width: 110,
      align: 'center',
      hideInSearch: true,
      hideInTable: ['1', '2', '3', '4', '7'].includes(tabStatus),
    },
    {
      title: '要求下单时间(周次)',
      dataIndex: 'cycle_time',
      width: 180,
      align: 'center',
      // hideInSearch: true,
      // render: (_: any, record: any) => {
      //   return `${record.required_order_begin_time} - ${record.required_order_end_time}`;
      // },
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
            begin: record.required_order_begin_time,
            end: record.required_order_end_time,
          }}
        />
      ),
    },
    {
      title: '供应商出货时间(货好时间)',
      dataIndex: 'vendor_shipment_time',
      width: 130,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '要求入库时间',
      dataIndex: 'expected_in_storage_time',
      width: 130,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '采购计划创建时间',
      dataIndex: 'create_time',
      width: 150,
      align: 'center',
      hideInSearch: true,
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
      dataIndex: 'time',
      valueType: 'dateRange',
      hideInTable: true,
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
      width: 220,
      fixed: 'right',
      align: 'center',
      valueType: 'option',
      className: 'wrap',
      render: (_, row: any) => {
        const renderList = [];
        if (row.status == 1) {
          renderList.push(
            <Access key="submit" accessible={access.canSee('purchase_plan_submit_in')}>
              <Submit reload={() => ref?.current?.reload()} id={row.id} name="提交审核" />
            </Access>,
            <Access key="nullify" accessible={access.canSee('purchase_plan_cancel_in')}>
              <CancelPlan reload={() => ref?.current?.reload()} id={row.id} name="作废" />
            </Access>,
            <Access key="editPlan" accessible={access.canSee('purchase_plan_edit_in')}>
              <a
                onClick={() => {
                  addPlanModelOpen(row);
                }}
              >
                编辑
              </a>
            </Access>,
          );
        }
        if (row.status == 2) {
          renderList.push(
            <Access key="auditOk" accessible={access.canSee('purchase_approval_in')}>
              <AuditOk reload={() => ref?.current?.reload()} id={row.id} name="审核通过" />
            </Access>,
            <Access key="auditNo" accessible={access.canSee('purchase_approval_in')}>
              <AduitNo reload={() => ref?.current?.reload()} id={row.id} name="审核不通过" />
            </Access>,
            <Access key="reback" accessible={access.canSee('purchase_reback_in')}>
              <AuditBack reload={() => ref?.current?.reload()} id={row.id} trigger={<a>撤回</a>} />
            </Access>,
          );
        }
        if (row.status == 3) {
          renderList.push(
            <Access key="editPlan" accessible={access.canSee('purchase_plan_edit_in')}>
              <a
                onClick={() => {
                  addPlanModelOpen(row);
                }}
              >
                编辑
              </a>
            </Access>,

            <Access key="nullify" accessible={access.canSee('purchase_plan_cancel_in')}>
              <CancelPlan reload={() => ref?.current?.reload()} id={row.id} name="作废" />
            </Access>,
          );
        }
        if (row.status == 4 || row.status == 5) {
          renderList.push(
            <Access key="editPlan" accessible={access.canSee('purchase_plan_update_in')}>
              <a
                onClick={() => {
                  row.customType = 'update';
                  addPlanModelOpen(row);
                }}
              >
                修改
              </a>
            </Access>,
          );
        }
        if (
          (row.status == 4 || row.status == 5) &&
          row?.sales_status != 3 &&
          row?.sales_status != 4
        ) {
          renderList.push(
            <Access key="createOne" accessible={access.canSee('purchase_plan_create_in_batch')}>
              <a
                onClick={() => {
                  addOrderOne_IN([row.id], []);
                }}
                key="addOrderOne_IN"
              >
                生成采购单
              </a>
            </Access>,
          );
        }
        if (row.status == 4) {
          renderList.push(
            <Access key="nullify" accessible={access.canSee('purchase_plan_cancel_approved_in')}>
              <CancelPlan
                reload={() => ref?.current?.reload()}
                id={row.id}
                name="作废"
                type="batch"
              />
            </Access>,
          );
        }
        if (row.status == 7 && !row?.stock_up_advice_code) {
          renderList.push(
            <Access key="editPlan" accessible={access.canSee('purchase_plan_edit_in')}>
              <a
                onClick={() => {
                  addPlanModelOpen(row);
                }}
              >
                编辑
              </a>
            </Access>,
          );
        }
        if (row.status != 1) {
          renderList.push(
            // /purchasePlan/approvalDetailHistory
            <Access key="auditList" accessible={access.canSee('purchase_plan_history_in')}>
              <a
                onClick={() => {
                  auditListModelOpen(row.id);
                }}
              >
                审批记录
              </a>
            </Access>,
            <Access
              key="order"
              accessible={
                (row.status == 5 || row.status == 6) && access.canSee('purchase_plan_order_in')
              }
            >
              {/*查看采购单*/}
              <OrderModal dicList={dicList} id={row.id} />
            </Access>,
          );
        }
        return renderList;
      },
    },
  ];
  // 列配置
  const defaultScrollX = 2300;
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
  const downLoadExcel = async () => {
    if (selectRows.length) {
      exportForm.selected_order_id = selectRows;
    }
    exportForm.export_config = { columns: computedColumnConfig(columns, columnsState) };
    setDownLoadPlans(true);
    const res: any = await exportPurchasePlan(exportForm);
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
      let fileName = `采购计划导出.xls`;
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
  return (
    <>
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
        <Spin spinning={upLoading} tip="导入中...">
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
            actionRef={ref}
            params={{ tabStatus }}
            formRef={formRef}
            tableAlertRender={false}
            tableAlertOptionRender={false}
            request={getListAction}
            rowSelection={
              access.canSee('purchase_plan_submit_in_batch') ||
              access.canSee('purchase_approval_in_batch') ||
              access.canSee('purchase_plan_cancel_in_batch') ||
              access.canSee('purchase_plan_create_in_batch') ||
              access.canSee('purchase_plan_cancel_approved_in_batch')
                ? {
                    fixed: true,
                    defaultSelectedRowKeys: selectRows,
                    onChange: (selectedRowKeys: any, selectedData: any) => {
                      setSelectRows(selectedRowKeys);
                      setSelectDataRows(selectedData);
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
                          customColumnDelete({ customColumnId: customColumnSetting?.id }).then(
                            () => {
                              pubRefreshColumnList(initialState, setInitialState);
                            },
                          );
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
            search={{ className: 'light-search-form', defaultCollapsed: false, labelWidth: 114, }}
            dateFormatter="string"
            headerTitle={
              <Space key="space" wrap>
                <Access key="approval" accessible={access.canSee('purchase_plan_submit_in_batch')}>
                  <Submit
                    reload={() => ref?.current?.reload()}
                    selectRows={selectRows}
                    name="提交审核"
                  />
                </Access>
                <Access key="access" accessible={access.canSee('purchase_approval_in_batch')}>
                  <AuditOk
                    reload={() => ref?.current?.reload()}
                    selectRows={selectRows}
                    name="审核通过"
                  />
                </Access>
                <Access key="reject" accessible={access.canSee('purchase_approval_in_batch')}>
                  <AduitNo
                    reload={() => ref?.current?.reload()}
                    selectRows={selectRows}
                    name="审核不通过"
                  />
                </Access>
                {/*新建、审核不通过 作废*/}
                <Access
                  key="delete"
                  accessible={
                    access.canSee('purchase_plan_cancel_in_batch') &&
                    [1, 3].includes(Number(tabStatus))
                  }
                >
                  <CancelPlan
                    reload={() => ref?.current?.reload()}
                    selectRows={selectRows}
                    name="批量作废"
                  />
                </Access>
                {/*审核通过 作废*/}
                <Access
                  key="delete_approved"
                  accessible={
                    access.canSee('purchase_plan_cancel_approved_in_batch') &&
                    [4].includes(Number(tabStatus))
                  }
                >
                  <CancelPlan
                    reload={() => ref?.current?.reload()}
                    selectRows={selectRows}
                    name="批量作废"
                    type="batch"
                  />
                </Access>
                <Access key="turnOne" accessible={access.canSee('purchase_plan_create_in_batch')}>
                  <Button
                    ghost
                    type="primary"
                    onClick={() => {
                      addOrderOne_IN(selectRows, selectDataRows);
                    }}
                  >
                    生成采购单(单供应商)
                  </Button>
                </Access>
                {/* <Access key="turnList" accessible={access.canSee('purchase_plan_create_in_batch')}>
                  <Button
                    ghost
                    type="primary"
                    onClick={() => {
                      choseVendorModelOpen(selectRows);
                    }}
                  >
                    生成采购单(多供应商)
                  </Button>
                </Access> */}
              </Space>
            }
            toolBarRender={() => [
              <Space key="space">
                <Access key="addPlan" accessible={access.canSee('purchase_plan_add_in')}>
                  <Button
                    type="primary"
                    onClick={() => {
                      addPlanModelOpen();
                    }}
                  >
                    添加商品采购计划
                  </Button>
                </Access>
                <Access
                  key="importPlan"
                  accessible={access.canSee('purchase_download_template_in')}
                >
                  <Popover
                    key="down"
                    title={'需要下载导入模板 ?'}
                    content={
                      <Button
                        key="down"
                        icon={<LinkOutlined />}
                        onClick={() => {
                          downLoadTemp();
                        }}
                        type="link"
                        disabled={downLoading}
                        loading={downLoading}
                      >
                        下载导入模板
                      </Button>
                    }
                  >
                    <Upload
                      beforeUpload={(file: any) =>
                        pubBeforeUpload({
                          file,
                          acceptType: ['xls', 'xlsx'], // 上传限制 非必填
                          // maxSize:20, // 非必填
                          // maxCount: 1, // 非必填
                          // acceptMessage:"上传格式不对，请检查上传文件", // 非必填
                        })
                      }
                      accept=".xls,.xlsx" // 打开时，默认显示的文件类型 非必填
                      key="upLoad"
                      showUploadList={false}
                      customRequest={handleUpload}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        type="primary"
                        disabled={upLoading}
                        loading={upLoading}
                        ghost
                      >
                        导入采购计划
                      </Button>
                    </Upload>
                  </Popover>
                </Access>
                <Access key="order" accessible={access.canSee('purchase_plan_export_in')}>
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
                    采购计划导出
                  </Button>
                </Access>
              </Space>,
            ]}
            rowClassName={(record: any) => {
              // clearance_period--》是否清仓期的sku 1是
              if (record?.clearance_period == '1' && ['1','2','3'].includes(String(record?.status))) {
                return 'row-cancel';
              }
              return '';
            }}
          />
          <AddPlanIn addPlanModel={addPlanModel} handleClose={modalClose} />
          {/*生成采购单(多供应商)*/}
          {/*<ChoseVendor choseVendorModel={choseVendorModel} handleClose={modalClose} />*/}
          <AuditList auditListModel={auditListModel} handleClose={modalClose} />
        </Spin>
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(
  ({ account, common }: { account: Record<string, unknown>; common: Record<string, unknown> }) => ({
    account,
    common,
  }),
)(Account);
export default ConnectPage;

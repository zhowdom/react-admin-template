import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef, useState } from 'react';
import { Access, connect, history, useAccess } from 'umi';
import { Button, DatePicker, Space, Spin } from 'antd';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { pubConfig, pubModal, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import { add, pubGetStoreList, pubBlobDownLoad, pubProLineList } from '@/utils/pubConfirm';
import {
  getPages,
  exportExcel,
  reCalc,
  exportStockupDetail,
  stockUpAdviceApprovePass,
} from '@/services/pages/stockUpIn/stockUp/suggestList';
import moment from 'moment';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import AddSuggest from './Dialog/AddSuggest';
import AduitNo from './Dialog/AduitNo';
import CancelPlan from './Dialog/CancelPlan';
import { getShopSkuCode } from '@/services/base';
import { pubAllLinks } from '@/utils/pubConfirm';
import { priceValue,NumberValue } from '@/utils/filter';
import { uniqBy } from 'lodash';

/*备货建议*/
const cacheKey = 'suggestListPageTab';
const cacheTab = window.sessionStorage.getItem(cacheKey);
const Page = (props: any) => {
  const { common } = props;
  const [tabActiveKey, tabActiveKeySet] = useState(cacheTab || 'Pending');
  const [queryParams, queryParamsSet] = useState({});
  const [selectedRowKeys, selectedRowKeysSet] = useState<React.Key[]>([]);
  const [selectedRowData, selectedRowDataSet] = useState<React.Key[]>([]);
  const [exporting, exportingSet] = useState(false);
  const [allLink, setAllLink] = useState<any[]>([]);
  const [allSku, setAllSku] = useState<any[]>([]);

  const access = useAccess();
  const ref = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState({
    downLoading: false,
    container: false,// 重算
    autidOking: false,// 审批通过
  });
  // 添加弹窗实例
  const addSuggestModel = useRef();
  const aduitNoModel = useRef();
  const cancelPlanModel = useRef(); // 作废计划

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

  // 获取下拉数据
  const getOptions = async (): Promise<any> => {
    const link: any = await pubAllLinks()
    const sku: any = await getShopSkuCode({
      sku_type: '1',
      business_scope: 'IN',
    });
    // console.log(link);
    // console.log(sku);
    setAllLink(link);
    const newSku = sku ? sku.map((val: any) => ({
      label: `${val?.sku_name}(${val?.shop_sku_code})`,
      value: `${val?.shop_sku_code}`,
    })) : []; // 去重shop_sku_code 因为同一个SKU可能在不同的店铺，是允许shop_sku_code重复的
    // console.log(newSku);
    setAllSku(uniqBy(newSku, 'value'));
  };

  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      status: params?.status1 && tabActiveKey != 'Pending' ? params?.status1 : params?.status,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    // 状态,多个逗号分隔。Pending待执行;Executed已执行;Voided已作废
    queryParamsSet(postData);
    const res = await getPages(postData);
    // 配置stick的table搜索后出现双滚动条问题
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0)
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    selectedRowKeysSet([]);
    selectedRowDataSet([]);
    getOptions();
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // keepAlive页面激活钩子函数
  useActivate(() => {
    ref?.current?.reload();
  });
  // 作废备货建议
  const cancelRow = async (rowData: any, type: string, modalType: string) => {
    if (!rowData.length) return pubMsg('请选择要操作的数据');
    const newD = type == 'one' ? rowData : rowData.map((v: any) => v.stock_up_advice_code)
    console.log(newD)
    const data: any = aduitNoModel?.current;
    data.open(newD, modalType,'fromPage');
  };
  // 作废计划
  const cancelPlanOpen = async (rowData: any, type: string) => {
    if (!rowData.length) return pubMsg('请选择要操作的数据');
    const newD = type == 'one' ? rowData : rowData.map((v: any) => v.stock_up_advice_code)
    console.log(newD)
    const data: any = cancelPlanModel?.current;
    data.open(newD);
  };
  // 重算
  const reCalcByCode = async (record: Record<string, any>) => {
    pubModal(`确认重算所选 (备货建议号: ${record.stock_up_advice_code})?`)
      .then(async () => {
        setLoading((values: any) => {
          return { ...values, container: true };
        });
        const res = await reCalc({ code: record.stock_up_advice_code });
        setLoading((values: any) => {
          return { ...values, container: false };
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('重算成功', 'success');
          ref?.current?.reload();
        }
      })
      .catch(() => {
        console.log('点了取消');
      });
  };
  // 审批通过
  const autidOkOpen = async (rowData: any, type: string) => {
    if (!rowData.length) return pubMsg('请选择要操作的数据');
    const newD = type == 'one' ? rowData : rowData.map((v: any) => v.stock_up_advice_code)
    pubModal(`确认选中的备货建议 审批通过?`)
      .then(async () => {
        setLoading((values: any) => {
          return { ...values, autidOking: true };
        });
        const res = await stockUpAdviceApprovePass({ code: newD });
        setLoading((values: any) => {
          return { ...values, autidOking: false };
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功', 'success');
          ref?.current?.reload();
        }
      })
      .catch(() => {
        console.log('点了取消');
      });
  };
  // 新建备货建议
  const addSugOpen = () => {
    const data: any = addSuggestModel?.current;
    data.open();
  };

  // 表格配置
  const columns: ProColumns<any>[] = [
    {
      title: 'NO.',
      dataIndex: 'index',
      valueType: 'index',
      width: 40,
      align: 'center',
    },
    {
      title: '备货建议号',
      dataIndex: 'stock_up_advice_code',
      width: 110,
      order: 20,
    },
    {
      title: '产品线',
      dataIndex: 'category_id',
      align: 'center',
      valueType: 'select',
      request: () => pubProLineList({ business_scope: 'IN' }),
      fieldProps: { showSearch: true },
      hideInTable: true,
      order: 18,
    },
    {
      title: '产品线',
      dataIndex: 'category_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '链接名称',
      dataIndex: 'link_name',
      hideInSearch: true,
      width: 240,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      hideInSearch: true,
      width: 240,
    },
    {
      title: 'SPU',
      dataIndex: 'link_management_id',
      hideInTable: true,
      width: 240,
      order: 17,
      valueType: 'select',
      fieldProps: {
        ...selectProps,
        options: allLink
      },
    },
    {
      title: 'SKU',
      dataIndex: 'shop_sku',
      hideInTable: true,
      width: 240,
      order: 16,
      valueType: 'select',
      fieldProps: {
        ...selectProps,
        options: allSku
      },
    },
    {
      title: '销售状态',
      dataIndex: 'sales_status',
      align: 'center',
      width: 100,
      order: 15,
      valueType: 'select',
      valueEnum: common?.dicList?.LINK_MANAGEMENT_SALES_STATUS,
    },
    {
      title: '店铺',
      dataIndex: 'shop_id',
      request: () => pubGetStoreList({ business_scope: 'IN' }),
      fieldProps: { showSearch: true },
      valueType: 'select',
      hideInTable: true,
      order: 19,
    },
    {
      title: '店铺',
      dataIndex: 'shop_name',
      hideInSearch: true,
      width: 170,
    },
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku',
      align: 'center',
      hideInSearch: true,
      width: 90,
    },
    {
      title: '备货建议周期',
      dataIndex: 'cycle_time',
      valueType: 'dateRange',
      // initialValue: [moment().subtract(1, 'months'), moment()],
      renderFormItem: () => {
        return (
          // @ts-ignore
          <DatePicker.RangePicker
            placeholder={['开始', '结束']}
            picker={'week'}
            ranges={
              tabActiveKey == 'Pending'
                ? {
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  下周: [
                    moment().add(1, 'w').startOf('week'),
                    moment().add(1, 'w').endOf('week'),
                  ],
                  未来2周: [
                    moment().add(1, 'w').startOf('week'),
                    moment().add(3, 'w').endOf('week'),
                  ],
                  未来3周: [
                    moment().add(1, 'w').startOf('week'),
                    moment().add(4, 'w').endOf('week'),
                  ],
                  未来6周: [
                    moment().add(1, 'w').startOf('week'),
                    moment().add(7, 'w').endOf('week'),
                  ],
                }
                : {
                  本周: [moment().startOf('week'), moment().endOf('week')],
                  上周: [
                    moment().subtract(1, 'w').startOf('week'),
                    moment().subtract(1, 'w').endOf('week'),
                  ],
                  过去2周: [
                    moment().subtract(3, 'w').startOf('week'),
                    moment().subtract(1, 'w').endOf('week'),
                  ],
                  过去3周: [
                    moment().subtract(4, 'w').startOf('week'),
                    moment().subtract(1, 'w').endOf('week'),
                  ],
                  过去6周: [
                    moment().subtract(7, 'w').startOf('week'),
                    moment().subtract(1, 'w').endOf('week'),
                  ],
                }
            }
          />
        );
      },
      search: {
        transform: (v: any) => {
          return {
            cycle_time: `${moment(v[0]).startOf('week').format('YYYY-MM-DD')},${moment(v[1])
              .endOf('week')
              .format('YYYY-MM-DD')}`,
          };
        },
      },
      render: (dom: any, record: any) => record.cycle_time,
      width: 110,
      align: 'center',
    },
    {
      title: '完结状态',
      dataIndex: 'status1',
      align: 'center',
      hideInTable: true,
      hideInSearch: tabActiveKey == 'Pending' || tabActiveKey == 'Wait_Approval',
      valueType: 'select',
      valueEnum: {
        Executed: '已完成',
        Voided: '已作废',
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      hideInSearch: true,
      valueType: 'select',
      valueEnum: common?.dicList?.IN_STOCK_UP_ADVICE_STATUS,
    },
    {
      title: '来源',
      dataIndex: 'data_source',
      align: 'center',
      hideInSearch: true,
      width: 100,
      valueType: 'select',
      valueEnum: {
        0: '系统自动',
        1: '手工创建',
      },
    },
    {
      title: '操作',
      width: tabActiveKey == 'Pending' ? 230 : 190,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record: any) => {
        const renList = [];
        if (tabActiveKey == 'Pending' && access.canSee('suggestList_detail')) {
          renList.push(
            <a
              onClick={() => {
                history.push(
                  `/stock-up-in/stockUp/suggest-detail?code=${record.stock_up_advice_code}`,
                );
              }}
              key="detail"
            >
              备货
            </a>
          );
        }
        if (tabActiveKey == 'Pending' && access.canSee('suggestList_advice_again')) {
          renList.push(
            <a
              onClick={() => {
                reCalcByCode(record);
              }}
              key="reCalc"
            >
              重算
            </a>
          );
        }
        if (tabActiveKey == 'Wait_Approval' && access.canSee('scm_suggestList_autidOk')) {
          renList.push(
            <a
              onClick={() => {
                autidOkOpen([record.stock_up_advice_code], 'one');
              }}
              key="scm_suggestList_autidOk"
            >
              通过
            </a>
          );
        }
        if (tabActiveKey == 'Wait_Approval' && access.canSee('scm_suggestList_autidNo')) {
          renList.push(
            <a
              onClick={() => {
                cancelRow([record.stock_up_advice_code], 'one', 'TH');
              }}
              key="scm_suggestList_autidNo"
            >
              退回
            </a>
          );
        }
        if (tabActiveKey == 'Wait_Approval' && access.canSee('scm_suggestList_return')) {
          renList.push(
            <a
              onClick={() => {
                cancelRow([record.stock_up_advice_code], 'one', 'CH');
              }}
              key="scm_suggestList_return"
            >
              撤回
            </a>
          );
        }
        if (access.canSee('suggestList_detail_only')) {
          renList.push(
            <a
              onClick={() => {
                history.push(
                  `/stock-up-in/stockUp/suggest-detail?code=${record.stock_up_advice_code}&readonly=true`,
                );
              }}
              key="detailonly"
            >
              查看
            </a>
          );
        }
        if (tabActiveKey == 'Pending' && access.canSee('suggestList_cancel')) {
          renList.push(
            <a
              onClick={() => {
                cancelRow([record.stock_up_advice_code], 'one', 'ZF');
              }}
              key="cancel"
            >
              作废建议
            </a>
          );
        }
        if (tabActiveKey == 'Executed,Voided' && access.canSee('scm_suggestList_cancelPlan')) {
          renList.push(
            <a
              onClick={() => {
                cancelPlanOpen([record.stock_up_advice_code], 'one');
              }}
              key="cancel"
            >
              作废计划
            </a>
          );
        }
        return renList;
      },
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 2400, '', 4);

  // 导出
  const downLoadTempAction = async () => {
    console.log(ColumnSet.customExportConfig);
    console.log(columns);
    const ExproCol: any = [];
    ColumnSet.customExportConfig.forEach((item: any) => {
      if (item.dataIndex == '采购数量' || item.dataIndex == '发货数量') {
        const aa: any = columns.find((k: any) => k.dataIndex == item.dataIndex);
        if (aa && aa.children) {
          aa?.children.forEach((h: any) => {
            ExproCol.push({
              title: h.title,
              order: item.order,
              dataIndex: h.dataIndex,
            });
          });
        }
      } else {
        ExproCol.push(item);
      }
    });
    console.log(ExproCol);
    setLoading((values: any) => {
      return { ...values, downLoading: true };
    });
    const res = await exportExcel({ ...queryParams, export_config: { columns: ExproCol } });
    setLoading((values: any) => {
      return { ...values, downLoading: false };
    });
    if (res) {
      pubBlobDownLoad(res, '备货建议');
    } else {
      pubMsg('服务异常, 导出失败了!');
    }
  };
  // 导出
  const exportDetailExcel = async () => {
    exportingSet(true);
    const res: any = await exportStockupDetail(queryParams);
    exportingSet(false);
    pubBlobDownLoad(res, `备货明细`);
    return;
  };



  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      className="pubPageTabs"
      tabList={[
        { tab: '待处理', key: 'Pending' },
        { tab: '待审批', key: 'Wait_Approval' },
        { tab: '备货历史', key: 'Executed,Voided' },
      ]}
      tabActiveKey={tabActiveKey}
      onTabChange={(val) => {
        tabActiveKeySet(val);
        window.sessionStorage.setItem(cacheKey, val);
      }}
    >
      <Spin spinning={loading.container} tip="重算ing...">
        <ProTable
          bordered
          columns={columns}
          {...ColumnSet}
          pagination={{
            showSizeChanger: true,
          }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          params={{
            status: tabActiveKey, // 状态,多个逗号分隔。Pending待执行;Executed已执行;Voided已作废
          }}
          actionRef={ref}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          rowKey="id"
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          dateFormatter="string"
          rowSelection={{
            alwaysShowAlert: false,
            selectedRowKeys,
            onChange: (rowKeys: any, rows: any) => {
              selectedRowKeysSet(rowKeys);
              selectedRowDataSet(rows);
            },
          }}
          headerTitle={
            <Space key="space">
              <Access key="export" accessible={access.canSee('suggestList_export')}>
                <Button
                  loading={loading.downLoading}
                  disabled={loading.downLoading}
                  type="primary"
                  onClick={downLoadTempAction}
                >
                  {loading.downLoading ? '导出中' : '导出'}
                </Button>
              </Access>
              <Access accessible={tabActiveKey == 'Pending' && access.canSee('scm_suggestList_cancel_batch')}>
                <Button
                  title={'选择表格数据后操作'}
                  disabled={selectedRowKeys?.length == 0}
                  type="primary"
                  onClick={() => cancelRow(selectedRowData, 'batch', 'ZF')}
                >
                  批量作废建议
                </Button>
              </Access>
              <Access accessible={tabActiveKey == 'Wait_Approval' && access.canSee('scm_suggestList_return_batch')}>
                <Button
                  title={'选择表格数据后操作'}
                  disabled={selectedRowKeys?.length == 0}
                  type="primary"
                  onClick={() => cancelRow(selectedRowData, 'batch', 'CH')}
                >
                  批量撤回
                </Button>
              </Access>
              <Access accessible={tabActiveKey == 'Wait_Approval' && access.canSee('scm_suggestList_autidOk_batch')}>
                <Button
                  title={'选择表格数据后操作'}
                  disabled={selectedRowKeys?.length == 0}
                  loading={loading.autidOking}
                  type="primary"
                  onClick={() => autidOkOpen(selectedRowData, 'batch')}
                >
                  批量通过
                </Button>
              </Access>
              <Access accessible={tabActiveKey == 'Wait_Approval' && access.canSee('scm_suggestList_autidNo_batch')}>
                <Button
                  title={'选择表格数据后操作'}
                  disabled={selectedRowKeys?.length == 0}
                  type="primary"
                  onClick={() => cancelRow(selectedRowData, 'batch', 'TH')}
                >
                  批量退回
                </Button>
              </Access>
              <Access accessible={tabActiveKey == 'Executed,Voided' && access.canSee('scm_suggestList_cancelPlan_batch')}>
                <Button
                  title={'选择表格数据后操作'}
                  disabled={selectedRowKeys?.length == 0}
                  type="primary"
                  onClick={() => cancelPlanOpen(selectedRowData, 'batch')}
                >
                  批量作废计划
                </Button>
              </Access>
              <Access key="export1" accessible={access.canSee('suggestList_export_detail')}>
                <Button
                  key="export11"
                  onClick={() => exportDetailExcel()}
                  loading={exporting}
                  type="primary"
                >
                  {exporting ? '导出中' : '导出备货明细'}
                </Button>
              </Access>
              <Access accessible={tabActiveKey == 'Pending' && access.canSee('scm_suggestList_add')}>
                <Button
                  key="suggestList_add"
                  onClick={() => addSugOpen()}
                  type="primary"
                >
                  新建备货建议
                </Button>
              </Access>
            </Space>
          }
        />
        <AddSuggest
          dicList={props?.common?.dicList}
          addSuggestModel={addSuggestModel}
          reload={ref?.current?.reload}
        />
        <AduitNo aduitNoModel={aduitNoModel} reload={ref?.current?.reload} />
        <CancelPlan cancelPlanModel={cancelPlanModel} dicList={props?.common?.dicList} reload={ref?.current?.reload} />
      </Spin>
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

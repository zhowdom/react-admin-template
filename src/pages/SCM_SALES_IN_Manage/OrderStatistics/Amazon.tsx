import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetStoreList, pubProLineList } from '@/utils/pubConfirm';
import {
  exportExcel,
  getList,
  reportOrderStatisticalSum,
} from '@/services/pages/SCM_SALES_IN_Manage/orderStatistics';
import { Space } from 'antd';
import moment from 'moment';
import { connect, useAccess } from 'umi';
import { changeNum } from '@/utils/filter';
import DownloadDetail from './dialog/DownloadDetail';
import DownloadDetailList from './dialog/DownloadDetailList';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import ExportBtn from '@/components/ExportBtn';
import './styles.less';

// Amazon订单统计
const Amazon: React.FC<{
  common: any;
  platform_code: any;
}> = ({ platform_code = 'AMAZON_SC' }) => {
  const actionRef = useRef<ActionType>();
  const [exportForm, setExportForm] = useState<any>({});
  const [summary, summarySet] = useState<any>({});
  const access = useAccess();
  // 获取表格数据
  const requestTableData = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      pageIndex: params?.current,
      platformType: 1,
    };
    const res = await getList(postData);
    const res2 = await reportOrderStatisticalSum(postData);
    if (res2) {
      summarySet(res2?.data || {});
    }
    setExportForm(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
    return {
      data: res?.data?.list || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // table配置
  const columns: ProColumns<any>[] = [
    {
      title: '店铺',
      dataIndex: 'shopId',
      request: () => pubGetStoreList({ business_scope: 'IN' }),
      fieldProps: { showSearch: true },
      valueType: 'select',
      hideInTable: true,
    },
    {
      title: '店铺',
      dataIndex: 'shopName',
      hideInSearch: true,
    },
    {
      title: '产品线',
      dataIndex: 'categoryId',
      align: 'center',
      valueType: 'select',
      request: () => pubProLineList({ business_scope: 'IN', platform_code }),
      fieldProps: { showSearch: true },
      hideInTable: true,
    },
    {
      title: '产品线',
      dataIndex: 'categoryName',
      hideInSearch: true,
    },
    {
      title: '生命周期',
      dataIndex: 'lifeCycleName',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
    },
    {
      title: '款式编码',
      dataIndex: 'skuCode',
    },
    {
      title: '款式名称',
      dataIndex: 'skuName',
      width: 180,
    },
    {
      title: '总销售额',
      dataIndex: 'saleAmount',
      align: 'right',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '总销售额(USD)',
      dataIndex: 'saleAmountUsd',
      align: 'right',
      width: 120,
      hideInSearch: true,
      tooltip: {
        overlayStyle: { maxWidth: 500 },
        destroyTooltipOnHide: true,
        title: <div>
          从〖订单报告〗中统计如下数据<br />
          (1) 订单状态 不是 Cancelled的(即:pending/UnShipped/Shipped)<br />
          (2) 订单的下单时间在所统计的月份<br />
          从符合要求的数据中,取【销售金额(USD)】字段值进行汇总;(根据【结算时间(当地)】所在月汇率转换为USD,若未有结算时间则用【下单时间(当地)】所在月汇率转换为USD)
        </div>
      },
    },
    {
      title: '总销量',
      dataIndex: 'saleQuantity',
      align: 'right',
      hideInSearch: true,
      tooltip: {
        overlayStyle: { maxWidth: 500 },
        destroyTooltipOnHide: true,
        title: <div>
          从〖订单报告〗统计如下数据<br />
          (1) 订单状态 不是 Cancelled的(即:pending/UnShipped/Shipped)<br />
          (2) 订单的下单时间在所统计的月份<br />
          从符合要求的数据中,取【数量】字段值进行汇总<br />
        </div>
      },
    },
    {
      title: '总下单量',
      dataIndex: 'totalOrderQuantity',
      align: 'right',
      width: 100,
      hideInSearch: true,
      tooltip: {
        overlayStyle: { maxWidth: 500 },
        destroyTooltipOnHide: true,
        title: <div>
          从〖订单报告〗中统计如下数据<br />
          (1) 订单的下单时间在所统计的月份<br />
          (2) 根据【Amazon订单号+SKU】维度进行去重<br />
          从符合要求的数据中,统计记录数量
        </div>
      },
    },
    {
      title: '退单量',
      dataIndex: 'chargebackQuantity',
      align: 'right',
      width: 100,
      hideInSearch: true,
      tooltip: {
        overlayStyle: { maxWidth: 500 },
        destroyTooltipOnHide: true,
        title: <div>
          从〖订单报告〗中统计如下数据<br />
          (1) 订单状态 是 Cancelled<br />
          (2) 订单的下单时间在所统计的月份<br />
          (3) 根据【Amazon订单号+SKU】维度进行去重<br />
          从符合要求的数据中,统计记录数量
        </div>
      },
    },
    {
      title: '净销售额',
      dataIndex: 'cleanAmount',
      align: 'right',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '净销售额(USD)',
      dataIndex: 'cleanAmountUsd',
      align: 'right',
      width: 120,
      hideInSearch: true,
      tooltip: '总销售额 -  退款金额',
    },
    {
      title: '净销量',
      dataIndex: 'cleanQuantity',
      align: 'right',
      hideInSearch: true,
      tooltip: {
        overlayStyle: { maxWidth: 500 },
        destroyTooltipOnHide: true,
        title: <div>
          净销量 = 总销量 - 退款量 - 客服换货量 - 平台换货量
        </div>
      },
    },
    {
      title: '销售平均价(USD)',
      dataIndex: 'avgAmount',
      align: 'right',
      width: 130,
      hideInSearch: true,
      tooltip:
        '公式计算所得:总销售额(USD) / 总销量(结果四舍五入保留两位小数,不足两位小数的,补零处理)',
    },
    {
      title: '产品定价',
      dataIndex: 'price',
      align: 'right',
      width: 100,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
      hideInSearch: true,
    },
    {
      title: '产品定价(USD)',
      dataIndex: 'priceUsd',
      align: 'right',
      width: 120,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
      hideInSearch: true,
      tooltip: '店铺SKU对应的产品款式的最新定价',
    },
    {
      title: '退款数量',
      dataIndex: 'refundQuantity',
      align: 'right',
      hideInSearch: true,
      width: 100,
      tooltip: {
        overlayStyle: { maxWidth: 500 },
        destroyTooltipOnHide: true,
        title: <div>
        （1）从〖结算/营收报告〗取单据类型为“Refund”且本金不为0的记录<br />
        （2）匹配〖订单报告〗中的订单，取匹配上的订单<br />
        （3）统计下单时间在统计时间范围内的记录<br />
        符合要求的数据中，取【数量】字段值汇总
        </div>
      },

    },
    {
      title: '客服换货数量',
      dataIndex: 'custExchangeQuantity',
      align: 'right',
      hideInSearch: true,
      width: 100,
      tooltip: {
        overlayStyle: { maxWidth: 500 },
        destroyTooltipOnHide: true,
        title: <div>
        （1）从〖结算/营收报告〗中取单据类型为“Order”且本金为0、订单号以S开头的订单<br />
        （2）匹配〖订单报告中〗Amazon订单号，并筛选merchant-order-id包含“CONSUMER”的订单<br />
        （3）统计下单时间在统计时间范围内的记录<br />
        符合要求的数据中，取【数量】字段值汇总
        </div>
      },
    },
    {
      title: '平台换货数量',
      dataIndex: 'platformExchangeQuantity',
      align: 'right',
      hideInSearch: true,
      width: 100,
      tooltip: {
        overlayStyle: { maxWidth: 500 },
        destroyTooltipOnHide: true,
        title: <div>
        （1）从〖结算/营收报告〗,取单据类型为“Order”且本金为0、订单号不是S开头的订单<br />
        （2）匹配〖换货报告〗中【换货订单号】，取匹配上的订单的【原订单号】<br />
        （3）匹配〖订单报告〗中匹配订单号，取匹配上的订单<br />
        （4）统计下单时间在统计时间范围内的记录<br />
        符合要求的数据中，取【数量】字段值汇总<br />
        </div>
      },

    },
    {
      title: '退换数量',
      dataIndex: 'reQuantity',
      align: 'right',
      hideInSearch: true,
      width: 100,
      tooltip: {
        overlayStyle: { maxWidth: 500 },
        destroyTooltipOnHide: true,
        title: <div>
          退换数量 = 退款数量 + 换货数量(客服换货) + 换货数量(平台换货)
        </div>
      },
    },

    {
      title: '退单率',
      dataIndex: 'chargebackRate',
      align: 'right',
      hideInSearch: true,
      tooltip: '退单量/总下单量  * 100%',
    },
    {
      title: '退款率',
      dataIndex: 'refundRate',
      align: 'right',
      hideInSearch: true,
      tooltip: '退货量/总销量  * 100%',
    },
    {
      title: '退换率',
      dataIndex: 'returnRate',
      align: 'right',
      hideInSearch: true,
      tooltip: '(退款量+客服换货量+平台换货量) / 总销量  * 100%',
    },
    {
      title: '退款金额',
      dataIndex: 'refundAmount',
      align: 'right',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '退款金额(USD)',
      dataIndex: 'refundAmountUsd',
      align: 'right',
      width: 120,
      hideInSearch: true,
      tooltip: {
        placement: 'left',
        overlayStyle: { maxWidth: 560 },
        destroyTooltipOnHide: true,
        title: <>
          (1) 下载统计开始时间至今的〖结算/营收报告〗，取单据类型为“Refund”且本金不为0的记录<br />
          (2) 匹配〖订单报告〗中匹配订单号，取匹配上的订单<br />
          (3) 统计下单时间在统计时间范围内的记录；<br />
          从符合要求的数据中,取【销售金额(USD)】字段值进行汇总(根据【结算时间(当地)】所在月汇率转换为USD,若未有结算时间则用【下单时间(当地)】所在月汇率转换为USD)
        </>
      },
    },
    {
      title: '统计时间',
      dataIndex: 'orderDate',
      align: 'center',
      valueType: 'dateRange',
      render: (_, record) => record.orderDate,
      initialValue: [moment().subtract(30, 'days'), moment()],
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          orderDateStart: value[0] ? `${value[0]} 00:00:00` : null,
          orderDateEnd: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
      hideInTable: true,
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 2200, 'amazon', 0, [
    'saleAmount',
    'cleanAmount',
    'price',
    'refundAmount',
  ]);
  return (
    <ProTable
      headerTitle={
        <div style={{ flexDirection: 'column' }} className='orderStatistics-header'>
          <Space size={10} style={{ paddingTop: '6px', textAlign: 'center' }}>
            <span><i>总销售额(USD)</i>: <br/>{changeNum(summary.saleAmountSum || 0)}</span>
            <span><i>总销售量</i>:<br/>{changeNum(summary.saleQuantitySum || 0)}</span>
            <span><i>净销售额(USD)</i>:<br/>{changeNum(summary.cleanAmountSum || 0)}</span>
            <span><i>净销售量</i>:<br/>{changeNum(summary.cleanQuantitySum || 0)}</span>
            <span><i>退换数量</i>:<br/>{changeNum(summary.refundQuantitySum || 0)}</span>
            <span><i>退款金额(USD)</i>:<br/>{changeNum(summary.refundAmountSum || 0)}</span>
            <span><i>总下单量</i>:<br/>{changeNum(summary.totalOrderQuantity || 0)}</span>
            <span><i>退单量</i>:<br/>{changeNum(summary.chargebackQuantity || 0)}</span>
            <span><i>退换率</i>:<br/>{summary.refundQuantitySum ? (((summary.refundQuantitySum || 0) / (summary.saleQuantitySum || 0) * 100)).toFixed(2):0}%</span>
          </Space>
        </div>
      }
      actionRef={actionRef}
      rowKey={(record: any) => record.shopId + record.shopName + record.sku}
      dateFormatter="string"
      pagination={{
        showSizeChanger: true,
      }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      {...ColumnSet}
      showSorterTooltip={false}
      request={requestTableData}
      columns={columns}
      search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
      toolBarRender={() => [
        <Space key="space">
          {access.canSee('liyi99-report_order-statistics-amazon-export-detail') ? (
            <>
              <DownloadDetailList /> {/*下载明细*/}
              <DownloadDetail /> {/*新增明细导出任务*/}
            </>
          ) : null}
          {access.canSee('liyi99-report_order-statistics-amazon-export') ? (
            <ExportBtn
              exportHandle={exportExcel}
              exportForm={{
                ...exportForm,
                exportConfig: { columns: ColumnSet.customExportConfig },
              }}
            />
          ) : null}
        </Space>,
      ]}
    />
  );
};
// 全局model注入
const Page: React.FC = connect(({ common }: any) => ({ common }))(Amazon);
export default Page;

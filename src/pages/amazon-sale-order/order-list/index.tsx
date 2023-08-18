import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetStoreList, pubProLineList } from '@/utils/pubConfirm';
import {
  exportExcel,
  getList,
  reportOrderStatisticalSum,
} from '@/services/pages/amazon-sale-order';
import { Space } from 'antd';
import {connect} from 'umi';
import { changeNum } from '@/utils/filter';
import DownloadDetail from './dialog/DownloadDetail';
import DownloadDetailList from './dialog/DownloadDetailList';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import ExportBtn from '@/components/ExportBtn';
import moment from "moment";

// 亚马逊销量统计报表 - 订单统计
const Index: React.FC<{
  common: any;
  platform_code: any;
}> = ({ platform_code = 'AMAZON_SC' }) => {
  const actionRef = useRef<ActionType>();
  const [exportForm, setExportForm] = useState<any>({});
  const [summary, summarySet] = useState<any>({});
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
      title: '商品名称',
      dataIndex: 'skuName',
      width: 180,
      hideInSearch: true,
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
      tooltip: (
        <>
          从订单报告中统计如下数据; <br />
          (1) 订单状态 不是 Cancelled的(即:pending/UnShipped/Shipped) <br />
          (2) sales Channel 不是 “Non-Amazon” <br />
          (3) 将订单号对应的到营收报告中,剔除补发单数量(订单类型,销售金额为0) <br />
          (4) 订单的下单时间在所统计的月份 <br />
          从符合要求的数据中,取【销售金额(USD)】字段值进行汇总;(根据结算时间所在月汇率转换为USD,若未有结算时间则用下单时间所在月汇率转换为USD){' '}
          <br />
        </>
      ),
    },
    {
      title: '总销量',
      dataIndex: 'saleQuantity',
      align: 'right',
      hideInSearch: true,
      tooltip:
        '从订单报告中,统计订单行状态不等于“Cancelled”的,且下单时间在统计时间范围内的记录,以“店铺SKU”维度,取【数量】字段值汇总',
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
      tooltip: '公式计算所得: 总销售额(USD) - 退货金额(USD)',
    },
    {
      title: '净销量',
      dataIndex: 'cleanQuantity',
      align: 'right',
      hideInSearch: true,
      tooltip: {
        overlayStyle: {maxWidth: 500},
        destroyTooltipOnHide: true,
        title: <div>
          净销量 = 总销量 - 退货数量 - 换货数量(客服换货) - 换货数量(平台换货)<br />
          (1)总销量：从订单报告中统计订单行状态不等于“Cancelled”且下单时间在统计时间范围内的记录。以“店铺SKU”维度，取【数量】字段值汇总<br /><br />
          (2)退货数量：从结算/营收报告中取单据类型为“Refund”且本金不为0的记录。到订单报告中根据订单号匹配其下单时间，统计下单时间在统计时间范围内的记录，以“店铺SKU”维度，取【数量】字段值汇总<br /><br />
          (3)换货数量(客服换货)：从结算/营收报告中取单据类型为“Order”且本金为0、订单号以S开头，到订单报告中根据订单号匹配其下单时间及merchant-order-id,统计下单时间在统计时间范围内且的记录merchant-order-id包含“CONSUMER”的订单，以“店铺SKU”维度，取【销售金额】字段值汇总<br /><br />
          (4)换货数量(平台换货)：从结算/营收报告中,取单据类型为“Order”且本金为0、订单号不是S开头，到订单报告中根据订单号匹配其下单时间，统计下单时间在统计时间范围内的记录,以“店铺SKU”维度,取【销售金额】字段值汇总
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
      title: '退换数量',
      dataIndex: 'reQuantity',
      align: 'right',
      hideInSearch: true,
      width: 100,
      tooltip: {
        overlayStyle: {maxWidth: 500},
        destroyTooltipOnHide: true,
        title: <div>
          退换数量 = 退款数量 + 换货数量(客服换货) + 换货数量(平台换货)<br/>
          {/* (1)退货数量：从结算/营收报告中取单据类型为“Refund”且本金不为0的记录，到订单报告中根据订单号匹配其下单时间，统计下单时间在统计时间范围内的记录，以“店铺SKU”维度取【数量】字段值汇总<br/><br/>
          (2)换货数量(客服换货)：从结算/营收报告中取单据类型为“Order”且本金为0、订单号以S开头，用“amazon-order-id”到换货报告中匹配“replacement-amazon-order-id”，将匹配上的数据取“original-amazon-order-id”，到订单报告中根据订单号匹配其下单时间及merchant-order-id。统计下单时间在统计时间范围内且的记录merchant-order-id包含“CONSUMER”的订单，以“店铺SKU”维度取【数量】字段值汇总<br/><br/>
          (3)换货数量(平台换货)：从结算/营收报告中取单据类型为“Order”且本金为0、订单号不是S开头，用“amazon-order-id”到换货报告中匹配“replacement-amazon-order-id”，将匹配上的数据取“original-amazon-order-id”，到订单报告中根据订单号匹配其下单时间，统计下单时间在统计时间范围内的记录，以“店铺SKU”维度取【数量】字段值汇总 */}
        </div>
      },
    },
    {
      title: '退换率',
      dataIndex: 'returnRate',
      align: 'right',
      hideInSearch: true,
      tooltip: '公式计算所得,退换率 = 退换数量 / 总销量 * 100%',
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
        overlayStyle: {maxWidth: 560},
        destroyTooltipOnHide: true,
        title: <>
          退款金额(USD) = 总销售额(USD) /总销量(结果四舍五入保留两位小数，不足两位小数的，补零处理)<br />
          1.从结算报告中筛选如下数据:<br />
          (1) 单据类型为“Refund”的数据且本金不为0<br />
          (2) 结算时间为所统计的月份,及次月<br /><br/>
          2. 根据第一步获得的数据，通过订单号在【订单报告】中获得订单的下单时间<br/>
          (1) 匹配订单下单时间后，筛选下单时间为统计月份的数据<br/><br/>
          3. 根据SKU进行数量及金额统计,取【退货金额(USD)】字段进行汇总;<br/>
          (1)根据结算时间所在月汇率转换为USD,若未有结算时间则用下单时间所在月汇率转换为USD
        </>
      },
    },
    {
      title: '统计时间',
      dataIndex: 'orderDate',
      align: 'center',
      initialValue: [moment().subtract(30, 'days'), moment()],
      valueType: 'dateRange',
      render: (_, record) => record.orderDate,
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
        <div style={{ flexDirection: 'column' }}>
          <div>亚马逊销量统计报表 - 订单列表</div>
          <Space size={10} style={{ paddingTop: '6px' }}>
            <span>总销售额(USD): {changeNum(summary.saleAmountSum || 0)}</span>
            <span>总销售量: {changeNum(summary.saleQuantitySum || 0)}</span>
            <span>净销售额(USD): {changeNum(summary.cleanAmountSum || 0)}</span>
            <span>净销售量: {changeNum(summary.cleanQuantitySum || 0)}</span>
            <span>退换数量: {changeNum(summary.refundQuantitySum || 0)}</span>
            <span>退款金额(USD): {changeNum(summary.refundAmountSum || 0)}</span>
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
            <>
              <DownloadDetailList /> {/*下载明细*/}
              <DownloadDetail /> {/*新增明细导出任务*/}
            </>
            <ExportBtn
              exportHandle={exportExcel}
              exportForm={{
                ...exportForm,
                exportConfig: { columns: ColumnSet.customExportConfig },
              }}
            />
        </Space>,
      ]}
    />
  );
};
// 全局model注入
const Page: React.FC<any> = connect(({ common }: any) => ({ common }))(Index);
export default Page;

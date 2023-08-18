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
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import ExportBtn from '@/components/ExportBtn';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import './styles.less';
// Walmart订单统计
const Walmart: React.FC<{
  common: any;
  platform_code: any;
}> = ({ platform_code = 'WALMART' }) => {
  const actionRef = useRef<ActionType>();
  const [exportForm, setExportForm] = useState<any>({});
  const [summary, summarySet] = useState<any>({});
  const access = useAccess();
  // 获取表格数据
  const requestTableData = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      pageIndex: params?.current,
      platformType: 2,
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
    },
    {
      title: '总销售额',
      dataIndex: 'saleAmount',
      align: 'right',
      hideInSearch: true,
      tooltip:
        '从订单列表中，统计订单行状态不等于“Cancelled”的，且下单时间在统计时间范围内的记录，以“店铺SKU”维度，取【销售金额】字段值汇总',
    },
    {
      title: '总销量',
      dataIndex: 'saleQuantity',
      align: 'right',
      hideInSearch: true,
      tooltip:
        '从订单列表中，统计订单行状态不等于“Cancelled”的，且下单时间在统计时间范围内的记录，以“店铺SKU”维度，取【数量】字段值汇总',
    },
    {
      title: '净销售额',
      dataIndex: 'cleanAmount',
      align: 'right',
      hideInSearch: true,
      tooltip: (
        <div>
          <div>公式计算所得：净销售额 = 总销售额 - 退货金额</div>
          <div>
            总销售额：从订单报告中，统计订单行状态不等于“Cancelled”的，且下单时间在统计时间范围内的记录，以“店铺SKU”维度，取【销售金额】字段值汇总
          </div>
          <div>
            退货售额：退货明细中，统计下单时间在统计时间范围内的记录，以“店铺SKU”维度，取【退款金额】字段值汇总
          </div>
        </div>
      ),
    },
    {
      title: '净销量',
      dataIndex: 'cleanQuantity',
      align: 'right',
      hideInSearch: true,
      tooltip: (
        <div>
          <div>公式计算所得：净销量 = 总销量 - 退货数量</div>
          <div>
            总销量：从订单报告中，统计订单行状态不等于“Cancelled”的，且下单时间在统计时间范围内的记录，以“店铺SKU”维度，取【数量】字段值汇总
          </div>
          <div>
            退货数量：退货明细中，统计下单时间在统计时间范围内的记录，以“店铺SKU”维度，取【退货数量】字段值汇总
          </div>
        </div>
      ),
    },
    {
      title: '销售平均价',
      dataIndex: 'avgAmount',
      align: 'right',
      hideInSearch: true,
      tooltip: '公式计算所得：销售平均价 = 总销售额 / 总销售量 （结果四舍五入并保留两位小数）',
    },
    {
      title: '产品定价',
      dataIndex: 'price',
      align: 'right',
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
      tooltip:
        '退货数量：退货明细中，统计下单时间在统计时间范围内的记录，以“店铺SKU”维度，取【退货数量】字段值汇总',
    },
    {
      title: '退换率',
      dataIndex: 'returnRate',
      align: 'right',
      hideInSearch: true,
      tooltip: '公式计算所得，退换率 = 退换数量 / 总销量 * 100%',
    },
    {
      title: '退款金额',
      dataIndex: 'refundAmount',
      align: 'right',
      hideInSearch: true,
      tooltip:
        '退货售额：退货明细中，统计下单时间在统计时间范围内的记录，以“店铺SKU”维度，取【退款金额】字段值汇总',
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
  const ColumnSet = useCustomColumnSet(columns, 1600, 'walmart');
  return (
    <ProTable
      headerTitle={
        <div style={{ flexDirection: 'column' }} className='orderStatistics-header'>
          <Space size={10} style={{ paddingTop: '6px', textAlign: 'center' }}>
            <span><i>总销售额:</i> <br />{changeNum(summary.saleAmountSum || 0)}</span>
            <span><i>总销售量:</i> <br />{changeNum(summary.saleQuantitySum || 0)}</span>
            <span><i>净销售额:</i> <br />{changeNum(summary.cleanAmountSum || 0)}</span>
            <span><i>净销售量:</i> <br />{changeNum(summary.cleanQuantitySum || 0)}</span>
            <span><i>退换数量:</i> <br />{changeNum(summary.refundQuantitySum || 0)}</span>
            <span><i>退款金额:</i> <br />{changeNum(summary.refundAmountSum || 0)}</span>
            <span><i>退换率:</i><br />{ summary.refundQuantitySum ?(((summary.refundQuantitySum || 0) / (summary.saleQuantitySum || 0) * 100)).toFixed(2) : 0}%</span>
          </Space>
        </div>
      }
      actionRef={actionRef}
      rowKey={(record: any) => record.id + record.sku}
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
          {access.canSee('liyi99-report_order-statistics-walmart-export') ? (
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
const Page: React.FC = connect(({ common }: any) => ({ common }))(Walmart);
export default Page;

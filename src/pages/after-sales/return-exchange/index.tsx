import React, { useRef, useState } from 'react';
import { useActivate } from 'react-activation';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import { Pagination } from 'antd';
import * as api from '@/services/pages/after-sales';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import RangeTimeSearch from '@/components/PubForm/RangeTimeSearch';
import { pubProLineList } from '@/utils/pubConfirm';
import moment from 'moment';
import { flatData } from '@/utils/filter';
import { connect } from 'umi';
import Chart from '../components/Chart';
/*客诉率统计报表 - 列表页*/
const Page: React.FC<any> = ({ common, history }) => {
  const formRef: any = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const [pagination, paginationSet] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
  });
  const [tableParams, tableParamsSet] = useState<any>({});
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '下单时间',
      dataIndex: 'timeRange',
      hideInTable: true,
      order: 22,
      initialValue: {
        type: '30day',
        dates: [
          moment(new Date()).add(-30, 'day'),
          moment(new Date()),
        ],
      },
      renderFormItem: () => <RangeTimeSearch />,
      search: {
        transform: (val: any) => {
          // console.log(moment(val.dates[0]).format('YYYY-MM-DD'))
          // console.log(moment(val.dates[1]).format('YYYY-MM-DD'))
          if (val?.dates && val.dates[0] && val.dates[1]) {
            return {
              purchaseTimeStart: moment(val.dates[0]).format('YYYY-MM-DD') + ' 00:00:00',
              purchaseTimeEnd: moment(val.dates[1]).format('YYYY-MM-DD') + ' 23:59:59',
            };
          }
          return {};
        },
      },
    },
    {
      title: '产品线',
      dataIndex: 'categoryName',
      align: 'center',
      hideInSearch: true,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '产品线',
      dataIndex: 'categoryId',
      align: 'center',
      valueType: 'select',
      order: 21,
      request: () => pubProLineList({ business_scope: 'IN' }),
      fieldProps: { showSearch: true },
      hideInTable: true,
    },
    {
      title: '产品名称',
      dataIndex: 'goodsName',
      align: 'center',
      order: 19,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      search: {
        transform: (val: any) => ({ goodsName: val.trim() }),
      },
    },
    {
      title: '产品编码',
      dataIndex: 'goodsCode',
      align: 'center',
      order: 20,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      search: {
        transform: (val: any) => ({ goodsCode: val.trim() }),
      },
    },
    {
      title: '产品生命周期',
      width: 100,
      dataIndex: 'goodsLifeCycleName',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      fieldProps: { showSearch: true },
      valueEnum: common?.dicList?.GOODS_LIFE_CYCLE || {},
      search: {
        transform: (val) => ({ goodsLifeCycle: val }),
      },
    },
    {
      title: '款式编码',
      dataIndex: 'skuCode',
      align: 'center',
      hideInTable: true,
      order: 18,
    },
    {
      title: '款式名称',
      dataIndex: 'skuName',
      align: 'center',
      hideInTable: true,
      order: 17,
    },
    {
      title: '店铺SKU',
      dataIndex: 'sku',
      align: 'center',
      order: 16,
      hideInTable: true,
    },
    {
      title: '款式编码',
      dataIndex: ['skuList', 'skuCode'],
      align: 'center',
      hideInSearch: true,
      onCell: (record: any) => ({ colSpan: record.skuList.colSpan || 1 }),
      render: (dom: any, record: any) =>
        record?.skuList?.colSpan ? (
          <div style={{ textAlign: 'right' }}>合计:</div>
        ) : (
          <div>{record?.skuList?.skuCode}</div>
        ),
    },
    {
      title: '款式名称',
      dataIndex: ['skuList', 'skuName'],
      align: 'center',
      hideInSearch: true,
      onCell: (record: any) => ({ colSpan: record.skuList.colSpan && 0 }),
    },
    {
      title: '店铺SKU',
      dataIndex: ['skuList', 'sku'],
      align: 'center',
      hideInSearch: true,
      onCell: (record: any) => ({ colSpan: record.skuList.colSpan && 0 }),
    },
    {
      title: '款式生命周期',
      width: 100,
      dataIndex: ['skuList', 'skuLifeCycleName'],
      align: 'center',
      onCell: (record: any) => ({ colSpan: record.skuList.colSpan && 0 }),
      fieldProps: { showSearch: true },
      valueEnum: common?.dicList?.GOODS_LIFE_CYCLE || {},
      search: {
        transform: (val) => ({ goodsSkuLifeCycle: val }),
      },
    },
    {
      title: '销量',
      tooltip:
        '从订单报告中，统计订单行状态不等于“Cancelled”的，且下单时间在统计时间范围内的记录，以款式为维度，取【数量】字段值',
      dataIndex: ['skuList', 'saleQuantity'],
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '退款数',
      tooltip:
        '退款数：从结算/营收报告中，取单据类型为“Refund”且本金不为0的记录，到订单报告中根据订单号匹配其下单时间，统计下单时间在统计时间范围内的记录，以款式为维度，取【数量】字段值汇总',
      dataIndex: ['skuList', 'refundQuantity'],
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record?.skuList?.colSpan ? (
          _
        ) : (
          <a
            onClick={() => {
              history.push({
                pathname: '/after-sales/feedback-detail',
                state: {
                  ...formRef?.current?.getFieldsFormatValue(),
                  skuCode: record?.skuList?.skuCode,
                  asin: record?.skuList?.asin,
                  typeName: 'RETURN',
                },
              });
            }}
          >
            {record?.skuList?.refundQuantity || '-'}
          </a>
        ),
    },
    {
      title: '退款率',
      tooltip: '退款率 = 退款数 / 销量 * 100%',
      dataIndex: ['skuList', 'returnRate'],
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '换货数',
      tooltip:
        (
          <>
          <p>换货数量 = 换货数量(客服换货) + 换货数量(平台换货)</p>
          <p>换货数量(客服换货):从结算/营收报告中,取单据类型为“Order”且本金为0且订单号以S开头,用“amazon-order-id”到换货报告中匹配“replacement-amazon-order-id”，将匹配上的数据取“original-amazon-order-id”，到订单报告中根据订单号匹配其下单时间及merchant-order-id,统计下单时间在统计时间范围内且的记录merchant-order-id包含“CONSUMER”的订单,以“店铺SKU”维度,取【数量】字段值汇总</p>
          <p>换货数量(平台换货):从结算/营收报告中,取单据类型为“Order”且本金为0且订单号不是S开头,用“amazon-order-id”到换货报告中匹配“replacement-amazon-order-id”，将匹配上的数据取“original-amazon-order-id”,到订单报告中根据订单号匹配其下单时间,统计下单时间在统计时间范围内的记录,以“店铺SKU”维度,取【数量】字段值汇总</p>
        </>),
      dataIndex: ['skuList', 'exchangeQuantity'],
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record?.skuList?.colSpan ? (
          _
        ) : (
          <a
            onClick={() => {
              console.log(record)
              history.push({
                pathname: '/after-sales/feedback-detail',
                state: {
                  ...formRef?.current?.getFieldsFormatValue(),
                  skuCode: record?.skuList?.skuCode,
                  asin: record?.skuList?.asin,
                  typeName: 'REPLACE',
                },
              });
            }}
          >
            {record?.skuList?.exchangeQuantity || '-'}
          </a>
        ),
    },
    {
      title: '换货率',
      tooltip: '换货率 = 换货数 / 销量 * 100%',
      dataIndex: ['skuList', 'exchangeRate'],
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '退换率',
      tooltip: '退换率 = (退款数 + 换货数) / 销量 * 100%',
      dataIndex: ['skuList', 'reRate'],
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      width: 90,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record: any) =>
        record?.skuList?.colSpan ? (
          '-'
        ) : (
          <Chart
            params={{
              goodsSkuId: record.skuList.goodsSkuId || record.skuList.goodsId,
              amazonAsin: record.skuList.asin,
              purchaseTimeStart: tableParams.purchaseTimeStart,
              purchaseTimeEnd: tableParams.purchaseTimeEnd,
            }}
            trigger={<a>趋势</a>}
            title={`趋势图`}
            page={'return'}
          />
        ),
    },
  ];
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable
        rowClassName={(record: any) => (record?.skuList?.colSpan ? 'emphasise-row-text' : '')}
        bordered
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        pagination={false}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        onSubmit={() => {
          pagination.current = 1;
        }}
        params={{
          current: pagination.current,
          pageSize: pagination.pageSize,
        }}
        request={async (params: any) => {
          if (params.havingType && !(params.havingTypeStart && params.havingTypeEnd)) {
            pubMsg('查询条件: "类型范围" 未完整填写, 无法查询');
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          const formData = {
            ...params,
            pageIndex: params.current,
          };
          delete formData.timeRange;
          delete formData.numRange;
          delete formData.current;
          tableParamsSet(formData)
          const res = await api.returnsPage(formData);
          if (res?.code != pubConfig.sCodeOrder) {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          let dataFlat: any[] = [];
          if (res?.data?.list?.length) {
            const list = res.data.list.map((item: any) => {
              if (item?.skuList?.length > 1) {
                return { ...item, skuList: [...item.skuList, { ...item, colSpan: 4 }] };
              } else {
                return item;
              }
            });
            dataFlat = flatData(list, 'skuList', 'null', false);
          }
          console.log(dataFlat, 'dataFlat');
          paginationSet({ ...pagination, total: res?.data?.total || 0 });
          return {
            success: true,
            data: dataFlat || [],
          };
        }}
        rowKey={(record: any) =>
          record?.goodsId + record?.skuList?.asin + record?.skuList?.goodsSkuId
        }
        dateFormatter="string"
        headerTitle={'客诉率统计报表'}
        scroll={{ x: 1200 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        showSorterTooltip={false}
        search={{span: 8, defaultCollapsed: false, className: 'light-search-form' }}
      />
      {/*ProTable合并单元格分页bug, 需要自定义分页*/}
      <div
        style={{
          position: 'sticky',
          padding: '10px 24px',
          borderTop: '1px solid #e9e9e9',
          bottom: 0,
          right: 0,
          zIndex: 2,
          width: '100%',
          textAlign: 'right',
          background: '#fff',
        }}
      >
        <Pagination
          showTotal={(total: number) => `总共${total}条`}
          onChange={(current, pageSize) => {
            if (pagination.pageSize == pageSize) {
              paginationSet({ ...pagination, current, pageSize });
            } else {
              paginationSet({ ...pagination, current: 1, pageSize });
            }
          }}
          showSizeChanger
          size={'small'}
          {...pagination}
        />
      </div>
    </PageContainer>
  );
};

// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

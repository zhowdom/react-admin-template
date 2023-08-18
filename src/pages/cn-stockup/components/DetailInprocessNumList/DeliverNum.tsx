import { Table, Space } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { findGoodSkuDeliveryPlan } from '@/services/pages/cn-sales';
// @ts-ignore
import accounting from 'accounting';
import './style.less';

// 已审核发货计划总数量
const DetailInprocessNumList: React.FC<{
  data: Record<string, any>;
  dicList: Record<string, any>;
}> = ({ data = {}, dicList }) => {
  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        title: '商品名称',
        dataIndex: 'goods_sku_name',
        hideInSearch: true,
      },
      {
        title: 'SKU',
        dataIndex: 'stock_no',
        hideInSearch: true,
      },
      {
        title: '发货计划编号',
        dataIndex: 'plan_no',
      },
      {
        title: '状态',
        dataIndex: 'approval_status',
        hideInTable: true,
        valueType: 'select',
        valueEnum: {
          3: '审核通过',
          7: '部分生成入库单',
          6: '全部生成入库单',
        },
      },
      {
        title: '发货计划状态',
        dataIndex: 'approval_status',
        hideInSearch: true,
        valueEnum: dicList?.DELIVERY_PLAN_STATUS || {},
        align: 'center',
      },
      {
        title: '平台',
        dataIndex: 'platform_name',
        hideInSearch: true,
        align: 'center',
      },
      {
        title: '计划发货数量（总）',
        dataIndex: 'num',
        align: 'center',
        hideInSearch: true,
        width: 110,
      },
      {
        title: '未建入库单数量',
        dataIndex: 'no_generate_warehousing_order_num',
        align: 'center',
        hideInSearch: true,
        width: 120,
      },
      {
        title: '已建入库单数量',
        dataIndex: 'generate_warehousing_order_num',
        align: 'center',
        hideInSearch: true,
        width: 130,
      },
    ],
    [dicList],
  );
  return (
    <ProTable
      headerTitle={
        <span className={'text-red'}>说明：从2023-02-01开始，统计已审核采购计划总数量</span>
      }
      rowKey='id'
      bordered
      columns={columns}
      options={false}
      size='small'
      pagination={false}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: true }}
      request={async (params) => {
        const res = await findGoodSkuDeliveryPlan({ ...params, goods_sku_id: data.goods_sku_id });
        if (res?.code != pubConfig.sCodeOrder) {
          pubMsg(res?.message);
          return {
            success: false,
            data: [],
            total: 0,
          };
        }
        return {
          success: true,
          data: res.data,
        };
      }}
      scroll={{ x: 1000, y: 400 }}
      sticky={{ offsetHeader: 0 }}
      showSorterTooltip={false}
      cardProps={{ bodyStyle: { padding: 0 } }}
      summary={() => (
        <Table.Summary fixed>
          <Table.Summary.Row style={{ fontWeight: 'bold' }}>
            <Table.Summary.Cell index={1} colSpan={9}>
              <Space size={40}>
                <span>
                  已审核发货计划总数量：
                  <span className={'text-red'}>
                    {accounting.formatNumber(data.in_process_delivery_num)}
                  </span>
                </span>
              </Space>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />
  );
};
export default DetailInprocessNumList;

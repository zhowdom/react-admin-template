import { Table, Space } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { findGoodSkuWarehousingOrder } from '@/services/pages/cn-sales';
// @ts-ignore
import accounting from 'accounting';
import './style.less';

// 计划外入库单数量
const DetailInprocessNumList: React.FC<{
  data: Record<string, any>;
  dicList: Record<string, any>;
}> = ({  data = {}, dicList}) => {
  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        title: '商品名称',
        dataIndex: 'skuName',
        hideInSearch: true,
      },
      {
        title: 'SKU',
        dataIndex: 'skuCode',
        hideInSearch: true,
      },
      {
        title: '入库单号',
        dataIndex: 'orderNo',
      },
      {
        title: '平台入库单号',
        dataIndex: 'platformWarehousingOrderNo',
        hideInSearch: true,
      },
      {
        title: '平台',
        dataIndex: 'platformName',
        hideInSearch: true,
        align: 'center',
      },
      {
        title: '入库单状态',
        dataIndex: 'approvalStatus',
        align: 'center',
        valueEnum: dicList?.WAREHOUSING_ORDER_STATUS,
        hideInSearch: true,
        width: 90,
      },
      {
        title: '发货数量',
        dataIndex: 'deliveryPlanCurrentNum',
        align: 'center',
        hideInSearch: true,
        width: 100,
      },
      {
        title: '已入库数量',
        dataIndex: 'warehousingNum',
        align: 'center',
        hideInSearch: true,
        width: 100,
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
        const res = await findGoodSkuWarehousingOrder({ ...params, goods_sku_id: data.goods_sku_id });
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
                计划外入库单发货数量：
                  <span className={'text-red'}>
                    {accounting.formatNumber(data.in_process_warehousing_order_num)}
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

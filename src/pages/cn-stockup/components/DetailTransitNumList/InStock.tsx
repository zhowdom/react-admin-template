import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { findCnTransitWarehousingOrder } from '@/services/pages/cn-sales';
// @ts-ignore
import './style.less';

// 计划外入库单数量
const DetailInprocessNumList: React.FC<{
  data: Record<string, any>;
  dicList: Record<string, any>;
}> = ({ data = {}, dicList }) => {
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
        width: 140,
        hideInSearch: true,
      },
      {
        title: '入库单号',
        dataIndex: 'order_no',
        width: 140,
        hideInTable: true,
      },
      {
        title: '平台入库单号',
        dataIndex: 'platformWarehousingOrderNo',
        hideInSearch: true,
      },
      {
        title: '平台',
        dataIndex: 'platformName',
        width: 100,
        align: 'center',
        hideInSearch: true,
      },
      {
        title: '状态',
        dataIndex: 'approvalStatus',
        valueEnum: dicList?.WAREHOUSING_ORDER_STATUS,
        width: 80,
        align: 'center',
        hideInSearch: true,
      },
      {
        title: '发货数量',
        dataIndex: 'deliveryPlanCurrentNum',
        width: 100,
        align: 'center',
        hideInSearch: true,
        renderText: (text: any) => text || 0,
      },
      {
        title: '预计平台入库时间',
        dataIndex: 'platformAppointmentTime',
        width: 120,
        align: 'center',
        hideInSearch: true,
      },
    ],
    [dicList],
  );
  return (
    <ProTable
      headerTitle={
        <span>{`区域：${data?.region_name || ''}`}</span>
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
        const res = await findCnTransitWarehousingOrder({
          ...params,
          goods_sku_id: data?.goods_sku_id, //款式id
          platform_name: data?.platform_name, //平台名称
          warehouse_area: data.region_name == '合计' ? null : data.region_name,  //区域
          startTime: data?.last_instock_time,
        });
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
    />
  );
};
export default DetailInprocessNumList;

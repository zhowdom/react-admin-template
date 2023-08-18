import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { findDeliveryPlanByInTransit } from '@/services/pages/cn-sales';
// @ts-ignore
import './style.less';

// 已审核采购计划总数量
const DetailInprocessNumList: React.FC<{
  data: Record<string, any>;
  dicList: Record<string, any>;
}> = ({ data = {}, dicList }) => {
  console.log(data, '5555')
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
        title: '发货计划编号',
        dataIndex: 'planNo',
        hideInSearch: true,
      },
      {
        title: '发货计划编号',
        dataIndex: 'plan_no',
        hideInTable: true,
      },
      {
        title: '发货计划状态',
        dataIndex: 'approvalStatus',
        hideInSearch: true,
        valueEnum: dicList?.DELIVERY_PLAN_STATUS || {},
        align: 'center',
        width: 100,
      },
      {
        title: '计划发货数量(总)',
        dataIndex: 'num',
        hideInSearch: true,
        align: 'center',
        renderText: (text: any) => text || 0,
      },
      {
        title: '未建入库单数量',
        dataIndex: 'noGenerateWarehousingOrderNum',
        hideInSearch: true,
        align: 'center',
        width: 130,
        renderText: (text: any) => text || 0,
      },
      {
        title: '要求平台入库时间',
        dataIndex: 'warehousingTime',
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
        <span>{`区域：${data?.region_name || ''}`}</span>
      }
      rowKey='tempId'
      bordered
      columns={columns}
      options={false}
      size='small'
      pagination={false}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: true }}
      request={async (params) => {
        const res = await findDeliveryPlanByInTransit({
          ...params,
          goods_sku_id: data?.goods_sku_id,
          platform_name: data?.platform_name, //平台名称
          warehouse_area_name: data?.region_name == '合计' ? null : data?.region_name,  //区域
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
          data: res.data.map((v: any, index: number) => ({
            ...v,
            tempId: `${v.orderNo}_${String(index)}`
          })),
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

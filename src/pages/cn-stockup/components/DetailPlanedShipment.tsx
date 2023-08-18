import { Modal, Table, Space } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useMemo, useState } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { plannedShipments } from '@/services/pages/cn-sales';
import { flatData } from '@/utils/filter';
// @ts-ignore
import accounting from 'accounting';

const DetailPlanedShipment: React.FC<{
  open: any;
  openSet: any;
  title?: string;
  data: Record<string, any>;
  dicList: Record<string, any>;
}> = ({ title, data, dicList, open, openSet }) => {
  const [] = useState(false);
  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        title: '商品名称',
        dataIndex: 'sku_name',
        search: false,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
      {
        title: 'SKU',
        dataIndex: 'stock_no',
        search: false,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
      {
        title: '发货计划编号',
        dataIndex: 'plan_no',
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
      {
        title: '发货计划状态',
        dataIndex: 'plan_status',
        search: false,
        valueEnum: dicList?.DELIVERY_PLAN_STATUS || {},
        align: 'center',
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
      {
        title: '计划发货数量(总)',
        dataIndex: 'total_plan_shipment',
        search: false,
        align: 'right',
        valueType: 'digit',
        width: 110,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
      {
        title: `计划发货数量(${data.region_name})`,
        dataIndex: 'region_total_plan_shipment',
        search: false,
        align: 'right',
        valueType: 'digit',
        width: 130,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        hideInTable: !data.region_name || data.region_name == '合计',
      },
      {
        title: '未建入库单数量',
        dataIndex: 'total_no_generate_warehousing_order_num',
        search: false,
        align: 'right',
        valueType: 'digit',
        width: 110,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
      {
        title: '入库单号',
        dataIndex: ['waitShipDetails', 'order_no'],
        search: false,
      },
      {
        title: '状态',
        dataIndex: ['waitShipDetails', 'order_status'],
        search: false,
        valueEnum: dicList?.WAREHOUSING_ORDER_STATUS || {},
        align: 'center',
        width: 80,
      },
      {
        title: '待发货数量',
        tooltip:
          '已建入库单，但是供应商没有发货的数量，包括计划关联的入库单新建、撤回中、已撤回三个状态;',
        dataIndex: ['waitShipDetails', 'wait_ship_num'],
        search: false,
        align: 'right',
        valueType: 'digit',
        width: 100,
      },
      {
        title: '已计划发货数量',
        tooltip: '已计划发货数量 = 未建入库单数量 + 待发货数量',
        dataIndex: 'total_planned_shipment',
        search: false,
        align: 'right',
        valueType: 'digit',
        width: 120,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
    ],
    [dicList, data],
  );
  return (
    <>
      <Modal
        width={1400}
        title={title || '已计划发货数量 - 详情'}
        footer={null}
        open={open}
        onCancel={() => openSet(false)}
        bodyStyle={{ paddingTop: 0 }}
        destroyOnClose
      >
        <ProTable
          headerTitle={
            <Space>
              <span>
                {data.region_name
                  ? data.region_name == '合计'
                    ? `${data.region_name}`
                    : `区域: ${data.region_name}`
                  : ''}
              </span>
              <span className={'text-red'}>说明：已计划发货数量 = 未建入库单数量 + 待发货数量</span>
            </Space>
          }
          rowKey={(record: any) =>
            record.plan_id + record?.waitShipDetails.order_no + record?.waitShipDetails.order_id
          }
          bordered
          columns={columns}
          options={false}
          pagination={false}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: true }}
          request={async (params) => {
            const res = await plannedShipments({
              ...params,
              goods_sku_id: data.goods_sku_id,
              platform_code: data?.platform_code || '',
              region: data.region_name || '',
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
              data: flatData(res.data, 'waitShipDetails', '', false),
            };
          }}
          scroll={{ x: 1000, y: 400 }}
          sticky={{ offsetHeader: 0 }}
          showSorterTooltip={false}
          cardProps={{ bodyStyle: { padding: 0 } }}
          summary={(record) => {
            // console.log(record, 'record')
            const sum = record.reduce(
              (result: any, current: any) => ({
                total_no_generate_warehousing_order_num:
                  (Number(result.total_no_generate_warehousing_order_num) || 0) +
                  (current.rowSpan1
                    ? Number(current?.total_no_generate_warehousing_order_num) || 0
                    : 0),
                total_wait_ship_num:
                  (Number(result.total_wait_ship_num) || 0) +
                  (current.rowSpan1 ? Number(current?.total_wait_ship_num) || 0 : 0),
              }),
              { total_no_generate_warehousing_order_num: 0, total_wait_ship_num: 0 },
            );
            return (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ fontWeight: 'bold' }}>
                  <Table.Summary.Cell index={1} colSpan={11}>
                    <Space size={30}>
                      <span>
                        未建入库单数量:{' '}
                        <span className={'text-red'}>
                          {accounting.formatNumber(sum.total_no_generate_warehousing_order_num)}
                        </span>
                      </span>
                      <span>
                        待发货数量:{' '}
                        <span className={'text-red'}>
                          {accounting.formatNumber(sum.total_wait_ship_num)}
                        </span>
                      </span>
                      <span>
                        已计划发货数量:{' '}
                        <span className={'text-red'}>
                          {accounting.formatNumber(data.planned_shipment)}
                        </span>
                      </span>
                    </Space>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Modal>
    </>
  );
};
export default DetailPlanedShipment;

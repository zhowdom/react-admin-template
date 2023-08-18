import { flatData } from '@/utils/filter';
import ProTable from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-table';

const Comp = (props: any) => {
  console.log(props?.defaultData, 'props?.defaultData');
  const fileColumns: ProColumns<any>[] = [
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '计划发货数量(本次)',
      dataIndex: 'delivery_plan_current_num',
      align: 'center',
      width: 110,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: (
        <>
          箱规（最多支持两种箱规）
          <br />
          长（cm）*宽（cm）*高（cm）=体积（cm³）
        </>
      ),
      dataIndex: 'plat_name',
      align: 'center',
      render: (_: any,record: any) => `${record.length}*${record.width}*${record.high}` 
    },
    {
      title: '单箱重量(kg)',
      dataIndex: 'unit_weight',
      align: 'center',
    },
    {
      title: (
        <>
          箱规
          <br />
          (每箱数量)
        </>
      ),
      dataIndex: 'pics',
      align: 'center',
      width: 100,
    },
    {
      title: '箱数',
      dataIndex: 'num',
      width: 90,
      align: 'center',
     
    },
    {
      title: '发货数量',
      dataIndex: 'picsTotal',
      align: 'center',
      width: 90,
      render: (_: any, record: any) => {
        // 箱规计算出来为0, 默认取父的本次计划发货数量
        return (
          <span>
            {(props?.defaultData?.[0]?.specificationList &&
              props?.defaultData?.[0]?.specificationList.reduce(
                (previousValue: any, currentValue: any) =>
                  previousValue + currentValue.pics * currentValue.num,
                0,
              )) ||
              record.delivery_plan_current_num}
          </span>
        );
      },
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '国内入库箱数',
      dataIndex: 'arrival_actual_num',
      align: 'center',
      width: 80,
      render: (_: any, record: any) => {
        let total = 0;
        props?.defaultData?.forEach((sku: any) => {
          const num = sku?.specificationList.reduce((previousValue: any, currentValue: any) => {
            return (
              previousValue +
              (currentValue.arrival_actual_num === null ? 0 : currentValue.arrival_actual_num)
            );
          }, 0);
          total = total + num;
        });
        return total;
      },
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: (
        <>
          国内入库数量
          <br />
          (到港数量)
        </>
      ),
      dataIndex: 'arrival_num',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '国内入库异常',
      dataIndex: 'arrival_exception_num',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
  ];
  return (
    <ProTable<any>
      columns={fileColumns}
      search={false}
      bordered
      options={false}
      pagination={false}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      dataSource={flatData(props?.defaultData || [], 'specificationList')}
      rowKey="id"
      dateFormatter="string"
      className="p-table-0 plan-detali-t"
      style={{ width: '100%' }}
      headerTitle={<span style={{ fontSize: '12px' }}>装箱明细：</span>}
      scroll={{ x: 1200 }}
    />
  );
};
export default Comp;

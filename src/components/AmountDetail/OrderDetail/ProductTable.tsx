import ProTable from '@ant-design/pro-table';
import {Divider, Space, Statistic} from 'antd';
import { pubFilter } from '@/utils/pubConfig';
import { mul } from '@/utils/pubConfirm';
// import BuyHistory from './BuyHistory';
import './index.less';

const ProductTable = (props: any) => {
  const columns: any = [
    {
      title: '关联采购计划单号',
      dataIndex: 'plan_no',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan, style: { padding: 0 } }),
      render: (_, record: any) => {
        if (record?.purchasePlanList?.length) {
          return <Space style={{width: '100%'}} direction={'vertical'} split={<Divider style={{margin: 0, borderColor: '#d9d9d9', width: '100%'}} plain />}>
            {record?.purchasePlanList.map((item: any) => item.plan_no)}
          </Space>
        } else {
          return _
        }
      },
    },
    {
      title: '商品图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      width: 80,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: 'SKU',
      dataIndex: props.business_scope === 'CN' ? 'stock_no' : 'shop_sku_code',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      width: 120,
      render: (_: any, record: any) => {
        return (
          <>
            <div>{props?.business_scope === 'CN' ? record.stock_no : record.shop_sku_code}</div>
            {/* <BuyHistory
              title="采购历史"
              business_scope={props?.business_scope}
              data={data}
              dicList={props?.dicList}
            /> */}
          </>
        );
      },
    },
    {
      title: '生命周期',
      dataIndex: 'life_cycle',
      valueType: 'select',
      align: 'center',
      width: 100,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList.GOODS_LIFE_CYCLE, record?.life_cycle) || '-';
      },
    },
    {
      title: '单位',
      dataIndex: 'uom',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '箱规(每箱数量)',
      dataIndex: 'quantity_per_box',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '商品类型',
      dataIndex: 'goods_sku_type',
      align: 'center',
      width: 100,
      render: (_: any, record: any) => {
        return record.goods_sku_type == '1' ? '采购商品' : '备品(赠品)';
      },
    },
    {
      title: '下单数量',
      dataIndex: 'num',
      align: 'center',
      valueType: 'digit',
      width: 110,
    },
    {
      title: '箱数',
      dataIndex: 'number_boxes',
      align: 'center',
      editable: false,
      render: (_, record: any) => {
        return (
          <Statistic
            value={record?.number_boxes}
            valueStyle={{ fontWeight: 400, fontSize: '12px' }}
          />
        );
      },
    },

    {
      title: `单价${props.tableCurrency}`,
      dataIndex: 'price',
      align: 'center',
      valueType: 'digit',
      width: 160,
    },
    {
      title: `金额${props.tableCurrency}`,
      editable: false,
      dataIndex: 'total',
      align: 'center',
      render: (_, record: any) => {
        const totalNum = record.price && record.num ? mul(record.price, record.num) : '-';
        return [
          <span key="status">
            <Statistic
              value={totalNum}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
              precision={2}
            />
          </span>,
        ];
      },
    },
    {
      title: '供应商出货时间(货好时间)',
      dataIndex: 'shipment_time',
      align: 'center',
      valueType: 'date',
      width: 140,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      align: 'center',
      tooltip: '备注会同步至供应商，供应商可以查看，但不显示到签约采购单',
    },
  ];

  return (
    <ProTable
      columns={columns}
      rowKey="id"
      dataSource={props?.dataSource || []}
      className={'p-table-0 add-order-one-table item0'}
      tableStyle={{ width: '100%' }}
      headerTitle={false}
      scroll={{ x: 2000 }}
      bordered={true}
      search={false}
      options={false}
      pagination={false}
    />
  );
};
export default ProductTable;

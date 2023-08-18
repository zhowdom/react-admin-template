import ProTable from '@ant-design/pro-table';
import {Divider, Space, Statistic, Tooltip} from 'antd';
import { pubFilter } from '@/utils/pubConfig';
import { IsGrey, mul } from '@/utils/pubConfirm';
import './index.less';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { sortBy } from 'lodash';

const DetailsTable = (props: any) => {
  const { dataSource, tableCurrency, business_scope, order_type } = props;
  let tableData: any =
    dataSource?.map((item: any) => {
      // 判断item的 goods_sku_id 是否有备品
      const hasSpare = dataSource?.find(
        (k: any) => k.goods_sku_id == item.goods_sku_id && k.goods_sku_type == 2,
      );
      return {
        ...item,
        rowSpan: item.goods_sku_type == 1 ? (hasSpare ? 2 : 1) : 0,
        copy_price: item.price,
        origin_u: item.undelivered_qty + item.num,
        number_boxes: item.quantity_per_box
          ? Math.ceil(item.num / item.quantity_per_box)
          : item?.quantity_per_box,
      };
    }) || [];
  // 数据顺序不一致, 合并单元格错位v1.2.3
  tableData = sortBy(tableData, ['sku_code', 'goods_sku_type'])
  const columns: any = [
    {
      title: '关联采购计划单号',
      dataIndex: 'plan_no',
      align: 'center',
      hideInTable: order_type == 2,
      onCell: (record: any) => ({ rowSpan: record.rowSpan, style: { padding: 0 } }),
      width: 120,
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
      dataIndex: business_scope === 'CN' ? 'stock_no' : 'shop_sku_code',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      render: (_: any, record: any) => {
        return (
          <>
            <div>{business_scope === 'CN' ? record.stock_no : record.shop_sku_code}</div>
          </>
        );
      },
    },
    {
      title: '商品条形码',
      dataIndex: 'bar_code',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '生命周期',
      dataIndex: 'life_cycle',
      valueType: 'select',
      align: 'center',
      hideInTable: order_type == 2,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList?.GOODS_LIFE_CYCLE, record?.life_cycle) || '-';
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
      render: (_: any, record: any) => {
        return record.goods_sku_type == '1' ? '采购商品' : '备品(赠品)';
      },
    },
    {
      title: '下单数量',
      dataIndex: 'num',
      align: 'center',
      valueType: 'digit',
    },
    {
      title: '箱数',
      dataIndex: 'number_boxes',
      align: 'center',
      render: (_, record: any) => {
        return (
          <Statistic
            value={record?.number_boxes}
            valueStyle={{ fontWeight: 400, fontSize: '14px' }}
          />
        );
      },
    },

    {
      title: `单价${tableCurrency}`,
      dataIndex: 'price',
      align: 'center',
      valueType: 'digit',
      render: (_: any,record: any) => !IsGrey && (record.price??'-')
    },
    {
      title: `金额${tableCurrency}`,
      editable: false,
      dataIndex: 'total',
      align: 'center',
      render: (_, record: any) => {
        const totalNum = record.price && record.num ? mul(record.price, record.num) : '0.00';
        return !IsGrey && [
          <span key="status">
            <Statistic
              value={totalNum}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
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
    },
    {
      title: (
        <>
          备注
          <Tooltip placement="top" title="备注会同步至供应商，供应商可以查看，但不显示到签约采购单">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'remarks',
      align: 'center',
    },
  ];

  return (
    <ProTable
      columns={columns}
      rowKey="id"
      dataSource={tableData}
      className={'expanded-table'}
      tableStyle={{ width: '100%' }}
      headerTitle={false}
      pagination={false}
      options={false}
      search={false}
      toolBarRender={false}
      cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
      style={{ wordBreak: 'break-all' }}
      bordered={true}
      scroll={{x: 1200}}
    />
  );
};
export default DetailsTable;

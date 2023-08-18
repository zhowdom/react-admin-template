import ProTable from '@ant-design/pro-table';

const Detail = (props: any) => {
  // 表格配置
  const columns: any[] = [
    {
      title: 'SKU',
      dataIndex: props.business_scope == 'IN' ? 'shop_sku_code' : 'stock_no',
      align: 'center',
    },
    {
      title: '入库单号',
      dataIndex: 'order_no',
      align: 'center',
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
    },
    {
      title: '平台入库时间',
      dataIndex: 'warehousing_time',
      align: 'center',
    },
  ];
  return (
    <ProTable
      columns={columns}
      options={false}
      pagination={false}
      bordered
      dataSource={props.data}
      rowKey="id"
      search={false}
      dateFormatter="string"
      className="p-table-0"
      headerTitle={false}
    />
  );
};

export default Detail;

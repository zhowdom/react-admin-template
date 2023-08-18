import ProTable from '@ant-design/pro-table';

const SkuTable = (props: any) => {
  const columns: any[] = [
    {
      title: '款式编码',
      dataIndex: ['goodsSku', 'sku_code'],
      width: '100px',
    },
    {
      title: '款式名称',
      dataIndex: ['goodsSku', 'sku_name'],
      width: '100px',
    },
    {
      title: '退货数量',
      dataIndex: 'planQty',
      width: '100px',
    },
    {
      title: '总入库数量',
      dataIndex: 'quantity',
      width: '100px',
    },
    {
      title: '良品数量',
      dataIndex: 'zpActualQty',
      width: '100px',
    },
    {
      title: '次品数量',
      dataIndex: 'ccActualQty',
      width: '100px',
    },
  ];
  return (
    <div className="p-table-inTable-content">
      <ProTable
        dataSource={props.data}
        className={'p-table-0'}
        rowKey="id"
        showHeader={false}
        pagination={false}
        options={false}
        search={false}
        toolBarRender={false}
        cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
        style={{ wordBreak: 'break-all' }}
        bordered
        columns={columns}
      />
    </div>
  );
};

export default SkuTable;

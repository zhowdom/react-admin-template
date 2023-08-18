import { pubFilter } from '@/utils/pubConfig';
import { IsGrey } from '@/utils/pubConfirm';
import ProTable from '@ant-design/pro-table';

const InnerTable = (props: any) => {
  const columns: any[] = [
    {
      title: '采购单价',
      dataIndex: 'sku_price',
      align: 'center',
      width: 100,
      render: (_: any,record: any) => !IsGrey && record.sku_price
    },
    {
      title: '结算币种',
      dataIndex: 'currency',
      align: 'center',
      width: 120,
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList?.SC_CURRENCY, record.currency) || '-';
      },
    },
    {
      title: ' 采购数量',
      dataIndex: 'sku_num',
      align: 'center',
      width: 100,
    },
    {
      title: '未交货数量',
      dataIndex: 'undelivered_num',
      align: 'center',
      width: 100,
    },
  ];
  return (
    <div className="p-table-inTable-content">
      <ProTable
        dataSource={props.data || [{}]}
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

export default InnerTable;

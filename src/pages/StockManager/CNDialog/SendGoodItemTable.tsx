// 列表合并单元格内嵌table / 装箱配置
import React from 'react';
import { ProTable } from '@ant-design/pro-components';

const ListInnerTable: React.FC<{
  value?: any;
}> = ({
  value,
}: any) => {
  const columns: any[] = [
    /*合并字段orderSkuList*/
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      width: 160,
    },
    {
      title: 'SKU',
      dataIndex: 'stock_no',
      width: 120,
    },
    {
      title: '发货数量',
      dataIndex: 'numTotal',
      align: 'center',
      width: 100,
      render: (_: any, row: any) => {
        return (
          <span>
            {row.specificationList &&
              row.specificationList.reduce(
                (previousValue: any, currentValue: any) =>
                  previousValue + currentValue.pics * currentValue.num,
                0,
              )}
          </span>
        );
      },
    },
  ];
  return (
    <div className="p-table-inTable-content">
      <ProTable
        columns={columns}
        dataSource={value}
        rowKey={(record) => record.id + record.order_id}
        showHeader={false}
        className={'p-table-0'}
        bordered
        pagination={false}
        options={false}
        search={false}
        toolBarRender={false}
        cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
        style={{ wordBreak: 'break-all' }}
      />
    </div>
  );
};
export default ListInnerTable;

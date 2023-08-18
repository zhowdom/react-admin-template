import { useState, useEffect } from 'react';
import { Card } from 'antd';
import ProTable from '@ant-design/pro-table';
import { IsGrey, mul } from '@/utils/pubConfirm';
import { priceValue } from '@/utils/filter';

const Dialog = (props: any) => {
  const { tableData } = props;
  const [list, setList] = useState([]);
  const columns: any[] = [
    {
      title: 'SKU',
      dataIndex: 'sku_code',
      align: 'left',
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'left',
    },

    {
      title: '下单数量',
      dataIndex: 'num',
      align: 'right',
    },
    {
      title: '单价',
      dataIndex: 'price',
      align: 'right',
      render: (_: any, record: any) => IsGrey ? '' :priceValue(record.price),
    },
    {
      title: '下单金额',
      dataIndex: 'amount',
      align: 'right',
      render: (_: any, record: any) => IsGrey ? '' : priceValue(mul(record.num, record.price)),
    },
  ];
  useEffect(() => {
    setList(tableData);
  }, [tableData]);

  return (
    <Card title="采购单商品明细" bordered={false} style={{ marginTop: '15px' }}>
      <ProTable
        className="center-th"
        columns={columns}
        pagination={false}
        options={false}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        dataSource={list}
        search={false}
        rowKey="id"
        dateFormatter="string"
        bordered
        toolBarRender={false}
      />
    </Card>
  );
};

export default Dialog;

import { useRef, useState, useEffect } from 'react';
import { Card } from 'antd';
import ProTable from '@ant-design/pro-table';
import { Table, Typography } from 'antd';
import { arraySum, IsGrey } from '@/utils/pubConfirm';
import { dateFormat, priceValue } from '@/utils/filter';
import AskActionOrderDetail from '@/components/Reconciliation/AskActionOrderDetail';

const Dialog = (props: any) => {
  const { tableData, dicList } = props;
  const [list, setList] = useState([]);
  const [columnsDetail, setColumnsDetail] = useState<any>({});
  const { Text } = Typography;

  // 添加弹窗实例
  const askActionOrderDetailModel = useRef();
  // 特批请款明细
  const askActionOrderDetailOpen: any = (orderId?: any) => {
    const data: any = askActionOrderDetailModel?.current;
    data.open(orderId);
  };
  const columns: any[] = [
    {
      title: '请款单号',
      dataIndex: 'funds_no',
      width: 120,
      align: 'left',
    },
    {
      title: '采购单号',
      dataIndex: 'order_no',
      width: 120,
      align: 'left',
    },
    {
      title: '请款时间',
      dataIndex: 'create_time',
      align: 'left',
      width: 120,
      render: (_: any, record: any) => {
        return dateFormat(record.create_time);
      },
    },
    {
      title: '请款人',
      dataIndex: 'create_user_name',
      align: 'left',
    },
    {
      title: '付款时间',
      dataIndex: 'payment_time',
      align: 'left',
      width: 120,
      render: (_: any, record: any) => {
        return dateFormat(record.create_time);
      },
    },
    {
      title: '请款金额',
      dataIndex: 'amount',
      align: 'right',
      render: (_: any, record: any) => {
        return  IsGrey ? '' : priceValue(record.amount);
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 80,
      align: 'center',
      valueType: 'option',
      render: (_: any, row: any) => [
        <a
          onClick={() => {
            askActionOrderDetailOpen(row.id);
          }}
          key="detail"
        >
          查看
        </a>,
      ],
    },
  ];
  useEffect(() => {
    setList(tableData);
    setColumnsDetail({
      amount: arraySum(tableData?.map((v: any) => v.amount)),
    });
  }, [tableData]);

  return (
    <Card title="特批请款明细" bordered={false} style={{ marginTop: '15px' }}>
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
        summary={() => {
          return list?.length ? (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5} align="center">
                合计
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text type="danger">{ IsGrey ? '' : priceValue(columnsDetail?.amount)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
            </Table.Summary.Row>
          ) : null;
        }}
      />
      <AskActionOrderDetail
        askActionOrderDetailModel={askActionOrderDetailModel}
        dicList={dicList}
      />
    </Card>
  );
};

export default Dialog;

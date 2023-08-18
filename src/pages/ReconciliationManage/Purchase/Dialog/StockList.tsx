import { useState, useEffect } from 'react';
import { Card } from 'antd';
import ProTable from '@ant-design/pro-table';
import { Table, Typography } from 'antd';
import { arraySum, IsGrey } from '@/utils/pubConfirm';
import { priceValue } from '@/utils/filter';
import StockOrderDetail from '@/components/Reconciliation/StockOrderDetail';
import StockOrderDetail_IN from '@/components/Reconciliation/StockOrderDetail_IN';

const Dialog = (props: any) => {
  const { tableData, businessScope, dicList, access } = props;
  const [list, setList] = useState([]);
  const [columnsDetail, setColumnsDetail] = useState<any>({});
  const { Text } = Typography;

  const columns: any[] = [
    {
      title: '采购单号',
      dataIndex: 'purchase_order_no',
      align: 'center',
    },
    {
      title: '商品名称',
      dataIndex: 'goods_sku_name',
      align: 'center',
    },
    {
      title: '不含税单价',
      dataIndex: 'no_tax_price',
      align: 'center',
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.no_tax_price);
      },
    },
    {
      title: '税额',
      dataIndex: 'tax',
      align: 'center',
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.tax);
      },
    },
    {
      title: '含税单价',
      dataIndex: 'price',
      align: 'center',
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.price);
      },
    },
    {
      title: `${businessScope == 'CN' ? '入库数量' : '到港数量'}`,
      dataIndex: businessScope == 'CN' ? 'warehousing_num' : 'arrival_num',
      align: 'center',
    },
    {
      title: `${businessScope == 'CN' ? '入库金额' : '到港金额'}`,
      dataIndex: 'total_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.total_amount);
      },
    },
    {
      title: '运费',
      dataIndex: 'freight_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.freight_amount);
      },
      hideInTable: columnsDetail.freight_amount == 0 ? true : false,
    },
    {
      title: '总计',
      dataIndex: 'total',
      align: 'center',
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.total);
      },
    },
    {
      title: '采购单扣款金额',
      dataIndex: 'deduction_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.deduction_amount);
      },
      hideInTable: columnsDetail.deduction_amount == 0 ? true : false,
    },
    {
      title: '已预付金额',
      dataIndex: 'prepayment_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.prepayment_amount);
      },
      hideInTable: columnsDetail.prepayment_amount == 0 ? true : false,
    },
    {
      title: '特批请款金额',
      dataIndex: 'special_funds_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.special_funds_amount);
      },
      hideInTable: columnsDetail.special_funds_amount == 0 ? true : false,
    },
    {
      title: '还需支付金额',
      dataIndex: 'payable_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.payable_amount);
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 80,
      align: 'center',
      valueType: 'option',
      render: (_: any, row: any) => {
        return businessScope == 'CN' ? (
          <StockOrderDetail
            id={row.order_id}
            data={row}
            access={access}
            from="purchase"
            dicList={dicList}
            title={<a key="detail">查看</a>}
          />
        ) : (
          <StockOrderDetail_IN
            id={row.order_id}
            data={row}
            dicList={dicList}
            title={<a key="detail1">查看</a>}
          />
        );
      },
    },
  ];
  useEffect(() => {
    setList(tableData);
    setColumnsDetail({
      warehousing_num: arraySum(tableData?.map((v: any) => v.warehousing_num)),
      arrival_num: arraySum(tableData?.map((v: any) => v.arrival_num)),
      total_amount: arraySum(tableData?.map((v: any) => v.total_amount)),
      freight_amount: arraySum(tableData?.map((v: any) => v.freight_amount)),
      total: arraySum(tableData?.map((v: any) => v.total)),
      deduction_amount: arraySum(tableData?.map((v: any) => v.deduction_amount)),
      prepayment_amount: arraySum(tableData?.map((v: any) => v.prepayment_amount)),
      special_funds_amount: arraySum(tableData?.map((v: any) => v.special_funds_amount)),
      payable_amount: arraySum(tableData?.map((v: any) => v.payable_amount)),
    });
  }, [tableData]);

  return (
    <Card title="入库单明细" bordered={false} style={{ marginTop: '15px' }}>
      <ProTable
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
          return list?.length && !IsGrey  ? (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5} align="center">
                合计
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="center">
                <Text type="danger">
                  {businessScope == 'CN'
                    ? columnsDetail?.warehousing_num
                    : columnsDetail?.arrival_num}
                </Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="center">
                <Text type="danger">{priceValue(columnsDetail?.total_amount)}</Text>
              </Table.Summary.Cell>
              {columnsDetail?.freight_amount == 0 ? (
                ''
              ) : (
                <Table.Summary.Cell index={3} align="center">
                  <Text type="danger">{priceValue(columnsDetail?.freight_amount)}</Text>
                </Table.Summary.Cell>
              )}
              <Table.Summary.Cell index={4} align="center">
                <Text type="danger">{priceValue(columnsDetail?.total)}</Text>
              </Table.Summary.Cell>
              {columnsDetail?.deduction_amount == 0 ? (
                ''
              ) : (
                <Table.Summary.Cell index={5} align="center">
                  <Text type="danger">{priceValue(columnsDetail?.deduction_amount)}</Text>
                </Table.Summary.Cell>
              )}
              {columnsDetail?.prepayment_amount == 0 ? (
                ''
              ) : (
                <Table.Summary.Cell index={6} align="center">
                  <Text type="danger">{priceValue(columnsDetail?.prepayment_amount)}</Text>
                </Table.Summary.Cell>
              )}
              {columnsDetail?.special_funds_amount == 0 ? (
                ''
              ) : (
                <Table.Summary.Cell index={7} align="center">
                  <Text type="danger">{priceValue(columnsDetail?.special_funds_amount)}</Text>
                </Table.Summary.Cell>
              )}
              <Table.Summary.Cell index={8} align="center">
                <Text type="danger">{priceValue(columnsDetail?.payable_amount)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={9} />
            </Table.Summary.Row>
          ) : null;
        }}
      />
    </Card>
  );
};

export default Dialog;

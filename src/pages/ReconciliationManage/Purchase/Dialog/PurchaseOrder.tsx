import { useState, useEffect, useRef } from 'react';
import { Button, Card } from 'antd';
import ProTable from '@ant-design/pro-table';
import { Table, Typography } from 'antd';
import { arraySum, IsGrey } from '@/utils/pubConfirm';
import { priceValue } from '@/utils/filter';
import PurchaseOrderDetailOther from '@/components/Reconciliation/PurchaseOrderDetailOther';
import { exportWarehousingPurchaseOrderSku } from '@/services/pages/reconciliationPurchase';
import { pubMsg } from '@/utils/pubConfig';
import { useAccess } from 'umi';
import OrderDetail from '@/components/OrderDetail';

const Dialog = (props: any) => {
  const { tableData, businessScope, dicList, getDetail, id } = props;
  const [list, setList] = useState([]);
  const [columnsDetail, setColumnsDetail] = useState<any>({});
  const { Text } = Typography;
  const [downLoading, setDownLoading] = useState<any>({});
  const access = useAccess();
  // 添加弹窗实例
  const purchaseOrderDetailOtherModel = useRef();
  // 对账采购单明细
  const purchaseOrderDetailOtherModelOpen: any = (row?: any) => {
    const data: any = purchaseOrderDetailOtherModel?.current;
    data.open(
      row?.account_statement_order_id,
      row?.purchase_order_sku_id,
      businessScope == 'CN' ? row.stock_no : row.shop_sku_code,
    );
  };
  // 导出excel
  const downLoadExcel = async (index: any, purchase_order_sku_id: string) => {
    setDownLoading((pre: any) => {
      return {
        ...pre,
        [`${index}`]: true,
      };
    });
    const res: any = await exportWarehousingPurchaseOrderSku({
      account_statement_order_id: id,
      purchase_order_sku_id,
    });
    const type = res.response.headers.get('content-type');
    if (type && type.indexOf('application/json') > -1) {
      const json = res?.response?.json();
      if (json) {
        json.then((r: any) => {
          pubMsg('操作失败: ' + r?.message);
        });
      } else {
        pubMsg(res?.message);
      }
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `入库明细.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
    setDownLoading((pre: any) => {
      return {
        ...pre,
        [`${index}`]: false,
      };
    });
  };
  const columns: any[] = [
    {
      title: '采购单号',
      dataIndex: 'purchase_order_no',
      align: 'left',
      onCell: (record: any) => {
        return { rowSpan: record?.rowSpan || 0 };
      },
      render: (_: any, record: any) => (
        <OrderDetail
          id={record.purchase_order_id}
          title={<a>{record.purchase_order_no}</a>}
          dicList={dicList}
        />
      ),
    },
    {
      title: 'SKU',
      dataIndex: businessScope == 'CN' ? 'stock_no' : 'shop_sku_code',
      align: 'left',
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'left',
    },
    {
      title: '不含税单价',
      dataIndex: 'no_tax_price',
      align: 'right',
      width: 90,
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.no_tax_price);
      },
    },
    {
      title: '税额',
      dataIndex: 'tax',
      align: 'right',
      width: 90,
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.tax);
      },
    },
    {
      title: '含税单价',
      dataIndex: 'price',
      align: 'right',
      width: 90,
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.price);
      },
    },
    //v1.1.1
    {
      title: '下单数量',
      dataIndex: 'order_num',
      align: 'right',
      valueType: 'digit',
      width: 90,
    },
    {
      title: `${businessScope == 'CN' ? '入库数量' : '到港数量'}`,
      dataIndex: businessScope == 'CN' ? 'warehousing_num' : 'arrival_num',
      align: 'right',
      width: 90,
    },
    {
      title: `${businessScope == 'CN' ? '入库金额' : '到港金额'}`,
      dataIndex: 'total_amount',
      align: 'right',
      width: 90,
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.total_amount);
      },
    },
    {
      title: '运费',
      dataIndex: 'freight_amount',
      align: 'right',
      width: 90,
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.freight_amount);
      },
      hideInTable: columnsDetail.freight_amount == 0 ? true : false,
    },
    {
      title: '总计',
      dataIndex: 'total',
      align: 'right',
      width: 90,
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.total);
      },
    },
    {
      title: '已预付金额',
      dataIndex: 'prepayment_amount',
      align: 'right',
      width: 90,
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.prepayment_amount);
      },
      hideInTable: columnsDetail.prepayment_amount == 0 ? true : false,
    },
    {
      title: '还需支付金额',
      dataIndex: 'payable_amount',
      align: 'right',
      width: 100,
      render: (_: any, record: any) => {
        return IsGrey ? '' :  priceValue(record.payable_amount);
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 110,
      align: 'center',
      valueType: 'option',
      render: (_: any, row: any) => {
        return (
          <>
            <a
              onClick={() => {
                purchaseOrderDetailOtherModelOpen(row);
              }}
              key="detail"
            >
              查看
            </a>
            {(access.canSee('accountStatementOrder_cn_order_receiptDetails') ||
              access.canSee('accountStatementOrder_in_order_receiptDetails')) && (
              <Button
                type="link"
                loading={downLoading[row.index]}
                onClick={() => {
                  downLoadExcel(row.index, row.purchase_order_sku_id);
                }}
              >
                导出
              </Button>
            )}
          </>
        );
      },
    },
  ];
  useEffect(() => {
    setList(
      tableData.map((v: any, index: number) => {
        return {
          ...v,
          index: index + '',
        };
      }),
    );
    setColumnsDetail({
      warehousing_num: arraySum(tableData?.map((v: any) => v.warehousing_num)),
      arrival_num: arraySum(tableData?.map((v: any) => v.arrival_num)),
      total_amount: arraySum(tableData?.map((v: any) => v.total_amount)),
      freight_amount: arraySum(tableData?.map((v: any) => v.freight_amount)),
      total: arraySum(tableData?.map((v: any) => v.total)),
      prepayment_amount: arraySum(tableData?.map((v: any) => v.prepayment_amount)),
      payable_amount: arraySum(tableData?.map((v: any) => v.payable_amount)),
    });
  }, [tableData]);

  return (
    <Card title="采购单明细" bordered={false} style={{ marginTop: '15px' }}>
      <ProTable
        className="center-th"
        columns={columns}
        pagination={false}
        options={false}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        dataSource={list}
        search={false}
        rowKey="purchase_order_sku_id"
        dateFormatter="string"
        bordered
        toolBarRender={false}
        summary={() => {
          return list?.length && !IsGrey  ? (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={7} align="center">
                合计
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text type="danger">
                  {businessScope == 'CN'
                    ? columnsDetail?.warehousing_num
                    : columnsDetail?.arrival_num}
                </Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <Text type="danger">{priceValue(columnsDetail?.total_amount)}</Text>
              </Table.Summary.Cell>
              {columnsDetail?.freight_amount == 0 ? (
                ''
              ) : (
                <Table.Summary.Cell index={3} align="right">
                  <Text type="danger">{priceValue(columnsDetail?.freight_amount)}</Text>
                </Table.Summary.Cell>
              )}
              <Table.Summary.Cell index={4} align="right">
                <Text type="danger">{priceValue(columnsDetail?.total)}</Text>
              </Table.Summary.Cell>
              {columnsDetail?.prepayment_amount == 0 ? (
                ''
              ) : (
                <Table.Summary.Cell index={5} align="right">
                  <Text type="danger">{priceValue(columnsDetail?.prepayment_amount)}</Text>
                </Table.Summary.Cell>
              )}
              <Table.Summary.Cell index={6} align="right">
                <Text type="danger">{priceValue(columnsDetail?.payable_amount)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} />
            </Table.Summary.Row>
          ) : null;
        }}
      />
      <PurchaseOrderDetailOther
        purchaseOrderDetailOtherModel={purchaseOrderDetailOtherModel}
        businessScope={businessScope}
        dicList={dicList}
        getDetail={getDetail}
        id={id}
      />
    </Card>
  );
};

export default Dialog;

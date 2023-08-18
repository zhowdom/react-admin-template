import { useState, useEffect } from 'react';
import { Card, Popconfirm } from 'antd';
import ProTable from '@ant-design/pro-table';
import { Table, Typography } from 'antd';
import { arraySum, IsGrey, mul } from '@/utils/pubConfirm';
import { flatData, priceValue } from '@/utils/filter';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import { removeWarehousingOrderException } from '@/services/pages/reconciliationPurchase';
import { useAccess } from 'umi';
import OrderDetail from '@/components/OrderDetail';

const Dialog = (props: any) => {
  const { tableData, getDetail, dicList } = props;
  const [list, setList] = useState([]);
  const [columnsDetail, setColumnsDetail] = useState<any>({});
  const { Text } = Typography;
  // 删除
  const deleteAction = async (orderId: string) => {
    const res = await removeWarehousingOrderException({ orderId });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('移除成功！', 'success');
      getDetail();
    }
  };
  const access = useAccess();
  const columns: any[] = [
    {
      title: '入库单号',
      dataIndex: 'order_no',
      align: 'left',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: 'SKU',
      dataIndex: 'stock_no',
      align: 'left',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '商品名称',
      dataIndex: 'goods_sku_name',
      align: 'left',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '采购单号',
      dataIndex: 'purchase_order_no',
      align: 'left',
      render: (_: any, record: any) => (
        <OrderDetail
          id={record.purchase_order_id}
          title={<a>{record.purchase_order_no}</a>}
          dicList={dicList}
        />
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      align: 'right',
      width: 110,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.price);
      },
    },
    {
      title: '丢失数量',
      dataIndex: 'logistics_loss_qty',
      align: 'right',
      width: 110,
    },

    {
      title: '金额',
      dataIndex: 'amount',
      align: 'right',
      width: 110,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return  IsGrey ? '' : priceValue(record.amount);
      },
    },
    {
      title: '物流赔偿凭证',
      dataIndex: 'satisfaction_voucher_file_list',
      align: 'left',
      width: 100,
      render: (_: any, record: any) =>
        record?.satisfaction_voucher_file_list?.length ? (
          <ShowFileList data={record.satisfaction_voucher_file_list || []} isShowDownLoad={true} />
        ) : (
          '-'
        ),
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '操作',
      key: 'option',
      width: 100,
      align: 'center',
      valueType: 'option',
      hideInTable: !access.canSee('scm_accountStatementOrder_cn_removeLost'),
      render: (_: any, row: any) => [
        <Popconfirm
          key="delete"
          title="确定移除?"
          onConfirm={async () => deleteAction(row.order_id)}
          okText="确定"
          cancelText="取消"
        >
          <a>移除</a>
        </Popconfirm>,
      ],
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
  ];

  // 重组数据
  const getFlatDataAction = () => {
    const dataC = [];
    const obj = tableData.reduce((prev: any, cur: any) => {
      cur.amount = mul(cur.price, cur.logistics_loss_qty);
      if (prev[cur.order_no]) {
        prev[cur.order_no].push(cur);
      } else {
        prev[cur.order_no] = [cur];
      }
      return prev;
    }, {});
    for (const [key, value] of Object.entries(obj)) {
      const objC = {
        order_no: key,
        childList: value,
      };
      dataC.push(objC);
    }
    return flatData(dataC, 'childList');
  };
  useEffect(() => {
    const dataFlat: any = tableData?.length ? getFlatDataAction() : [];
    setList(dataFlat);
    setColumnsDetail({
      amount: arraySum(tableData?.map((v: any) => v.amount)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);

  return (
    <Card title="物流丢失明细" bordered={false} style={{ marginTop: '15px' }}>
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
              <Table.Summary.Cell index={0} colSpan={6} align="center">
                合计
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text type="danger">{ IsGrey ? '' : priceValue(columnsDetail?.amount)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
              {access.canSee('scm_accountStatementOrder_cn_removeLost') && (
                <Table.Summary.Cell index={3} />
              )}
            </Table.Summary.Row>
          ) : null;
        }}
      />
    </Card>
  );
};

export default Dialog;

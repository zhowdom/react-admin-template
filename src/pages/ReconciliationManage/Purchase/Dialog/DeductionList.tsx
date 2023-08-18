import { useRef, useState, useEffect } from 'react';
import { Card, Popconfirm } from 'antd';
import ProTable from '@ant-design/pro-table';
import { Table, Typography } from 'antd';
import { arraySum, IsGrey } from '@/utils/pubConfirm';
import { dateFormat, priceValue } from '@/utils/filter';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import DeductionOrderDetail from '@/components/Reconciliation/DeductionOrderDetail';
import { removeDeduction } from '@/services/pages/reconciliationPurchase';
import { useAccess } from 'umi';

const Dialog = (props: any) => {
  const { tableData, dicList, getDetail, status, isCn } = props;
  const access = useAccess();
  const [list, setList] = useState([]);
  const [columnsDetail, setColumnsDetail] = useState<any>({});
  const { Text } = Typography;
  // 添加弹窗实例
  const deductionOrderDetailModel = useRef();
  // 特批请款明细
  const deductionOrderDetailModelOpen: any = (orderId?: any) => {
    const data: any = deductionOrderDetailModel?.current;
    data.open(orderId);
  };
  // 删除/移除
  const deleteAction = async (id: string) => {
    const res = await removeDeduction(id);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('移除成功！', 'success');
      getDetail();
    }
  };

  const columns: any[] = [
    {
      title: '扣款类型',
      dataIndex: 'business_type',
      width: 120,
      align: 'left',
      render: (_: any, record: any) => {
        return pubFilter(dicList.BUSINESS_DEDUCTION_BUSINESS_TYPE, record.business_type);
      },
    },
    {
      title: '扣款单号',
      dataIndex: 'deduction_no',
      width: 120,
      align: 'left',
    },
    {
      title: '扣款原因',
      dataIndex: 'reason',
      align: 'left',
    },
    {
      title: '申请日期',
      dataIndex: 'create_time',
      align: 'center',
      width: 100,
      render: (_: any, record: any) => {
        return dateFormat(record.create_time);
      },
    },
    {
      title: '可用扣款金额',
      dataIndex: 'available_amount',
      align: 'right',
      width: 150,
      render: (_: any, record: any) => {
        return  IsGrey ? '' : priceValue(record.available_amount);
      },
    },
    {
      title: '本次抵扣金额',
      dataIndex: 'amount',
      align: 'right',
      width: 150,
      render: (_: any, record: any) => {
        return  IsGrey ? '' : priceValue(record.amount);
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 110,
      align: 'center',
      valueType: 'option',
      render: (_: any, row: any) => [
        <a
          onClick={() => {
            deductionOrderDetailModelOpen(row.id);
          }}
          key="detail"
        >
          查看
        </a>,
        /*数据字典:ACCOUNT_STATEMENT_STATUS 新建和驳回状态才能移除*/
        ((isCn && access.canSee('scm_accountStatementOrder_cn_remove_deduction')) ||
          (!isCn && access.canSee('scm_accountStatementOrder_in_remove_deduction'))) &&
        [1, 3, 5, 7, 10].includes(Number(status)) ? (
          <Popconfirm
            key="delete"
            title="确定移除?"
            onConfirm={async () => deleteAction(row.order_deduction_id)}
            okText="确定"
            cancelText="取消"
          >
            <a>移除</a>
          </Popconfirm>
        ) : null,
      ],
    },
  ];
  useEffect(() => {
    setList(tableData);
    setColumnsDetail({
      available_amount: arraySum(tableData?.map((v: any) => v.available_amount)),
      amount: arraySum(tableData?.map((v: any) => v.amount)),
    });
  }, [tableData]);

  return (
    <Card title="扣款单明细" bordered={false} style={{ marginTop: '15px' }}>
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
              <Table.Summary.Cell index={0} colSpan={columns?.length - 3} align="center">
                合计
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text type="danger">{ IsGrey ? '' : priceValue(columnsDetail?.available_amount)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <Text type="danger">{ IsGrey ? '' : priceValue(columnsDetail?.amount)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} />
            </Table.Summary.Row>
          ) : null;
        }}
      />
      <DeductionOrderDetail
        deductionOrderDetailModel={deductionOrderDetailModel}
        dicList={dicList}
      />
    </Card>
  );
};

export default Dialog;

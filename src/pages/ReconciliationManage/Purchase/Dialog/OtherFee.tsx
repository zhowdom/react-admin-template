import { useState, useEffect } from 'react';
import { Card, Popconfirm } from 'antd';
import ProTable from '@ant-design/pro-table';
import { Table, Typography } from 'antd';
import { arraySum, IsGrey } from '@/utils/pubConfirm';
import { priceValue } from '@/utils/filter';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import { deleteOtherFunds } from '@/services/pages/reconciliationPurchase';
import { useAccess } from 'umi';

const Dialog = (props: any) => {
  const { tableData, detail, dicList, aduitNoModelOpen, getDetail, approval_status } = props;
  const [list, setList] = useState([]);
  const [columnsDetail, setColumnsDetail] = useState<any>({});
  const { Text } = Typography;
  // 删除
  const deleteAction = async (id: string) => {
    const res = await deleteOtherFunds({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('删除成功！', 'success');
      getDetail();
    }
  };
  const access = useAccess();
  // 修改
  const editAction = (row: any) => {
    aduitNoModelOpen(detail.id, 'addOtherFee', false, {
      currency: pubFilter(dicList.SC_CURRENCY, detail?.currency),
      ...row,
      isEdit: true,
    });
  };
  const columns: any[] = [
    {
      title: '费用类型',
      dataIndex: 'funds_type',
      align: 'left',
      width: 100,
    },
    {
      title: '费用说明',
      dataIndex: 'remark',
      align: 'left',
    },

    {
      title: '附件',
      width: 200,
      dataIndex: 'sys_files',
      align: 'left',
      render: (_: any, record: any) => {
        return record?.sys_files?.length ? (
          <ShowFileList data={record.sys_files || []} isShowDownLoad={true} />
        ) : (
          '-'
        );
      },
    },
    {
      title: '费用金额',
      dataIndex: 'amount',
      align: 'right',
      width: 150,
      render: (_: any,record: any) => IsGrey ? '' : priceValue(record?.amount)
    },
    {
      title: '操作',
      key: 'option',
      width: 150,
      align: 'center',
      valueType: 'option',
      hideInTable: !(
        ['1', '3', '5', '7', '10'].includes(approval_status) &&
        (access.canSee('accountStatementOrder_cn_addOtherFee') ||
          access.canSee('accountStatementOrder_in_addOtherFee'))
      ),

      render: (_: any, row: any) => [
        <a
          onClick={() => {
            editAction(row);
          }}
          key="edit"
        >
          修改
        </a>,
        <Popconfirm
          key="delete"
          title="确定删除?"
          onConfirm={async () => deleteAction(row.id)}
          okText="确定"
          cancelText="取消"
        >
          <a>删除</a>
        </Popconfirm>,
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
    <Card title="其他费用" bordered={false} style={{ marginTop: '15px' }}>
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
              <Table.Summary.Cell index={0} colSpan={3} align="center">
                合计
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text type="danger">{IsGrey ? '' : priceValue(columnsDetail?.amount)}</Text>
              </Table.Summary.Cell>
              {['1', '3', '5', '7', '10'].includes(approval_status) &&
                (access.canSee('accountStatementOrder_cn_addOtherFee') ||
                  access.canSee('accountStatementOrder_in_addOtherFee')) && (
                  <Table.Summary.Cell index={2} />
                )}
            </Table.Summary.Row>
          ) : null;
        }}
      />
    </Card>
  );
};

export default Dialog;

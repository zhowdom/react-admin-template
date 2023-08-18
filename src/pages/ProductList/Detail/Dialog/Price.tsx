import { connect } from 'umi';
import { useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import type { ActionType } from '@ant-design/pro-table';
import { pubFilter } from '@/utils/pubConfig';

const Detail = (props: any) => {
  const ref = useRef<ActionType>();
  const { common } = props;
  const formRef = useRef<ProFormInstance>();

  // 表格配置
  const columns: any[] = [
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
    },
    {
      title: '价格',
      dataIndex: 'price',
      align: 'center',
    },
    {
      title: '币种',
      dataIndex: 'vendor_currency',
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(common?.dicList.SC_CURRENCY, record?.vendor_currency) || '-';
      },
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '主供应商',
      dataIndex: 'main',
      align: 'center',
      render: (_: any, record: any) => <span>{record.main ? '是' : '否'}</span>,
    },
  ];
  return (
    <ProTable<TableListItem>
      columns={columns}
      actionRef={ref}
      options={false}
      pagination={false}
      bordered
      formRef={formRef}
      dataSource={props.data}
      rowKey="id"
      search={false}
      className="p-table-0"
      dateFormatter="string"
    />
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Detail);

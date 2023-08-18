import { connect } from 'umi';
import { useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import type { ActionType } from '@ant-design/pro-table';

const Detail = (props: any) => {
  const ref = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  // 表格配置
  const columns: any[] = [
    {
      title: '规格类型',

      dataIndex: 'type',
      align: 'center',
      editable: false,
      width: 90,
      valueEnum: {
        1: { text: '单品尺寸' },
        2: { text: '包装尺寸' },
        3: { text: '箱规' },
      },
    },
    {
      title: '长(cm)',
      dataIndex: 'length',
      align: 'center',
      valueType: 'digit',
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      align: 'center',
    },
    {
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
    },
    {
      title: '重量(g)',
      dataIndex: 'weight',
      align: 'center',
    },
    {
      title: '每箱数量',
      dataIndex: 'pics',
      align: 'center',
      render: (_: any, record: any) => <span>{record.pics || '-'}</span>,
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

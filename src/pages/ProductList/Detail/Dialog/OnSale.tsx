import { connect } from 'umi';
import { useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import type { ActionType } from '@ant-design/pro-table';
import { pubFilter } from '@/utils/pubConfig';

const Detail = (props: any) => {
  const ref = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  // 表格配置
  const columns: any[] = [
    {
      title: '平台',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '店铺',
      dataIndex: 'shop_name',
      align: 'center',
    },
    {
      title: '链接名称',
      dataIndex: 'link_name',
      align: 'center',
    },
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
    },
    {
      title: '商品条码',
      dataIndex: 'code_69',
      align: 'center',
      hideInTable: props?.business_scope == 'IN',
    },
    {
      title: 'UPC',
      dataIndex: 'upc_ean',
      align: 'center',
      hideInTable: props?.business_scope == 'CN',
    },
    {
      title: '销售状态',
      dataIndex: 'sales_status',
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(props?.common?.dicList?.LINK_MANAGEMENT_SALES_STATUS, record.sales_status);
      },
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
      rowKey="shop_sku_code"
      search={false}
      dateFormatter="string"
      className="p-table-0"
      headerTitle={false}
    />
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Detail);

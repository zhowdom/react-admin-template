import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { listLinkManagementSku } from '@/services/pages/products';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';

export default (props: any) => {
  return (
    <ModalForm
      title="上架详情"
      trigger={<a>查看详情</a>}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
      }}
      submitter={false}
      width={1200}
    >
      <ProTable
        request={async (): Promise<any> => {
          const res = await listLinkManagementSku({ id: props?.id });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          }
          return {
            data: res?.data || [],
            success: true,
          };
        }}
        options={false}
        bordered
        size="small"
        search={false}
        rowKey="shop_sku_code"
        columns={[
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
            title: '店铺SKU',
            dataIndex: 'shop_sku_code',
            align: 'center',
          },
          {
            title: '商品条码',
            dataIndex: 'bar_code',
            align: 'center',
            hideInTable: props.business_scope === 'IN',
          },
          {
            title: 'UPC',
            dataIndex: 'bar_code',
            align: 'center',
            hideInTable: props.business_scope === 'CN',
          },
          {
            title: '销售状态',
            dataIndex: 'sales_status',
            width: '120px',
            align: 'center',
            valueEnum: props.dicList?.LINK_MANAGEMENT_SALES_STATUS,
            render: (_: any, record: any) => {
              return (
                pubFilter(props.dicList.LINK_MANAGEMENT_SALES_STATUS, record?.sales_status) || '-'
              );
            },
          },
        ]}
      />
    </ModalForm>
  );
};

import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { listingDetails } from '@/services/pages/stockManage';

export default (props: any) => {
  const { goods_sku_id, platform_code } = props;
  return (
    <ModalForm
      title="链接生命周期"
      trigger={<a>查看链接生命周期</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={false}
      width={1200}
    >
      <ProTable
        request={async (): Promise<any> => {
          const res = await listingDetails({ goods_sku_id, platform_code });
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
        columns={[
          {
            title: '店铺',
            dataIndex: 'shop_name',
          },
          {
            title: '链接名称',
            dataIndex: 'link_name',
          },
          {
            title: '链接ID',
            dataIndex: 'link_id',
          },
          {
            title: '链接生命周期',
            dataIndex: 'life_cycle',
            render: (_: any, record: any) => {
              return (
                pubFilter(props?.dicList.LINK_MANAGEMENT_LIFE_CYCLE, record?.life_cycle) || '-'
              );
            },
          },
          {
            title: '店铺SKU',
            dataIndex: 'shop_sku_code',
          },
          {
            title: '销售状态',
            dataIndex: 'sales_status',
            render: (_: any, record: any) => {
              return (
                pubFilter(props?.dicList.LINK_MANAGEMENT_SALES_STATUS, record?.sales_status) || '-'
              );
            },
          },
          // {
          //   title: '销售销量',
          //   dataIndex: 'num',
          // },
        ]}
      />
    </ModalForm>
  );
};

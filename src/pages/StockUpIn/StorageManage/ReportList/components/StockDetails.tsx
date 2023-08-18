import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { inventoryListByShopSkuCode } from '@/services/pages/stockUpIn/storageManage/reportList';
import { Table } from 'antd';

export default (props: any) => {
  return (
    <ModalForm
      title={`库存明细(${props?.shop_sku_code})`}
      trigger={<a>{props.trigger}</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={false}
      width={800}
    >
      <ProTable
        request={async (): Promise<any> => {
          const res = await inventoryListByShopSkuCode({ shop_sku_code: props?.shop_sku_code });
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
        rowKey={'id'}
        summary={(pageData) => {
          let totalful = 0;
          let totalReserved = 0;

          pageData.forEach(({ fulfillable_quantity, total_reserved_quantity }) => {
            totalful += fulfillable_quantity;
            totalReserved += total_reserved_quantity;
          });

          return (
            <>
              <Table.Summary.Row style={{ fontWeight: 500 }}>
                <Table.Summary.Cell index={0} colSpan={2} align="center">
                  <span>合计</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <span>{totalful}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <span>{totalReserved}</span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
        columns={[
          {
            title: '平台',
            dataIndex: 'platform_name',
            align: 'center',
          },
          {
            title: '店铺',
            dataIndex: 'shop_name',
            align: 'center',
          },
          {
            title: '可售库存',
            dataIndex: 'fulfillable_quantity',
            align: 'right',
          },
          {
            title: '预留数量',
            dataIndex: 'total_reserved_quantity',
            align: 'right',
          },
        ]}
      />
    </ModalForm>
  );
};

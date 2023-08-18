import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { getStockList } from '@/services/pages/deliveryPlan';
import StockOrderDetail from '@/components/Reconciliation/StockOrderDetail';
import { useAccess } from 'umi';
import StockOrderDetail_IN from '@/components/Reconciliation/StockOrderDetail_IN';

const Component = (props: any) => {
  const { dicList, id, business_scope } = props;
  const access = useAccess();
  return (
    <ModalForm
      title={'入库单'}
      trigger={<a>查看入库单</a>}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={false}
      width={1200}
    >
      <ProTable
        request={async (): Promise<any> => {
          const res = await getStockList({ delivery_plan_id: id });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            return {
              data: [],
              total: 0,
              success: false,
            };
          }
          return {
            data: res?.data || [],
            total: res?.data?.total || 0,
            success: true,
          };
        }}
        search={false}
        options={false}
        bordered
        size="small"
        cardProps={{ bodyStyle: { padding: 0 } }}
        rowKey={'id'}
        columns={[
          {
            title: '入库单号',
            dataIndex: 'order_no',
            align: 'center',
            render: (_: any, record: any) =>
              business_scope === 'CN' ? (
                <StockOrderDetail
                  id={record.id}
                  from="stock"
                  access={access}
                  dicList={dicList}
                  title={<a key="detail">{record.order_no}</a>}
                />
              ) : (
                <StockOrderDetail_IN
                  id={record.id}
                  from="stock"
                  dicList={dicList}
                  access={access}
                  title={<a key="detail">{record.order_no}</a>}
                />
              ),
          },
          {
            title: '占用当前计划数量',
            dataIndex: 'delivery_plan_current_num',
            width: 140,
            align: 'center',
          },
          {
            title: '入库单状态',
            dataIndex: 'approval_status',
            align: 'center',
            render: (_: any, record: any) => {
              return pubFilter(dicList?.WAREHOUSING_ORDER_IN_STATUS, record.approval_status) || '-';
            },
          },
          {
            title: '发货数量',
            dataIndex: 'shipped_num',
            align: 'center',
            render: (_: any, record: any) => {
              return record?.shipped_num == 0
                ? record?.delivery_plan_current_num
                : record?.shipped_num ?? '-';
            },
          },
          {
            title: '国内在途数量',
            width: 140,
            dataIndex: 'cn_transit_num',
            align: 'center',
          },
          {
            title: '到港数量',
            dataIndex: 'arrival_num',
            align: 'center',
            hideInTable: business_scope === 'CN',
          },
          {
            title: '国内入库异常',
            dataIndex: 'arrival_exception_num',
            align: 'center',
            hideInTable: business_scope === 'CN',
          },
          {
            title: '跨境在途数量',
            dataIndex: 'in_transit_num',
            align: 'center',
            hideInTable: business_scope === 'CN',
          },
          {
            title: '平台入库数量',
            dataIndex: 'warehousing_num',
            align: 'center',
          },
          {
            title: '平台入库异常',
            dataIndex: 'warehousing_exception_num',
            align: 'center',
          },
        ]}
      />
    </ModalForm>
  );
};
export default Component;

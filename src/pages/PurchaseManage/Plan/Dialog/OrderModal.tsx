import { Tag } from 'antd';
import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { Link, useAccess } from 'umi';
import OrderDetail from '@/components/OrderDetail';
import { listByPurchasePlanId } from '@/services/pages/purchasePlan';

export default (props: any) => {
  const access = useAccess();
  const { dicList } = props;
  return (
    <ModalForm
      title=""
      trigger={<a>查看采购单</a>}
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
          const res = await listByPurchasePlanId({ purchase_plan_ids: props?.id });
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
            title: '采购单号',
            dataIndex: 'order_no',
            align: 'center',
            width: 180,
            render: (_: any, record: any) => {
              return (
                <div className="order-wrapper">
                  {access.canSee('purchase_order_detail') ? (
                    <OrderDetail
                      id={record.purchase_order_id}
                      title={<a>{record.purchase_order_no}</a>}
                      dicList={dicList}
                    />
                  ) : (
                    <span className="c-order">{record.purchase_order_no}</span>
                  )}
                </div>
              );
            },
          },
          {
            title: <>总下单数量<br/>(不含备货)</>,
            dataIndex: 'po_num',
          },
          {
            title: '占用当前计划数量',
            dataIndex: 'num',
          },
          {
            title: '采购单状态',
            dataIndex: 'purchase_order_status',
            align: 'center',
            order: 5,
            hideInSearch: true,
            render: (_, record: any) => {
              const item = dicList?.PURCHASE_APPROVAL_STATUS;
              const key = record?.purchase_order_status;
              return (
                <div className="order-wrapper">
                  {record?.purchaseOrderChangeHistory?.purchase_order_status === '8' &&
                    access.canSee('purchase_order_update_detail') && (
                      <Link
                        to={`/purchase-manage/update-detail?type=detail&id=${record?.purchaseOrderChangeHistory?.id}`}
                      >
                        <Tag color="red">已变更</Tag>
                      </Link>
                    )}
                  <span
                    key="approval_status"
                    style={{
                      display: 'block',
                      margin: record.change_order_approval_status === 8 ? '10px 0' : 0,
                    }}
                  >
                    {record.approval_status === '11' &&
                    access.canSee('purchase_order_update_detail') ? (
                      <Link
                        to={`/purchase-manage/update-detail?type=detail&id=${record?.purchaseOrderChangeHistory?.id}`}
                      >
                        {item?.[key]?.text}
                      </Link>
                    ) : (
                      item?.[key]?.text || '-'
                    )}
                  </span>
                </div>
              );
            },
          },
          {
            title: '下单时间',
            dataIndex: 'create_time',
          },
          {
            title: '审核时间',
            dataIndex: 'approval_agree_time',
          },
          {
            title: '签约时间',
            dataIndex: 'signing_time',
            align: 'center',
          },
          {
            title: '采购员（创建人）',
            dataIndex: 'create_user_name',
            align: 'center',
          },
        ]}
      />
    </ModalForm>
  );
};

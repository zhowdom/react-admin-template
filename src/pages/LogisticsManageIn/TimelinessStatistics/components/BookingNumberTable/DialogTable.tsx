import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import StockOrderDetail_IN from '@/components/Reconciliation/StockOrderDetail_IN';
import { useAccess } from 'umi';
import { getUuid } from '@/utils/pubConfirm';

export default (props: any) => {
  const { api, recordData, dicList } = props;
  // 自定义列 配置
  const access = useAccess();
  const columns: any = [
    {
      title: '入库单号',
      dataIndex: 'warehousing_order_no',
      align: 'center',
      width: 130,
      render: (_: any, record: any) => {
        return access.canSee('stockManager_view_detail_in') ? (
          <StockOrderDetail_IN
            id={record.warehousing_order_id}
            from="stock"
            dicList={dicList}
            access={access}
            title={<a key="detail">{record.warehousing_order_no}</a>}
          />
        ) : (
          record.warehousing_order_no ?? '-'
        );
      },
    },
    {
      title: '采购负责人',
      dataIndex: 'warehouse_create_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: 'Shipment ID',
      dataIndex: 'shipment_id',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: 'Reference ID',
      dataIndex: 'reference_id',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '平台目的仓库',
      dataIndex: 'platform_target_warehouse',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '中文品名',
      dataIndex: 'sku_name',
      align: 'center',
    },
    {
      title: '英文品名',
      dataIndex: 'name_en',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      align: 'center',
    },
    {
      title: '数量',
      dataIndex: 'num',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '箱数',
      dataIndex: 'test9',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record?.warehousingOrderSpecifications?.reduce(
          (pre: any, cur: any) => (pre += cur.num),
          0,
        ) ?? '-',
    },
    {
      title: '货好时间-装柜时间',
      dataIndex: 'warehouse_delivery_days',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '要求入库时间',
      dataIndex: 'required_warehousing_time',
      align: 'center',
      hideInSearch: true,
    },
  ];
  return (
    <ModalForm
      title="货件数（入库单维度）"
      trigger={props.trigger}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={{
        searchConfig: {
          submitText: '确认',
          resetText: '关闭',
        },
        submitButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
      width={1200}
    >
      <ProTable
      scroll={{x: 1200}}
        cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
        request={async (params: any): Promise<any> => {
          const postData: any = {
            current_page: params?.current,
            page_size: params?.pageSize,
            ...params,
            type: '3',
            express_id: recordData.express_id,
            start_port_id: recordData.start_port_id,
            order_no: recordData.order_no,
            end_port_id: recordData.end_port_id,
            prescription_config_id: recordData.prescription_config_id,
          };

          const res = await api(postData);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          }
          return {
            data: res?.data?.records.map((v: any)=>({
              ...v,
              uid: getUuid(),
            })) || [],
            success: true,
            total: res?.data?.total || 0,
          };
        }}
        options={false}
        bordered
        size="small"
        rowKey="uid"
        pagination={{
          showSizeChanger: true,
          className: 'modal-pagi',
        }}
        search={false}
        columns={columns}
      />
    </ModalForm>
  );
};

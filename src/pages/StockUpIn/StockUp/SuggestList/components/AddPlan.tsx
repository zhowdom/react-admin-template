import { useState } from 'react';
import { Divider, Modal, Spin,Button } from 'antd';
import ProTable from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-table';
import {
  stockUpAdviceGetPurchaseShipmentPlan,
} from '@/services/pages/stockUpIn/stockUp/suggestList';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog: React.FC<{
  dicList: any;
  addPlanModel: any;
}> = (props: any) => {
  const { dicList } = props;
  const [loading, setLoading] = useState(false);
  const [deliveryPlans, setDeliveryPlans] = useState<any[]>([]); // 发货
  const [purchasePlans, setPurchasePlans] = useState<any[]>([]); // 采购
  const [isModalVisible, setIsModalVisible] = useState(false);

  const columns: ProColumns<any>[] = [
    {
      title: 'NO.',
      dataIndex: 'index',
      valueType: 'index',
      align: 'center',
      width: 50,
    },
    {
      title: '店铺',
      dataIndex: 'shop_name',
      hideInSearch: true,
      width: 180,
      align: 'center',
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku_code',
      hideInSearch: true,
      align: 'center',
      width: 120,
    },
    {
      title: '备货周期',
      dataIndex: 'cycle_time',
      width: 100,
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '申请采购数量',
      dataIndex: 'num',
      width: 110,
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '发货途径',
      dataIndex: 'delivery_route_name',
      width: 90,
      hideInSearch: true,
      align: 'center',
      render: (_: any, record: any) => record?.applyShipment?.delivery_route_name,
    },
    {
      title: '运输方式',
      dataIndex: 'shipping_method_name',
      align: 'center',
      width: 100,
      hideInSearch: true,
      render: (_: any, record: any) => record?.applyShipment?.shipping_method_name,
    },
    {
      title: '装柜方式',
      dataIndex: 'box_type',
      align: 'center',
      width: 90,
      render: (_: any, record: any) => record?.applyShipment?.box_type_name,
      hideInSearch: true,
    },
    {
      title: '尺寸类型',
      dataIndex: 'belong_classify',
      align: 'center',
      width: 90,
      render: (_: any, record: any) => record?.applyShipment?.belong_classify_name,
      hideInSearch: true,
    },
    {
      title: '计划创建时间',
      dataIndex: 'create_time',
      width: 150,
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '预计货好时间',
      dataIndex: 'vendor_shipment_time',
      width: 110,
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '预计入仓时间',
      dataIndex: 'expected_in_storage_time',
      width: 110,
      hideInSearch: true,
      align: 'center',
    },
  ];
  const columns1: ProColumns<any>[] = [
    {
      title: 'NO.',
      dataIndex: 'index',
      valueType: 'index',
      align: 'center',
      width: 50,
    },
    {
      title: '店铺',
      dataIndex: 'shop_name',
      hideInSearch: true,
      width: 180,
      align: 'center',
    },
    {
      title: '款式名称',
      dataIndex: 'goods_sku_name',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku_code',
      hideInSearch: true,
      align: 'center',
      width: 120,
    },
    {
      title: '备货周期',
      dataIndex: 'cycle_time',
      width: 100,
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '发货途径',
      dataIndex: 'delivery_route_name',
      width: 90,
      hideInSearch: true,
      align: 'center',
      render: (_: any, record: any) => record?.applyShipment?.delivery_route_name,
    },
    {
      title: '运输方式',
      dataIndex: 'shipping_method_name',
      align: 'center',
      width: 100,
      hideInSearch: true,
      render: (_: any, record: any) => record?.applyShipment?.shipping_method_name,
    },
    {
      title: '装柜方式',
      dataIndex: 'box_type',
      align: 'center',
      width: 90,
      render: (_: any, record: any) => record?.applyShipment?.box_type_name,
      hideInSearch: true,
    },
    {
      title: '尺寸类型',
      dataIndex: 'belong_classify',
      align: 'center',
      width: 90,
      render: (_: any, record: any) => record?.applyShipment?.belong_classify_name,
      hideInSearch: true,
    },
    {
      title: '申请发货数量',
      dataIndex: 'num',
      width: 110,
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '计划创建时间',
      dataIndex: 'create_time',
      width: 150,
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '预计入仓时间',
      dataIndex: 'warehousing_time',
      width: 110,
      hideInSearch: true,
      align: 'center',
    },
  ];
  const getList = async (id: any): Promise<any> => {
    setLoading(true);
    const res = await stockUpAdviceGetPurchaseShipmentPlan({ id });
    setLoading(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    setDeliveryPlans(res.data.deliveryPlans || []);
    setPurchasePlans(res.data.purchasePlans || []);
  };

  props.addPlanModel.current = {
    open: (pid?: any) => {
      // console.log(pid);
      setIsModalVisible(true);
      getList(pid);
    },
  };
  // 取消+关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <Modal
      width={1200}
      title="计划预览"
      open={isModalVisible}
      onCancel={() => modalClose()}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
      okText="创建"
      footer={
        [
          <Button key="submit" type="primary" onClick={() => modalClose()}>
            关闭
          </Button>
        ]
      }
    >
      <Spin spinning={loading}>
        <Divider orientation="left" orientationMargin="0">
          采购计划
        </Divider>
        <ProTable<any>
          columns={columns}
          search={false}
          options={false}
          scroll={{x: 1600}}
          bordered
          pagination={false}
          tableAlertRender={false}
          dateFormatter="string"
          dataSource={purchasePlans}
          rowKey="id"
          size="small"
          className="p-table-0"
        />

        <Divider orientation="left" orientationMargin="0">
          发货计划
        </Divider>
        <ProTable<any>
          columns={columns1}
          search={false}
          options={false}
          bordered
          pagination={false}
          scroll={{x: 1600}}
          tableAlertRender={false}
          dateFormatter="string"
          dataSource={deliveryPlans}
          rowKey="id"
          size="small"
          className="p-table-0"
        />
      </Spin>
    </Modal>
  );
};

export default Dialog;

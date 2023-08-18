import React from 'react';
import { Col, Form, Row } from 'antd';
import { EditableProTable } from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { warehousing } from '@/services/pages/order/sales-refund';
import './style.less';

const Comp: React.FC<{ dataSource: any; reload: any; title?: string }> = ({ dataSource = [], reload }) => {
  const [editForm] = Form.useForm();
  const deliveryPackageItems = dataSource?.deliveryPackageItems || [];
  const editableKeys = deliveryPackageItems?.map((item: any) => item.id) || [];
  return (
    <ModalForm
      title="销退单入库"
      trigger={<a>入库</a>}
      layout="horizontal"
      modalProps={{ destroyOnClose: true }}
      initialValues={{ deliveryPackageItems }}
      validateTrigger="onBlur"
      width={1000}
      className="item15"
      labelAlign="right"
      labelCol={{ flex: '90px' }}
      onFinish={async (values: any) => {
        const res: any = await warehousing(values.deliveryPackageItems);
        if (res?.code != pubConfig.sCodeOrder) {
          pubMsg(res.message);
          return;
        }
        pubMsg('操作成功！', 'success');
        if (reload) reload();
        return true;
      }}
    >
      <Row>
        <Col span={12}>
          <Form.Item label="ERP订单号">{dataSource.erpNo ?? '-'}</Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="平台订单号">{dataSource.platformNo ?? '-'}</Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="快递单号">{dataSource.expressCode ?? '-'}</Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="快递公司">{dataSource.logisticsName ?? '-'}</Form.Item>
        </Col>
      </Row>
      <EditableProTable
        name="deliveryPackageItems"
        request={async () => ({
          data: deliveryPackageItems,
          success: true,
        })}
        value={deliveryPackageItems}
        columns={[
          {
            title: '图片',
            dataIndex: ['goodsSku', 'image_url'],
            align: 'center',
            valueType: 'image',
            width: 120,
            editable: false,
          },
          {
            title: '款式编码',
            dataIndex: ['goodsSku', 'sku_code'],
            editable: false,
            width: 120,
          },
          {
            title: '款式名称',
            dataIndex: ['goodsSku', 'sku_name'],
            editable: false,
          },

          {
            title: '条码',
            dataIndex: ['goodsSku', 'bar_code'],
            align: 'center',
            editable: false,
            width: 120,
          },
          {
            title: '申请退回数量',
            dataIndex: 'planQty',
            editable: false,
            width: 120,
          },
          {
            title: '入库数量',
            dataIndex: 'quantity',
            align: 'center',
            valueType: 'digit',
            width: 180,
            formItemProps: () => {
              return {
                rules: [pubRequiredRule],
              };
            },
          },
        ]}
        cardProps={{ bodyStyle: { padding: 0 } }}
        rowKey="id"
        bordered
        recordCreatorProps={false}
        editable={{
          type: 'multiple',
          editableKeys,
          form: editForm,
          actionRender: () => [],
        }}
      />
    </ModalForm>
  );
};
export default Comp;

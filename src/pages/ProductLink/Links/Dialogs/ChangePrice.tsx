import { Col, Form, Modal, Row } from 'antd';
import { ModalForm, ProForm, EditableProTable } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useRef } from 'react';
import { updatePrice } from '@/services/pages/link';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const ChangePrice: React.FC<{
  title?: string;
  reload: any;
  data: Record<string, any>;
}> = ({ title, data, reload }) => {
  const formRef: any = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  return (
    <ModalForm
      title={title || '修改价格'}
      trigger={<a>修改价格</a>}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      formRef={formRef}
      width={800}
      onFinish={async (values) => {
        const res = await updatePrice({ ...values, id: data.id });
        if (res?.code == pubConfig.sCode) {
          pubMsg(res?.message, 'success');
          if (reload) reload();
          return true;
        }
        pubMsg(res?.message);
        return false;
      }}
      onFinishFailed={() => {
        editForm.validateFields();
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
      initialValues={{ skuList: data?.linkManagementSkuList || [] }}
    >
      <Row>
        <Col span={24}>
          <ProForm.Item label={'链接名称'}>{data.link_name}</ProForm.Item>
        </Col>
      </Row>
      <EditableProTable
        name={'skuList'}
        rowKey={'id'}
        size={'small'}
        pagination={false}
        columns={[
          {
            title: 'SKU',
            dataIndex: 'shop_sku_code',
            editable: false,
          },
          {
            title: '款式名称',
            dataIndex: 'sku_name',
            editable: false,
          },
          {
            title: '采销价',
            dataIndex: 'purchase_sale_price',
            align: 'center',
            valueType: 'digit',
            fieldProps: {
              precision: 2,
              min: 0,
              width: 120,
            },
          },
          {
            title: '售价',
            dataIndex: 'sale_price',
            align: 'center',
            valueType: 'digit',
            fieldProps: {
              precision: 2,
              min: 0,
              width: 120,
            },
          },
        ]}
        editable={{
          type: 'multiple',
          editableKeys: data?.linkManagementSkuList?.map((item: any) => item.id),
        }}
        recordCreatorProps={false}
      />
    </ModalForm>
  );
};
export default ChangePrice;

import React, { useRef } from 'react';
import { Col, Form, Row } from 'antd';
import { EditableProTable } from '@ant-design/pro-table';
import { ModalForm, ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { quality } from '@/services/pages/order/sales-refund';
import './style.less';
import { sub } from '@/utils/pubConfirm';

const Comp: React.FC<{ dataSource: any; reload: any; title?: string }> = ({ dataSource = [], reload }) => {
  const [editForm] = Form.useForm();
  const deliveryPackageItems = dataSource?.deliveryPackageItems || [];
  const editableKeys = deliveryPackageItems?.map((item: any) => item.id) || [];
  const formRef = useRef<ProFormInstance>();
  return (
    <ModalForm
      title="销退单质检"
      formRef={formRef}
      trigger={<a>质检</a>}
      layout="horizontal"
      modalProps={{ destroyOnClose: true, forceRender: true }}
      initialValues={{ deliveryPackageItems: dataSource?.deliveryPackageItems || [] }}
      width={1200}
      validateTrigger="onBlur"
      className="item15"
      labelAlign="right"
      labelCol={{ flex: '90px' }}
      onFinish={async (values: any) => {
        const res: any = await quality(values.deliveryPackageItems);
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
      <Form.Item rules={[{ required: true, message: '请添加数据' }]} name="deliveryPackageItems">
        <EditableProTable
          params={{timeStamp: Date.now()}}
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
              editable: false,
              width: 120,
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
              width: 180,
            },

            {
              title: '条码',
              dataIndex: ['goodsSku', 'bar_code'],
              align: 'center',
              editable: false,
              width: 120,
            },
            {
              title: '申请退货数量',
              dataIndex: 'planQty',
              editable: false,
              width: 120,
            },
            {
              title: '入库数量',
              dataIndex: 'quantity',
              align: 'center',
              editable: false,
            },
            {
              title: '良品数量',
              dataIndex: 'zpActualQty',
              align: 'center',
              valueType: 'digit',
              formItemProps: (form: any, row: any) => {
                return {
                  rules: [
                    {
                      validator(_: any, value: any) {
                        if (typeof value != 'number') {
                          return Promise.reject(new Error('请输入良品数量'));
                        }
                        if (value < 0) {
                          return Promise.reject(new Error('良品数量不能小于0'));
                        }
                        if (value > row.entity.quantity) {
                          return Promise.reject(new Error('不能大于入库数量'));
                        }

                        return Promise.resolve();
                      },
                    },
                  ],
                };
              },
            },
            {
              title: '残次品数量',
              dataIndex: 'ccActualQty',
              align: 'center',
              valueType: 'digit',
              formItemProps: (form: any, row: any) => {
                return {
                  rules: [
                    {
                      validator(_: any, value: any) {
                        if (typeof value != 'number') {
                          return Promise.reject(new Error('请输入残次品数量'));
                        }
                        if (value < 0) {
                          return Promise.reject(new Error('残次品数量不能小于0'));
                        }
                        if (value > row.entity.quantity) {
                          return Promise.reject(new Error('不能大于入库数量'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ],
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
            onValuesChange: (record, recordList) => {
              let recordListC = JSON.parse(JSON.stringify(recordList))
              const preRecord = formRef?.current
                ?.getFieldValue('deliveryPackageItems')
                ?.filter((v: any) => v.id == record.id)?.[0];

              if (
                preRecord.zpActualQty != record.zpActualQty &&
                record.zpActualQty <= record.quantity
              ) {
                editForm?.setFieldsValue({
                  [`${record.id}`]: {
                    ccActualQty: sub(record.quantity, record.zpActualQty),
                  },
                });
                recordListC = recordListC.map((v: any) => {
                  return {
                    ...v,
                    ccActualQty: v.id === record.id ? sub(record.quantity, record.zpActualQty) : v.ccActualQty
                  }
                })
              }
              if (
                preRecord.ccActualQty != record.ccActualQty &&
                record.ccActualQty <= record.quantity
              ) {
                editForm?.setFieldsValue({
                  [`${record.id}`]: {
                    zpActualQty: sub(record.quantity, record.ccActualQty),
                  },
                });
                recordListC = recordListC.map((v: any) => {
                  return {
                    ...v,
                    zpActualQty: v.id === record.id ? sub(record.quantity, record.ccActualQty) : v.zpActualQty
                  }
                })
              }
              formRef.current?.setFieldsValue({
                deliveryPackageItems: recordListC,
              });
            },
          }}
        />
      </Form.Item>
    </ModalForm>
  );
};
export default Comp;

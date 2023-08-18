import React, { useRef, useState } from 'react';
import { Col, Form, Row } from 'antd';
import { EditableProTable } from '@ant-design/pro-table';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { handleCutZero, pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { getSpecification, updateSpecification } from '@/services/pages/establish';

const BarCodeEdit: React.FC<{ initData: any }> = ({ initData }) => {
  const [editForm] = Form.useForm();
  const [editableKeys, setEditableKeys] = useState([]);
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  return (
    <ModalForm
      title="设置箱规"
      trigger={<a>设置箱规</a>}
      layout="horizontal"
      formRef={formRef}
      modalProps={{
        destroyOnClose: true,
      }}
      initialValues={{ ...initData }}
      validateTrigger="onBlur"
      width={1100}
      onVisibleChange={async (visible: boolean) => {
        if (visible) {
          setLoading(true);
          const res = await getSpecification({
            id: initData?.id,
          });
          if (res?.code != pubConfig.sCode) {
            setLoading(false);
            pubMsg(res?.message);
          } else {
            const data = JSON.parse(JSON.stringify(res?.data?.projectsGoodsSkus || []));
            data?.forEach((item: any) => {
              const cur = item?.projectsGoodsSkuSpecifications?.[0];
              item.length = cur?.length;
              item.width = cur?.width;
              item.high = cur?.high;
              item.weight = cur?.weight;
              item.pics = cur?.pics;
            });
            formRef.current?.setFieldsValue({
              projectsGoodsSkus: data || [],
            });
            setEditableKeys(data?.map((item: any) => item.id));
            setLoading(false);
          }
        }
      }}
      onFinish={async (values) => {
        return Promise.all([editForm.validateFields()]).then(async () => {
          const postData = JSON.parse(JSON.stringify(values));
          postData.projectsGoodsSkus.forEach((item: any) => {
            const temp = item.projectsGoodsSkuSpecifications?.[0];
            temp.length = item?.length;
            temp.width = item?.width;
            temp.high = item?.high;
            temp.weight = item?.weight;
            temp.pics = item?.pics;
          });
          const res: any = await updateSpecification(postData);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res.message);
            return;
          }
          pubMsg('操作成功！', 'success');
          return true;
        });
      }}
      onFinishFailed={() => {
        editForm.validateFields();
      }}
    >
      <ProFormText name="id" label="id" hidden />
      <Row gutter={20}>
        <Col span={8}>
          <ProFormText name="name" label="产品名称" readonly />
        </Col>
        <Col span={8}>
          <ProFormText name="goods_code" label="产品编码" readonly />
        </Col>
      </Row>
      <Form.Item name="projectsGoodsSkus" label="款式箱规" rules={[pubRequiredRule]}>
        <EditableProTable
          loading={loading}
          columns={[
            {
              title: '款式名称',
              dataIndex: 'sku_name',
              editable: false,
            },
            {
              title: '款式编码',
              dataIndex: 'sku_code',
              align: 'center',
              editable: false,
              width: 120,
            },
            {
              title: '箱规长(cm)',
              dataIndex: 'length',
              align: 'center',
              valueType: 'digit',
              width: 120,
              fieldProps: {
                min: '',
                precision: 2,
                formatter: (value: any) => {
                  return handleCutZero(String(value));
                },
              },
              formItemProps: () => {
                return {
                  rules: [
                    {
                      validator(a: any, value: any) {
                        if (typeof value != 'number') {
                          return Promise.reject(new Error('请输入长度'));
                        }
                        if (typeof value == 'number' && value <= 0) {
                          return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ],
                };
              },
            },
            {
              title: '箱规宽(cm)',
              dataIndex: 'width',
              align: 'center',
              valueType: 'digit',
              width: 120,
              formItemProps: () => {
                return {
                  rules: [
                    {
                      validator(a: any, value: any) {
                        if (typeof value != 'number') {
                          return Promise.reject(new Error('请输入宽度'));
                        }
                        if (typeof value == 'number' && value <= 0) {
                          return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ],
                };
              },
              fieldProps: {
                precision: 2,
                formatter: (value: any) => {
                  return handleCutZero(String(value));
                },
              },
            },
            {
              title: '箱规高(cm)',
              dataIndex: 'high',
              align: 'center',
              valueType: 'digit',
              width: 120,
              fieldProps: {
                precision: 2,
                formatter: (value: any) => {
                  return handleCutZero(String(value));
                },
              },
              formItemProps: () => {
                return {
                  rules: [
                    {
                      validator(a: any, value: any) {
                        if (typeof value != 'number') {
                          return Promise.reject(new Error('请输入高度'));
                        }
                        if (typeof value == 'number' && value <= 0) {
                          return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ],
                };
              },
            },
            {
              title: '重量(g)',
              dataIndex: 'weight',
              align: 'center',
              valueType: 'digit',
              width: 120,
              fieldProps: {
                precision: 2,
                formatter: (value: any) => {
                  return handleCutZero(String(value));
                },
              },
              formItemProps: () => {
                return {
                  rules: [
                    {
                      validator(a: any, value: any) {
                        if (typeof value != 'number') {
                          return Promise.reject(new Error('请输入重量'));
                        }
                        if (typeof value == 'number' && value <= 0) {
                          return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ],
                };
              },
            },
            {
              title: '每箱数量',
              dataIndex: 'pics',
              align: 'center',
              valueType: 'digit',
              width: 120,
              formItemProps: () => {
                return {
                  rules: [
                    {
                      validator(a: any, value: any) {
                        if (typeof value != 'number') {
                          return Promise.reject(new Error('请输入每箱数量'));
                        }
                        if (typeof value == 'number' && value <= 0) {
                          return Promise.reject(new Error('请输入大于0的数值'));
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
          onChange={(editableRows) => {
            console.log(editableRows, 'editableRows');
            formRef?.current?.setFieldsValue({
              projectsGoodsSkus: editableRows,
            });
          }}
          className="center-th"
          editable={{
            type: 'multiple',
            editableKeys,
            form: editForm,
            actionRender: (row, config, defaultDoms) => {
              return [defaultDoms.delete];
            },
            onValuesChange: (record, recordList) => {
              console.log(recordList, 'recordList');
              formRef?.current?.setFieldsValue({
                projectsGoodsSkus: recordList,
              });
            },
          }}
        />
      </Form.Item>
    </ModalForm>
  );
};
export default BarCodeEdit;

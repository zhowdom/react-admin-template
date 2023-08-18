import { Button, Col, Form, Modal, Popconfirm, Row } from 'antd';
import ProForm, { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';
import type { ActionType } from '@ant-design/pro-table';
import { useRef, useState } from 'react';
import { handleCutZero, pubConfig, pubMsg } from '@/utils/pubConfig';
import {
  findGoodsSkuToVendor,
  goodsSkuFindById,
  addVendorSpecification,
} from '@/services/pages/cooperateProduct';
import { getUuid } from '@/utils/pubConfirm';

export default (props: any) => {
  const ref: any = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const formRef1 = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const [editableKeys, setEditableKeys] = useState<any>([]);
  const [vendorKey, setVendorKey] = useState<any>([]);
  const [vendorIds, setVendorIds] = useState<any>([]);
  const [detailData, setDetailData] = useState<any>([]);
  const formItemLayout1 = {
    labelCol: { span: 3 },
    wrapperCol: { span: 20 },
  };
  // 删除SKU
  const delSku = async (record: any) => {
    const newData = formRef?.current?.getFieldValue('specList');
    const data = newData?.filter((item: any) => item.id !== record.id);
    formRef?.current?.setFieldsValue({
      specList: data || [],
    });
    setVendorIds((pre: any) => {
      console.log(
        pre.filter((v: any) => {
          return v != record.vendor_id;
        }),
      );
      return pre.filter((v: any) => {
        return v != record.vendor_id;
      });
    });
    setVendorKey(getUuid());
  };
  return (
    <ModalForm
      title="设置供应商箱规"
      trigger={<a>设置供应商箱规</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      className="spec-setting"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      onVisibleChange={async (visible: boolean) => {
        if (visible) {
          const res = await goodsSkuFindById({ id: props?.record?.id });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          } else {
            const specList =
              res?.data?.goodsSkuSpecificationVendorList.map((v: any) => {
                return {
                  ...v,
                  tempId: getUuid(),
                };
              }) || [];
            formRef.current?.setFieldsValue({
              specList: specList,
            });
            setDetailData(res.data || []);
            setVendorIds(specList?.map((v: any) => v.vendor_id));
            setEditableKeys(specList?.map((v: any) => v.tempId));
          }
        } else {
          setVendorIds([]);
          setEditableKeys([]);
        }
      }}
      formRef={formRef}
      width={1000}
      onFinish={async (values) => {
        return Promise.all([editForm.validateFields()])
          .then(async () => {
            const res = await addVendorSpecification({
              goods_sku_id: props?.record.id,
              goodsSkuSpecificationVendorList: values.specList,
            });
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              return false;
            } else {
              pubMsg('提交成功!', 'success');
              props.reload();
              return true;
            }
          })
          .catch((e) => {
            console.log(e, 22);
            Modal.warning({
              title: '提示',
              content: '请检查表单正确性',
            });
          });
      }}
      onFinishFailed={(e) => {
        editForm.validateFields();
        console.log(e, 11);
        Modal.warning({
          title: '提示',
          content: '请检查表单正确性',
        });
      }}
    >
      <Row>
        <Col span={12}>
          <Form.Item label="商品名称：" name="links">
            {detailData?.sku_name}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="箱规" name="links">
            {`${detailData?.skuSpecifications?.filter((v: any) => v.type == 3)?.[0].length} *
              ${detailData?.skuSpecifications?.filter((v: any) => v.type == 3)?.[0].width} *
              ${detailData?.skuSpecifications?.filter((v: any) => v.type == 3)?.[0].high}*
              ${detailData?.skuSpecifications?.filter((v: any) => v.type == 3)?.[0].weight}*
              ${detailData?.skuSpecifications?.filter((v: any) => v.type == 3)?.[0].pics}`}
          </Form.Item>
        </Col>
        <ProForm
          submitter={false}
          labelAlign="right"
          labelCol={{ span: 6 }}
          style={{ width: '100%' }}
          layout="horizontal"
          formRef={formRef1}
        >
          <Row>
            <Col span={12}>
              <ProFormSelect
                label={'供应商'}
                name={'vendor_id'}
                rules={[{ required: true, message: '请选择供应商' }]}
                showSearch
                key={vendorKey}
                params={{ goods_sku_id: props?.record?.id, custom: vendorIds.length }}
                fieldProps={{ showSearch: true }}
                request={async (params) => {
                  const res = await findGoodsSkuToVendor(params);
                  if (res?.code != pubConfig.sCode) {
                    pubMsg(res?.message);
                    return [];
                  }
                  return res.data.map((item: any) => ({
                    label: item.vendor_name,
                    value: item.vendor_id,
                    disabled: vendorIds.includes(item.vendor_id),
                  }));
                }}
              />
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                style={{ marginLeft: '20px' }}
                onClick={() => {
                  formRef1.current?.validateFields().then((values: any) => {
                    const obj = {
                      goods_sku_id: props?.record?.id,
                      vendor_id: values.vendor_id,
                      length: null,
                      width: null,
                      high: null,
                      weight: null,
                      pics: null,
                      tempId: getUuid(),
                    };
                    const specList = [...formRef.current?.getFieldsValue().specList, obj];
                    formRef.current?.setFieldsValue({
                      specList: specList,
                    });
                    formRef1.current?.setFieldsValue({
                      vendor_id: null,
                    });
                    setVendorIds([...vendorIds, values.vendor_id]);
                    setEditableKeys((pre: any) => [...pre, obj.tempId]);
                  });
                }}
              >
                新增
              </Button>
            </Col>
          </Row>
        </ProForm>

        <Col span={24} className="edit-table bar-code">
          <Form.Item label={'供应商箱规'} name="specList" {...formItemLayout1} labelAlign="right">
            <EditableProTable
              bordered
              rowKey="tempId"
              actionRef={ref}
              size="small"
              recordCreatorProps={false}
              onChange={(editableRows) => {
                formRef?.current?.setFieldsValue({
                  specList: editableRows,
                });
              }}
              editable={{
                type: 'multiple',
                editableKeys,
                form: editForm,
                actionRender: () => {
                  return [];
                },
                onValuesChange: (record, recordList) => {
                  console.log(recordList, 'recordList');
                  formRef?.current?.setFieldsValue({
                    specList: recordList,
                  });
                },
              }}
              columns={[
                {
                  title: '供应商',
                  dataIndex: 'vendor_id',
                  editable: false,
                  valueType: 'select',
                  width: 200,
                  request: async (v) => {
                    const res: any = await findGoodsSkuToVendor(v);
                    if (res?.code != pubConfig.sCode) {
                      pubMsg(res?.message);
                      return [];
                    }
                    return res.data.map((item: any) => ({
                      label: item.vendor_name,
                      value: item.vendor_id,
                    }));
                  },
                },
                {
                  title: '长（cm）',
                  dataIndex: 'length',
                  valueType: 'digit',
                  width: 100,
                  fieldProps: {
                    min: '',
                    precision: 2,
                    formatter: (v: any) => {
                      return handleCutZero(String(v));
                    },
                  },
                  align: 'center',
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
                  title: '宽（cm）',
                  dataIndex: 'width',
                  valueType: 'digit',
                  width: 100,
                  fieldProps: {
                    min: '',
                    precision: 2,
                    formatter: (v: any) => {
                      return handleCutZero(String(v));
                    },
                  },
                  align: 'center',
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
                },
                {
                  title: '高（cm）',
                  dataIndex: 'high',
                  valueType: 'digit',
                  width: 100,
                  fieldProps: {
                    min: '',
                    precision: 2,
                    formatter: (v: any) => {
                      return handleCutZero(String(v));
                    },
                  },
                  align: 'center',
                  formItemProps: () => {
                    return {
                      rules: [
                        {
                          validator(a: any, value: any) {
                            if (typeof value != 'number') {
                              return Promise.reject(new Error('请输入高'));
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
                  title: '重量（g）',
                  dataIndex: 'weight',
                  valueType: 'digit',
                  width: 100,
                  align: 'center',
                  fieldProps: {
                    min: '',
                    precision: 2,
                    formatter: (v: any) => {
                      return handleCutZero(String(v));
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
                  valueType: 'digit',
                  width: 100,
                  align: 'center',
                  fieldProps: {
                    min: '',
                  },
                  formItemProps: () => {
                    return {
                      rules: [
                        {
                          validator(a: any, value: any) {
                            if (typeof value != 'number') {
                              return Promise.reject(new Error('请输入数量'));
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
                  title: '操作',
                  valueType: 'option',
                  width: 80,
                  editable: false,
                  align: 'center',
                  render: (text: any, record: any) => [
                    <Popconfirm
                      key="delete"
                      title="确认删除"
                      onConfirm={() => {
                        delSku(record);
                      }}
                    >
                      <a>删除</a>
                    </Popconfirm>,
                  ],
                },
              ]}
              dataSource={[]}
            />
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  );
};

import React, { useRef, useState } from 'react';
import { Row, Col, Form, Modal, Button } from 'antd';
import { EditableProTable } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { handleCutZero, pubConfig, pubMsg } from '@/utils/pubConfig';
import { getDetail, updateGoodsSkuSpecification } from '@/services/pages/productList';
import './SpecEdit.less';

const SpecEdit = (props: any) => {
  const [editForm] = Form.useForm();
  const formRef = useRef<ProFormInstance>();
  const formItemLayout1 = {
    labelCol: { flex: 'auto' },
    wrapperCol: { flex: 1 },
  };

  // 设置选中的表格key
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(props.editIds);
  const [loading, setLoading] = useState(false);
  const [copyData, setCopyData] = useState<any[]>([]);
  // 处理sku数据
  const handleSkus = (projectsGoodsSkus: any) => {
    return (
      projectsGoodsSkus?.reduce((pre: any[], current: any) => {
        let preC = pre;
        const details = current.skuSpecifications || [];
        if (details.length) {
          const arr = details.map((value: any) => {
            return {
              ...current,
              skuId: current.id,
              ...value,
              pics: value.pics || null,
              rowSpan: details.length == 1 ? 1 : 0,
            };
          });
          if (arr.length && arr.length != 1) {
            arr[0].rowSpan = arr.length;
          }
          preC = [...preC, ...arr];
        } else {
          preC = [...preC, current];
        }
        return preC;
      }, []) || []
    );
  };
  // 复制某一条数据
  const copySkuSpecifications = (data: any) => {
    const ids = data?.skuSpecifications.map((v: any) => v.id);
    console.log(ids);
    const oldData = formRef?.current?.getFieldsValue().projectsGoodsSkus;
    const copy = oldData.filter((k: any) => ids.indexOf(k.id) > -1);
    console.log(copy);
    setCopyData(JSON.parse(JSON.stringify(copy)));
  };
  // 粘贴到某一条数据
  const pasteSkuSpecifications = (pasteData: any) => {
    const oldData = formRef?.current?.getFieldsValue().projectsGoodsSkus;
    const ids = pasteData.map((v: any) => v.id);
    const aa = oldData.map((v: any) => {
      if (ids.indexOf(v.id) > -1) {
        const copyItem = copyData.find((k: any) => k.type == v.type);
        return {
          ...v,
          length: copyItem.length,
          width: copyItem.width,
          high: copyItem.high,
          weight: copyItem.weight,
          pics: copyItem.pics,
        };
      } else {
        return { ...v };
      }
    });
    formRef?.current?.setFieldsValue({
      projectsGoodsSkus: aa,
    });
    pasteData.forEach((v: any) => {
      const copyItem = copyData.find((k: any) => k.type == v.type);
      editForm.setFieldsValue({
        [v.id]: {
          length: copyItem.length,
          width: copyItem.width,
          high: copyItem.high,
          weight: copyItem.weight,
          pics: copyItem.pics,
        },
      });
    });
  };

  const columns1: any = [
    {
      title: '款式',
      dataIndex: 'sku_name',
      align: 'center',
      onCell: (_: any, index: any) => ({ rowSpan: index ? 0 : 3 }),
      render: () => <a>已复制的数据</a>,
    },
    {
      title: '规格类型',
      dataIndex: 'type',
      align: 'center',
      width: 90,
      valueEnum: {
        1: { text: '单品尺寸' },
        2: { text: '包装尺寸' },
        3: { text: '箱规' },
      },
    },
    {
      title: '长(cm)',
      dataIndex: 'length',
      align: 'center',
      width: 150,
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      align: 'center',
      width: 150,
    },
    {
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
      width: 150,
    },
    {
      title: '重量(g)',
      dataIndex: 'weight',
      align: 'center',
      width: 150,
    },
    {
      title: '每箱数量',
      dataIndex: 'pics',
      align: 'center',
      width: 150,
      render: (text: any, record: any) => {
        return record.type === 3 ? text : '--';
      },
    },
    {
      title: '操作',
      dataIndex: 'options',
      width: 120,
      onCell: (_: any, index: any) => ({ rowSpan: index ? 0 : 3 }),
      align: 'center',
      render: () => [
        <Button
          key="clear"
          type="link"
          onClick={() => {
            setCopyData([]);
          }}
        >
          清除
        </Button>,
        <Button
          key="pasteAll"
          type="link"
          onClick={() => {
            console.log(456);
            const allData = formRef?.current?.getFieldsValue().projectsGoodsSkus;
            pasteSkuSpecifications(allData);
          }}
        >
          粘贴到全部
        </Button>,
      ],
    },
  ];
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="规格修改"
      trigger={<a>规格修改</a>}
      onVisibleChange={async (visible: boolean) => {
        if (visible) {
          setLoading(true);
          const res = await getDetail({ id: props.id });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            setLoading(false);
          } else {
            const initForm = res.data;
            const projectsGoodsSkus = res.data.goodsSkus || [];
            initForm.projectsGoodsSkus = handleSkus(projectsGoodsSkus);
            const ids = initForm?.projectsGoodsSkus?.map((val: any) => val.id) || [];
            setEditableRowKeys(ids);
            console.log(initForm.projectsGoodsSkus);
            formRef.current?.setFieldsValue({
              projectsGoodsSkus: initForm.projectsGoodsSkus,
            });
            setLoading(false);
          }
        } else {
          setEditableRowKeys([]);
          setLoading(false);
        }
      }}
      labelAlign="right"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 16 }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      formRef={formRef}
      width={1200}
      onFinish={async (values: any) => {
        return Promise.all([editForm.validateFields()])
          .then(async () => {
            const arr = [];
            const postData = values?.projectsGoodsSkus?.reduce((pre: any[], current: any) => {
              const obj = {
                id: current.id,
                goods_sku_id: current.goods_sku_id,
                type: current.type,
                length: current.length,
                width: current.width,
                high: current.high,
                weight: current.weight,
                pics: current.pics,
              };
              if (pre[current.skuId]) {
                pre[current.skuId].push(obj);
              } else {
                pre[current.skuId] = [obj];
              }
              return pre;
            }, {});
            for (const [key, value] of Object.entries(postData)) {
              console.log(`${key}: ${value}`);
              const obj = {
                id: key,
                skuSpecifications: value,
              };
              arr.push(obj);
            }

            const res = await updateGoodsSkuSpecification({ goodsSkus: arr });
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
            } else {
              pubMsg('修改成功', 'success');
            }
            return true;
          })
          .catch((e) => {
            console.log(e);

            Modal.warning({
              title: '提示',
              content: '请检查表单信息正确性',
            });
            return false;
          });
      }}
      onFinishFailed={() => {
        editForm.validateFields();
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
    >
      <Row>
        <Col span={24}>
          {copyData.length ? (
            <div className="copyTable">
              <ProTable
                className={'p-table-0'}
                dataSource={copyData}
                rowKey="id"
                showHeader={false}
                pagination={false}
                options={false}
                search={false}
                toolBarRender={false}
                size="small"
                bordered
                columns={columns1}
              />
            </div>
          ) : (
            ''
          )}
          <Form.Item
            {...formItemLayout1}
            rules={[{ required: true, message: '请添加产品SKU' }]}
            name="projectsGoodsSkus"
          >
            <EditableProTable
              loading={loading}
              columns={[
                {
                  title: '款式',
                  dataIndex: 'sku_name',
                  onCell: (record: any) => ({ rowSpan: record.rowSpan }),
                  editable: false,
                },
                {
                  title: 'ERP编码',
                  dataIndex: 'erp_sku',
                  onCell: (record: any) => ({ rowSpan: record.rowSpan }),
                  align: 'center',
                  editable: false,
                },
                {
                  title: '规格类型',
                  dataIndex: 'type',
                  align: 'center',
                  editable: false,
                  width: 90,
                  valueEnum: {
                    1: { text: '单品尺寸' },
                    2: { text: '包装尺寸' },
                    3: { text: '箱规' },
                  },
                },
                {
                  title: '长(cm)',
                  dataIndex: 'length',
                  align: 'center',
                  width: 150,
                  valueType: 'digit',
                  fieldProps: {
                    precision: 2,
                    formatter: (value) => {
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
                  title: '宽(cm)',
                  dataIndex: 'width',
                  align: 'center',
                  width: 150,
                  valueType: 'digit',
                  fieldProps: {
                    precision: 2,
                    formatter: (value) => {
                      return handleCutZero(String(value));
                    },
                  },
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
                  title: '高(cm)',
                  dataIndex: 'high',
                  align: 'center',
                  width: 150,
                  valueType: 'digit',
                  fieldProps: {
                    precision: 2,
                    formatter: (value) => {
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
                  width: 150,
                  valueType: 'digit',
                  fieldProps: {
                    precision: 2,
                    formatter: (value) => {
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
                  width: 150,
                  valueType: 'digit',
                  formItemProps: () => {
                    return {
                      rules: [
                        {
                          validator(b: any, value: any) {
                            if (typeof value != 'number') {
                              return Promise.reject(new Error('请输入每箱数量'));
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
                  editable: (text: any, record: any) => {
                    return record.type === 3;
                  },
                },
                {
                  title: '操作',
                  dataIndex: 'options',
                  onCell: (record: any) => ({ rowSpan: record.rowSpan }),
                  align: 'center',
                  width: 120,
                  editable: false,
                  hideInTable: editableKeys?.length == 3,
                  render: (text: any, record: any) => {
                    return copyData.length ? (
                      <a
                        style={{ color: 'red' }}
                        onClick={() => {
                          pasteSkuSpecifications(record.skuSpecifications);
                        }}
                      >
                        粘贴数据
                      </a>
                    ) : (
                      <a
                        onClick={() => {
                          copySkuSpecifications(record);
                        }}
                      >
                        复制数据
                      </a>
                    );
                  },
                },
              ]}
              scroll={{ x: 1000 }}
              className="p-table-0"
              rowKey="id"
              bordered
              recordCreatorProps={false}
              onChange={(editableRows) => {
                formRef?.current?.setFieldsValue({
                  projectsGoodsSkus: editableRows,
                });
              }}
              editable={{
                type: 'multiple',
                editableKeys,
                form: editForm,
                actionRender: () => [],
                onValuesChange: (record, recordList) => {
                  formRef?.current?.setFieldsValue({
                    projectsGoodsSkus: recordList,
                  });
                },
                onChange: (editableKeyss) => {
                  setEditableRowKeys(editableKeyss);
                },
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  );
};
export default SpecEdit;

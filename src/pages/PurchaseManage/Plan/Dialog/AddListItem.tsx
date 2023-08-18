import React, { useRef, useState, useEffect } from 'react';
import {Button, Card, Row, Col, Form, Spin, Space, Popconfirm, Statistic, Divider} from 'antd';
import { ProFormInstance, ProFormText } from '@ant-design/pro-form';
import ProForm, { ProFormSelect, ProFormDatePicker } from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';
import { saveOrderByPlan, saveOrderAuditByPlan } from '@/services/pages/purchasePlan';
import { mul } from '@/utils/pubConfirm';
import {
  pubConfig,
  pubMsg,
  pubAlert,
  pubModal,
  onFinishFailed,
  pubFilter,
} from '@/utils/pubConfig';

const Page = (props: any) => {
  // model的下发数据
  const { itemData, itemIndex, checkFormId, isRolad, checkAllForm, dicList } = props;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [tableCurrency, setTableCurrency] = useState('');
  const [mainList, setMainList] = useState([]);
  const [saveForm] = Form.useForm();
  let saveType = '';

  const getDetail = async (): Promise<any> => {
    setTableCurrency(`(${pubFilter(dicList.SC_CURRENCY, itemData.purchaseOrderSku[0].currency)})`);
    const newSubject = itemData.vendorSubjectList.map((v: any) => {
      return {
        value: v?.subject_id,
        label: v?.subject_name,
      };
    });
    setMainList(newSubject);
  };
  useEffect(() => {
    getDetail();
  }, []);
  useEffect(() => {
    if (isRolad) {
      setFormData(itemData);
      formRef?.current?.setFieldsValue({ ...itemData });
    }
  }, [isRolad]);
  useEffect(() => {
    // checkAllForm 触发子组件的表单校验 只校验checkFormId的供应商数据 已去掉当前页面的 isReadOnly
    if (checkFormId.length) {
      if (!itemData.isReadOnly) {
        formRef?.current
          ?.validateFields()
          .then(async (values) => {
            // console.log(values);
            props.checkFormBack({
              isOk: true,
              data: values,
              vendor_id: itemData.vendor_id,
            });
          })
          .catch((e) => {
            console.log(e);
            // onFinishFailed(e);
            props.checkFormBack({
              isOk: false,
              data: e,
              vendor_name: itemData.vendor_name,
            });
          });
      }
    }
  }, [checkAllForm]);
  // 取消下单
  const cancelItem = () => {
    pubModal(`是否确定取消 (${formData.vendor_name}) 的采购单？`)
      .then(() => {
        console.log('点击了确定');
        props.itemBack({
          delVendor: true,
          itemIndex: itemIndex,
        });
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 删除SKU
  const delSku = (index: number, row: any) => {
    console.log(row);
    if (row.goods_sku_type == 1) {
      const okNum = formData.purchaseOrderSku.filter((v: any) => v.goods_sku_type == 1);
      if (okNum.length == 1) return pubAlert('请至少保留一个SKU！');
    }
    props.itemBack({
      delSku: true,
      itemIndex: itemIndex,
      delRow: row,
      delIndex: index,
    });
  };

  // 添加备品
  const addSpare = async (index: number, row: any) => {
    console.log(index);
    console.log(row);
    const newRow = {
      ...row,
      goods_sku_type: 2,
      tId: `${itemData.vendor_id}-${row.plan_id}-2`,
      num: '',
      number_boxes: 0,
      remarks: '备品',
      price: 0,
      copy_price: 0,
      total_price: 0,
      rowSpan: 0,
      hasSpare: true,
    };
    const newData = JSON.parse(JSON.stringify(itemData));
    newData.purchaseOrderSku[index].rowSpan = 2;
    newData.purchaseOrderSku[index].hasSpare = true;
    newData.purchaseOrderSku.splice(index + 1, 0, newRow);

    console.log(newData);
    props.itemBack({
      addSpare: true,
      itemIndex: itemIndex,
      newItem: newData,
    });
    // formRef?.current?.setFieldsValue({ ...newData });
  };

  // 接口提交
  const submitOver = async (values: Record<string, any>) => {
    console.log(saveType);
    // 判断SKU的发货数量是不是为0  ERP同步过来的数据有可能为0，限制不能生成采购单
    let num = 0;
    values.purchaseOrderSku.forEach((v: any) => {
      console.log(v.quantity_per_box);
      if (!v.quantity_per_box) {
        num++;
      }
    });
    console.log(num);
    if (num) return pubAlert('发货数量不能为0，请查检修改SKU箱规！');
    let res;
    setLoading(true);
    if (saveType == 'save') {
      res = await saveOrderByPlan([values]);
    }
    if (saveType == 'saveAndAudit') {
      res = await saveOrderAuditByPlan([values]);
    }
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功', 'success');
      props.itemBack({
        isReadOnly: true,
        itemIndex: itemIndex,
        vendor_id: itemData.vendor_id,
        orderNo: res.data[0],
        newSkuData: values.purchaseOrderSku,
      });
    }
    setLoading(false);
  };

  // 单个的提交
  const itemSave = (type: any) => {
    saveType = type;
    formRef.current?.submit();
  };

  // 提交
  const onFinish = async (values: Record<string, any>) => {
    return Promise.all([saveForm?.validateFields()])
      .then(async () => {
        console.log(values);
        submitOver(values);
      })
      .catch((e) => {
        onFinishFailed(e);
      });
  };
  const onchange = async (values: any, data: any) => {
    const newData = { ...formData, ...data };
    props.itemChange(newData, itemIndex);
  };

  const columnsSkus = [
    {
      title: 'tId',
      dataIndex: 'tId',
      align: 'center',
      editable: false,
      width: 130,
      hideInTable: true,
    },
    {
      title: '关联采购计划单号',
      dataIndex: 'plan_no',
      align: 'center',
      editable: false,
      width: 130,
      onCell: (record: any) => ({ rowSpan: record.rowSpan, style: { padding: 0 } }),
      render: (_, record: any) => {
        if (record?.purchasePlanList?.length) {
          return <Space style={{width: '100%'}} direction={'vertical'} split={<Divider style={{margin: 0, borderColor: '#d9d9d9', width: '100%'}} plain />}>
            {record?.purchasePlanList.map((item: any) => item.plan_no)}
          </Space>
        } else {
          return _
        }
      },
    },
    {
      title: '计划下单数量',
      dataIndex: 'plan_num',
      align: 'center',
      editable: false,
      width: 110,
      onCell: (record: any) => ({ rowSpan: record.rowSpan, style: { padding: 0 } }),
      render: (_, record: any) => {
        if (record?.purchasePlanList?.length) {
          return <Space style={{width: '100%'}} direction={'vertical'} split={<Divider style={{margin: 0, borderColor: '#d9d9d9', width: '100%'}} plain />}>
            {record?.purchasePlanList.map((item: any) => item.num)}
          </Space>
        } else {
          return _
        }
      },
    },
    {
      title: '未下单数量',
      dataIndex: 'undelivered_qty',
      align: 'center',
      editable: false,
      width: 110,
      onCell: (record: any) => ({ rowSpan: record.rowSpan, style: { padding: 0 } }),
      render: (_, record: any) => {
        if (record?.purchasePlanList?.length) {
          return <Space style={{width: '100%'}} direction={'vertical'} split={<Divider style={{margin: 0, borderColor: '#d9d9d9', width: '100%'}} plain />}>
            {record?.purchasePlanList.map((item: any) => item.no_order_qty)}
          </Space>
        } else {
          return _
        }
      },
    },
    {
      title: '商品图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      editable: false,
      width: 80,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
      editable: false,
      width: 200,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: 'SKU',
      dataIndex: 'over_code',
      align: 'center',
      editable: false,
      width: 130,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '单位',
      dataIndex: 'uom',
      align: 'center',
      editable: false,
      width: 80,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '箱规(每箱数量)',
      dataIndex: 'quantity_per_box',
      align: 'center',
      editable: false,
      width: 170,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '供应商出货时间(货好时间)',
      dataIndex: 'shipment_time',
      align: 'center',
      valueType: 'date',
      fixed: 'right',
      width: 140,
      formItemProps: () => {
        return {
          rules: [
            {
              required: true,
              message: '请输入时间',
            },
          ],
        };
      },
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      align: 'center',
      fixed: 'right',
      width: 100,
    },
    {
      title: '商品类型',
      dataIndex: 'goods_sku_type',
      align: 'center',
      fixed: 'right',
      editable: false,
      width: 100,
      render: (_: any, record: any) => {
        return record.goods_sku_type == '1' ? '采购商品' : '备品(赠品)';
      },
    },
    {
      title: '下单数量',
      dataIndex: 'num',
      align: 'center',
      fixed: 'right',
      valueType: 'digit',
      width: 110,
      fieldProps: {
        precision: 0,
      },
      formItemProps: (_: any, row: any) => {
        return {
          rules: [
            {
              required: true,
              validator(a: any, value: any) {
                if (!value) {
                  return Promise.reject(new Error('请输入下单数量'));
                }
                if (value > row.entity.undelivered_qty && row.goods_sku_type == 1) {
                  return Promise.reject(new Error('下单数量不能大于未下单数量'));
                }
                if (value <= 0) {
                  return Promise.reject(new Error('下单数量不能小于1'));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
    {
      title: '箱数',
      dataIndex: 'number_boxes',
      align: 'center',
      fixed: 'right',
      width: 80,
      editable: false,
    },
    {
      title: `单价${tableCurrency}`,
      dataIndex: 'price',
      fixed: 'right',
      align: 'center',
      width: 160,
      valueType: 'digit',
      fieldProps: {
        min: 0,
        precision: 2,
      },
      // formItemProps: {
      //   rules: [{ required: true, message: '请输入单价' }],
      // },
      editable: (text: any, record: any) => record.goods_sku_type == 1,
      formItemProps: (_: any, row: any) => {
        return {
          // extra: '低于正常采购价20%',
          extra: row.entity.extra ? row.entity.extra : '',
          rules: [
            {
              required: true,
              message: '请输入单价',
            },
            {
              message: '不能高于最新采购价',
              validator(a: any, value: any) {
                if (value > row.entity.copy_price) {
                  return Promise.reject();
                }
                return Promise.resolve();
              },
            },
            {
              warningOnly: true,
              validator(a: any, value: any) {
                if (!row.entity?.copy_price) return Promise.resolve();
                if (!value) return Promise.resolve();
                if (value < mul(row.entity.copy_price, 0.8)) {
                  return Promise.reject(new Error('低于最新采购价20%'));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
    {
      title: `金额${tableCurrency}`,
      dataIndex: 'total_price',
      align: 'center',
      fixed: 'right',
      width: 100,
      editable: false,
      render: (_, record: any) => (
        <Statistic
          value={record.total_price}
          valueStyle={{ fontWeight: 400, fontSize: '14px' }}
          precision={2}
        />
      ),
    },
    {
      title: '操作',
      dataIndex: 'option',
      align: 'center',
      width: 80,
      editable: false,
      fixed: 'right',
      valueType: 'option',
      render: (_: any, row: any, index: number) => {
        return itemData.isReadOnly ? (
          ''
        ) : (
          <>
            <Popconfirm
              key="delete"
              title="确认删除"
              onConfirm={() => {
                delSku(index, row);
              }}
            >
              <a>{row.goods_sku_type == 1 ? '删除' : '删除备品'}</a>
            </Popconfirm>
            <div />
            {!row.hasSpare ? (
              <a
                key="addSpare"
                onClick={() => {
                  addSpare(index, row);
                }}
              >
                添加备品
              </a>
            ) : (
              ''
            )}
          </>
        );
      },
    },
  ];
  return (
    <Card title={false} bordered={false} style={{ marginTop: itemIndex ? '10px' : '0' }}>
      <ProForm
        layout="horizontal"
        formRef={formRef}
        labelWrap={true}
        submitter={false}
        labelAlign="right"
        onFinish={onFinish}
        onFinishFailed={(e) => {
          console.log(e);
          saveForm.validateFields();
          onFinishFailed(e);
        }}
        onValuesChange={onchange}
      >
        <Spin spinning={loading}>
          {itemData.isReadOnly ? (
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item label="采购单号">{itemData.orderNo}</Form.Item>
              </Col>
            </Row>
          ) : (
            <Space style={{ marginBottom: '10px' }}>
              {checkFormId.length > 1 ? <Button onClick={() => cancelItem()}>取消下单</Button> : ''}
              <Button type="primary" ghost onClick={() => itemSave('save')}>
                保存采购单
              </Button>
              <Button type="primary" onClick={() => itemSave('saveAndAudit')}>
                保存并提交审核
              </Button>
            </Space>
          )}
          <Row gutter={20}>
            <Col span={8}>
              <ProFormText name="vendor_id" label="供应商ID" hidden />
              <Form.Item label="供应商">{formData.vendor_name}</Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="税率">
                {pubFilter(dicList.VENDOR_TAX_RATE, formData?.tax_rate) || '--'}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={8}>
              <ProFormSelect
                name="main_id"
                label="采购主体"
                readonly={itemData.isReadOnly}
                rules={[{ required: true, message: '请选择采购主体' }]}
                fieldProps={{
                  options: mainList,
                  filterOption: (input: any, option: any) => {
                    const trimInput = input.replace(/^\s+|\s+$/g, '');
                    if (trimInput) {
                      return option.label.indexOf(trimInput) >= 0;
                    } else {
                      return true;
                    }
                  },
                }}
              />
            </Col>
            <Col span={8}>
              <ProFormText name="currency" label="币种" hidden />
              <ProFormText name="vendorSubjectList" label="主体的列表" hidden />
              <ProFormDatePicker
                name="expected_receipt_time"
                label="预计入库时间"
                readonly={itemData.isReadOnly}
                rules={[{ required: true, message: '请选择预计入库时间' }]}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                label="是否节日订单"
                name="festival"
                readonly={itemData.isReadOnly}
                rules={[{ required: true, message: '请选择是否节日订单' }]}
                valueEnum={dicList?.PURCHASE_FESTIVAL}
              />
            </Col>
          </Row>
          <Form.Item name="purchaseOrderSku">
            <EditableProTable
              className="p-table-0 add-order-one-table"
              controlled={true}
              bordered
              editable={{
                form: saveForm,
                type: 'multiple',
                editableKeys: itemData.isReadOnly
                  ? []
                  : formData.purchaseOrderSku?.map((record: any) => record.tId),
                onValuesChange: (val, allRow) => {
                  console.log(val);
                  console.log(allRow);
                  val.number_boxes = val.quantity_per_box
                    ? Math.ceil(val.num / val.quantity_per_box)
                    : val.quantity_per_box;
                  val.total_price = mul(val.num, val.price);
                  if (val.price < mul(val.copy_price, 0.8)) {
                    val.extra = '低于最新采购价20%';
                  } else {
                    val.extra = '';
                  }
                },
              }}
              scroll={{ x: 1800 }}
              recordCreatorProps={false}
              columns={columnsSkus}
              rowKey={'tId'}
            />
          </Form.Item>
        </Spin>
      </ProForm>
    </Card>
  );
};
// 全局model注入
export default Page;

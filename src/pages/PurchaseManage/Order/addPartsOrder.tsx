import type { FC } from 'react';
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Row, Col, Form, Spin, Popconfirm, Empty, Statistic } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
  ProFormDatePicker,
  ProFormDependency,
} from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import './addPartsOrder.less';
import { connect, history, useAccess, Access } from 'umi';
import {
  saveOrderByPlan,
  saveOrderAuditByPlan,
  findValidVendorToSubject,
} from '@/services/pages/purchasePlan';
import { mul, arraySum, pubGetVendorList } from '@/utils/pubConfirm';
import { priceValue } from '@/utils/filter';
import {
  pubConfig,
  pubMsg,
  pubFilter,
  onFinishFailed,
  pubAlert,
  pubRequiredLengthRule,
} from '@/utils/pubConfig';
import PartsSku from './components/PartsSku';

const Page: FC<Record<string, any>> = (props) => {
  const access = useAccess();
  const readonly = history?.location?.query?.readonly;
  // model下发数据
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [venderList, setVenderList] = useState([]);
  const [mainList, setMainList] = useState([]);
  const [venderInfo, setVenderInfo] = useState<any>({});
  const [goodsSkuDate, setGoodsSkuDate] = useState<any>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [tableCurrency, setTableCurrency] = useState('');
  const [saveForm] = Form.useForm();
  let saveType = '';
  // 添加弹窗实例
  const partsSkuModel = useRef();
  // 选择配件商品
  const partsSkuOpen: any = () => {
    const data: any = partsSkuModel?.current;
    data.open(venderInfo, goodsSkuDate);
  };
  // 弹窗关闭
  const modalClose = (data: any) => {
    if (!data) return;
    console.log(data);

    let skuData = JSON.parse(JSON.stringify(data));
    skuData = skuData.map((v: any) => {
      return {
        ...v,
        goods_sku_type: v.goods_sku_type || 1,
        quantity_per_box: v?.goodsSkuSpecification?.pics,
        number_boxes: 0,
        tId: `${v.id}1`,
        rowSpan: 1,
        hasSpare: false,
      };
    });
    setGoodsSkuDate(skuData);
    formRef?.current?.setFieldsValue({
      purchaseOrderSku: skuData,
    });
  };

  // 根据SKUids 得到可以选择的供应商下拉列表
  const getVenderList = async () => {
    setLoading(true);
    const res: any = await pubGetVendorList({ vendor_status_array: [1, 4], business_scope: 'CN' });
    setVenderList(res);
    setLoading(false);
  };
  // (单个供应商)查询某个供应商下面所有在有效期内的签约主体
  const getValidVendor = async (vendorId?: any) => {
    setLoading(true);
    const res = await findValidVendorToSubject({ vendorId, abroad: 1 });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const newSubject = res.data.map((v: any) => {
        return {
          value: v.subject_id,
          label: v.subject_name,
        };
      });
      setMainList(newSubject);
    }
    setLoading(false);
  };
  // 改变供应商时获取供应商信息
  const changeVendor = async (id: string, data: any) => {
    setVenderInfo(data?.data);
    getValidVendor(id);
    // 取供应商的币种
    setTableCurrency(`(${pubFilter(common.dicList.SC_CURRENCY, data?.data?.currency)})`);
    formRef.current?.setFieldsValue({
      main_id: null,
      currency: data?.data?.currency,
    });
  };
  useEffect(() => {
    getVenderList();
  }, []);

  // 删除SKU
  const delSku = async (index: number, row: any) => {
    console.log(index);
    console.log(row);
    const newData = formRef?.current?.getFieldsValue();
    console.log(newData);
    if (row.goods_sku_type == 2) {
      newData.purchaseOrderSku.splice(index, 1);
      newData.purchaseOrderSku[index - 1].hasSpare = false;
      newData.purchaseOrderSku[index - 1].rowSpan = 1;
    } else {
      const okNum = newData.purchaseOrderSku.filter((v: any) => v.goods_sku_type == 1);
      if (okNum.length == 1) return pubAlert('请至少保留一个SKU！');
      newData.purchaseOrderSku = newData.purchaseOrderSku.filter((v: any) => v.id != row.id);
    }
    formRef?.current?.setFieldsValue({ ...newData });
    setGoodsSkuDate(newData.purchaseOrderSku);
  };

  // 添加备品
  const addSpare = async (index: number, row: any) => {
    console.log(index);
    console.log(row);
    const newRow = {
      ...row,
      goods_sku_type: 2,
      tId: `${row.id}2`,
      num: '',
      number_boxes: 0,
      remarks: '备品',
      price: 0,
      copy_price: 0,
      total_price: 0,
      rowSpan: 0,
      hasSpare: true,
    };
    const newData = formRef?.current?.getFieldsValue();
    newData.purchaseOrderSku[index].rowSpan = 2;
    newData.purchaseOrderSku[index].hasSpare = true;
    newData.purchaseOrderSku.splice(index + 1, 0, newRow);

    formRef?.current?.setFieldsValue({ ...newData });
    setGoodsSkuDate(newData.purchaseOrderSku);
  };

  // 提交
  const onFinish = async (values: Record<string, any>) => {
    console.log(values);
    values.order_type = 2;
    return Promise.all([saveForm?.validateFields()])
      .then(async () => {
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
          history.goBack();
        }
        setLoading(false);
      })
      .catch((e) => {
        onFinishFailed(e);
      });
  };

  const columnsSkus = [
    {
      title: 'tId',
      dataIndex: 'tId',
      align: 'center',
      editable: false,
      hideInTable: true,
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
      dataIndex: 'stock_no',
      align: 'center',
      editable: false,
      width: 130,
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
      title: '单位',
      dataIndex: 'uom',
      align: 'center',
      editable: false,
      width: 80,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
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
                console.log(value, '99');
                if (value == undefined) {
                  return Promise.reject(new Error('请输入下单数量'));
                }
                if (row.entity.quantity_per_box && value % row.entity.quantity_per_box) {
                  return Promise.reject(new Error('非整箱！'));
                }
                if (value > 99999) {
                  return Promise.reject(`输入内容不能超过99999`);
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
      width: 110,
      valueType: 'digit',
      fieldProps: {
        min: 0,
        precision: 2,
      },
      editable: (text: any, record: any) => record.goods_sku_type == 1,
      formItemProps: () => {
        return {
          rules: [
            {
              required: true,
              validator(a: any, value: any) {
                if (value == undefined) {
                  return Promise.reject(new Error('请输入单价'));
                }
                if (value > 99999) {
                  return Promise.reject(`输入内容不能超过99999`);
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
      title: '操作',
      dataIndex: 'option',
      align: 'center',
      width: 80,
      editable: false,
      fixed: 'right',
      valueType: 'option',
      render: (_: any, row: any, index: number) => (
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
      ),
    },
  ];
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <ProForm
        layout={'horizontal'}
        formRef={formRef}
        submitter={{
          render: (data) => {
            return !readonly ? (
              <FooterToolbar>
                <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                  返回
                </Button>
                <Access
                  key="save"
                  accessible={
                    access.canSee('purchase_plan_create_batch') ||
                    access.canSee('purchase_plan_create_in_batch')
                  }
                >
                  <Button
                    type="primary"
                    ghost
                    onClick={() => {
                      saveType = 'save';
                      data.form?.submit?.();
                    }}
                  >
                    保存采购单
                  </Button>
                </Access>
                <Access
                  key="saveAudit"
                  accessible={
                    access.canSee('purchase_plan_create_batch') ||
                    access.canSee('purchase_plan_create_in_batch')
                  }
                >
                  <Button
                    type="primary"
                    onClick={() => {
                      saveType = 'saveAndAudit';
                      data.form?.submit?.();
                    }}
                  >
                    保存并提交审核
                  </Button>
                </Access>
              </FooterToolbar>
            ) : (
              <FooterToolbar>
                <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                  返回
                </Button>
              </FooterToolbar>
            );
          },
        }}
        labelAlign="right"
        onFinish={onFinish}
        onFinishFailed={(e) => {
          saveForm.validateFields();
          onFinishFailed(e);
        }}
        labelWrap={true}
      >
        <Spin spinning={loading}>
          <Card title={'创建配件采购单'} bordered={false}>
            <ProFormSelect
              name="vendor_id"
              label="供应商"
              rules={[{ required: true, message: '请选择供应商' }]}
              showSearch
              debounceTime={300}
              fieldProps={{
                options: venderList,
                filterOption: (input: any, option: any) => {
                  const trimInput = input.replace(/^\s+|\s+$/g, '');
                  if (trimInput) {
                    return option.label.indexOf(trimInput) >= 0;
                  } else {
                    return true;
                  }
                },
                onChange: (id, data) => {
                  setGoodsSkuDate([]);
                  formRef?.current?.setFieldsValue({
                    purchaseOrderSku: [],
                  });
                  changeVendor(id, data);
                },
                notFoundContent: (
                  <Empty
                    className="pub-empty-blue"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="没有满足所选全部商品的供应商"
                  />
                ),
              }}
              labelCol={{ flex: '150px' }}
              wrapperCol={{ span: 8 }}
            />

            <ProFormDependency name={['vendor_id']}>
              {({ vendor_id }) => {
                if (vendor_id) {
                  return (
                    <div className="add-order-byPlan-one">
                      <Row gutter={20}>
                        <Col span={8}>
                          <Form.Item label="供应商联系人">{venderInfo?.contacts?.name}</Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="供应商联系人电话">
                            {venderInfo?.contacts?.telephone}
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={20}>
                        <Col span={8}>
                          <Form.Item label="供应商账户名称">
                            {venderInfo?.bankAccount[0]?.bank_account_name}
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="供应商开户行">
                            {venderInfo?.bankAccount[0]?.bank_name}
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="供应商银行账号">
                            {venderInfo?.bankAccount[0]?.bank_account}
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="结算方式">
                            {pubFilter(
                              common.dicList.VENDOR_PAYMENT_METHOD,
                              venderInfo?.payment_method,
                            )}
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="结算币种">
                            {pubFilter(common.dicList.SC_CURRENCY, venderInfo?.currency)}
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="税率">
                            {pubFilter(common?.dicList.VENDOR_TAX_RATE, venderInfo?.tax_rate) ||
                              '--'}
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  );
                } else {
                  return '';
                }
              }}
            </ProFormDependency>
            <Row>
              <Col
                flex="150px"
                style={{ paddingRight: '10px' }}
                className="add-order-one-signingType"
              >
                <ProFormSelect
                  name="signing_type"
                  initialValue={'1'}
                  label=" "
                  rules={[{ required: true, message: '请选择采购主体类型' }]}
                  valueEnum={common.dicList.PURCHASE_SIGNING_TYPE}
                  disabled
                />
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="main_id"
                  label=""
                  rules={[{ required: true, message: '请选择采购主体' }]}
                  showSearch
                  debounceTime={300}
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
                    notFoundContent: (
                      <Empty
                        className="pub-empty-blue"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="没有满足所选供应商的采购主体"
                      />
                    ),
                  }}
                />
              </Col>
            </Row>
            <ProFormText name="currency" label="币种" hidden />
            <ProFormDatePicker
              name="expected_receipt_time"
              label="预计入库时间"
              rules={[{ required: true, message: '请选择预计入库时间' }]}
              labelCol={{ flex: '150px' }}
              wrapperCol={{ span: 8 }}
            />
            <ProFormSelect
              label="是否节日订单"
              name="festival"
              rules={[{ required: true, message: '请选择是否节日订单' }]}
              valueEnum={common?.dicList?.PURCHASE_FESTIVAL}
              labelCol={{ flex: '150px' }}
              wrapperCol={{ span: 8 }}
            />
            <ProFormTextArea
              name="signing_contract_remarks"
              label="采购单签约合同备注"
              placeholder="请输入采购单签约合同备注"
              labelCol={{ flex: '150px' }}
              wrapperCol={{ span: 15 }}
              formItemProps={{
                style: { margin: '10px 0 4px' },
              }}
              rules={[
                {
                  validator: (_, value) => pubRequiredLengthRule(value, 100, '超过字符限制'),
                },
              ]}
            />
            <div style={{ paddingLeft: '150px', color: 'red' }}>
              *此备注非必填，备注会显示到签约采购单合同上面，请用户慎填
            </div>
            <Row style={{ paddingTop: '15px', paddingBottom: '10px' }}>
              <Col flex={1}>
                <Button
                  disabled={JSON.stringify(venderInfo) == '{}'}
                  type="primary"
                  onClick={() => {
                    partsSkuOpen();
                  }}
                >
                  添加商品
                </Button>
                <div style={{ display: 'inline-block', paddingLeft: '15px', color: 'red' }}>
                  *说明：必须填写完成上面供应商、采购主体、采购单信息后才能保存采购单。
                </div>
              </Col>
              <Col flex={'auto'}>
                <div className="add-order-one-total">
                  采购单金额: <span>{priceValue(totalPrice)}</span>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item name="purchaseOrderSku">
                  <EditableProTable
                    className="p-table-0 add-order-one-table"
                    controlled={true}
                    bordered
                    size="small"
                    editable={{
                      form: saveForm,
                      type: 'multiple',
                      editableKeys: goodsSkuDate.map((record: any) => record.tId),
                      onValuesChange: (val, allRow) => {
                        val.number_boxes = val.num ? Math.ceil(val.num / val.quantity_per_box) : 0;
                        val.total_price = val.num ? mul(val.num, val.price) : 0;
                        const allTotal = allRow.map((item) => {
                          return item.total_price;
                        });
                        setTotalPrice(arraySum(allTotal));
                      },
                    }}
                    scroll={{ x: 1800 }}
                    recordCreatorProps={false}
                    columns={columnsSkus}
                    rowKey={(record: any) => record.tId}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Spin>
      </ProForm>
      <PartsSku partsSkuModel={partsSkuModel} handleClose={modalClose} dicList={common?.dicList} />
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

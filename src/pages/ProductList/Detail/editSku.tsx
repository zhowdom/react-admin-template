import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { connect, history, useAccess } from 'umi';
import { Button, Card, Col, Form, Modal, Row, Space, Spin, Tabs } from 'antd';
import { ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormSelect } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  handleCutZero,
  pubConfig,
  pubFilter,
  pubModal,
  pubMsg,
  pubRequiredRule,
} from '@/utils/pubConfig';
import { getDetail, updateGoods } from '@/services/pages/productList';
import { EditableProTable } from '@ant-design/pro-table';
import { priceValue } from '@/utils/filter';
import Dialog from './Dialog';
import './index.less';
import { pubGetStoreList } from '@/utils/pubConfirm';
import CloudCangTable from './cloudCangTable';
import ComUpload from '@/pages/EstablishManage/components/customUpload';
import QiMenCangTable from './QiMenCangTable';
import FormSpecField from '@/pages/EstablishManage/components/FormSpecField';
import { pubAllGoodsSkuBrand } from '@/utils/pubConfirm';

const Page = (props: any) => {
  const access = useAccess();
  const [editForm] = Form.useForm();
  const [editForm1] = Form.useForm();
  const [editForm2] = Form.useForm();
  const ref2: any = useRef();
  const { common } = props;
  const { dicList } = common;
  const id = history?.location?.query?.id;
  const formRef = useRef<ProFormInstance>();
  const [detailData, setDetailData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [dialogType, setDialogType] = useState<string | undefined>();
  const [dialogData, setDialogData] = useState<any[]>([]);
  const [cloudCangData, setCloudCangData] = useState<any[]>([]);
  const [qiMenData, setQiMenData] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState<any>(20);
  const [tabKey, setTabKey] = useState<string>('1');
  // 详情接口
  const getDetailAction = async () => {
    const res = await getDetail({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    const initForm: any = res?.data || {};
    initForm.goodsSkus = initForm.goodsSkus.map((v: any) => {
      return {
        ...v,
        old_sku_name: v.sku_name,

        sku_name: {
          sku_form: v?.sku_form,
          sku_spec: v?.sku_spec,
        },
        send_kind: v.send_kind || v.send_kind == 0 ? v.send_kind + '' : null,
        position: v.position ? v.position + '' : '100',
      };
    });
    // for (let i = 0; i < 100; i++) {
    //   initForm.goodsSkus.push({
    //     ...initForm.goodsSkus?.[0],
    //     id: i,
    //   });
    // }
    // console.log(initForm.goodsSku, 6);
    // 筛选出是云仓的
    initForm.projectsCloudCangData = initForm?.goodsSkus.filter((v: any) => v.send_kind == '5');
    initForm.projectsQiMenCloudCangData = initForm?.goodsSkus?.filter(
      (v: any) => v.send_kind == '6',
    );
    setCloudCangData(initForm.projectsCloudCangData);
    setQiMenData(initForm.projectsQiMenCloudCangData);
    if (initForm.projectsQiMenCloudCangData?.length && !initForm.projectsCloudCangData?.length) {
      setTabKey('2');
    }
    setDetailData(initForm);
    formRef?.current?.setFieldsValue({
      ...initForm,
    });
  };

  useEffect(() => {
    getDetailAction();
  }, []);

  // 弹窗展示
  const modalChange = (type: string, data: any[]) => {
    ref2?.current?.visibleChange();
    setDialogType(type);
    setDialogData(data);
  };
  // 提交表单
  const updateForm = (postData: any) => {
    pubModal('确定提交吗?')
      .then(async () => {
        setLoading(true);
        const res = await updateGoods(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          setLoading(false);
        } else {
          pubMsg('提交成功', 'success');
          setTimeout(() => {
            history.goBack();
          }, 200);
          setLoading(false);
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  const onChange = (key: string) => {
    setTabKey(key);
  };
  return (
    <PageContainer breadcrumb={{}} title={false}>
      <Dialog
        ref2={ref2}
        type={dialogType}
        dialogData={dialogData}
        business_scope={detailData?.business_scope}
      />
      <Spin spinning={loading}>
        <ProForm
          labelAlign="right"
          layout="horizontal"
          formRef={formRef}
          className="pub-detail-form label-width-68"
          submitter={{
            render: (data: any) => (
              <FooterToolbar style={{ padding: '6px' }}>
                {
                  <Space>
                    <Button
                      type="primary"
                      key="save"
                      onClick={async () => {
                        data.form?.submit?.();
                      }}
                    >
                      提交
                    </Button>
                    <Button
                      key="cancel"
                      onClick={() => {
                        setTimeout(() => {
                          history.goBack();
                        }, 200);
                      }}
                    >
                      取消
                    </Button>
                  </Space>
                }
              </FooterToolbar>
            ),
          }}
          onFinish={async (values: any) => {
            return Promise.all([
              editForm.validateFields(),
              editForm1.validateFields(),
              editForm2.validateFields(),
            ])
              .then(() => {
                const postData = JSON.parse(
                  JSON.stringify({
                    id,
                    uom: values.uom,
                    currency: values.currency,
                    goodsSkus: values.goodsSkus,
                    projectsCloudCangData: values.projectsCloudCangData,
                    projectsQiMenCloudCangData: values.projectsQiMenCloudCangData,
                  }),
                );
                postData.goodsSkus = postData.goodsSkus.map((v: any) => {
                  const newA = postData?.projectsCloudCangData?.find((h: any) => h.id == v.id);
                  const newB = postData?.projectsQiMenCloudCangData?.find((h: any) => h.id == v.id);
                  return {
                    ...v,
                    sku_name: v?.sku_name?.sku_form
                      ? `${detailData?.name_cn}${v?.sku_name?.sku_form}${v?.sku_name?.sku_spec}`
                      : `${detailData?.name_cn}${v?.sku_name?.sku_spec}`,
                    sku_form: v?.sku_name?.sku_form,
                    sku_spec: v?.sku_name?.sku_spec,
                    cloud_warehouse_id:
                      v.send_kind == '5' ? newA?.cloud_warehouse_id : newB?.cloud_warehouse_id,
                    return_cloud_warehouse_id:
                      v.send_kind == '5'
                        ? newA?.return_cloud_warehouse_id
                        : newB?.return_cloud_warehouse_id,
                  };
                });
                postData.goodsSkus.forEach((v: any, index: number) => {
                  if (
                    !v?.sys_files ||
                    JSON.stringify(v.sys_files) == '[]' ||
                    !v.position ||
                    !v?.sku_spec ||
                    (!v.price && v.price != 0) ||
                    (!v.bottom_line_price && v.bottom_line_price != 0) ||
                    (!v.send_kind && v.send_kind != 0 && detailData?.business_scope == 'CN')
                  ) {
                    let msg = '';
                    if (!v?.sys_files || JSON.stringify(v.sys_files) == '[]') {
                      msg = '图片';
                    } else if (!v?.position) {
                      msg = '产品定位';
                    } else if (!v?.sku_spec) {
                      msg = '款式名称';
                    } else if (!v?.price) {
                      msg = '定价';
                    } else if (!v?.bottom_line_price) {
                      msg = '底线成交价';
                    } else if (!v?.send_kind) {
                      msg = '配送类型';
                    }
                    const suoyin = index + 1;
                    const size: any = Number(pageSize);
                    const currPage =
                      suoyin % size == 0 ? parseInt(suoyin / size) : parseInt(suoyin / size) + 1;
                    Modal.warning({
                      title: '提示',
                      content: (
                        <div>
                          第 <span style={{ color: 'red' }}>{`${currPage}`}</span> 页, 【
                          <span style={{ color: 'red' }}>{`${msg}`}</span>】为必填项,
                          请检查表单信息正确性
                        </div>
                      ),
                    });
                    throw new Error('otherPageRequired');
                  }
                });
                updateForm(postData);
              })
              .catch((e) => {
                const qiMenNoCross = values?.projectsQiMenCloudCangData?.some(
                  (v: any) => !v.cloud_warehouse_id,
                );
                const clNoCross = values?.projectsCloudCangData?.some(
                  (v: any) => !v.cloud_warehouse_id || !v.return_cloud_warehouse_id,
                );
                if (
                  tabKey == '2' &&
                  values?.projectsQiMenCloudCangData?.length &&
                  !qiMenNoCross &&
                  values?.projectsCloudCangData?.length &&
                  clNoCross
                ) {
                  setTabKey('1');
                } else if (
                  tabKey == '1' &&
                  values?.projectsCloudCangData?.length &&
                  !clNoCross &&
                  values?.projectsQiMenCloudCangData?.length &&
                  qiMenNoCross
                ) {
                  setTabKey('2');
                } else if(String(e).indexOf('otherPageRequired') == -1){
                  Modal.warning({
                    title: '提示',
                    content: '请检查表单信息正确性',
                  });
                }
              });
          }}
          onFinishFailed={() => {
            editForm.validateFields();
            if (detailData?.projectsCloudCangData?.length) {
              editForm1.validateFields();
            }
            if (detailData?.projectsQiMenCloudCangData?.length) {
              editForm2.validateFields();
            }
          }}
        >
          <Card title="产品信息" bordered={false}>
            <Row gutter={24}>
              <Col span={8}>
                <ProFormText name="goods_code" label="产品编码" readonly />
              </Col>
              <Col span={8}>
                <ProFormText name="name_cn" label="产品名称" readonly />
              </Col>
              <Col span={8}>
                <Form.Item label="产品线">
                  {pubFilter(dicList?.SYS_BUSINESS_SCOPE, detailData?.business_scope)} -{' '}
                  {detailData?.category_name}
                </Form.Item>
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="life_cycle"
                  label="生命周期"
                  readonly
                  placeholder="--"
                  valueEnum={dicList.GOODS_LIFE_CYCLE}
                />
              </Col>

              <Col span={8}>
                <ProFormSelect
                  name="uom"
                  label="单位: "
                  placeholder="请选择单位"
                  wrapperCol={{ span: 16 }}
                  valueEnum={dicList.GOODS_UOM}
                  rules={[{ required: true, message: '请选择单位' }]}
                />
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="currency"
                  label="定价币种: "
                  placeholder="--"
                  valueEnum={dicList.SC_CURRENCY}
                  rules={[pubRequiredRule]}
                />
              </Col>

              <Col span={24}>
                <div>款式: </div>
                <Form.Item labelCol={{ flex: 0 }} label="" name="goodsSkus">
                  {useMemo(
                    () => (
                      <EditableProTable
                        options={false}
                        className="p-table-0 product-edit-skus"
                        pagination={{
                          showSizeChanger: true,
                          pageSizeOptions: [10, 20],
                          className: 'small-size',
                          pageSize,
                          onChange: (page, size) => {
                            setPageSize(size);
                          },
                        }}
                        scroll={{ x: 1200, y: 'calc(100vh - 440px)' }}
                        recordCreatorProps={false}
                        editable={{
                          type: 'multiple',
                          editableKeys: detailData?.goodsSkus?.map((v: any) => v.id) || [],
                          actionRender: (row, config, defaultDoms) => {
                            return [defaultDoms.delete];
                          },
                          form: editForm,
                          onValuesChange: (record, recordList) => {
                            const pre = formRef?.current
                              ?.getFieldValue('goodsSkus')
                              ?.filter((v: any) => v.id == record.id)?.[0];
                            // 区分奇门云仓，万里牛云仓
                            const newCloud = recordList.filter((v: any) =>
                              ['5', '6'].includes(v.send_kind),
                            );
                            let wLData = newCloud.filter((v: any) => v.send_kind == '5');
                            let qMData = newCloud.filter((v: any) => v.send_kind == '6');
                            wLData = wLData?.map((v: any) => {
                              return {
                                ...v,
                                cloud_warehouse_id:
                                  v.id == record?.id ? null : v.cloud_warehouse_id,
                                return_cloud_warehouse_id:
                                  v.id == record?.id ? null : v.return_cloud_warehouse_id,
                              };
                            });
                            qMData = qMData?.map((v: any) => {
                              return {
                                ...v,
                                cloud_warehouse_id:
                                  v.id == record?.id ? null : v.cloud_warehouse_id,
                                return_cloud_warehouse_id:
                                  v.id == record?.id ? null : v.return_cloud_warehouse_id,
                              };
                            });
                            // 修改了款式名称
                            if (JSON.stringify(pre.sku_name) != JSON.stringify(record.sku_name)) {
                              if (['5', '6'].includes(record.send_kind)) {
                                formRef?.current?.setFieldsValue({
                                  projectsCloudCangData: wLData,
                                  projectsQiMenCloudCangData: qMData,
                                });
                                setCloudCangData(wLData);
                                setQiMenData(qMData);
                              }
                            }
                            // 修改了配送类型
                            if (pre.send_kind != record.send_kind) {
                              if (!record.send_kind) {
                                if (!wLData?.length) {
                                  setTabKey('2');
                                }
                                if (!qMData?.length) {
                                  setTabKey('1');
                                }
                              }
                              if (record.send_kind == '6') {
                                setTabKey('2');
                              } else if (record.send_kind == '5') {
                                setTabKey('1');
                              }
                              // 判断当配送类型为万里牛云仓时 send_kind == 5,奇门云仓时 send_kind == 6
                              if (['5', '6'].includes(record.send_kind)) {
                                formRef?.current?.setFieldsValue({
                                  projectsCloudCangData: wLData,
                                  projectsQiMenCloudCangData: qMData,
                                });
                                setCloudCangData(wLData);
                                setQiMenData(qMData);
                              } else {
                                if (wLData.filter((v: any) => v.id == record.id)) {
                                  formRef?.current?.setFieldsValue({
                                    projectsCloudCangData: wLData,
                                  });
                                  setCloudCangData(wLData);
                                }
                                if (qMData.filter((v: any) => v.id == record.id)) {
                                  formRef?.current?.setFieldsValue({
                                    projectsQiMenCloudCangData: qMData,
                                  });
                                  setQiMenData(qMData);
                                }
                              }
                            }

                            formRef?.current?.setFieldsValue({
                              goodsSkus: recordList,
                            });
                          },
                        }}
                        columns={[
                          {
                            title: '图片',
                            align: 'center',
                            dataIndex: 'sys_files',
                            width: 240,
                            formItemProps: {
                              rules: [
                                {
                                  validator: async (rule, value) => {
                                    const unDeleteFiles = value?.filter(
                                      (file: any) => file.delete != 1,
                                    );
                                    if (!unDeleteFiles?.length) {
                                      return Promise.reject(new Error('请上传图片'));
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ],
                            },
                            renderFormItem: (_: any) => {
                              return (
                                <ComUpload
                                  sys_files={_?.entity?.sys_files}
                                  disabled={false}
                                  key="upload"
                                />
                              );
                            },
                          },
                          {
                            title: '款式编码',
                            dataIndex: 'sku_code',
                            align: 'center',
                            editable: false,
                            width: 100,
                          },
                          {
                            title: 'ERP编码',
                            dataIndex: 'erp_sku',
                            align: 'center',
                            editable: false,
                            width: 150,
                          },
                          {
                            title: '产品定位',
                            dataIndex: 'position',
                            valueType: 'select',
                            align: 'center',
                            width: 160,
                            formItemProps: {
                              rules: [{ required: true, message: '请选择产品定位' }],
                            },
                            valueEnum: dicList.PROJECTS_GOODS_SKU_POSITION,
                          },
                          {
                            title: '品牌',
                            dataIndex: 'brand_id',
                            valueType: 'select',
                            align: 'center',
                            width: 90,
                            hideInTable: detailData?.business_scope == 'IN' ? false : true,
                            editable: false,
                            request: async () => {
                              const res = await pubAllGoodsSkuBrand();
                              return res;
                            },
                          },
                          {
                            title: '款式名称',
                            dataIndex: 'sku_name',
                            align: 'center',
                            // formItemProps: {
                            //   rules: [{ required: true, message: '请输入款式名称' }],
                            // },
                            width: 350,
                            // fieldProps: {
                            //   addonBefore: detailData?.name_cn + '-',
                            // },
                            renderFormItem: () => {
                              return <FormSpecField productName={detailData?.name_cn} />;
                            },
                            formItemProps: {
                              rules: [
                                {
                                  validator: async (rule: any, value: any) => {
                                    if (value?.sku_form?.length > 6) {
                                      return Promise.reject(new Error('款式形态应少于等于6个字'));
                                    }
                                    if (!value?.sku_spec) {
                                      return Promise.reject(new Error('规格型号必填'));
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ],
                            },
                          },
                          {
                            title: '商品条码',
                            dataIndex: 'bar_code',
                            align: 'center',
                            width: 150,
                          },
                          {
                            title: '定价',
                            dataIndex: 'price',
                            valueType: 'digit',
                            align: 'center',
                            render: (_: any, record: any) => {
                              return priceValue(record?.price);
                            },
                            width: 150,
                            formItemProps: {
                              rules: [{ required: true, message: '请输入定价' }],
                            },
                            fieldProps: {
                              precision: 2,
                              formatter: (value) => {
                                return handleCutZero(String(value));
                              },
                            },
                          },
                          {
                            title: '底线成交价',
                            dataIndex: 'bottom_line_price',
                            valueType: 'digit',
                            align: 'center',
                            render: (_: any, record: any) => {
                              return handleCutZero(String(record?.bottom_line_price));
                            },
                            width: 150,
                            formItemProps: {
                              rules: [{ required: true, message: '请输入底线成交价' }],
                            },
                            fieldProps: {
                              precision: 2,
                              formatter: (value) => {
                                return handleCutZero(String(value));
                              },
                            },
                          },
                          {
                            title: '采销价',
                            dataIndex: 'procurement_price',
                            valueType: 'digit',
                            align: 'center',
                            render: (_: any, record: any) => {
                              return record?.procurement_price ? handleCutZero(String(record?.procurement_price)) : '-';
                            },
                            width: 150,
                            fieldProps: {
                              precision: 2,
                              formatter: (value) => {
                                return handleCutZero(String(value));
                              },
                            },
                          },
                          {
                            title: '库存成本',
                            dataIndex: 'unit_final_cost',
                            valueType: 'digit',
                            align: 'center',
                            render: (_: any, record: any) => {
                              return priceValue(record?.unit_final_cost);
                            },
                            editable: false,
                            width: 100,
                          },
                          {
                            title: '配送类型',
                            dataIndex: 'send_kind',
                            valueType: 'select',
                            align: 'center',
                            width: 160,
                            formItemProps: {
                              rules: [{ required: true, message: '请选择配送类型' }],
                            },
                            hideInTable: detailData?.business_scope == 'CN' ? false : true,
                            valueEnum: dicList.SYS_SEND_KIND,
                          },
                          {
                            title: '预计店铺',
                            dataIndex: 'expected_shop',
                            valueType: 'select',
                            align: 'center',
                            width: 120,
                            editable: false,
                            render: (_: any, record: any) => record.expected_shop_name || '-',
                            hideInTable: detailData?.business_scope == 'IN' ? false : true,
                            request: async () => {
                              const res: any = await pubGetStoreList({ business_scope: 'IN' });
                              return res;
                            },
                          },
                          {
                            title: '供应商报价',
                            dataIndex: 'test',
                            editable: false,
                            align: 'center',
                            width: 90,
                            hideInTable: !access.canSee('productlist_supplier_price'),
                            render: (_: any, record: any) => {
                              return (
                                <a
                                  onClick={() =>
                                    modalChange(
                                      'price',
                                      record?.skuVendorsList?.map((item: any) => {
                                        return {
                                          ...item,
                                          main: item.vendor_id === record.main_vendor_id,
                                        };
                                      }) || [],
                                    )
                                  }
                                >
                                  详情
                                </a>
                              );
                            },
                          },
                          {
                            title: '上架信息',
                            dataIndex: 'test',
                            align: 'center',
                            width: 90,
                            editable: false,
                            hideInTable: !access.canSee('productlist_online_info'),
                            render: (_: any, record: any) => {
                              return (
                                <a
                                  onClick={() =>
                                    modalChange('onSale', record.linkManagementSkuList || [])
                                  }
                                >
                                  详情
                                </a>
                              );
                            },
                          },
                          {
                            title: '规格信息',
                            dataIndex: 'test',
                            width: 90,
                            editable: false,
                            hideInTable: !access.canSee('productlist_spec_info'),
                            align: 'center',
                            render: (_: any, record: any) => {
                              return (
                                <a
                                  onClick={() =>
                                    modalChange('spec', record.skuSpecifications || [])
                                  }
                                >
                                  详情
                                </a>
                              );
                            },
                          },
                          {
                            title: '生命周期',
                            key: 'life_cycle',
                            width: 90,
                            dataIndex: 'life_cycle',
                            editable: false,
                            align: 'center',
                            render: (_: any, record: any) => {
                              const item = dicList.GOODS_LIFE_CYCLE;
                              return [
                                <span key="uom">{item?.[record.life_cycle]?.text || '-'}</span>,
                              ];
                            },
                          },
                        ]}
                        tableStyle={{ marginTop: '10px', padding: 0 }}
                        rowKey="id"
                        bordered
                      />
                    ),
                    [detailData,pageSize],
                  )}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Tabs
                  activeKey={tabKey}
                  onChange={onChange}
                  items={
                    cloudCangData?.length && qiMenData.length
                      ? ([
                          {
                            label: `万里牛云仓信息`,
                            key: '1',
                          },
                          {
                            label: `奇门云仓信息`,
                            key: '2',
                          },
                        ] as any)
                      : cloudCangData?.length
                      ? [
                          {
                            label: `万里牛云仓信息`,
                            key: '1',
                          },
                        ]
                      : qiMenData.length
                      ? [
                          {
                            label: `奇门云仓信息`,
                            key: '2',
                          },
                        ]
                      : []
                  }
                />
                {
                  <Form.Item
                    labelCol={{ flex: 0 }}
                    label=""
                    name="projectsCloudCangData"
                    hidden={!(!!cloudCangData?.length && tabKey == '1')}
                  >
                    <CloudCangTable
                      formRef={formRef}
                      productName={detailData?.name_cn}
                      platform_code="YUNCANG"
                      form={editForm1}
                      dicList={dicList}
                      approval_status={detailData?.approval_status}
                    />
                  </Form.Item>
                }
                {
                  <Form.Item
                    labelCol={{ flex: 0 }}
                    label=""
                    name="projectsQiMenCloudCangData"
                    hidden={!(!!qiMenData?.length && tabKey == '2')}
                  >
                    <QiMenCangTable
                      platform_code="QIMEN_YUNCANG"
                      formRef={formRef}
                      form={editForm2}
                      productName={detailData?.name_cn}
                      dicList={dicList}
                      approval_status={detailData?.approval_status}
                    />
                  </Form.Item>
                }
              </Col>
            </Row>
          </Card>
        </ProForm>
      </Spin>
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);

export default ConnectPage;

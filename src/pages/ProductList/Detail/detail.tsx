import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { connect, history, useAccess } from 'umi';
import { Button, Card, Col, Form, Row, Spin, Tabs } from 'antd';
import { ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormSelect } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import { handleCutZero, pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getDetail } from '@/services/pages/productList';
import ProTable from '@ant-design/pro-table';
import { priceValue } from '@/utils/filter';
import CloudCangTable from './cloudCangTable';
import LogCost from './Dialog/LogCost';
import Dialog from './Dialog';
import './index.less';
import QiMenCangTable from './QiMenCangTable';
import { pubAllGoodsSkuBrand,IsGrey } from '@/utils/pubConfirm';
import PubLogisticsClearance from '@/components/PubLogisticsClearance';

const Page = (props: any) => {
  const access = useAccess();
  const ref2: any = useRef();
  const { common } = props;
  const { dicList } = common;
  const formItemLayout1 = {
    labelCol: { span: 1.5 },
    wrapperCol: { span: 23 },
  };
  const id = history?.location?.query?.id;
  const formRef = useRef<ProFormInstance>();
  const [detailData, setDetailData] = useState<any>();
  const [loading] = useState(false);
  const [dialogType, setDialogType] = useState<string | undefined>();
  const [dialogData, setDialogData] = useState<any[]>([]);
  const [cloudCangData, setCloudCangData] = useState<any[]>([]);
  const [qiMenData, setQiMenData] = useState<any[]>([]);
  const [tabKey, setTabKey] = useState<string>('1');
  const pathname = history.location.pathname;
  const [clear, setClear] = useState<any[]>([]);
  // console.log(pathname);
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
      };
    });
    if (res.data.business_scope == 'IN') {
      const projectsGoodsSkuCustomsClearance = initForm?.goodsSkus?.flatMap((v: any) =>
        v?.goodsSkuCustomsClearance
          ? [
              {
                ...v.goodsSkuCustomsClearance,
                sku_name: v.sku_name,
              },
            ]
          : [],
      );
      setClear(projectsGoodsSkuCustomsClearance);
    }
    // 筛选出是云仓的
    initForm.projectsCloudCangData = initForm?.goodsSkus.filter((v: any) => v.send_kind == '5');
    initForm.projectsQiMenCloudCangData = initForm?.goodsSkus.filter(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 弹窗展示
  const modalChange = (type: string, data: any[]) => {
    ref2?.current?.visibleChange();
    setDialogType(type);
    setDialogData(data);
  };
  const onChange = (key: string) => {
    setTabKey(key);
  };
  return (
    <PageContainer
      breadcrumb={{}}
      title={false}
    >
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
            render: () => (
              <FooterToolbar style={{ padding: '6px' }}>
                {
                  <Button
                    icon={<ArrowLeftOutlined />}
                    key="back"
                    onClick={() => {
                      setTimeout(() => {
                        history.goBack();
                      }, 200);
                    }}
                  >
                    返回
                  </Button>
                }
              </FooterToolbar>
            ),
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
                <ProFormText name="name_en" label="产品线英文名" readonly />
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
                  placeholder="--"
                  readonly
                  valueEnum={dicList.GOODS_UOM}
                />
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="currency"
                  label="定价币种: "
                  placeholder="--"
                  readonly
                  valueEnum={dicList.SC_CURRENCY}
                />
              </Col>

              <Col span={24}>
                <Form.Item {...formItemLayout1} label="款式" name="goodsSkus"  labelCol={{ flex: '80px' }}>
                  <ProTable
                    options={false}
                    pagination={false}
                    search={false}
                    columns={[
                      {
                        title: '图片',
                        dataIndex: 'image_url',
                        align: 'center',
                        valueType: 'image',
                        hideInSearch: true,
                        width: 120,
                      },
                      {
                        title: '款式编码',
                        dataIndex: 'sku_code',
                        align: 'center',
                      },
                      {
                        title: 'ERP编码',
                        dataIndex: 'erp_sku',
                        align: 'center',
                      },
                      {
                        title: '款式名称',
                        dataIndex: 'sku_name',
                      },
                      {
                        title: '产品定位',
                        dataIndex: 'position',
                        valueType: 'select',
                        align: 'center',
                        width: 160,
                        valueEnum: dicList.PROJECTS_GOODS_SKU_POSITION,
                      },
                      {
                        title: '品牌',
                        dataIndex: 'brand_id',
                        valueType: 'select',
                        align: 'center',
                        width: 90,
                        hideInTable: detailData?.business_scope == 'IN' ? false : true,
                        request: async () => {
                          const res = await pubAllGoodsSkuBrand();
                          return res;
                        },
                      },
                      {
                        title: '商品条码',
                        dataIndex: 'bar_code',
                        align: 'center',
                      },
                      {
                        title: '定价',
                        dataIndex: 'price',
                        valueType: 'digit',
                        align: 'center',
                        hideInTable: IsGrey,
                        render: (_: any, record: any) => {
                          return handleCutZero(String(record?.price));
                        },
                      },
                      {
                        title: '底线成交价',
                        dataIndex: 'bottom_line_price',
                        valueType: 'digit',
                        align: 'center',
                        hideInTable: IsGrey,
                        render: (_: any, record: any) => {
                          return handleCutZero(String(record?.bottom_line_price));
                        },
                      },
                      {
                        title: '采销价',
                        dataIndex: 'procurement_price',
                        valueType: 'digit',
                        align: 'center',
                        hideInTable: IsGrey,
                        render: (_: any, record: any) => {
                          return record.procurement_price ? handleCutZero(String(record?.procurement_price)) : '-';
                        },
                      },
                      {
                        title: '库存成本',
                        dataIndex: 'unit_final_cost',
                        align: 'center',
                        fieldProps: {
                          precision: 2,
                        },
                        hideInTable: IsGrey || pathname.indexOf('/product-detail-marketing') != -1,
                        render: (text, record: any) =>
                          detailData.business_scope == 'IN' ? (
                            <LogCost
                              id={record.id}
                              triggerText={priceValue(record.unit_final_cost)}
                            />
                          ) : (
                            priceValue(record.unit_final_cost)
                          ),
                      },
                      {
                        title: '配送类型',
                        dataIndex: 'send_kind',
                        align: 'center',
                        width: 160,
                        hideInTable: detailData?.business_scope == 'CN' ? false : true,
                        render: (_: any, record: any) => {
                          return pubFilter(dicList?.SYS_SEND_KIND, record?.send_kind) || '-';
                        },
                      },
                      {
                        title: '预计店铺',
                        dataIndex: 'expected_shop_name',
                        align: 'center',
                        hideInTable: detailData?.business_scope == 'IN' ? false : true,
                      },
                      {
                        title: '供应商报价',
                        dataIndex: 'test',
                        align: 'center',
                        hideInTable:
                          (pathname.indexOf('/product-detail-marketing') != -1 ||
                          !access.canSee('productlist_supplier_price') || IsGrey),
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
                        hideInTable: !access.canSee('productlist_spec_info'),
                        align: 'center',
                        render: (_: any, record: any) => {
                          return (
                            <a onClick={() => modalChange('spec', record.skuSpecifications || [])}>
                              详情
                            </a>
                          );
                        },
                      },
                      {
                        title: '产品尺寸类型',
                        dataIndex: 'test',
                        hideInTable: !access.canSee('scm_productlist_sizeKind'),
                        align: 'center',
                        render: (_: any, record: any) => {
                          return (
                            <a onClick={() => modalChange('size', record.id || [])}>
                              详情
                            </a>
                          );
                        },
                      },
                      {
                        title: '入库记录',
                        dataIndex: 'warehousingRecord',
                        hideInTable: !access.canSee('productlist_warehousing_record'),
                        align: 'center',
                        render: (_: any, record: any) => {
                          return (
                            <a
                              onClick={() =>
                                modalChange(
                                  'warehousingRecord',
                                  record.warehousingPurchaseOrderSkuList || [],
                                )
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
                        dataIndex: 'life_cycle',
                        editable: false,
                        align: 'center',
                        render: (_: any, record: any) => {
                          const item = dicList.GOODS_LIFE_CYCLE;
                          return [<span key="uom">{item?.[record.life_cycle]?.text || '-'}</span>];
                        },
                      },
                    ]}
                    className="p-table-0"
                    rowKey="id"
                    dataSource={detailData?.goodsSkus}
                    bordered
                    scroll={{ x: 1400 }}
                  />
                </Form.Item>
              </Col>
              {(!!cloudCangData?.length || !!qiMenData.length) && (
                <Col span={24} style={{ marginTop: '10px' }}>
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
                        platform_code="YUNCANG"
                        dicList={dicList}
                        disable={true}
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
                        dicList={dicList}
                        disable={true}
                        approval_status={detailData?.approval_status}
                      />
                    </Form.Item>
                  }
                </Col>
              )}

              {clear?.length ? (
                <Col span={24} style={{marginTop: '20px'}}>
                  <PubLogisticsClearance
                    dicList={dicList}
                    labelCol={{ flex: '80px' }}
                    wrapperCol= {{ span: 23 }}
                    projectsGoodsSkuCustomsClearance={clear}
                  />
                </Col>
              ) : <></>}
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

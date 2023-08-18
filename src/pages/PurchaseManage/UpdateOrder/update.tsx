import ProForm, { ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import { FooterToolbar } from '@ant-design/pro-layout';
import { Button, Card, Col, Divider, Form, Modal, Row, Space, Spin } from 'antd';
import { Access, connect, history, useAccess } from 'umi';
import { pubModal, pubFilter, pubConfig, pubMsg } from '@/utils/pubConfig';
import './index.less';
import OrderTable from './components/OrderTable';
import { getDetail, specialUpdateById } from '@/services/pages/purchaseOrder';
import { findBySku, findValidVendorToSubject } from '@/services/pages/purchasePlan';
import { mul, pubDownLoad } from '@/utils/pubConfirm';
import { getList } from '@/services/pages/sign';
import { agree, exportPdf, findById } from '@/services/pages/updateOrder';
import AuditOptions from './components/AuditOptions';
import {sortBy} from "lodash";
const Page = (props: any) => {
  const access = useAccess();
  const { common } = props;
  const id = history?.location?.query?.id;
  const dicList = common?.dicList;
  const formRef = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableCurrency, setTableCurrency] = useState('');
  const [alReady, setAlReady] = useState(false);
  const [mainList, setMainList] = useState([]);
  const formItemLayout = {
    labelCol: { flex: '148px' },
  };
  const formItemLayout1 = {
    labelCol: { flex: '460px' },
  };
  const [detailData, setDetailData] = useState<any>();
  const [editIds, setEditIds] = useState<any>([1, 2, 3, 4]);
  const pageType = history?.location?.query?.type || 'detail';
  const [changeFields, setChangeFields] = useState<any>({});
  // 提交
  const updateForm = (postData: any) => {
    pubModal('确定提交吗?')
      .then(async () => {
        // console.log(postData);
        postData.purchaseOrderSkuChangeHistories = postData.purchaseOrderSkuChangeHistories.map(
          (v: any) => {
            return {
              purchase_order_sku_id: v?.id,
              before_price: v.copy_price,
              after_price: v?.price,
              after_num: v?.num,
              before_num: v.copy_num,
              before_shipment_time: v.copy_shipment_time || null,
              after_shipment_time: v?.shipment_time,
              remarks: v?.remarks,
              after_quantity_per_box: v?.quantity_per_box,
              number_boxes: Math.ceil(v?.num / v?.quantity_per_box),
            };
          },
        );
        const res = await specialUpdateById(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('提交成功', 'success');
          setTimeout(() => {
            history.goBack();
          }, 2000);
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 跨境主体
  const getNewVendersAction = async () => {
    setLoading(true);
    const res = await getList({
      current_page: 1,
      page_size: 999,
      abroad: 2,
    });
    setMainList(
      res?.data?.records?.map((v: any) => {
        return {
          value: v.id,
          label: v.client_corp_name,
        };
      }) || [],
    );
    setLoading(false);
  };
  // (单个供应商)查询某个供应商下面所有在有效期内的签约主体
  const getValidVendor = async (vendorId?: any) => {
    if (formRef.current?.getFieldValue('signing_type') == '2') {
      getNewVendersAction();
    } else {
      setLoading(true);
      const res = await findValidVendorToSubject({
        vendorId,
        abroad: formRef.current?.getFieldValue('signing_type'),
      });
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        const newVenders = res.data.map((v: any) => {
          return {
            value: v.subject_id,
            label: v.subject_name,
          };
        });
        setMainList(newVenders);
      }
      setLoading(false);
    }
  };
  // 根据SKUids和供应商ID 得到SKU的价格
  const getSkuPrice = async (data?: any, ids?: any) => {
    const res = await findBySku({ vendor_id: data?.vendor_id, sku_id: ids });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return [];
    } else {
      const newData = data.purchaseOrderSkuChangeHistories?.map((h: any) => {
        res.data.forEach((k: any) => {
          // console.log(h.price);
          // console.log(k.price);
          if (h.goods_sku_id == k.goods_sku_id) {
            const newPrice = h.price >= k.price ? h.price : k.price;
            // console.log(k.price);
            h.max_price = newPrice;
          }
        });
        return h;
      });
      return newData;
    }
  };
  // 获取详情接口
  const getDetailAction = async () => {
    setLoading(true);
    const res = pageType === 'detail' ? await findById({ id }) : await getDetail({ id });
    // console.log(res);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    res.data.sysBusinessRemarks = res?.data?.sysBusinessRemarks || [];
    res.data.purchaseOrderSku =
      res?.data?.purchaseOrderSku?.map((item: any) => {
        // 判断item的 goods_sku_id 是否有备品
        const hasSpare = res?.data?.purchaseOrderSku.find(
          (k: any) => k.goods_sku_id == item.goods_sku_id && k.goods_sku_type == 2,
        );
        // console.log(hasSpare);
        return {
          ...item,
          rowSpan: item.goods_sku_type == 1 ? (hasSpare ? 2 : 1) : 0,
          copy_price: item.price,
          max_price: item.price,
          copy_num: item.num,
          copy_shipment_time: item.shipment_time,
          total_price: mul(item.num, item.price),
        };
      }) || [];
    // 数据顺序不一致, 合并单元格错位v1.2.3
    res.data.purchaseOrderSku = sortBy(res.data.purchaseOrderSku, ['sku_code', 'goods_sku_type', 'shipment_time'])
    let initForm = res?.data || {};
    if (pageType === 'detail') {
      initForm.purchaseOrderSkuB = initForm.purchaseOrderSkuChangeHistories;
      initForm.purchaseOrderSkuA = initForm.purchaseOrderSkuChangeHistories;
    } else {
      initForm.purchaseOrderSkuChangeHistories = initForm.purchaseOrderSku;
    }

    initForm.signing_type = initForm.signing_type ? String(initForm.signing_type) : '1';
    if (pageType === 'detail') {
      initForm = {
        ...initForm,
        vendor_name: initForm?.purchaseOrder?.vendor_name,
        vendor_contacts: initForm?.purchaseOrder?.vendor_contacts,
        vendor_contacts_phone: initForm?.purchaseOrder?.vendor_contacts_phone,
        bank_account_name: initForm?.purchaseOrder?.bank_account_name,
        bank_name: initForm?.purchaseOrder?.bank_name,
        bank_account: initForm?.purchaseOrder?.bank_account,
        payment_method: initForm?.purchaseOrder?.payment_method,
        prepayment_percentage: initForm?.purchaseOrder?.prepayment_percentage,
        currency: initForm?.purchaseOrder?.currency,
        tax_rate: initForm?.purchaseOrder?.tax_rate,
        bank_routing: initForm?.purchaseOrder?.bank_routing,
        swift: initForm?.purchaseOrder?.swift,
        bank_address: initForm?.purchaseOrder?.bank_address,
        company_address: initForm?.purchaseOrder?.company_address,
        phone_number: initForm?.purchaseOrder?.phone_number,
        business_scope: initForm?.purchaseOrder?.business_scope,
      };
    }
    setDetailData(initForm);
    setChangeFields((pre: any) => {
      return {
        ...pre,
        signing_type:
          pageType === 'detail' && initForm?.before_signing_type != initForm?.signing_type,
        main_id: pageType === 'detail' && initForm?.before_main_id != initForm?.main_id,
        festival: pageType == 'detail' && initForm?.before_festival != initForm?.festival,
        signing_contract_remarks:
          pageType == 'detail' &&
          initForm?.before_signing_contract_remarks != initForm?.signing_contract_remarks,
      };
    });
    setTableCurrency(`(${pubFilter(common.dicList.SC_CURRENCY, initForm?.currency)})`);

    if (pageType == 'edit') {
      const ids = initForm?.purchaseOrderSku?.map((val: any) => val.id) || [];
      setEditIds(ids);
      const skuIds = initForm?.purchaseOrderSku?.map((val: any) => val.goods_sku_id) || [];
      initForm.purchaseOrderSkuChangeHistories = await getSkuPrice(initForm, skuIds);
    }
    formRef?.current?.setFieldsValue({
      ...initForm,
    });
    if (pageType === 'edit') {
      getValidVendor(initForm.vendor_id);
    }
    setLoading(false);
    setAlReady(true);
  };
  // 审核通过
  const agreeAction = async () => {
    pubModal('确定审核通过?')
      .then(async () => {
        const res: any = await agree({ id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功', 'success');
          getDetailAction();
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };

  // 导出采购单pdf
  const downLoadPdf = async (pdfType: string) => {
    const res: any = await exportPdf({ id, pdfType });
    const type = res.response.headers.get('content-type');
    if (type.indexOf('application/json') > -1) {
      pubMsg(res?.message || '服务器异常, 请稍后重试!');
    } else {
      const blob = new Blob([res.data], {
        type: 'application/pdf;chartset=UTF-8',
      });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = pdfType == 'before' ? `变更前PO单.pdf` : `变更后PO单.pdf`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.target = '_blank';
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
  };
  useEffect(() => {
    getDetailAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ProForm
      layout={'horizontal'}
      formRef={formRef}
      initialValues={{
        projectsGoodsSkus: [{}, {}],
      }}
      submitter={{
        render: (data: any) => (
          <FooterToolbar style={{ padding: '6px' }}>
            <Space>
              {pageType === 'edit' && access.canSee('purchase_order_update') ? (
                <>
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
                  <Button
                    type="primary"
                    key="saveS"
                    onClick={async () => {
                      data.form?.submit?.();
                    }}
                  >
                    提交审核
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    key="goback"
                    onClick={() => {
                      setTimeout(() => {
                        history.goBack();
                      }, 200);
                    }}
                  >
                    返回
                  </Button>
                  {detailData?.approval_status == '2' ? (
                    <>
                      <Access key="reject" accessible={access.canSee('updateOrder_auditing')}>
                        <AuditOptions
                          ghost
                          reload={() => {
                            getDetailAction();
                          }}
                          type="refuse"
                          ids={[id]}
                          title="审核不通过"
                          approval_status={['2']}
                        />
                      </Access>
                      <Access key="approval" accessible={access.canSee('updateOrder_auditing')}>
                        <Button type="primary" key="saveS" onClick={agreeAction}>
                          审核通过
                        </Button>
                      </Access>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              )}
            </Space>
          </FooterToolbar>
        ),
      }}
      labelAlign="right"
      onFinish={async (values) => {
        return Promise.all([editForm.validateFields()])
          .then(() => {
            const postData = JSON.parse(JSON.stringify(values));
            postData.order_id = id;
            updateForm(postData);
          })
          .catch(() => {
            Modal.warning({
              title: '提示',
              content: '请检查表单信息正确性',
            });
          });
      }}
      onFinishFailed={() => {
        editForm.validateFields();
        // console.log(e);
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
    >
      <Spin spinning={loading}>
        <Card title={'供应商信息'} bordered={false}>
          <Row gutter={20} className="light-form-item-row">
            <Col span={8}>
              <Form.Item label="供应商" {...formItemLayout}>
                {detailData?.vendor_name || '-'}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="供应商联系人" {...formItemLayout}>
                {detailData?.vendor_contacts || '-'}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="供应商联系人电话" {...formItemLayout}>
                {detailData?.vendor_contacts_phone || '-'}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="供应商账户名称" {...formItemLayout}>
                {detailData?.bank_account_name || '-'}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="供应商开户行" {...formItemLayout}>
                {detailData?.bank_name || '-'}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="供应商银行账号" {...formItemLayout}>
                {detailData?.bank_account || '-'}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="结算方式" {...formItemLayout}>
                {pubFilter(dicList.VENDOR_PAYMENT_METHOD, detailData?.payment_method) || '-'}
              </Form.Item>
            </Col>
            {['8', '9', '10', '11', '12', '13'].includes(detailData?.payment_method) && (
              <Col span={8}>
                <Form.Item label="预付比例" {...formItemLayout}>
                  {detailData?.prepayment_percentage
                    ? detailData?.prepayment_percentage + '%'
                    : '-'}
                </Form.Item>
              </Col>
            )}
            {detailData?.currency != 'USD' && (
              <Col span={8}>
                <Form.Item label="税率" {...formItemLayout}>
                  {pubFilter(dicList.VENDOR_TAX_RATE, detailData?.tax_rate) || '-'}
                </Form.Item>
              </Col>
            )}
            <Col span={8}>
              <Form.Item label="结算币种" {...formItemLayout}>
                {pubFilter(dicList.SC_CURRENCY, detailData?.currency) || '-'}
              </Form.Item>
            </Col>
          </Row>
          <Row
            gutter={20}
            className="light-form-item-row"
            style={{ display: detailData?.currency === 'USD' ? 'flex' : 'none' }}
          >
            <Col span={24}>
              <Divider />
            </Col>
            <Col span={24}>
              <Form.Item
                label="Bank Routing#（ABA转账编码，收款账号为美国银行的需提供）"
                {...formItemLayout1}
              >
                {detailData?.bank_routing || '-'}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="SWIFT（国际转账编码）" {...formItemLayout1}>
                {detailData?.swift || '-'}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Bank Address（银行地址）" {...formItemLayout1}>
                {detailData?.bank_address || '-'}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Company Address（收款人地址）" {...formItemLayout1}>
                {detailData?.company_address || '-'}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Phone Number（收款人联系电话）" {...formItemLayout1}>
                {detailData?.phone_number || '-'}
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title={'采购主体信息'} bordered={false} style={{ marginTop: '10px' }}>
          {(changeFields.signing_type || changeFields.main_id) && (
            <Row gutter={10} className="light-form-item-row pro-v before-item">
              <Col>
                <div>
                  <span className="change-title-item" style={{ lineHeight: '32px' }}>
                    变更前
                  </span>
                  <span style={{ lineHeight: '32px' }}>
                    {detailData?.before_signing_type == '1'
                      ? '境内采购主体 :'
                      : detailData?.before_signing_type == '2'
                      ? '境外采购主体 :'
                      : '-'}
                  </span>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ lineHeight: '33px' }}> {detailData?.before_main_name ?? '-'}</div>
              </Col>
            </Row>
          )}

          <Row
            gutter={10}
            className={
              changeFields.signing_type || changeFields.main_id
                ? 'light-form-item-row pro-v after-item'
                : 'light-form-item-row pro-v'
            }
          >
            {detailData?.signing_type ? (
              <>
                <Col>
                  <ProFormSelect
                    name="signing_type"
                    label=""
                    valueEnum={
                      changeFields.signing_type || changeFields.main_id
                        ? {
                            1: {
                              text: (
                                <>
                                  <span className="change-title-item">变更后</span>
                                  <span className={changeFields.signing_type ? 'add-color' : ''}>
                                    境内采购主体 :
                                  </span>
                                </>
                              ),
                            },
                            2: {
                              text: (
                                <>
                                  <span className="change-title-item">变更后</span>
                                  <span className={changeFields.signing_type ? 'add-color' : ''}>
                                    境外采购主体 :
                                  </span>
                                </>
                              ),
                            },
                          }
                        : {
                            1: { text: pageType != 'edit' ? '境内采购主体 : ' : '境内采购主体' },
                            2: { text: pageType != 'edit' ? '境外采购主体 : ' : '境外采购主体' },
                          }
                    }
                    allowClear={false}
                    readonly={pageType != 'edit'}
                    disabled={detailData.order_type == '2'}
                    labelCol={{ flex: '0px' }}
                    fieldProps={{
                      onChange: () => {
                        formRef.current?.setFieldsValue({
                          main_id: null,
                        });
                        getValidVendor(formRef.current?.getFieldValue('vendor_id'));
                      },
                    }}
                  />
                </Col>
                <Col span={12}>
                  {pageType == 'edit' ? (
                    <ProFormSelect
                      name="main_id"
                      label=""
                      showSearch
                      labelCol={{ flex: '0px' }}
                      placeholder="请选择采购主体"
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
                      }}
                      rules={[{ required: true, message: '请选择采购主体' }]}
                    />
                  ) : (
                    <Form.Item
                      labelCol={{ flex: '0px' }}
                      className={changeFields.main_id ? 'add-color' : ''}
                    >
                      {detailData?.main_name || '-'}
                    </Form.Item>
                  )}
                </Col>
              </>
            ) : (
              <Col>-</Col>
            )}
          </Row>
        </Card>
        <Card title={'采购单信息'} bordered={false} style={{ marginTop: '10px' }}>
          <Row gutter={20} className="light-form-item-row">
            {pageType === 'detail' && (
              <Col span={8}>
                <Form.Item label="变更单号" {...formItemLayout}>
                  {detailData?.change_order_no || '-'}
                </Form.Item>
              </Col>
            )}

            <Col span={8}>
              <Form.Item label="关联采购单单号" {...formItemLayout}>
                {detailData?.order_no || '-'}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="变更单状态" {...formItemLayout}>
                {pubFilter(
                  dicList.PURCHASE_ORDER_CHANGE_HISTORY_APPROVAL_STATUS,
                  detailData?.approval_status,
                ) || '-'}
              </Form.Item>
            </Col>
            {pageType === 'detail' && (
              <Col span={8}>
                <Form.Item label="创建时间" {...formItemLayout}>
                  {detailData?.update_time || '-'}
                </Form.Item>
              </Col>
            )}

            {changeFields.festival && (
              <Col span={8}>
                <ProFormSelect
                  readonly
                  name="before_festival"
                  placeholder="请选择是否节日订单"
                  label="是否节日订单(变更前)"
                  style={{ width: '150px' }}
                  valueEnum={dicList?.PURCHASE_FESTIVAL}
                  {...formItemLayout}
                />
              </Col>
            )}

            <Col span={8} className={changeFields.festival ? 'add-color' : ''}>
              <ProFormSelect
                readonly={pageType != 'edit'}
                name="festival"
                placeholder="请选择是否节日订单"
                label={changeFields.festival ? '是否节日订单(变更后)' : '是否节日订单'}
                style={{ width: '150px' }}
                valueEnum={dicList?.PURCHASE_FESTIVAL}
                rules={[
                  {
                    required: pageType === 'edit',
                    message: '请选择是否节日订单',
                  },
                ]}
                {...formItemLayout}
              />
            </Col>
            {detailData?.approval_agree_time && (
              <Col span={8}>
                <Form.Item label="审核时间" {...formItemLayout}>
                  {detailData?.approval_agree_time}
                </Form.Item>
              </Col>
            )}
            {detailData?.signing_time && (
              <Col span={8}>
                <Form.Item label="签约时间" {...formItemLayout}>
                  {detailData?.signing_time}
                </Form.Item>
              </Col>
            )}
          </Row>
          {changeFields.signing_contract_remarks && (
            <Row gutter={20} className="light-form-item-row">
              <Col span={12}>
                <ProFormSelect
                  readonly
                  name="before_signing_contract_remarks"
                  label="采购单签约合同备注(变更前)"
                  valueEnum={dicList?.PURCHASE_FESTIVAL}
                  labelCol={{ flex: '190px' }}
                />
              </Col>
            </Row>
          )}
          <Row
            gutter={20}
            className={
              changeFields.signing_contract_remarks
                ? 'light-form-item-row add-color'
                : 'light-form-item-row'
            }
          >
            <Col span={12} className="red">
              <ProFormTextArea
                readonly={pageType != 'edit'}
                name="signing_contract_remarks"
                label={
                  changeFields.signing_contract_remarks
                    ? '采购单签约合同备注(变更后)'
                    : '采购单签约合同备注'
                }
                placeholder="请输入采购单签约合同备注"
                {...formItemLayout}
                labelCol={{
                  flex:
                    pageType == 'detail' &&
                    detailData?.before_signing_contract_remarks !=
                      detailData?.signing_contract_remarks
                      ? '190px'
                      : '148px',
                }}
              />
              {pageType === 'edit' && (
                <div style={{ marginLeft: '130px' }}>
                  <p style={{ color: 'red' }}>
                    *此备注非必填，备注会显示到签约采购单合同上面，请用户慎填
                  </p>
                </div>
              )}
            </Col>
          </Row>
          {detailData?.exception_reason && (
            <Col span={8}>
              <Form.Item label="异常原因" {...formItemLayout}>
                {detailData?.exception_reason}
              </Form.Item>
            </Col>
          )}
        </Card>
        <Card title={'变更信息'} bordered={false} style={{ marginTop: '10px' }}>
          <Row>
            <Col span={24}>
              {pageType == 'edit' ? (
                <Form.Item {...formItemLayout1} label="" name="purchaseOrderSkuChangeHistories">
                  {alReady ? (
                    <OrderTable
                      business_scope={detailData?.business_scope}
                      order_type={detailData?.order_type}
                      tableCurrency={tableCurrency}
                      pageType={pageType}
                      formRef={formRef}
                      form={editForm}
                      currency={detailData?.currency}
                      delivery_status={detailData?.delivery_status}
                      editIds={pageType == 'edit' ? editIds : []}
                      dicList={dicList}
                      formName="purchaseOrderSkuChangeHistories"
                    />
                  ) : (
                    <div>-</div>
                  )}
                </Form.Item>
              ) : (
                <>
                  <div className="change-title">
                    <h1>变更前</h1>
                    <p>
                      <span>变更前PO单：</span>
                      {detailData?.beforeVendorContract?.download_url ? (
                        <a
                          onClick={() =>
                            pubDownLoad(detailData?.beforeVendorContract?.download_url)
                          }
                        >{`${detailData?.order_no}（PDF）`}</a>
                      ) : (
                        <a
                          onClick={() => downLoadPdf('before')}
                        >{`${detailData?.order_no}（PDF）`}</a>
                      )}
                    </p>
                  </div>
                  <Form.Item {...formItemLayout1} label="" name="purchaseOrderSkuB">
                    {alReady ? (
                      <OrderTable
                        type="before"
                        business_scope={detailData?.business_scope}
                        tableCurrency={tableCurrency}
                        pageType={pageType}
                        formRef={formRef}
                        form={editForm}
                        currency={detailData?.currency}
                        delivery_status={detailData?.delivery_status}
                        editIds={[]}
                        dicList={dicList}
                        formName="purchaseOrderSkuB"
                      />
                    ) : (
                      <div>-</div>
                    )}
                  </Form.Item>
                  <div className="change-title" style={{ marginTop: '20px' }}>
                    <h1>变更后</h1>
                    {detailData?.afterVendorContract?.download_url ? (
                      <p>
                        <span>变更后PO单：</span>
                        <a
                          onClick={() => pubDownLoad(detailData?.afterVendorContract?.download_url)}
                        >{`${detailData?.order_no}（PDF）`}</a>
                      </p>
                    ) : (
                      ['2', '3', '5', '8'].includes(detailData?.approval_status) && (
                        <p>
                          <span>变更后PO单：</span>
                          <a
                            onClick={() => downLoadPdf('after')}
                          >{`${detailData?.order_no}（PDF）`}</a>
                        </p>
                      )
                    )}
                  </div>
                  <Form.Item {...formItemLayout1} label="" name="purchaseOrderSkuA">
                    {alReady ? (
                      <OrderTable
                        type="after"
                        afterColor={true}
                        business_scope={detailData?.business_scope}
                        tableCurrency={tableCurrency}
                        pageType={pageType}
                        formRef={formRef}
                        form={editForm}
                        delivery_status={detailData?.delivery_status}
                        currency={detailData?.currency}
                        editIds={[]}
                        dicList={dicList}
                        formName="purchaseOrderSkuA"
                      />
                    ) : (
                      <div>-</div>
                    )}
                  </Form.Item>
                </>
              )}
            </Col>
          </Row>
        </Card>
      </Spin>
    </ProForm>
  );
};
const ConnectPage = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

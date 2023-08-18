import { useEffect, useRef, useState } from 'react';
import { Row, Col, Form, Spin, Statistic, Modal, Space, Divider } from 'antd';
import { ProFormDatePicker } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import ProductTable from './ProductTable';
import { pubFilter, pubMsg,pubConfig } from '@/utils/pubConfig';
import './style.less';
import ProTable from '@ant-design/pro-table';
import { turnList, getDetail } from '@/services/pages/SCM_Manage/order';
import PubDivider from '@/components/PubForm/PubDivider';
import {sortBy} from "lodash";

const Detail = (props: any) => {
  const dicList = props?.dicList;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [detailData, setDetailData] = useState<any>();
  const [alReady, setAlReady] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [originRemarks, setOriginRemarks] = useState([]);
  const [tableCurrency, setTableCurrency] = useState('');
  const [deDetailShow, setDeDetailShow] = useState(false);
  const [turnShow, setTurnShow] = useState(false);
  const [deDetailData, setDeDetailData] = useState<any>({});
  const [turnData, setTurnData] = useState<any>({});
  // 查询扣款记录
  const getTurnList = async () => {
    const res = await turnList({ id: props?.id });
    setTurnData(res.data || []);
  };

  // 获取详情接口
  const getDetailAction = async () => {
    setLoading(true);
    const res = await getDetail({ id: props?.id });
    console.log(res);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    res.data.sysBusinessRemarks = res?.data?.sysBusinessRemarks || [];
    setOriginRemarks(JSON.parse(JSON.stringify(res.data?.sysBusinessRemarks)));
    res.data.purchaseOrderSku =
      res?.data?.purchaseOrderSku?.map((item: any) => {
        // 判断item的 goods_sku_id 是否有备品
        const hasSpare = res?.data?.purchaseOrderSku.find(
          (k: any) => k.goods_sku_id == item.goods_sku_id && k.goods_sku_type == 2,
        );
        console.log(hasSpare, 'hasSpare');
        return {
          ...item,
          rowSpan: item.goods_sku_type == 1 ? (hasSpare ? 2 : 1) : 0,
          copy_price: item.price,
          origin_u: item.undelivered_qty + item.num,
        };
      }) || [];
    // 数据顺序不一致, 合并单元格错位v1.2.3
    res.data.purchaseOrderSku = sortBy(res.data.purchaseOrderSku, ['sku_code', 'goods_sku_type', 'shipment_time'])
    const initForm = res?.data || {};
    initForm.signing_type = initForm.signing_type ? String(initForm.signing_type) : '1';
    setDeDetailData(initForm.purchaseOrderDeductions || []);
    setDetailData(initForm);
    setTableCurrency(`(${pubFilter(dicList.SC_CURRENCY, initForm?.currency)})`);
    getTurnList();
    if (res?.data?.sysBusinessRemarks?.length > 3) {
      setShowMore(true);
      res.data.sysBusinessRemarks = res.data?.sysBusinessRemarks.slice(-3);
    }
    formRef?.current?.setFieldsValue({
      ...initForm,
    });
    setLoading(false);
    setAlReady(true);
  };
  useEffect(() => {
    getDetailAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const formItemLayout = {
    labelCol: { flex: '140px' },
  };
  const formItemLayout1 = {
    labelCol: { flex: '460px' },
  };
  return (
    <>
      <Modal
        width={600}
        title="扣款明细"
        visible={deDetailShow}
        onOk={() => {
          setDeDetailShow(false);
        }}
        onCancel={() => {
          setDeDetailShow(false);
        }}
        footer={false}
      >
        <ProTable
          bordered
          dataSource={deDetailData}
          rowKey="id"
          search={false}
          pagination={false}
          options={false}
          size="small"
          style={{ minWidth: '400px' }}
          columns={[
            {
              title: `扣款金额${tableCurrency}`,
              dataIndex: 'amount',
              hideInSearch: true,
              align: 'center',
              render: (_, row: any) => (
                <Statistic
                  value={row.amount}
                  valueStyle={{ fontWeight: 400, fontSize: '12px' }}
                  precision={2}
                />
              ),
            },
            {
              title: '扣款原因',
              dataIndex: 'reason',
              align: 'center',
            },
            {
              title: '添加扣款时间',
              dataIndex: 'create_time',
              align: 'center',
            },
            {
              title: '添加扣款人',
              dataIndex: 'create_user_name',
              align: 'center',
            },
          ]}
        />
      </Modal>
      <Modal
        width={600}
        title="历史采购员"
        visible={turnShow}
        onOk={() => {
          setTurnShow(false);
        }}
        onCancel={() => {
          setTurnShow(false);
        }}
        footer={false}
      >
        <ProTable
          dataSource={turnData}
          rowKey="id"
          search={false}
          pagination={false}
          options={false}
          size="small"
          style={{ minWidth: '400px' }}
          columns={[
            {
              title: '采购员',
              dataIndex: 'from_user_name',
              align: 'center',
            },
            {
              title: '转出时间',
              dataIndex: 'create_time',
              align: 'center',
            },
          ]}
        />
      </Modal>
      <ProForm
        layout={'horizontal'}
        formRef={formRef}
        initialValues={{
          projectsGoodsSkus: [{}, {}],
        }}
        submitter={false}
        labelAlign="right"
      >
        <Spin spinning={loading}>
          <PubDivider title="供应商信息" />
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
            <Col span={8}>
              <Form.Item label="税率" {...formItemLayout}>
                {pubFilter(dicList.VENDOR_TAX_RATE, detailData?.tax_rate) || '-'}
              </Form.Item>
            </Col>

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

          <PubDivider title="采购主体信息" />
          <Row gutter={10} className="light-form-item-row pro-v">
            <Col>
              <ProFormSelect
                name="signing_type"
                label=""
                valueEnum={{
                  1: { text: '境内采购主体 : ' },
                  2: { text: '境外采购主体 : ' },
                }}
                allowClear={false}
                readonly
                labelCol={{ flex: '0px' }}
              />
            </Col>
            <Col span={12}>
              <Form.Item labelCol={{ flex: '0px' }}>{detailData?.main_name || '-'}</Form.Item>
            </Col>
          </Row>
          <PubDivider title="采购单信息" />
          <Row gutter={20} className="light-form-item-row">
            <Col span={8}>
              <Form.Item label="采购单号" {...formItemLayout}>
                {detailData?.order_no || '-'}
              </Form.Item>
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="approval_status"
                label="采购单状态"
                valueEnum={dicList?.PURCHASE_APPROVAL_STATUS}
                placeholder="--"
                readonly
                {...formItemLayout}
              />
            </Col>
            <Col span={8}>
              <ProFormText
                readonly
                label="创建时间"
                name="create_time"
                placeholder="--"
                {...formItemLayout}
              />
            </Col>
            <Col span={8}>
              <Form.Item label="采购单金额" {...formItemLayout}>
                <Statistic
                  value={detailData?.amount}
                  valueStyle={{
                    fontWeight: 400,
                    fontSize: '12px',
                  }}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="采购运费" {...formItemLayout}>
                <Statistic
                  value={detailData?.freight_amount}
                  valueStyle={{
                    fontWeight: 400,
                    fontSize: '12px',
                  }}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="已付金额" {...formItemLayout}>
                <Statistic
                  value={detailData?.payment_amount}
                  valueStyle={{
                    fontWeight: 400,
                    fontSize: '12px',
                  }}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="未付金额" {...formItemLayout}>
                <Statistic
                  value={detailData?.payable_amount}
                  valueStyle={{
                    fontWeight: 400,
                    fontSize: '12px',
                  }}
                  precision={2}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <ProFormSelect
                name="pay_status"
                label="付款状态"
                valueEnum={dicList?.PURCHASE_PAY_STATUS}
                placeholder="--"
                readonly
                {...formItemLayout}
              />
            </Col>
            <Col span={8}>
              <Form.Item label="采购单扣款" {...formItemLayout}>
                <Space size={10}>
                  <Statistic
                    value={detailData?.deduction_amount}
                    valueStyle={{
                      fontWeight: 400,
                      fontSize: '12px',
                    }}
                    precision={2}
                  />
                  {/* {detailData?.deduction_amount != 0 && (
                    <a
                      onClick={() => {
                        setDeDetailShow(true);
                      }}
                    >
                      采购单扣款详情
                    </a>
                  )} */}
                </Space>
              </Form.Item>
            </Col>
            {detailData?.business_scope === 'IN' && (
              <>
                <Col span={8}>
                  <Form.Item label="平台" {...formItemLayout}>
                    {detailData?.platform_name || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="店铺" {...formItemLayout}>
                    {detailData?.shop_name || '-'}
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          <Row gutter={20} className="light-form-item-row">
            <Col span={8}>
              <Form.Item label="采购员" {...formItemLayout}>
                <Space size={10}>
                  <span> {detailData?.purchaser_name || '-'}</span>
                  {turnData?.length ? (
                    <a
                      onClick={() => {
                        setTurnShow(true);
                      }}
                    >
                      历史采购员
                    </a>
                  ) : (
                    ''
                  )}
                </Space>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="审批人" {...formItemLayout}>
                {detailData?.approval_user_name || '-'}
              </Form.Item>
            </Col>
            <Col span={8}>
              <ProFormDatePicker
                style={{ width: '150px' }}
                name="expected_receipt_time"
                label="预计入库时间"
                readonly
                placeholder="请选择预计入库时间"
                {...formItemLayout}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="festival"
                readonly
                placeholder="请选择预计入库时间"
                label="是否节日订单"
                style={{ width: '150px' }}
                valueEnum={dicList?.PURCHASE_FESTIVAL}
                {...formItemLayout}
              />
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={24} className="red">
              <ProFormTextArea
                name="signing_contract_remarks"
                label="采购单签约合同备注"
                placeholder="请输入采购单签约合同备注"
                {...formItemLayout}
                formItemProps={{
                  style: { margin: '10px 0 4px' },
                }}
                readonly
              />
            </Col>

            <Col span={12}>
              <Form.Item label="采购单备注内容" {...formItemLayout}>
                <div className="item" style={{ paddingTop: '7px' }}>
                  <span className="value">
                    {detailData?.sysBusinessRemarks?.length
                      ? detailData?.sysBusinessRemarks.map(
                          (
                            item: { remarks: string; create_time: string; id: string },
                            index: number,
                          ) => {
                            return (
                              <div
                                key={item.id}
                                style={{
                                  fontSize: '12px',
                                  display: showMore && index > 2 ? 'none' : 'block',
                                }}
                              >
                                <Row gutter={4}>
                                  <Col span={2}>{index + 1}.</Col>
                                  <Col span={10}>
                                    <pre style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                                      {item.remarks}
                                    </pre>
                                  </Col>
                                  <Col span={12}>
                                    <span style={{ color: '#aaa', fontSize: '12px' }}>
                                      —{item.create_time}
                                    </span>
                                  </Col>
                                </Row>
                              </div>
                            );
                          },
                        )
                      : '-'}
                    <a
                      style={{
                        display: showMore ? 'block' : 'none',
                      }}
                      onClick={() => {
                        setDetailData((pre: any) => {
                          return {
                            ...pre,
                            sysBusinessRemarks: originRemarks,
                          };
                        });
                        setShowMore(false);
                      }}
                    >
                      更多
                    </a>
                  </span>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <PubDivider title="采购商品列表" />
          <Row>
            <Col span={24}>
              {alReady && (
                <ProductTable
                  business_scope={detailData.business_scope}
                  tableCurrency={tableCurrency}
                  pageType={'detail'}
                  formRef1={formRef}
                  form={editForm}
                  dataSource={detailData.purchaseOrderSku}
                  editIds={[]}
                  dicList={dicList}
                />
              )}
            </Col>
          </Row>
        </Spin>
      </ProForm>
    </>
  );
};

export default Detail;

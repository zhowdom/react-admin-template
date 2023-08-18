import { useEffect, useRef, useState } from 'react';
import { Col, Form, Modal, Row, Space, Statistic } from 'antd';
import { ProFormDatePicker, ProFormDigit } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormSelect } from '@ant-design/pro-form';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import ProTable from '@ant-design/pro-table';
import { addAsk, requestDetail } from '@/services/pages/purchaseOrder';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import type { ActionType } from '@ant-design/pro-table';
import { findValidVendorToSubject } from '@/services/pages/purchasePlan';
import { add, IsGrey } from '@/utils/pubConfirm';

const AskPayment = (props: any) => {
  const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const formItemLayout1 = {
    labelCol: { flex: '120px' },
    wrapperCol: { span: 16 },
  };
  const [mainList, setMainList] = useState([]);
  const [type, setType] = useState(props.items.delivery_status == '0' ? 0 : 1);
  const [detailData, setDetailData] = useState<any>({});
  const [specialList, setSpecialList] = useState(props.items.delivery_status != '0');
  const ref = useRef<ActionType>();
  const disabledDate = (current: any) => {
    return current && new Date(current).getTime() + 24 * 60 * 60 < new Date().getTime();
  };
  const formRef = useRef<ProFormInstance>();
  const handleUpload = (info: any) => {
    formRef?.current?.setFieldsValue({
      proof: info,
    });
  };
  props.refAsk.current = {
    submit: () => {
      formRef?.current?.submit();
    },
  };
  // 添加请款
  const addAskAction = async (postData: any) => {
    props.toggleLoading();
    const res = await addAsk(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      props.toggleLoading();
      return;
    }
    pubMsg('添加成功', 'success');
    props.toggleLoading();
    ref?.current?.reload();
    props.handleClose(true);
  };

  // (单个供应商)查询某个供应商下面所有在有效期内的签约主体
  const getValidVendor = async (vendorId?: any) => {
    const res = await findValidVendorToSubject({ vendorId });
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
  };
  // 详情数据查询
  const getItems = async () => {
    const res = await requestDetail({ id: props?.items?.id, type });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    let data = res.data || {};
    data.type = type;
    const statement_amount = data?.account_statement_orders?.reduce(
      (pre: any, current: any) => add(pre, current.total_amount),
      0,
    );
    data = {
      ...data,
      ...data.vendorBankAccount,
      statement_amount,
      main: {
        value: data.main_id,
        label: data.main_name,
      },
    };
    if (type == 0 && data.recoverable_amount == 0) {
      setType(1);
      setSpecialList(true);
    }
    setDetailData(data);
    console.log(data);
    return data || {};
  };
  useEffect(() => {
    getValidVendor(props?.items?.vendor_id);
  }, []);
  const columns: any[] = [
    {
      title: props?.items?.currency === 'USD' ? '请款金额（美元）' : '请款金额（人民币）',
      dataIndex: 'amount',
      align: 'center',
      render: (_, record: any) =>
        !IsGrey && (
          <Statistic
            value={record.amount}
            valueStyle={{ fontWeight: 400, fontSize: '14px' }}
            precision={2}
          />
        ),
    },
    {
      title: '请款原因',
      dataIndex: 'reason',
      align: 'center',
    },
    {
      title: '请款时间',
      dataIndex: 'create_time',
      align: 'center',
    },
    {
      title: '请款人',
      dataIndex: 'create_user_name',
      align: 'center',
    },
  ];
  const columns1: any[] = [
    {
      title: props?.items?.currency === 'USD' ? '扣款金额（美元)' : '扣款金额（人民币）',
      dataIndex: 'amount',
      align: 'center',
      render: (_, record: any) =>
        !IsGrey && (
          <Statistic
            value={record.amount}
            valueStyle={{ fontWeight: 400, fontSize: '14px' }}
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
  ];
  return (
    <ProForm
      className="supplier-detail"
      formRef={formRef}
      params={{ type }}
      onFinish={async (values: any) => {
        const postData = {
          ...detailData,
          ...values,
          order_no: props?.items?.order_no,
          order_id: props?.items?.id,
          requirement_pay_time: values?.requirement_pay_time + ' 00:00:00',
          main_name: values?.main?.label || null,
          main_id: values?.main?.value || null,
          amount: values?.needAmount,
          type,
        };
        delete postData.id;
        addAskAction(postData);
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
      labelAlign="right"
      {...formItemLayout}
      submitter={false}
      request={getItems}
      layout="horizontal"
    >
      <Row gutter={10}>
        <Col span={24}>
          <div style={{ marginLeft: '25px' }}>
            <ProForm.Group>
              <ProFormSelect
                name="type"
                label=""
                allowClear={false}
                options={
                  specialList
                    ? [
                        {
                          value: 1,
                          label: '特批请款',
                        },
                      ]
                    : [
                        {
                          value: 0,
                          label: '正常请款',
                        },
                        {
                          value: 1,
                          label: '特批请款',
                        },
                      ]
                }
                placeholder="请选择"
                fieldProps={{
                  onChange: (val: any) => {
                    console.log(val);
                    setType(val);
                  },
                }}
              />
              <p
                style={{
                  marginBottom: '20px',
                  transform: 'translateX(-100px)',
                  lineHeight: '28px',
                  color: '#a9a9a9',
                }}
              >
                1. 正常请款，可请款金额 ≤ 采购金额*预付比例 - 已申请预付金额；
                <br />
                2. 特批请款，可请款金额 ≤ （采购金额+运费）-采购扣款- 已请款金额（所有状态） -
                对账单已生成的金额（所有状态）；
                <br />
                3. 有预付比例时，申请特批请款，会占用掉预付比例；
                <br />
              </p>
            </ProForm.Group>
          </div>
        </Col>
      </Row>
      <Row className="show-detail">
        <Col span={6}>
          <Form.Item label="采购单号">{props?.items?.order_no || '--'}</Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="采购金额">
            {!IsGrey && (
              <Statistic
                value={detailData?.amount ?? '--'}
                valueStyle={{
                  fontWeight: 400,
                  fontSize: '14px',
                  color: detailData?.amount || detailData?.amount == 0 ? '#282828' : '#c8c8c8',
                }}
                precision={2}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="运费">
            {!IsGrey && (
              <Statistic
                value={detailData?.freight_amount ?? '--'}
                valueStyle={{
                  fontWeight: 400,
                  fontSize: '14px',
                  color:
                    detailData?.freight_amount || detailData?.freight_amount == 0
                      ? '#282828'
                      : '#c8c8c8',
                }}
                precision={2}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={6} className="disabled">
          <ProFormSelect
            name="pay_method"
            label="结算方式"
            disabled
            valueEnum={props.dicList.VENDOR_PAYMENT_METHOD}
            placeholder="--"
          />
        </Col>
        <Col
          span={24}
          style={{
            margin: ' 0px 0px 20px 0',
            display: detailData?.purchaseOrderRequestFunds?.length ? 'block' : 'none',
            paddingLeft: '25px',
          }}
        >
          <ProTable
            className="p-table-0"
            columns={columns}
            pagination={false}
            options={false}
            dataSource={detailData.purchaseOrderRequestFunds || []}
            search={false}
            rowKey="id"
            actionRef={ref}
            dateFormatter="string"
            headerTitle={
              detailData?.request_funds_amount && !IsGrey ? (
                <Space>
                  <span style={{ color: '#2e62e2' }}>已请款: </span>
                  <Statistic
                    value={detailData?.request_funds_amount}
                    valueStyle={{ fontWeight: 400, fontSize: '14px' }}
                    precision={2}
                  />
                </Space>
              ) : (
                ''
              )
            }
            bordered
          />
        </Col>
        <Col
          span={24}
          style={{
            margin: ' 0px 0px 30px 0',
            display: detailData?.purchaseOrderDeductions?.length ? 'block' : 'none',
            paddingLeft: '25px',
          }}
        >
          <ProTable
            className="p-table-0"
            columns={columns1}
            pagination={false}
            dataSource={detailData.purchaseOrderDeductions || []}
            search={false}
            rowKey="id"
            options={false}
            dateFormatter="string"
            headerTitle={
              detailData?.deduction_amount && !IsGrey ? (
                <Space>
                  <span style={{ color: '#2e62e2' }}>采购单扣款金额: </span>
                  <Statistic
                    value={detailData?.deduction_amount}
                    valueStyle={{ fontWeight: 400, fontSize: '14px' }}
                    precision={2}
                  />
                </Space>
              ) : (
                ''
              )
            }
            bordered
          />
        </Col>
        <Col
          span={24}
          hidden={IsGrey}
          style={{
            margin: ' 0px 0px 30px 0',
            display: detailData?.account_statement_orders?.length ? 'block' : 'none',
            paddingLeft: '25px',
          }}
        >
          <ProTable
            size="small"
            className="p-table-0"
            columns={[
              {
                title: '对账单号',
                dataIndex: 'account_statement_order_no',
                align: 'center',
              },
              {
                title: '对账单已生成金额(所有状态)',
                dataIndex: 'total_amount',
                align: 'center',
              },
            ]}
            pagination={false}
            dataSource={detailData.account_statement_orders || []}
            search={false}
            rowKey="id"
            options={false}
            dateFormatter="string"
            headerTitle={
              detailData?.statement_amount && !IsGrey ? (
                <Space align="center">
                  <span style={{ color: '#2e62e2' }}>对账单已生成金额 : </span>
                  <Statistic
                    value={detailData?.statement_amount}
                    valueStyle={{ fontWeight: 400, fontSize: '14px' }}
                    precision={2}
                  />
                </Space>
              ) : (
                ''
              )
            }
            bordered
          />
        </Col>
        <Col span={12} style={{ marginLeft: '15px' }}>
          <Form.Item label="可请款金额" labelCol={{ span: 4 }}>
            {!IsGrey && (
              <Statistic
                value={detailData.recoverable_amount ?? '--'}
                valueStyle={{
                  fontWeight: 400,
                  fontSize: '14px',
                }}
              />
            )}
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <ProFormDigit
            fieldProps={{
              precision: 2,
              maxLength: 125,
            }}
            min={0}
            labelCol={{ flex: '120px' }}
            placeholder="请输入请款金额"
            label="请款金额"
            name="needAmount"
            rules={[
              { required: true, message: '请输入请款金额' },
              () => ({
                validator(_, value) {
                  if (value == 0) {
                    return Promise.reject(new Error('请款金额不能为0'));
                  }
                  if (value > detailData.recoverable_amount) {
                    return Promise.reject(new Error('请款金额应小于等于可请款金额'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            name="main"
            label="付款主体"
            readonly
            showSearch
            labelCol={{ flex: '120px' }}
            placeholder="请选择付款主体"
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
              labelInValue: true,
            }}
            rules={[
              { required: true, message: '请选择付款主体' },
              ({}) => ({
                validator(_, value) {
                  if (JSON.stringify(value) === '{}') {
                    return Promise.reject(new Error('请选择付款主体'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
        </Col>
        <Col span={12}>
          <ProFormDatePicker
            fieldProps={{
              disabledDate: disabledDate,
            }}
            labelCol={{ flex: '120px' }}
            name="requirement_pay_time"
            label="要求支付日期"
            placeholder="请选择要求支付日期"
            rules={[{ required: true, message: '请选择要求支付日期' }]}
          />
        </Col>
        <Col span={12}>
          <ProFormText
            name="reason"
            label="请款原因"
            placeholder="请输入请款原因"
            labelCol={{ flex: '120px' }}
            rules={[
              { required: true, message: '请输入请款原因' },
              {
                pattern: /^(?=.*\S).+$/,
                message: '请输入请款原因',
              },
            ]}
          />
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Form.Item label="供应商账户名称" labelCol={{ flex: '120px' }}>
            {detailData.bank_account_name || '-'}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="供应商开户行" labelCol={{ flex: '120px' }}>
            {detailData.bank_name || '-'}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="供应商银行账号" labelCol={{ flex: '120px' }}>
            {detailData.bank_account || '-'}
          </Form.Item>
        </Col>
      </Row>
      {props?.items?.currency === 'USD' && (
        <Row className="us show-detail">
          <Col span={24}>
            <Form.Item
              label=" Bank Routing#（ABA转账编码，收款账号为美国银行的需提供）"
              labelCol={{ flex: '410px' }}
            >
              {detailData.bank_routing}
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="SWIFT（国际转账编码）" labelCol={{ flex: '410px' }}>
              {detailData.swift}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Bank Address（银行地址）" labelCol={{ flex: '410px' }}>
              {detailData.bank_address}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Company Address（收款人地址）" labelCol={{ flex: '410px' }}>
              {detailData.company_address}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Phone Number（收款人联系电话）" labelCol={{ flex: '410px' }}>
              {detailData.phone_number}
            </Form.Item>
          </Col>
        </Row>
      )}
      <Row>
        <Col span={24}>
          <Form.Item
            {...formItemLayout1}
            label="上传附件"
            name="proof"
            extra="支持PDF、Word、JPG、JPEG、PNG、EXCEL文件格式"
          >
            <UploadFileList
              fileBack={handleUpload}
              required
              businessType="PURCHASE_ORDER_REQUEST_FUNDS"
              listType="picture-card"
              defaultFileList={detailData.proof}
              accept={['.png,.jpg,.docx,.pdf,.doc,.xls,.xlsx']}
              acceptType={['png', 'jpg', 'docx', 'pdf', 'doc', 'xls', 'xlsx']}
            />
          </Form.Item>
        </Col>
      </Row>
    </ProForm>
  );
};
export default AskPayment;

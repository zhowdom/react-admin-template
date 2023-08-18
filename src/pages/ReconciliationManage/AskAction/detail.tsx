import type { FC } from 'react';
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftOutlined, ReconciliationOutlined } from '@ant-design/icons';
import { Button, Card, Spin, Space } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormTextArea } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import './style.less';
import { connect, history } from 'umi';
import {
  addOrderRemarks,
  purchaseOrderGetDetailById,
} from '@/services/pages/reconciliationAskAction';
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { IsGrey, pubGoUrl } from '@/utils/pubConfirm';
import DetailItem from '@/components/Reconciliation/DetailItem';
import { dateFormat, convertCurrency } from '@/utils/filter';
import { useAccess, Access } from 'umi';
import OrderDetail from '@/components/OrderDetail';
import HandleAction from './Dialog/HandleAction';
import moment from 'moment';
import PurchaseOrder from './Dialog/PurchaseOrder';

const Page: FC<Record<string, any>> = (props) => {
  // model下发数据
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const id = history.location?.query?.id || '';
  const access = useAccess();
  // 添加弹窗实例
  const aduitModel = useRef();
  // 打开弹窗
  const handleOpen: any = (ids?: any, type?: any, required?: any) => {
    const data: any = aduitModel?.current;
    data.open(ids, type, required);
  };
  // 详情
  const getDetail = async (): Promise<any> => {
    setLoading(true);
    const res = await purchaseOrderGetDetailById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setDetail(res.data);
    }
    setLoading(false);
  };
  useEffect(() => {
    getDetail();
  }, []);

  // 弹窗关闭
  const modalClose = (data: any) => {
    console.log(data);
    if (!data) return;
    setTimeout(() => {
      getDetail();
    }, 200);
  };
  // 打印
  const print = async () => {
    const url = `/appPage_Scm/askAction-print?ids=${id}`;
    pubGoUrl(url);
  };
  // 添加备注
  const addRemarks = async (value: any) => {
    value.ids = id;
    setLoading(true);
    const res = await addOrderRemarks(value);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功', 'success');
      formRef.current?.setFieldsValue({
        remark: null,
      });
      getDetail();
    }
    setLoading(false);
  };

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
        submitter={false}
        labelAlign="right"
        labelWrap={true}
        onFinish={async (values) => {
          addRemarks(values);
        }}
      >
        <Spin spinning={loading}>
          <Card
            title={
              <>
                <Space>
                  <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                    返回
                  </Button>
                  {detail.approval_status == '8' ? (
                    <Access key="paymentButton" accessible={access.canSee('askAction_payment')}>
                      <Button
                        type="primary"
                        onClick={() => {
                          handleOpen(detail?.id, 'payment');
                        }}
                      >
                        确认付款
                      </Button>
                    </Access>
                  ) : (
                    ''
                  )}
                  {(detail.approval_status == '4' &&
                    detail.roleCodeList &&
                    detail.roleCodeList.indexOf('sc_cw') > -1) ||
                  (detail.approval_status == '6' &&
                    detail.roleCodeList &&
                    detail.roleCodeList.indexOf('sc_cwsx') > -1) ? (
                    <>
                      <Access key="approvalButton" accessible={access.canSee('askAction_approval')}>
                        <Button
                          type="primary"
                          onClick={() => {
                            handleOpen(
                              detail?.id,
                              'approve',
                              detail.approval_status == '4' ? true : false,
                            );
                          }}
                        >
                          审批通过
                        </Button>
                        <Button
                          onClick={() => {
                            handleOpen(detail?.id, 'refuse', true);
                          }}
                        >
                          驳回
                        </Button>
                      </Access>
                    </>
                  ) : (
                    ''
                  )}
                  <Access
                    key="printButton"
                    accessible={access.canSee('askAction_print') && detail.approval_status == '8'}
                  >
                    <Button
                      icon={<ReconciliationOutlined />}
                      ghost
                      type="primary"
                      onClick={() => {
                        print();
                      }}
                    >
                      打印
                    </Button>
                  </Access>
                </Space>
                <Access key="findByIdButton" accessible={access.canSee('askAction_order_detail')}>
                  <OrderDetail
                    id={detail.order_id}
                    title={
                      <Button style={{ float: 'right' }} ghost type="primary">
                        查看采购单
                      </Button>
                    }
                    dicList={common?.dicList}
                  />
                </Access>
              </>
            }
            bordered={false}
          >
            <div className="reconciliation-detail-table">
              <div className="r-w">
                <DetailItem title="请款单号">{detail?.funds_no}</DetailItem>
                <DetailItem title="当前状态">
                  {pubFilter(common.dicList.PURCHASE_REQUEST_FUNDS_STATUS, detail.approval_status)}
                </DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="请款日期">{dateFormat(detail?.create_time)}</DetailItem>
                <DetailItem title="请款人">{detail?.create_user_name}</DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="供应商名称">{detail?.vendor_name}</DetailItem>
                <DetailItem title="付款主体">{detail?.main_name}</DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="请款金额">{IsGrey ? '' :(detail?.amount)}</DetailItem>
                <DetailItem title="采购单号">
                  {access.canSee('askAction_order_detail') ? (
                    <OrderDetail
                      id={detail.order_id}
                      title={<a>{detail.order_no}</a>}
                      dicList={common?.dicList}
                    />
                  ) : (
                    detail?.order_no
                  )}
                </DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="请款金额(大写)">{IsGrey ? '' : convertCurrency(detail?.amount)}</DetailItem>
                <DetailItem title="结算方式">{detail?.paymentMethod || '-'}</DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="收款账户名">{detail?.bank_account_name}</DetailItem>
                <DetailItem title="要求付款时间">
                  {dateFormat(detail?.requirement_pay_time)}
                </DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="银行账号">{detail?.bank_account}</DetailItem>
                <DetailItem title="附件">
                  <ShowFileList data={detail?.proof || []} />
                </DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="开户行">{detail?.bank_name}</DetailItem>
              </div>

              {detail?.currency == 'USD' ? (
                <>
                  <div className="r-w">
                    <DetailItem title="Bank Routing">{detail?.bank_routing}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="SWIFT">{detail?.swift}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="Bank Address">{detail?.bank_address}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="Company Address">{detail?.company_address}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="Phone Number">{detail?.phone_number}</DetailItem>
                  </div>
                </>
              ) : (
                ''
              )}

              <div className="r-w">
                <DetailItem title="请款原因">{detail?.reason}</DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="账单备注">
                  {detail?.remarks?.map((elem: any) => {
                    return (
                      <div className="detail-remarks" key={elem.id}>
                        <Space>
                          <span>{moment(elem.create_time).format('YYYY-MM-DD')}</span>
                          <span className="name">{elem.create_user_name}</span>
                          <span>{elem.remarks}</span>
                        </Space>
                      </div>
                    );
                  })}
                </DetailItem>
                <DetailItem title="添加备注">
                  <ProFormTextArea
                    name="remark"
                    label=""
                    placeholder="请输入备注"
                    rules={[{ required: true, message: '请输入备注' }]}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 14 }}
                  />
                  <Access
                    key="remarksButton"
                    accessible={access.canSee(
                      'accountStatementOrder_cn_addRemarks,accountStatementOrder_in_addRemarks',
                    )}
                  >
                    <Button
                      type="primary"
                      onClick={() => {
                        formRef?.current?.submit();
                      }}
                    >
                      添加备注
                    </Button>
                  </Access>
                </DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="审批记录">
                  {detail?.approvalHistoryList?.map((elem: any) => {
                    return (
                      <div className="detail-remarks" key={elem.id}>
                        <Space>
                          <span>{moment(elem.approval_time).format('YYYY-MM-DD')}</span>
                          <span className="name">{elem.approval_user_name}</span>
                          <span>{elem.approval_status_name}</span>
                        </Space>
                      </div>
                    );
                  })}
                </DetailItem>
              </div>
            </div>
          </Card>
        </Spin>
      </ProForm>
      {detail?.id && detail?.purchaseOrderSkuList?.length ? (
        <PurchaseOrder tableData={detail?.purchaseOrderSkuList} />
      ) : (
        ''
      )}
      <HandleAction aduitNoModel={aduitModel} handleClose={modalClose} />
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

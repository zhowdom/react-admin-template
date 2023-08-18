import type { FC } from 'react';
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftOutlined, ReconciliationOutlined } from '@ant-design/icons';
import { Button, Card, Spin, Space } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import './style.less';
import { connect } from 'umi';
import {
  accountStatementOrderById,
  addRemarksAccountOrder,
  exportWarehousingPurchaseOrderSku,
} from '@/services/pages/reconciliationPurchase';
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import DetailItem from '@/components/Reconciliation/DetailItem';
import { dateFormat, priceValue, convertCurrency } from '@/utils/filter';
import AduitNo from './Dialog/AduitNo';
import PurchaseOrder from './Dialog/PurchaseOrder';
import AskActionList from './Dialog/AskActionList';
import AuditList from './Dialog/AuditList';
import DeductionList from './Dialog/DeductionList';
import Pament from './Dialog/Pament';
import PamentNo from './Dialog/PamentNo';
import OtherFee from './Dialog/OtherFee';
import EditTime from './Dialog/EditTime';
import { print } from './config';
import { useAccess, Access } from 'umi';
import moment from 'moment';
import LostDetails from './Dialog/LostDetails';
import { IsGrey } from '@/utils/pubConfirm';
import {useModel} from "@@/plugin-model/useModel";

const Page: FC<Record<string, any>> = (props) => {
  // model下发数据
  const { common, history } = props;
  const isCn = history?.location?.pathname.indexOf('purchaseCn') > -1;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const id = history.location?.query?.id || '';
  const [downLoading, setDownLoading] = useState<any>(false);
  const access = useAccess();
  const { initialState }: any = useModel('@@initialState');
  const userInfo = initialState?.currentUser

  // 添加弹窗实例
  const aduitNoModel = useRef();
  const auditListModel = useRef();
  const pamentModel = useRef();
  const pamentNoModel = useRef();
  const editTimeModel = useRef();
  // 审核不通过
  const aduitNoModelOpen: any = (ids?: any, type?: any, required?: any, dataC?: any) => {
    const data: any = aduitNoModel?.current;
    data.open(ids, type, required, dataC);
  };
  // 审批记录
  const auditListModelOpen: any = (sid?: any) => {
    const data: any = auditListModel?.current;
    data.open(sid);
  };
  // 确认付款
  const pamentModelOpen: any = (rowData?: any) => {
    const data: any = pamentModel?.current;
    data.open(rowData);
  };
  // 付款驳回
  const pamentNoModelOpen: any = (rowData?: any) => {
    const data: any = pamentNoModel?.current;
    data.open(rowData);
  };
  // 更新账单
  const editTimeModelOpen: any = () => {
    const data: any = editTimeModel?.current;
    data.open(id);
  };

  // 详情
  const getDetail = async (): Promise<any> => {
    setLoading(true);
    const res = await accountStatementOrderById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const newData = res.data;
      let newAccount: any = [];
      const oldAccount = res.data.accountStatementOrderDetail;
      for (const k in oldAccount) {
        const newItem = oldAccount[k].map((v: any, index: number) => ({
          ...v,
          rowSpan: !index ? oldAccount[k].length : 0,
        }));
        newAccount = [...newItem].concat(newAccount);
      }
      console.log(newAccount);
      newData.accountStatementOrderDetail = newAccount;
      newData.roleCodeList = userInfo.roleCodes ? userInfo.roleCodes.split(',') : [];
      console.log(newData)
      setDetail(newData);
    }
    setLoading(false);
  };
  // 导出excel
  const downLoadExcel = async () => {
    setDownLoading(true);
    const res: any = await exportWarehousingPurchaseOrderSku({ account_statement_order_id: id });
    const type = res.response.headers.get('content-type');
    if (type && type.indexOf('application/json') > -1) {
      const json = res?.response?.json();
      if (json) {
        json.then((r: any) => {
          pubMsg('操作失败: ' + r?.message);
        });
      } else {
        pubMsg(res?.message);
      }
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `入库明细.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
    setDownLoading(false);
  };
  useEffect(() => {
    console.log(2);
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

  // 添加备注
  const addRemarks = async (value: any) => {
    console.log(value);
    value.id = id;
    setLoading(true);
    const res = await addRemarksAccountOrder(value);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功', 'success');
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
        className="p-order"
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
                  {(detail.approval_status == '1' ||
                    detail.approval_status == '3' ||
                    detail.approval_status == '5' ||
                    detail.approval_status == '7' ||
                    detail.approval_status == '10') &&
                    ((detail.business_scope == 'CN' &&
                      access.canSee('accountStatementOrder_cn_initiateAnApplication')) ||
                      (detail.business_scope == 'IN' &&
                        access.canSee('accountStatementOrder_in_initiateAnApplication'))) ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        aduitNoModelOpen(
                          detail?.id,
                          'addAudit',
                          false,
                          detail?.latest_payment_date,
                        );
                      }}
                    >
                      申请对账
                    </Button>
                  ) : (
                    ''
                  )}
                  {detail.approval_status == '8' &&
                    ((detail.business_scope == 'CN' &&
                      access.canSee('accountStatementOrder_cn_payment')) ||
                      (detail.business_scope == 'IN' &&
                        access.canSee('accountStatementOrder_in_payment') &&
                        detail.roleCodeList.indexOf('sc_zczy') > -1)) ? (
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => {
                          pamentModelOpen(detail);
                        }}
                      >
                        确认付款
                      </Button>
                      <Button
                        onClick={() => {
                          pamentNoModelOpen(detail);
                        }}
                      >
                        付款驳回
                      </Button>
                    </Space>
                  ) : (
                    ''
                  )}
                  {((detail.approval_status == '2' &&
                    detail.roleCodeList &&
                    detail.roleCodeList.indexOf('sc_cgsx') > -1) ||
                    (detail.approval_status == '4' &&
                      detail.roleCodeList &&
                      detail.roleCodeList.indexOf('sc_cw') > -1) ||
                    (detail.approval_status == '6' &&
                      detail.roleCodeList &&
                      detail.roleCodeList.indexOf('sc_cwsx') > -1)) &&
                    ((detail.business_scope == 'CN' &&
                      access.canSee('accountStatementOrder_cn_approval')) ||
                      (detail.business_scope == 'IN' &&
                        access.canSee('accountStatementOrder_in_approval'))) ? (
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => {
                          aduitNoModelOpen(detail?.id, 'approve', detail.approval_status == '4');
                        }}
                      >
                        审批通过
                      </Button>
                      <Button
                        onClick={() => {
                          aduitNoModelOpen(detail?.id, 'refuse', true);
                        }}
                      >
                        驳回
                      </Button>
                    </Space>
                  ) : (
                    ''
                  )}

                  {(detail.approval_status == '1' ||
                    detail.approval_status == '3' ||
                    detail.approval_status == '5' ||
                    detail.approval_status == '7' ||
                    detail.approval_status == '10') &&
                    ((detail.business_scope == 'CN' &&
                      access.canSee('accountStatementOrder_cn_update')) ||
                      (detail.business_scope == 'IN' &&
                        access.canSee('accountStatementOrder_in_update'))) ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        aduitNoModelOpen(detail?.id, 'uploadAccount');
                      }}
                    >
                      更新账单
                    </Button>
                  ) : (
                    ''
                  )}
                  {(detail.business_scope == 'CN' &&
                    access.canSee('accountStatementOrder_cn_history')) ||
                    (detail.business_scope == 'IN' &&
                      access.canSee('accountStatementOrder_in_history')) ? (
                    <Button
                      type="primary"
                      ghost
                      onClick={() => {
                        auditListModelOpen(detail?.id);
                      }}
                    >
                      审批日志
                    </Button>
                  ) : (
                    ''
                  )}

                  {detail.approval_status == '8' &&
                    ((detail.business_scope == 'CN' &&
                      access.canSee('accountStatementOrder_cn_print')) ||
                      (detail.business_scope == 'IN' &&
                        access.canSee('accountStatementOrder_in_print'))) ? (
                    <Button
                      icon={<ReconciliationOutlined />}
                      ghost
                      type="primary"
                      onClick={() => {
                        print([detail?.id]);
                      }}
                    >
                      打印
                    </Button>
                  ) : (
                    ''
                  )}
                  {['1', '3', '5', '7', '10'].includes(detail.approval_status) &&
                    (access.canSee('accountStatementOrder_cn_addOtherFee') ||
                      access.canSee('accountStatementOrder_in_addOtherFee')) ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        aduitNoModelOpen(detail?.id, 'addOtherFee', false, {
                          currency: pubFilter(common.dicList.SC_CURRENCY, detail?.currency),
                        });
                      }}
                    >
                      添加其他费用
                    </Button>
                  ) : (
                    ''
                  )}
                  {(access.canSee('accountStatementOrder_cn_receiptDetails') ||
                    access.canSee('accountStatementOrder_in_receiptDetails')) && (
                      <Button
                        type="primary"
                        onClick={() => {
                          downLoadExcel();
                        }}
                        loading={downLoading}
                      >
                        导出入库明细
                      </Button>
                    )}
                  {((access.canSee('scm_accountStatement_cn_editTime') || access.canSee('scm_accountStatement_in_editTime')) && ['1', '3', '5', '7', '10'].includes(detail?.approval_status)) && (
                    <Button
                      type="primary"
                      onClick={() => {
                        editTimeModelOpen();
                      }}
                    >
                      修改账单期间
                    </Button>
                  )}
                </Space>
              </>
            }
            bordered={false}
          >
            <div className="reconciliation-detail-table">
              <div className="r-w">
                <DetailItem title="对账单号">{detail?.order_no}</DetailItem>
                <DetailItem title="账单状态">
                  {pubFilter(common.dicList.ACCOUNT_STATEMENT_STATUS, detail?.approval_status)}
                </DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="供应商名称">{detail?.vendor_name}</DetailItem>
                <DetailItem title="付款主体">{detail?.main_name}</DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="收款账户名">{detail?.bank_account_name}</DetailItem>
                <DetailItem title="账单期间">
                  {dateFormat(detail?.begin_time)} 到 {dateFormat(detail?.end_time)}
                </DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="收款账号">{detail?.bank_account}</DetailItem>
                <DetailItem title="结算方式">
                  {pubFilter(common.dicList.VENDOR_PAYMENT_METHOD, detail?.payment_method)}
                </DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="开户行">{detail?.bank_name}</DetailItem>
                <DetailItem title="最迟付款日期">
                  {dateFormat(detail?.latest_payment_date)}
                </DetailItem>
              </div>

              {detail?.currency == 'USD' ? (
                <>
                  <div className="r-w">
                    <DetailItem title="Bank Routing">{detail?.bank_routing}</DetailItem>
                    <DetailItem title="结算币种">
                      {pubFilter(common.dicList.SC_CURRENCY, detail?.currency)}
                    </DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="SWIFT">{detail?.swift}</DetailItem>
                    <DetailItem title="供应商等级">{detail?.vendor_level}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="Bank Address">{detail?.bank_address}</DetailItem>
                    <DetailItem title="采购员">{detail?.purchaser_name}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="Company Address">{detail?.company_address}</DetailItem>
                    <DetailItem />
                  </div>
                  <div className="r-w">
                    <DetailItem title="Phone Number">{detail?.phone_number}</DetailItem>
                    <DetailItem />
                  </div>
                  <div className="r-w">
                    <DetailItem title="账单应付金额">{IsGrey ? '' : priceValue(detail?.amount)}</DetailItem>
                    <DetailItem />
                  </div>
                  <div className="r-w">
                    <DetailItem title="账单应付金额">{IsGrey ? '' : convertCurrency(detail?.amount)}</DetailItem>
                    <DetailItem />
                  </div>
                </>
              ) : (
                <>
                  <div className="r-w">
                    <DetailItem title="账单应付金额">{IsGrey ? '' :priceValue(detail?.amount)}</DetailItem>
                    <DetailItem title="供应商等级">{detail?.vendor_level}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="账单应付金额">{IsGrey ? '' :convertCurrency(detail?.amount)}</DetailItem>
                    <DetailItem title="采购员">{detail?.purchaser_name}</DetailItem>
                  </div>
                </>
              )}
              {detail?.approval_status == '9' ? (
                <div className="r-w">
                  <DetailItem title="付款凭证">
                    <ShowFileList data={detail?.sys_files || []} />
                  </DetailItem>
                </div>
              ) : (
                ''
              )}
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
                    name="remarks"
                    label=""
                    placeholder="请输入备注"
                    rules={[{ required: true, message: '请输入备注' }]}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
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
      {detail?.id ? (
        <>
          <PurchaseOrder
            tableData={detail?.accountStatementOrderDetail}
            businessScope={detail?.business_scope}
            dicList={props?.common?.dicList}
            getDetail={getDetail}
            id={detail?.id}
            loading={downLoading}
          />
          {detail?.logistics_loss_list?.length ? (
            <LostDetails
              tableData={detail?.logistics_loss_list}
              approval_status={detail.approval_status}
              getDetail={getDetail}
              dicList={props?.common?.dicList}
            />
          ) : (
            ''
          )}
          {detail?.purchaseOrderRequestFundsList.length ? (
            <AskActionList
              tableData={detail?.purchaseOrderRequestFundsList}
              businessScope={detail?.business_scope}
              dicList={props?.common?.dicList}
            />
          ) : (
            ''
          )}

          {detail?.sysBusinessDeductionList.length ? (
            <DeductionList
              isCn={isCn}
              getDetail={getDetail}
              status={detail?.approval_status}
              tableData={detail?.sysBusinessDeductionList}
              dicList={props?.common?.dicList}
            />
          ) : (
            ''
          )}

          {detail?.sysBusinessOtherFundsList.length ? (
            <OtherFee
              tableData={detail?.sysBusinessOtherFundsList}
              detail={detail}
              approval_status={detail.approval_status}
              getDetail={getDetail}
              dicList={props?.common?.dicList}
              aduitNoModelOpen={(ids?: any, type?: any, required?: any, dataC?: any) => {
                aduitNoModelOpen(ids, type, required, dataC);
              }}
            />
          ) : (
            ''
          )}
          <AuditList auditListModel={auditListModel} handleClose={modalClose} />
          <Pament pamentModel={pamentModel} handleClose={modalClose} />
          <PamentNo pamentNoModel={pamentNoModel} handleClose={modalClose} />
          <AduitNo aduitNoModel={aduitNoModel} handleClose={modalClose} />
          <EditTime editTimeModel={editTimeModel} handleClose={modalClose} />
        </>
      ) : (
        ''
      )}
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

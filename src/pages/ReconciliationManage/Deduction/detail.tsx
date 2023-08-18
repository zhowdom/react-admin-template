import type { FC } from 'react';
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftOutlined, ReconciliationOutlined } from '@ant-design/icons';
import { Button, Card, Spin, Space } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import './style.less';
import { connect, history } from 'umi';
import {
  sysBusinessDeductionById,
  // sysBusinessDeductionApproval,
  // sysBusinessDeductionFreeze,
  // sysBusinessDeductionRevokeFreeze,
} from '@/services/pages/reconciliationDeduction';
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { IsGrey, pubGoUrl } from '@/utils/pubConfirm';
import DetailItem from '@/components/Reconciliation/DetailItem';
import { dateFormat, priceValue } from '@/utils/filter';
// import AduitNo from './Dialog/AduitNo';
import { useAccess, Access } from 'umi';
import OrderDetail from '@/components/OrderDetail';

const Page: FC<Record<string, any>> = (props) => {
  // model下发数据
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const id = history.location?.query?.id || '';
  const access = useAccess();
  // 添加弹窗实例
  // const aduitNoModel = useRef();
  // // 审核不通过
  // const aduitNoModelOpen: any = (ids?: any) => {
  //   const data: any = aduitNoModel?.current;
  //   data.open(ids);
  // };
  // 详情
  const getDetail = async (): Promise<any> => {
    setLoading(true);
    const res = await sysBusinessDeductionById({ id });
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
  // const modalClose = (data: any) => {
  //   console.log(data);
  //   if (!data) return;
  //   setTimeout(() => {
  //     getDetail();
  //   }, 200);
  // };
  // 打印
  const print = async () => {
    const url = `/appPage_Scm/deduction-print?ids=${id}`;
    pubGoUrl(url);
  };
  // // 提交
  // const save = async (type: string) => {
  //   setLoading(true);
  //   const res = await sysBusinessDeductionApproval({
  //     id: id,
  //     operate: type,
  //   });
  //   if (res?.code != pubConfig.sCode) {
  //     pubMsg(res?.message);
  //   } else {
  //     pubMsg('提交成功', 'success');
  //     history.goBack();
  //   }
  //   setLoading(false);
  // };

  // // 提交
  // const submit = (type: string) => {
  //   // 通过：approve 驳回：refuse 付款：payment
  //   if (type == 'approve') {
  //     pubModal('是否确认通过审批？')
  //       .then(async () => {
  //         save('approve');
  //       })
  //       .catch(() => {
  //         console.log('点了取消');
  //       });
  //   } else if (type == 'refuse') {
  //     aduitNoModelOpen(id);
  //   }
  // };
  // // 冻结
  // const freeze = () => {
  //   pubModal('是否确定冻结扣款单？')
  //     .then(async () => {
  //       setLoading(true);
  //       const res = await sysBusinessDeductionFreeze({
  //         id: id,
  //       });
  //       if (res?.code != pubConfig.sCode) {
  //         pubMsg(res?.message);
  //       } else {
  //         pubMsg('提交成功', 'success');
  //         history.goBack();
  //       }
  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       console.log('点了取消');
  //     });
  // };
  // // 撤销冻结
  // const revokeFreeze = () => {
  //   pubModal('是否确定冻结扣款单？')
  //     .then(async () => {
  //       setLoading(true);
  //       const res = await sysBusinessDeductionRevokeFreeze({
  //         id: id,
  //       });
  //       if (res?.code != pubConfig.sCode) {
  //         pubMsg(res?.message);
  //       } else {
  //         pubMsg('提交成功', 'success');
  //         history.goBack();
  //       }
  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       console.log('点了取消');
  //     });
  // };
  return (
    <PageContainer
      header={{
        title: false,
      }}
    >
      <ProForm
        layout={'horizontal'}
        formRef={formRef}
        submitter={false}
        labelAlign="right"
        labelWrap={true}
      >
        <Spin spinning={loading}>
          <Card
            title={
              <>
                <Space>
                  <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                    返回
                  </Button>
                  {/* <Button
                    type="primary"
                    onClick={() => {
                      submit('approve');
                    }}
                  >
                    审批通过
                  </Button>
                  <Button
                    onClick={() => {
                      submit('refuse');
                    }}
                  >
                    驳回
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      freeze();
                    }}
                  >
                    冻结
                  </Button>
                  <Button
                    type="primary"
                    ghost
                    onClick={() => {
                      revokeFreeze();
                    }}
                  >
                    撤销冻结
                  </Button> */}
                  {detail.approval_status == '10' ? (
                    <Access
                      key="printButton"
                      accessible={access.canSee('sysBusinessDeduction_print')}
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
                  ) : (
                    ''
                  )}
                </Space>
                {detail.business_type == '2' ? (
                  <Access
                    key="findByIdButton"
                    accessible={access.canSee('sysBusinessDeduction_order_detail')}
                  >
                    <OrderDetail
                      id={detail.business_id}
                      title={
                        <Button style={{ float: 'right' }} ghost type="primary">
                          查看采购单
                        </Button>
                      }
                      dicList={common?.dicList}
                    />
                  </Access>
                ) : (
                  ''
                )}
              </>
            }
            bordered={false}
          >
            <div className="reconciliation-detail-table">
              <div className="r-w">
                <DetailItem title="扣款单号">{detail?.deduction_no}</DetailItem>
                <DetailItem title="申请日期">{dateFormat(detail?.create_time)}</DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="扣款类型">
                  {pubFilter(
                    common?.dicList?.BUSINESS_DEDUCTION_BUSINESS_TYPE,
                    detail.business_type,
                  )}
                </DetailItem>
                <DetailItem title="当前状态">
                  {pubFilter(
                    common?.dicList?.PURCHASE_ORDER_DEDUCTION_STATUS,
                    detail.approval_status,
                  )}
                </DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="供应商">{detail?.vendor_name}</DetailItem>
                <DetailItem title="采购主体">{detail?.main_name}</DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="申请扣款金额">{IsGrey ? '' : priceValue(detail?.amount)}</DetailItem>
                <DetailItem title="可用金额">{IsGrey ? '' : detail?.available_amount}</DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="来源单号">
                  {detail.business_type == '2' ? detail?.business_no : '--'}
                </DetailItem>
                <DetailItem title="申请人">{detail?.create_user_name}</DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="附件">
                  <ShowFileList data={detail?.sys_files || []} />
                </DetailItem>
              </div>
              <div className="r-w">
                <DetailItem title="扣款原因">{detail?.reason}</DetailItem>
              </div>
            </div>
          </Card>
        </Spin>
      </ProForm>
      {/* <AduitNo aduitNoModel={aduitNoModel} handleClose={modalClose} /> */}
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

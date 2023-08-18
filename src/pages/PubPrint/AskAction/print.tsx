import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { Button, Space, Spin } from 'antd';
import './../print.less';
import { connect, history } from 'umi';
import {
  purchaseOrderGetDetailByIds,
  purchaseOrderPrint,
} from '@/services/pages/reconciliationAskAction';
import { pubConfig, pubMsg, pubModal, pubAlert } from '@/utils/pubConfig';
import DetailItem from '@/components/Reconciliation/DetailItem';
import { dateFormat, priceValue, convertCurrency } from '@/utils/filter';
import moment from 'moment';
import ProTable from '@ant-design/pro-table';
import { IsGrey, mul } from '@/utils/pubConfirm';

// 禁止选择文本
const omitformtagList = ['input', 'textarea', 'select'];
const omitformtags = omitformtagList.join('|');
function disableselect(e: any) {
  if (omitformtags.indexOf(e.target.tagName.toLowerCase()) == -1) return false;
}
function reEnable() {
  return true;
}
if (typeof document.onselectstart != 'undefined')
  document.onselectstart = new Function('return false');
else {
  document.onmousedown = disableselect;
  document.onmouseup = reEnable;
}
document.title = '采购请款';
// 禁用右键
function stop() {
  return false;
}
document.oncontextmenu = stop;

//
const Page: FC<Record<string, any>> = () => {
  const [loading, setLoading] = useState(false);
  const [detailList, setDetailList] = useState([]);
  const ids = history.location?.query?.ids || '';

  const getDetail = async () => {
    setLoading(true);
    const res = await purchaseOrderGetDetailByIds({ ids });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setDetailList(res.data ? res.data : []);
    }
    setLoading(false);
  };
  useEffect(() => {
    getDetail();
  }, []);

  // 打印
  const print = async () => {
    pubModal('是否确认打印账单？')
      .then(async () => {
        pubAlert('请立即打印，取消打印预览也会计打印数！').then(async () => {
          setLoading(true);
          const res = await purchaseOrderPrint({ ids: ids });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          } else {
            setTimeout(() => {
              window.print(); //调用浏览器的打印功能
            }, 200);
          }
          setLoading(false);
        });
      })
      .catch(() => {
        console.log('点了取消');
      });
  };
  const columns: any[] = [
    {
      title: 'SKU',
      dataIndex: 'sku_code',
      align: 'left',
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'left',
    },

    {
      title: '下单数量',
      dataIndex: 'num',
      align: 'right',
    },
    {
      title: '单价',
      dataIndex: 'price',
      align: 'right',
      render: (_: any, record: any) =>  IsGrey ? '' : priceValue(record.price),
    },
    {
      title: '下单金额',
      dataIndex: 'amount',
      align: 'right',
      render: (_: any, record: any) => IsGrey ? '' :  priceValue(mul(record.num, record.price)),
    },
  ];
  return (
    <Spin spinning={loading}>
      <div className="order-print">
        <div className="order-print-body">
          {detailList.map((item: any,i: number) => {
            return (
              <div className={i == detailList.length - 1 ? '' : 'order-print-page'} key={item.id}>
                <div className="order-print-title">
                  <span>{dateFormat(new Date())}</span>
                  {`${item?.main_name}-${item?.business_scope}-采购请款`}
                  <i>打印次数：{item?.frequency + 1}</i>
                </div>
                <div className="reconciliation-detail-table tsa">
                  <div className="r-w">
                    <DetailItem title="请款单号">{item?.funds_no}</DetailItem>
                    <DetailItem title="当前状态">{item?.approval_status_name}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="请款日期">{dateFormat(item?.create_time)}</DetailItem>
                    <DetailItem title="请款人">
                      {item?.create_user_nick_name || item?.create_user_name}
                    </DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="供应商名称">{item?.vendor_name}</DetailItem>
                    <DetailItem title="付款主体">{item?.main_name}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="请款金额">{ IsGrey ? '' : priceValue(item?.amount)}</DetailItem>

                    <DetailItem title="采购单号">{item?.order_no}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="请款金额(大写)">{ IsGrey ? '' : convertCurrency(item?.amount)}</DetailItem>
                    <DetailItem title="结算方式">{item?.paymentMethod || '-'}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="收款账户名">{item?.bank_account_name}</DetailItem>
                    <DetailItem title="要求付款时间">
                      {dateFormat(item?.requirement_pay_time)}
                    </DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="银行账号">{item?.bank_account}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="开户行">{item?.bank_name}</DetailItem>
                  </div>
                  {item?.currency == 'USD' ? (
                    <>
                      <div className="r-w">
                        <DetailItem title="Bank Routing">{item?.bank_routing}</DetailItem>
                      </div>
                      <div className="r-w">
                        <DetailItem title="SWIFT">{item?.swift}</DetailItem>
                      </div>
                      <div className="r-w">
                        <DetailItem title="Bank Address">{item?.bank_address}</DetailItem>
                      </div>
                      <div className="r-w">
                        <DetailItem title="Company Address">{item?.company_address}</DetailItem>
                      </div>
                      <div className="r-w">
                        <DetailItem title="Phone Number">{item?.phone_number}</DetailItem>
                      </div>
                    </>
                  ) : (
                    ''
                  )}
                  <div className="r-w">
                    <DetailItem title="请款原因">{item?.reason}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="账单备注">
                      {item?.remarks?.map((elem: any) => {
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
                  </div>
                  <div className="r-w">
                    <DetailItem title="审批记录">
                      {item?.approvalHistoryList.map((elem: any) => {
                        return (
                          <div key={elem.id}>
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
                {item.purchaseOrderSkuList?.length ? (
                  <div className="recon-table">
                    <div className="recon-table-title">采购单商品明细</div>
                    <ProTable
                      columns={columns}
                      pagination={false}
                      options={false}
                      className="center-th"
                      tableAlertRender={false}
                      tableAlertOptionRender={false}
                      dataSource={item.purchaseOrderSkuList}
                      search={false}
                      rowKey="id"
                      dateFormatter="string"
                      size="small"
                      bordered
                      toolBarRender={false}
                    />
                  </div>
                ) : (
                  ''
                )}
              </div>
            );
          })}
        </div>
        <div className="order-print-btn">
          <Button
            key="back"
            type="primary"
            onClick={() => {
              print();
            }}
          >
            打印预览
          </Button>
          <p>打印时请在打印设置里取消页眉页脚</p>
        </div>
      </div>
    </Spin>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

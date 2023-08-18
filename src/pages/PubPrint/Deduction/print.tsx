import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { Button, Spin } from 'antd';
import './../print.less';
import { connect, history } from 'umi';
import {
  sysBusinessDeductionGetDetailByIds,
  sysBusinessDeductionPrint,
} from '@/services/pages/reconciliationDeduction';
import { pubConfig, pubMsg, pubModal, pubAlert } from '@/utils/pubConfig';
import DetailItem from '@/components/Reconciliation/DetailItem';
import { dateFormat, priceValue } from '@/utils/filter';
import { IsGrey } from '@/utils/pubConfirm';

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
document.title = '扣款单';
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
    const res = await sysBusinessDeductionGetDetailByIds({ ids });
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
    pubModal('是否确认打印扣款单？')
      .then(async () => {
        pubAlert('请立即打印，取消打印预览也会计打印数！').then(async () => {
          setLoading(true);
          const res = await sysBusinessDeductionPrint({ ids: ids });
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

  return (
    <Spin spinning={loading}>
      <div className="order-print">
        <div className="order-print-body">
          {detailList.map((item: any,i: number) => {
            return (
              <div className={i == detailList.length - 1 ? '' : 'order-print-page'} key={item.id}>
                <div className="order-print-title">
                  <span>{dateFormat(new Date())}</span>
                  扣款单
                  <i>打印次数：{item?.frequency + 1}</i>
                </div>
                <div className="reconciliation-detail-table tsa">
                  <div className="r-w">
                    <DetailItem title="扣款单号">{item?.deduction_no}</DetailItem>
                    <DetailItem title="申请日期">{dateFormat(item?.create_time)}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="扣款类型">{item?.business_type_name}</DetailItem>
                    <DetailItem title="当前状态">{item?.approval_status_name}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="供应商">{item?.vendor_name}</DetailItem>
                    <DetailItem title="采购主体">{item?.main_name}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="申请扣款金额">{ IsGrey ? '' : priceValue(item?.amount)}</DetailItem>
                    <DetailItem title="可用金额">{ IsGrey ? '' : priceValue(item?.available_amount)}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="来源单号">
                      {item?.business_type == '2' ? item?.business_no : '--'}
                    </DetailItem>
                    <DetailItem title="申请人">{item?.create_user_name}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="扣款原因">{item?.reason}</DetailItem>
                  </div>
                </div>
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

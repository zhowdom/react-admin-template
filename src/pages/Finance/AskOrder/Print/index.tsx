import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { Button, Spin, Image, Space } from 'antd';
import './index.less';
import { connect, history } from 'umi';
import { pubConfig, pubMsg, pubModal, pubAlert } from '@/utils/pubConfig';
import DetailItem from '@/components/Reconciliation/DetailItem';
import useFormItem from '../components/useFormItem';
import { printConfirm, getProcessInstances } from '@/services/pages/askOrder';
import moment from 'moment';

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
  const [detailList, setDetailList] = useState<any>([]);
  const [picList, setPicList] = useState<any>({});
  const [printTime, setPrintTime] = useState<any>();
  const ids = history.location?.query?.ids || '';

  const getDetail = async () => {
    setLoading(true);
    const res = await getProcessInstances({ process_instance_ids: ids });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      res.data.forEach((detailC: any, index: number) => {
        const last = detailC.bodyResult?.tasks.filter((v: any) => v.status == 'RUNNING')?.[0]
        res.data[index].bodyResult.operationRecords =
          last
            ? [...detailC?.bodyResult?.operationRecords, last]
            : [...detailC?.bodyResult?.operationRecords];
        res.data[index].bodyResult.operationRecords.forEach((v: any) => {
          v.date = v?.date?.replaceAll('T', ' ')?.replaceAll('Z', '');
        });
      });
      setDetailList(res.data);
      const list: any = res.data;
      const picsObj = {};
      list?.forEach((a: any) => {
        const arr: any = a?.formComponentValues?.filter(
          (b: any) => b.componentType == 'DDPhotoField',
        );
        picsObj[a.id] = arr?.map((v: any) => (v.value ? JSON.parse(v.value) : [])).flat(1);
      });
      setPicList(picsObj);
    }
    setLoading(false);
  };
  useEffect(() => {
    getDetail();
  }, []);
  const S = {
    AGREE: '已同意',
    REFUSE: '已拒绝',
    NONE: '审批中',
  };
  // 打印
  const print = async () => {
    pubModal('是否确认打印？')
      .then(async () => {
        pubAlert('请立即打印，取消打印预览也会计打印数！').then(async () => {
          setLoading(true);
          const res = await printConfirm({ process_instance_ids: ids });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          } else {
            setPrintTime(new Date().getTime());
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
  // 渲染表单项值
  const renderFormItem = useFormItem();
  const renderTableItem = (item: any) => {
    if (item.value) {
      if (JSON.parse(item.value).length == 1) {
      }
    } else {
      return <></>;
    }
  };
  return (
    <Spin spinning={loading}>
      <div className="order-print">
        <div className="order-print-body" id="content-html">
          {detailList?.map((item: any, i: number) => {
            return (
              <>
                <div
                  className={
                    i == detailList.length - 1 && !picList?.[item.id]?.length
                      ? ''
                      : 'order-print-page'
                  }
                  key={item.id}
                >
                  <div className="order-print-title">{`${item?.bodyResult?.title}`}</div>
                  <Space style={{ marginBottom: '5px' }}>
                    {/* <span>科博跨境科技有限公司</span> */}
                    <span>
                      创建时间: {moment(item?.bodyResult?.createTime).format('YYYY-MM-DD')}
                    </span>
                  </Space>
                  <div className="reconciliation-detail-table tsa">
                    <DetailItem title="审批单号">{item?.process_instance_id}</DetailItem>
                    <DetailItem title="创建人">{item?.create_user_name}</DetailItem>
                    <DetailItem title="创建人部门">
                      {item?.bodyResult?.originatorDeptName}
                    </DetailItem>
                    {item?.bodyResult?.formComponentValues?.map((elem: any) => {
                      return elem.componentType == 'TableField' &&
                        item.value &&
                        JSON.parse(item.value).length != 1 ? (
                        <DetailItem title={elem.name}>{renderTableItem(elem)}</DetailItem>
                      ) : (
                        <div className="r-w" key={elem?.id}>
                          {elem.componentType == 'TextNote' ? (
                            <DetailItem title="说明">{elem?.value}</DetailItem>
                          ) : (
                            <DetailItem
                              title={elem.name}
                              noPadding={elem.componentType == 'TableField'}
                            >
                              {renderFormItem(elem, true)}
                            </DetailItem>
                          )}
                        </div>
                      );
                    })}

                    <div className="r-w">
                      <DetailItem title="审批流程">
                        {item.bodyResult.operationRecords
                          ?.filter(
                            (a: any) =>
                              !['START_PROCESS_INSTANCE', 'PROCESS_CC', 'ADD_REMARK'].includes(
                                a.type,
                              ),
                          )
                          ?.map((v: any) => (
                            <div
                              style={{ display: 'flex', justifyContent: 'space-between' }}
                              key={v.activityId}
                            >
                              <Space>
                                {item?.userMap?.[v.userId]}&nbsp; {S[v.result]}
                              </Space>
                              {!(v.type == 'NONE' || v.status == 'RUNNING') && (
                                <span> {moment(v.date).format('YYYY-MM-DD HH:mm')}</span>
                              )}
                            </div>
                          ))}
                      </DetailItem>
                    </div>
                  </div>
                </div>
                <div>
                  {picList?.[item.id]?.map((v: any) => (
                    <Image
                      width={760}
                      src={v}
                      key={v}
                      style={{ marginBottom: '10px' }}
                      preview={false}
                    />
                  ))}
                </div>
                <Space size={20} style={{ marginTop: '20px' }}>
                  <span>
                    打印时间: {printTime ? moment(printTime).format('YYYY-MM-DD HH:mm') : ''}
                  </span>
                  <span>
                    打印人: {JSON.parse(localStorage.getItem('userInfo') as string)?.user?.name}
                  </span>
                  <span>打印次数：{item?.print_times + 1}</span>
                </Space>
              </>
            );
          })}
        </div>
        <div className="order-print-btn">
          <Button key="back" type="primary" onClick={print}>
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

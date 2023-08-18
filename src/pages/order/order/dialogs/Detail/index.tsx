import { Button, Drawer, Card, Space, Typography, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { PageContainer, ProDescriptions } from '@ant-design/pro-components';
import './index.less';
import {
  findByIdOrder,
  getPlatformOrder,
  listPageOrderItem,
  refreshOrderItem,
} from '@/services/pages/order';
import {findDeliveryDetailById} from '@/services/pages/order/delivery-order';
import OrderDetail from './OrderDetail';
import DistributionDetail from './DistributionDetail';
import LogList from './LogList';
import MarkSubmit from '../MarckSubmit';
import { Access, useAccess } from 'umi';
import SourceDetail from './SourceDetail';
import {pubConfig, pubModal, pubMsg} from '@/utils/pubConfig';
import EditLocation from '../EditLocation';
import { getUuid, mul, add, sub } from '@/utils/pubConfirm';
import {flatData} from "@/utils/filter";

const Component: React.FC<{
  record: Record<string, any>;
  exceptions: any[];
  dicList?: any;
  common?: any;
}> = ({ record, exceptions, dicList, common }) => {
  const [open, openSet] = useState(false);
  const [tabActiveKey, tabActiveKeySet] = useState('base');
  const [detail, detailSet] = useState<any>(null); // 基础信息
  const [orderDetail, orderDetailSet] = useState<any>(null); // 订单明细
  const [disDetail, disDetailSet] = useState<any>(null); // 配送详情
  const [sourceDetail, sourceDetailSet] = useState<any>(null); // 源信息
  const [timeStamp, timeStampSet] = useState<any>(0); // 刷新日志列表
  const [loading, loadingSet] = useState(false);
  const [observer, observerSet] = useState<any>(null); // 滚动后可见元素侦听
  const [detailHandle, detailHandleSet] = useState<any>(null); // 明细操作类型: 1: 人工打折,2: 编辑
  const ref: any = useRef(null); // 明细操作
  const scrollEl = useRef(null);
  useEffect(() => {
    if (scrollEl.current) {
      observerSet(
        new IntersectionObserver(
          (entries: any) => {
            entries.forEach((entry: any) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.8) {
                tabActiveKeySet(entry.target.id);
              }
            });
          },
          {
            root: scrollEl.current,
            rootMargin: '12px',
            threshold: [0.5, 0.8],
          },
        ),
      );
    }
  }, [scrollEl.current]);
  // 地址修改完成
  const finishHandle = (values: any) => {
    detailSet((pre: any) => {
      return {
        ...pre,
        receiverNameEncr: values?.receiverName,
        receiverPhoneEncr: values?.receiverMobile,
        receiverArea: `${values?.receiverState}-${values?.receiverCity}-${values?.receiverDistrict}`,
        receiverAddressEncr: values?.receiverAddress,
      };
    });
  };
  const access = useAccess();
  // 获取源信息
  const getPlatformOrderAction = async () => {
    getPlatformOrder({ platformCode: record.platformCode, platformNo: record.platformNo })
      .then((res) => {
        if (res?.code == '0') {
          sourceDetailSet(res.data);
        } else {
          sourceDetailSet([]);
        }
      })
      .catch(() => {
        sourceDetailSet([]);
      });
  };
  const setData = (data: any) => {
    if (ref?.current) {
      ref.current?.setData(data);
    } else {
      setTimeout(() => {
        setData(data);
      }, 1000);
    }
  };
  const fetchBaseDetail = () => {
    loadingSet(true);
    findByIdOrder({ orderId: record.id })
      .then((res) => {
        if (res?.code == '0') {
          detailSet(res.data);
        } else {
          pubMsg('获取订单详情失败: ' + res?.message)
          detailSet({});
        }
      })
      .finally(() => loadingSet(false));
    // 订单明细
    listPageOrderItem({ orderId: record.id })
      .then((res) => {
        if (res?.code == '0') {
          const data =
            res.data?.list?.map((v: any, i: number) => ({
              ...v,
              tempId: getUuid(),
              index: i + 1,
              itemMaxNum: sub(add(mul(v.salePrice, v.num), v.fee), v.discountAmt),
            })) || [];
          orderDetailSet(data);
          setData(data);
        } else {
          pubMsg('获取订单明细失败: ' + res?.message)
          orderDetailSet([]);
        }
      })
      .catch((e) => {
        console.log(e);
        orderDetailSet([]);
      });
    // 配送详情
    findDeliveryDetailById({
      orderId: record.id,
    })
      .then((res) => {
        if (res?.code == pubConfig.sCodeOrder) {
          disDetailSet(flatData(res.data?.deliveryList, 'deliveryPackageList', 'deliveryPackageItems', false ));
        } else {
          pubMsg('获取配送详情失败: ' + res?.message)
          disDetailSet([]);
        }
      })
      .catch((e) => {
        console.log(e);
        disDetailSet([]);
      });
    getPlatformOrderAction();
  };
  // 更新订单
  const reloadDetail = async () => {
    pubModal('是否确定更新此订单？')
      .then(async () => {
        refreshOrderItem({ platformNo: detail.platformNo })
          .then((res) => {
            if (res?.code == '0') {
              fetchBaseDetail();
            } else {
              pubMsg(res?.message);
            }
          })
          .catch(() => {
            sourceDetailSet([]);
          });
      })
      .catch(() => {
        console.log('点了取消');
      });
  };

  return (
    <>
      <a
        onClick={() => {
          openSet(true);
          fetchBaseDetail();
        }}
      >
        详情
      </a>
      <Drawer
        width={'80%'}
        title={'订单详情'}
        onClose={() => {
          openSet(false);
          detailHandleSet(null);
        }}
        open={open}
        bodyStyle={{ padding: 0, overflow: 'hidden', background: '#f9f9f9' }}
        className={'drawer-order-detail'}
        destroyOnClose
        footer={
          <Space>
            <Button
              onClick={() => {
                fetchBaseDetail();
              }}
            >
              刷新
            </Button>
            <Button onClick={() => openSet(false)}>关闭</Button>
          </Space>
        }
      >
        <PageContainer
          fixedHeader
          tabActiveKey={tabActiveKey}
          tabList={[
            {
              tab: '基础信息',
              key: 'base',
            },
            {
              tab: '订单明细',
              key: 'detail',
            },
            {
              tab: '配送详情',
              key: 'distributionDetail',
            },
            {
              tab: '操作记录',
              key: 'log',
            },
          ]}
          onTabChange={(val = '') => {
            tabActiveKeySet(val);
            document.querySelector(`#${val}`)?.scrollIntoView({ behavior: 'smooth' });
          }}
          tabProps={{ size: 'small' }}
        >
          <Spin spinning={loading}>
            <div className={'drawer-content'} ref={scrollEl}>
              <div id={'base'} className={'pt-5'} ref={(val) => val && observer?.observe(val)}>
                <Card
                  title={
                    <Space>
                      <span className={'title-bar'}></span>
                      <span style={{ marginRight: 8 }}>{`ERP订单号: ${detail?.erpNo || '-'}`}</span>
                      <span style={{ marginRight: 8 }}>{`平台单号: ${
                        detail?.platformNo || '-'
                      }`}</span>
                      <span style={{ marginRight: 8 }}>{`店铺: ${detail?.shopName || '-'}`}</span>
                    </Space>
                  }
                  size={'small'}
                >
                  <ProDescriptions column={{ xs: 1, sm: 2, md: 3, lg: 4 }} size={'small'}>
                    <ProDescriptions.Item label="订单状态">
                      {detail?.orderStatusName}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label="下单时间" tooltip="" valueType="dateTime">
                      {detail?.orderTime}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label="付款时间" tooltip="" valueType="dateTime">
                      {detail?.paymentTime}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label="审核时间" tooltip="" valueType="dateTime">
                      {detail?.auditTime}
                    </ProDescriptions.Item>
                  </ProDescriptions>
                </Card>
                <Card
                  className={'mt-5'}
                  title={
                    <Space>
                      <span className={'title-bar'}></span>基本信息
                    </Space>
                  }
                  size={'small'}
                >
                  <ProDescriptions column={{ xs: 1, sm: 2, md: 3, lg: 4 }} size={'small'}>
                    <ProDescriptions.Item span={4} style={{ fontWeight: 'bold' }}>
                      订单信息
                    </ProDescriptions.Item>
                    <ProDescriptions.Item
                      label="订单类型"
                      valueEnum={{
                        open: {
                          text: '普通订单',
                          status: 'Error',
                        },
                        closed: {
                          text: '补发单',
                          status: 'Success',
                        },
                        processing: {
                          text: '换货单',
                          status: 'Processing',
                        },
                      }}
                    >
                      {detail?.orderType}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label="旺旺ID" tooltip="">
                      {detail?.buyerId}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item
                      label="买家留言"
                      contentStyle={{
                        display: 'block',
                        maxWidth: '65%',
                      }}
                    >
                      <Typography.Text
                        copyable={!!detail?.buyerMemo}
                        ellipsis={{ tooltip: detail?.buyerMemo }}
                      >
                        {detail?.buyerMemo || '-'}
                      </Typography.Text>
                    </ProDescriptions.Item>
                    <ProDescriptions.Item
                      label="卖家留言"
                      contentStyle={{
                        display: 'block',
                        maxWidth: '65%',
                      }}
                    >
                      <Typography.Text
                        copyable={!!detail?.sellerMemo}
                        ellipsis={{ tooltip: detail?.sellerMemo }}
                      >
                        {detail?.sellerMemo || '-'}
                      </Typography.Text>
                    </ProDescriptions.Item>
                    <ProDescriptions.Item span={4} style={{ fontWeight: 'bold' }}>
                      <Space>
                        <span>收货人信息</span>
                        <Access accessible={access.canSee('order_update_address')}>
                          <EditLocation
                            common={common}
                            title={`修改地址`}
                            trigger={<Button type={'primary'}>修改地址</Button>}
                            ids={[record.id]}
                            finishHandle={finishHandle}
                          />
                        </Access>
                      </Space>
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label={'姓名'}>
                      {detail?.receiverNameEncr || '-'}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label={'电话'}>
                      {detail?.receiverPhoneEncr || '-'}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label={'地址'}>
                      {detail?.receiverArea || '-'}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item
                      label="详细地址"
                      contentStyle={{
                        display: 'block',
                        maxWidth: '65%',
                      }}
                    >
                      <Typography.Text ellipsis={{ tooltip: detail?.receiverAddressEncr }}>
                        {detail?.receiverAddressEncr}
                      </Typography.Text>
                    </ProDescriptions.Item>
                    <ProDescriptions.Item span={4} style={{ fontWeight: 'bold' }}>
                      <Space>
                        <span>物流信息</span>{' '}
                        {/*<Button size={'small'} type={'primary'}>
                        修改快递
                      </Button>{' '}
                      <Button size={'small'} type={'primary'}>
                        指定发货时间
                      </Button>*/}
                      </Space>
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label={'要求发货日期'} valueType={'dateTime'}>
                      {detail?.requestDeliveryTime}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label={'期望送达日期'} valueType={'dateTime'}>
                      {detail?.expectDeliveryTime}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label={'实际发货日期'} valueType={'dateTime'}>
                      {detail?.actualShippingTime}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label={'指定快递'} valueType={'text'}>
                      {detail?.express}
                    </ProDescriptions.Item>
                  </ProDescriptions>
                </Card>
              </div>
              <div id={'source'} className={'pt-5'} ref={(val) => val && observer?.observe(val)}>
                <Card
                  title={
                    <Space>
                      <span className={'title-bar'}></span>订单源信息
                    </Space>
                  }
                  size={'small'}
                >
                  <SourceDetail dicList={dicList} sourceDetail={sourceDetail} />
                </Card>
              </div>
              <div id={'detail'} className={'pt-5'} ref={(val) => val && observer?.observe(val)}>
                <Card
                  title={
                    <Space>
                      <span className={'title-bar'}></span>订单明细
                      <Access
                        accessible={
                          access.canSee('order_refresh_orderItem') &&
                          detail?.orderStatus == 'order_erp_status_check' &&
                          detail?.shopId != '0'
                        }
                      >
                        <Button size={'small'} type={'primary'} onClick={() => reloadDetail()}>
                          更新
                        </Button>
                      </Access>
                      <Access accessible={access.canSee('order_manual_discount')}>
                        <Button
                          size={'small'}
                          type={'primary'}
                          disabled={detailHandle == 1}
                          onClick={() => {
                            if (detail?.paymentDiff == 0) {
                              pubMsg('当前订单支付差额为0，不需要打折', 'warning');
                              return;
                            }
                            detailHandleSet(1);
                            setData(orderDetail);
                          }}
                        >
                          人工打折
                        </Button>
                      </Access>
                      <Access
                        accessible={
                          access.canSee('order_detail_edit') &&
                          ['order_erp_status_no_pay', 'order_erp_status_check'].includes(
                            detail?.orderStatus,
                          )
                        }
                      >
                        <Button
                          disabled={detailHandle == 2}
                          size={'small'}
                          type={'primary'}
                          onClick={() => {
                            detailHandleSet(2);
                            setData(orderDetail);
                          }}
                        >
                          编辑
                        </Button>
                      </Access>
                    </Space>
                  }
                  size={'small'}
                >
                  <OrderDetail
                    dicList={dicList}
                    detail={detail}
                    orderDetail={orderDetail}
                    _ref={ref}
                    id={record?.id}
                    fetchBaseDetail={fetchBaseDetail}
                    detailHandle={detailHandle}
                    detailHandleSet={detailHandleSet}
                  />
                </Card>
              </div>
              <div
                id={'distributionDetail'}
                className={'pt-5'}
                ref={(val) => val && observer?.observe(val)}
              >
                <Card title={<Space><span className={'title-bar'}></span>配送详情</Space>} size={'small'}>
                  <DistributionDetail dicList={dicList} disDetail={disDetail} />
                </Card>
              </div>
              <div id={'log'} className={'pt-5'} ref={(val) => val && observer?.observe(val)}>
                <Card
                  title={
                    <Space>
                      <span className={'title-bar'}></span>
                      操作记录 {/*添加备注*/}
                      <Access accessible={access.canSee('order_orderIndexMarkInner')}>
                        <MarkSubmit ids={[record.id]} reload={() => timeStampSet(Date.now())} />
                      </Access>
                    </Space>
                  }
                  size={'small'}
                >
                  <LogList exceptions={exceptions} orderId={record.id} timeStamp={timeStamp} />
                </Card>
              </div>
            </div>
          </Spin>
        </PageContainer>
      </Drawer>
    </>
  );
};
export default Component;

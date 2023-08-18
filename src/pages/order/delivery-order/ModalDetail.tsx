import {useAccess} from 'umi'
import {Modal, Tabs, Badge, Table, Space} from 'antd';
import {ProDescriptions} from '@ant-design/pro-components';
import {findDeliveryDetailById, log} from '@/services/pages/order/delivery-order';
import {pubConfig, pubMsg} from '@/utils/pubConfig';
import {useMemo, useState} from 'react';
import {flatData} from '@/utils/filter';
import './style.less';


const ModalDetail: React.FC<{
  open: boolean;
  openSet: any;
  data: any;
  createTypeSet: any,
  openCreateInterceptSet: any,
  defaultIdsSet: any,
  defaultIdTypeSet: any,
  tabActiveKey: any;
}> = ({open, openSet, data, createTypeSet, openCreateInterceptSet, defaultIdTypeSet, defaultIdsSet, tabActiveKey}) => {
  const access = useAccess();
  const [activeKey, activeKeySet] = useState<any>('1');
  const [dataSource, dataSourceSet] = useState<any>({});
  const [logList, logListSet] = useState<any>([]);
  const tabItems = useMemo(() => {
    const orderItemList = dataSource?.orderItemList || [];
    const tempDeliveryList = dataSource?.deliveryList || []
    const matchedItem = tempDeliveryList.find((item: any) => item.deliveryCode == data.deliveryCode)
    const deliveryList = flatData(
      matchedItem ? [matchedItem, ...tempDeliveryList.filter((item: any) => item.deliveryCode != matchedItem.deliveryCode)] : tempDeliveryList,
      'deliveryPackageList',
      'deliveryPackageItems',
      false,
    );
    return [
      {
        key: '1',
        label: (
          <Badge count={orderItemList.length} offset={[6, -5]}>
            订单明细
          </Badge>
        ),
        children: (
          <Table
            rowKey={'id'}
            sticky={{offsetHeader: -25, offsetScroll: -20}}
            style={{maxWidth: 600}}
            pagination={false}
            dataSource={orderItemList}
            columns={[
              {
                title: '序号',
                dataIndex: 'index',
                width: 80,
                render: (text, record, index) => index + 1,
              },
              {
                title: '款式编码',
                dataIndex: ['goodsSku', 'sku_code'],
              },
              {
                title: '款式名称',
                dataIndex: ['goodsSku', 'sku_name'],
              },
              {
                title: '数量',
                dataIndex: 'num',
                width: 80,
              },
            ]}
          />
        ),
      },
      {
        key: '2',
        label: (
          <Badge count={dataSource?.deliveryList?.length} offset={[6, -5]}>
            配送详情
          </Badge>
        ),
        children: (
          <Table
            sticky={{offsetHeader: -10, offsetScroll: -20, getContainer: () => document.querySelector('.ant-modal .ant-modal-body') as HTMLElement || document.documentElement}}
            rowClassName={(record) => data.deliveryCode == record.deliveryCode ? 'emphasize-row-primary' : ''}
            rowKey={(record) => record.deliveryCode + record?.deliveryPackageList?.expressCode + record?.deliveryPackageItems?.goodsSku?.sku_code}
            pagination={false}
            dataSource={deliveryList}
            columns={[
              {
                title: '配送单号',
                dataIndex: 'deliveryCode',
                onCell: (record: any) => ({rowSpan: record.rowSpan1}),
              },
              {
                title: '仓库订单号',
                dataIndex: 'deliveryOrderId',
                onCell: (record: any) => ({rowSpan: record.rowSpan1}),
              },
              {
                title: '发货状态',
                dataIndex: 'deliveryStatusName',
                width: 80,
                onCell: (record: any) => ({rowSpan: record.rowSpan1}),
              },
              {
                title: '快递单号',
                dataIndex: ['deliveryPackageList', 'expressCode'],
                onCell: (record: any) => ({rowSpan: record.rowSpan2}),
              },
              {
                title: '快递公司',
                dataIndex: ['deliveryPackageList', 'logisticsName'],
                width: 80,
                onCell: (record: any) => ({rowSpan: record.rowSpan2}),
              },
              {
                title: '款式编码',
                dataIndex: ['deliveryPackageItems', 'goodsSku', 'sku_code'],
              },
              {
                title: '款式名称',
                dataIndex: ['deliveryPackageItems', 'goodsSku', 'sku_name'],
              },
              {
                title: '数量',
                dataIndex: ['deliveryPackageItems', 'planQty'],
                width: 70,
              },
              {
                title: '销退单号',
                dataIndex: ['deliveryPackageList', 'returnOrderCode'],
                onCell: (record: any) => ({rowSpan: record.rowSpan2}),
              },
              {
                title: '拦截原因',
                dataIndex: ['deliveryPackageList', 'interceptRemark'],
                onCell: (record: any) => ({rowSpan: record.rowSpan2}),
              },
              {
                title: '拦截状态',
                dataIndex: ['deliveryPackageList', 'interceptStatusName'],
                onCell: (record: any) => ({rowSpan: record.rowSpan2}),
              },
              {
                title: '处理状态',
                dataIndex: ['deliveryPackageList', 'nonDeliveryReason'],
                onCell: (record: any) => ({rowSpan: record.rowSpan2}),
              },
              {
                title: '失败原因',
                dataIndex: ['deliveryPackageList', 'interceptFailureRemark'],
                onCell: (record: any) => ({rowSpan: record.rowSpan2}),
                ellipsis: true,
              },
              {
                title: '操作',
                dataIndex: 'option',
                width: 80,
                align: 'center',
                onCell: (record: any) => ({rowSpan: record.rowSpan2}),
                fixed: 'right',
                render: (_, record) => {
                  const expressCode = record?.deliveryPackageList?.expressCode
                  const defaultIds = expressCode ? expressCode : record?.deliveryCode
                  const defaultIdType = expressCode ? 'SHIP_NO' : 'DELIVERY_NO'
                  return <Space wrap>
                    {
                      access.canSee('order_delivery_intercept')
                        ? <a onClick={() => {
                          defaultIdsSet(defaultIds)
                          defaultIdTypeSet(defaultIdType)
                          createTypeSet('intercept');
                          openCreateInterceptSet(true);
                        }}>拦截</a>
                        : null
                    }
                    {
                      access.canSee('order_delivery_refund')
                      && (
                        ['QIMEN_YUNCANG', 'YUNCANG'].includes(tabActiveKey) ||
                        ['HUIYE', 'VENDOR',].includes(tabActiveKey) && record.deliveryStatus == 'SENT'
                      )
                        ? <a onClick={() => {
                          defaultIdsSet(defaultIds)
                          defaultIdTypeSet(defaultIdType)
                          createTypeSet('refund');
                          openCreateInterceptSet(true);
                        }}>销退</a>
                        : null
                    }
                  </Space>
                }
              },
            ]}
            scroll={{x: 1800}}
            bordered
          />
        ),
      },
      {
        key: '3',
        label: (
          <Badge count={logList.length} offset={[6, -5]}>
            日志
          </Badge>
        ),
        children: (
          <Table
            rowKey={'id'}
            pagination={{defaultPageSize: 10}}
            dataSource={logList}
            columns={[
              {
                title: '序号',
                dataIndex: 'index',
                width: 60,
                render: (text, record, index) => index + 1,
              },
              {
                title: '日期',
                dataIndex: 'createTime',
              },
              {
                title: '操作人',
                dataIndex: 'createName',
              },
              {
                title: '操作内容',
                dataIndex: 'trackRecord',
              },
            ]}
          />
        ),
      },
    ];
  }, [dataSource]);
  return (
    <Modal
      width={1200}
      title={'配送单详情'}
      open={open}
      onCancel={() => {
        dataSourceSet({})
        activeKeySet('1')
        openSet(false)
      }}
      bodyStyle={{paddingTop: 10}}
      footer={null}
      destroyOnClose
    >
      <ProDescriptions
        bordered
        colon
        size={'small'}
        contentStyle={{padding: '2px 4px'}}
        column={{xs: 1, sm: 2, md: 3}}
        params={{deliveryId: data.id}}
        request={async (params) => {
          if (!open) {
            return {
              success: true,
              data: [],
            }
          }
          log({sourceId: data.id, pageIndex: 1, pageSize: 999}).then((res: any) => {
            if (res?.code == pubConfig.sCodeOrder) {
              logListSet(res.data)
            } else {
              pubMsg('获取日志失败:' + res?.message)
              logListSet([])
            }
          })
          const res = await findDeliveryDetailById(params);
          if (res.code == pubConfig.sCodeOrder) {
            dataSourceSet(res?.data);
            return {
              success: true,
              data: res?.data?.order,
            };
          } else {
            pubMsg(res?.message)
          }
          return {};
        }}
      >
        <ProDescriptions.Item
          label="订单信息"
          span={3}
          style={{background: '#fff', fontWeight: 'bold', borderRightColor: '#fff'}}
        />
        <ProDescriptions.Item label="订单号" dataIndex={'platformNo'}/>
        <ProDescriptions.Item label="订单类型" dataIndex={'orderType'}/>
        <ProDescriptions.Item label="换货/补货新订单" dataIndex={'renewOrder'}/>
        <ProDescriptions.Item label="订单状态" dataIndex={'orderStatusName'}/>
        <ProDescriptions.Item label="公司员工" dataIndex={'updateName'}/>
        <ProDescriptions.Item label="订单来源" dataIndex={'shopName'}/>
        <ProDescriptions.Item label="退货/取消原因" dataIndex={'n'}/>
        <ProDescriptions.Item label="下订单日期" dataIndex={'createTime'}/>
        <ProDescriptions.Item label="付款时间" dataIndex={'paymentTime'}/>
        <ProDescriptions.Item label="确认订单时间" dataIndex={'confirmedTime'}/>
        <ProDescriptions.Item label="支付方式" dataIndex={'paymentTypeName'}/>
        <ProDescriptions.Item label="客户应付金额" dataIndex={'custPayableAmt'}/>
        <ProDescriptions.Item label="客户已付金额" dataIndex={'custActualPaid'}/>
        <ProDescriptions.Item />
        <ProDescriptions.Item />
        <ProDescriptions.Item
          label="收货人信息"
          span={3}
          style={{background: '#fff', fontWeight: 'bold', borderRightColor: '#fff'}}
        />
        <ProDescriptions.Item label="姓名">{dataSource.orderReceiverInfo?.receiverName || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="电话">{dataSource.orderReceiverInfo?.receiverMobile || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="省份">{dataSource.orderReceiverInfo?.receiverState || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="地址" span={3}>{dataSource.orderReceiverInfo?.receiverAddress || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item
          label="物流信息"
          span={3}
          style={{background: '#fff', fontWeight: 'bold', borderRightColor: '#fff'}}
        />
        <ProDescriptions.Item label="要求发货日期" dataIndex={'requestDeliveryTime'}/>
        <ProDescriptions.Item label="指定快递" dataIndex={'express'}/>
      </ProDescriptions>
      <Tabs style={{paddingTop: 10}} className={'delivery-order-detail-tabs'} onChange={activeKeySet} activeKey={activeKey} items={tabItems}/>
    </Modal>
  );
};
export default ModalDetail;

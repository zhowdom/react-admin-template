import {connect, useAccess} from 'umi';
import React, {useRef, useState} from 'react';
import {useActivate} from 'react-activation';
import type {ProFormInstance, ProDescriptionsActionType} from '@ant-design/pro-components';
import {ProTable, PageContainer, ProDescriptions, ProForm, ProFormTextArea} from '@ant-design/pro-components';
import {Space, Card, Divider, Timeline, Button, Result} from 'antd';
import {history} from 'umi'
import {pubConfig, pubMsg, pubRequiredRule} from '@/utils/pubConfig';
import {partsOrder, partsOrderAddRemark} from '@/services/pages/warehouse/input'
import {ArrowLeftOutlined} from "@ant-design/icons";
// 包材配件入库单 - 详情
const Page: React.FC<{ common: any }> = ({common}) => {
  const id: any = history?.location?.query?.id || ''
  const order_no: any = history?.location?.query?.order_no || ''
  const actionRef: any = useRef<ProDescriptionsActionType>(null)
  const formRef: any = useRef<ProFormInstance>(null)
  const [info, infoSet] = useState<any>({})
  const access = useAccess();
  const fetchInfo = () => {
    if (!order_no) {
      pubMsg('无可查询的入库单号~')
      return Promise.reject({})
    }
    return partsOrder({keyWords: order_no}).then((res: any) => {
      if (res?.code == pubConfig.sCode) {
        if (res.data) {
          infoSet(res.data)
          return res.data
        } else {
          infoSet({})
          pubMsg('无法查到单号明细~')
          return {}
        }
      } else {
        infoSet({})
        pubMsg(res?.message)
        return {}
      }
    })
  }
  // keepAlive页面激活钩子函数
  useActivate(() => {
    fetchInfo()
  });
  return (
    <PageContainer header={{title: false, breadcrumb: {}}} style={{minHeight: 'calc(100vh - 90px)', background: '#fff'}}>
      {access.canSee('warehouse-input-po-list-detail')
        ? <Card title={'包材配件入库单信息'}>
          <ProDescriptions actionRef={actionRef} dataSource={info} column={3} request={() => fetchInfo()}>
            <ProDescriptions.Item label={'入库单号'} dataIndex={'order_no'}/>
            <ProDescriptions.Item label={'状态'} dataIndex={'inboundStatus'} valueEnum={common.dicList.SCM_PARTS_INBOUND_STATUS || {}}/>
            <ProDescriptions.Item label={'采购员'} dataIndex={'create_user_name'}/>
            <ProDescriptions.Item label={'创建时间'} dataIndex={'create_time'}/>
            <ProDescriptions.Item label={'入库操作员'} dataIndex={'warehousing_user_name'}/>
            <ProDescriptions.Item label={'入库时间'} dataIndex={'warehousing_time'}/>
            <ProDescriptions.Item label={'备注'} dataIndex={'remarks'} valueType={'textarea'} contentStyle={{display: 'block'}}>
              <ProForm
                formRef={formRef}
                style={{paddingRight: 12}}
                submitter={{
                  searchConfig: {
                    submitText: '保存备注信息'
                  },
                  resetButtonProps: {style: {display: 'none'}}
                }}
                onFinish={async (values) => {
                  console.log(values, 'values')
                  const res = await partsOrderAddRemark({...values, business_id: id})
                  if (res?.code == pubConfig.sCode) {
                    pubMsg(res?.message, 'success')
                    actionRef?.current?.reload()
                    formRef?.current?.resetFields()
                  } else {
                    pubMsg(res?.message)
                  }
                }}>
                <ProFormTextArea name={'remarks'} rules={[pubRequiredRule]} fieldProps={{maxLength: 200}}/>
              </ProForm>
            </ProDescriptions.Item>
            <ProDescriptions.Item label={'备注内容'} span={2} valueType={'textarea'} contentStyle={{display: 'block', paddingTop: 8}}>
              {info?.sysBusinessRemarks?.length ? <Timeline mode={'left'}>
                {info.sysBusinessRemarks.map((item: any) => <Timeline.Item key={item.id}>
                  <Space>
                    <span style={{wordBreak: 'break-all'}}>{item.remarks}</span>
                    <span style={{whiteSpace: 'nowrap'}}> - {item.create_user_name}</span>
                    <span style={{whiteSpace: 'nowrap'}}>{item.create_time}</span>
                  </Space>
                </Timeline.Item>)}
              </Timeline> : '-'}
            </ProDescriptions.Item>
            <ProDescriptions.Item span={3}>
              <Divider/>
            </ProDescriptions.Item>
            {info?.orderSkuList?.length ? <>
              <ProDescriptions.Item span={3} style={{paddingBottom: 0}}>
                <h3>入库商品明细</h3>
              </ProDescriptions.Item>
              <ProDescriptions.Item span={3} valueType={'textarea'} contentStyle={{display: 'block'}}>
                <ProTable rowKey={'id'} defaultSize={'small'} bordered style={{width: '100%', maxWidth: 1000}}
                          search={false}
                          options={false} pagination={false}
                          cardProps={{bodyStyle: {padding: 0}}}
                          dataSource={info?.orderSkuList || []}
                          columns={[
                            {title: '商品图片', dataIndex: 'image_url', align: 'center', valueType: 'image', width: 80},
                            {title: '商品名称', dataIndex: 'sku_name'},
                            {title: 'SKU', dataIndex: 'sku_code'},
                            {title: '商品条形码', dataIndex: 'bar_code'},
                            {title: '发货数量', dataIndex: 'delivery_num', valueType: 'digit', fieldProps: {precision: 0}, width: 100},
                            {title: '实际收货入库数量', dataIndex: 'warehousing_num', valueType: 'digit', fieldProps: {precision: 0}, width: 120},
                            {
                              title: '未入库数量',
                              dataIndex: 'unStorageNum',
                              valueType: 'digit',
                              width: 100,
                              render: (_, record) => {
                                if (info.inboundStatus == 'IN_STORAGE') {
                                  return <>{record.unStorageNum} (<span style={{color: 'red'}}>{record.unStorageNum < 0 ? '多收' : '少收'}</span>)</>
                                }
                                return record.unStorageNum
                              },
                            },
                            {title: '备注', dataIndex: 'remark', ellipsis: true},
                          ]}/>
              </ProDescriptions.Item>
            </> : null}
          </ProDescriptions>
          <div className={'ant-pro-footer-bar'} style={{justifyContent: 'flex-end', paddingTop: 12, paddingBottom: 12}}>
            <Button
              icon={<ArrowLeftOutlined/>}
              key={'backBtn'}
              onClick={() => history.replace('/warehouse/input/po-list')}
            >
              返回
            </Button>
          </div>
        </Card>
        : <Result
          status="403"
          title="403"
          subTitle="抱歉，你无权访问该页面"
          extra={
            <Button type="primary" onClick={() => history.replace('/')}>
              返回首页
            </Button>
          }
        />}
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({common}: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

import {connect, useAccess} from 'umi';
import React, {useRef, useState} from 'react';
import {useActivate} from 'react-activation';
import {Button, Popconfirm, Card, Result, Timeline, Space} from "antd";
import {ProForm, ProDescriptions, EditableProTable, ProFormTextArea} from '@ant-design/pro-components';
import type {ProDescriptionsActionType} from '@ant-design/pro-components';
import type {ProFormInstance, EditableFormInstance} from '@ant-design/pro-components';
import {history} from 'umi'
import {pubConfig, pubMsg, pubRequiredRule} from '@/utils/pubConfig';
import {detail, addOrUpdate} from '@/services/pages/warehouse/stock'
import SelectGood from "@/pages/warehouse/components/SelectGood";
import {uniqBy} from "lodash";
import {FooterToolbar} from "@ant-design/pro-layout";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {addRemark} from "@/services/pages/warehouse/stock";
import ShowFileList from "@/components/PubShowFiles/ShowFileList";
// 盘点管理 - 详情
const Page: React.FC<{ common: any }> = ({}) => {
  const id: any = history?.location?.query?.id || ''
  const type: 'good_qty' | 'bad_qty' | any = history?.location?.query?.type || ''
  const edit: any = history?.location?.query?.edit || ''
  const readonly = id && !edit
  const formRef = useRef<ProFormInstance>();
  const actionRef: any = useRef<ProDescriptionsActionType>(null)
  const editorFormRef = useRef<EditableFormInstance<any>>();
  const access = useAccess();
  const [info, infoSet] = useState<any>({})
  const [goodsList, goodsListSet] = useState<any>([])
  const [editableKeys, editableKeysSet] = useState<React.Key[]>([]);
  const [loadings, loadingsSet] = useState({
    NEW: false,
    FINISHED: false,
  })
  const reset = () => {
    infoSet({})
    goodsListSet([])
    editableKeysSet([])
    loadingsSet({
      NEW: false,
      FINISHED: false,
    })
  }
  const fetchInfo = () => {
    return detail({id}).then((res: any) => {
      if (res?.code == pubConfig.sCode) {
        if (res.data) {
          infoSet(res.data)
          const tempList = res.data.detailList
          goodsListSet(tempList)
          if (edit) {
            editableKeysSet(tempList.map((item: any) => item.goods_sku_id))
          } else {
            editableKeysSet([])
          }
          return res.data
        } else {
          infoSet({})
          pubMsg('无法查到明细~')
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
    reset()
    if (id) {
      fetchInfo()
    }
  });
  const onSubmit = async (approve_status: 'NEW' | 'FINISHED') => {
    const postData = {
      id: id || '',
      "order_type": "TAKE_STOCK", //盘点TAKE_STOCK；良品转不良品GOOD_TRANS_BAD
      "order_sub_type": type == 'good_qty' ? "TAKE_GOOD_STOCK" : 'TAKE_BAD_STOCK', //良品盘点TAKE_GOOD_STOCK；不良品盘点TAKE_BAD_STOCK；良品转不良品GOOD_TRANS_BAD
      approve_status, //新建NEW；已完成FINISHED
      "detailList": goodsList,
    }
    loadingsSet({...loadings, [approve_status]: true})
    const res = await addOrUpdate(postData)
    loadingsSet({...loadings, [approve_status]: false})
    if (res?.code == pubConfig.sCode) {
      pubMsg(res?.message, 'success')
      history.replace('/warehouse/stock/check')
    } else {
      pubMsg(res?.message)
    }
  }
  return <>
    {
      access.canSee('warehouse-stock-check-detail')
        ? <ProForm
          style={{minHeight: 'calc(100vh - 90px)', background: '#fff', padding: 24}}
          formRef={formRef}
          submitter={{
            render: () => {
              return !id || edit ? (
                <FooterToolbar>
                  <Button icon={<ArrowLeftOutlined/>} onClick={() => history.replace('/warehouse/stock/check')}>
                    返回
                  </Button>
                  <Button
                    loading={loadings.NEW}
                    ghost
                    type="primary"
                    onClick={() => {
                      onSubmit('NEW')
                    }}
                  >
                    暂存
                  </Button>
                  <Popconfirm
                    title={
                      <>
                        确定后系统数据将更改
                        <br/>
                        盘点单不可以重新编辑
                      </>
                    }
                    onConfirm={() => onSubmit('FINISHED')}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button loading={loadings.FINISHED} type="primary">确定完成盘点</Button>
                  </Popconfirm>
                </FooterToolbar>
              ) : (
                <FooterToolbar>
                  <Button icon={<ArrowLeftOutlined/>} onClick={history.goBack}>
                    返回
                  </Button>
                </FooterToolbar>
              );
            },
          }}
        >
          {
            id ?
              <>
                <ProDescriptions title={'盘点单信息'} actionRef={actionRef} dataSource={info} column={5} request={fetchInfo}>
                  <ProDescriptions.Item label={'盘点单号'} dataIndex={'order_no'}/>
                  <ProDescriptions.Item label={'盘点人'} dataIndex={'create_user_name'}/>
                  <ProDescriptions.Item label={'创建时间'} dataIndex={'create_time'}/>
                  <ProDescriptions.Item label={'状态'} dataIndex={'approve_status'} valueEnum={{
                    'NEW': {text: '新建'},
                    'FINISHED': {text: '已完成'},
                  }}/>
                  <ProDescriptions.Item label={'盘点类型'} dataIndex={'order_sub_type'}/>
                  {readonly ? <>
                    <ProDescriptions.Item span={5} label={'评审凭证'} contentStyle={{display: 'block'}}>
                      {info?.sys_files?.length ? <ShowFileList data={info.sys_files} isShowDownLoad={true}/> : '未上传'}
                    </ProDescriptions.Item>
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
                          const res = await addRemark({...values, business_id: id})
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
                    <ProDescriptions.Item label={'备注内容'} span={4} valueType={'textarea'} contentStyle={{display: 'block', paddingTop: 8}}>
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
                  </> : null}
                </ProDescriptions>
              </>
              : null
          }
          <Card title={`盘点明细 - ${type == 'good_qty' ? '良品' : '不良品'}盘点`}>
            <EditableProTable
              headerTitle={
                edit || !id ?
                  <SelectGood
                    title={'添加盘点商品'}
                    trigger={<Button type={'primary'}>添加盘点商品</Button>}
                    requestApi={'/sc-scm/ownStockManagement/ownStockPage'}
                    requestParams={{stock_type: 'RETURN'}}
                    extraColumns={[
                      {title: '良品数量', dataIndex: 'good_qty', align: 'center', width: 90, hideInSearch: true,},
                      {title: '不良品数量', dataIndex: 'bad_qty', align: 'center', width: 90, hideInSearch: true,},
                    ]}
                    value={goodsList}
                    onChange={(val: any[]) => {
                      const formatVal = val.map((data: any) => {
                        return {...data, sys_stock: data[type], real_stock: data[type], stockComputed: 0, reason: ''}
                      })
                      const tempList = uniqBy([...goodsList, ...formatVal], 'goods_sku_id').map((item: any) => ({...item, id: ''}))
                      goodsListSet(tempList)
                      editableKeysSet(tempList.map(item => item.goods_sku_id))
                    }}/> : null
              }
              rowKey={'goods_sku_id'}
              editableFormRef={editorFormRef}
              defaultSize={'small'}
              bordered
              style={{width: '100%'}}
              cardProps={{bodyStyle: {padding: 0}}}
              scroll={{
                x: 888,
              }}
              loading={false}
              recordCreatorProps={false}
              value={goodsList}
              onChange={goodsListSet}
              controlled
              editable={{
                type: 'multiple',
                editableKeys,
                onChange: editableKeysSet,
                onValuesChange: (record, recordList) => {
                  goodsListSet(recordList);
                },
                actionRender: (row, config, defaultDoms) => [defaultDoms.delete],
              }}
              columns={[
                {title: '序号', dataIndex: '序号', valueType: 'index', width: 60, align: 'center', editable: false,},
                {title: '商品图片', dataIndex: 'image_url', align: 'center', valueType: 'image', width: 80, editable: false,},
                {title: '商品条形码', dataIndex: 'bar_code', editable: false,},
                {title: '商品名称', dataIndex: 'sku_name', editable: false,},
                {title: 'SKU', dataIndex: 'sku_code', editable: false,},
                {
                  title: `系统${type == 'good_qty' ? '良品' : '不良品'}数量`, dataIndex: 'sys_stock',
                  width: 110, editable: false,
                },
                {
                  title: `实际${type == 'good_qty' ? '良品' : '不良品'}数量`, dataIndex: 'real_stock',
                  width: 110, valueType: 'digit', fieldProps: {
                    precision: 0
                  }
                },
                {
                  title: <><span className={'text-red'}>盘亏</span>/<span className={'text-green'}>盘盈</span></>,
                  dataIndex: 'stockComputed',
                  width: 90,
                  align: 'center',
                  editable: false,
                  render: (_, record: any) => {
                    const tempNum = record.real_stock - record.sys_stock
                    return <span className={tempNum < 0 ? 'text-red' : tempNum > 0 ? 'text-green' : ''}>{tempNum}</span>
                  }
                },
                {
                  title: '差异原因', dataIndex: 'reason', valueType: 'textarea', fieldProps: {
                    maxLength: 200,
                  }
                },
                {
                  title: '操作', valueType: 'option', width: 70, align: 'center', fixed: 'right', hideInTable: readonly,
                },
              ]}/>
          </Card>
        </ProForm>
        : <Result
          status="403"
          title="403"
          subTitle="抱歉，你无权访问该页面"
          extra={
            <Button type="primary" onClick={() => history.replace('/')}>
              返回首页
            </Button>
          }
        />
    }
  </>
};

const ConnectPage: React.FC = connect(({common}: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

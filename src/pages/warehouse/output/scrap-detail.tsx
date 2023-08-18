import {connect, useAccess} from 'umi';
import React, {useRef, useState} from 'react';
import {useActivate} from 'react-activation';
import {Button, Popconfirm, Card, Result, Timeline, Space} from "antd";
import {ProForm, ProDescriptions, EditableProTable, ProFormTextArea, ModalForm} from '@ant-design/pro-components';
import type {ProDescriptionsActionType} from '@ant-design/pro-components';
import type {ProFormInstance, EditableFormInstance} from '@ant-design/pro-components';
import {history} from 'umi'
import {pubConfig, pubMsg, pubRequiredRule, pubFilter} from '@/utils/pubConfig';
import {detail, addOrUpdate, approve} from '@/services/pages/warehouse/stock'
import SelectGood from "@/pages/warehouse/components/SelectGood";
import {uniqBy} from "lodash";
import {FooterToolbar} from "@ant-design/pro-layout";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {addRemark} from "@/services/pages/warehouse/stock";
// 不良品出库 - 详情
const Page: React.FC<{ common: any }> = ({common}) => {
  const id: any = history?.location?.query?.id || ''
  const edit: any = history?.location?.query?.edit || ''
  const approval: any = history?.location?.query?.approval || ''
  const order_sub_type: 'SCRAP_OUT' | 'SOLD_INSIDE' | 'LEND_OUT' | string | string[] = history?.location?.query?.order_sub_type || ''
  const readonly = id && (!edit || approval)
  const formRef = useRef<ProFormInstance>();
  const actionRef: any = useRef<ProDescriptionsActionType>(null)
  const editorFormRef = useRef<EditableFormInstance<any>>();
  const access = useAccess();
  const [info, infoSet] = useState<any>({})
  const [goodsList, goodsListSet] = useState<any>([])
  const [editableKeys, editableKeysSet] = useState<React.Key[]>([]);
  const [loadings, loadingsSet] = useState({
    NEW: false,
    WAIT_APPROVAL: false,
  })
  const reset = () => {
    infoSet({})
    goodsListSet([])
    editableKeysSet([])
    loadingsSet({
      NEW: false,
      WAIT_APPROVAL: false,
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
  const onSubmit = async (approve_status: 'NEW' | 'WAIT_APPROVAL') => {
    if (!goodsList.length) {
      pubMsg('请添加需要出库的商品')
      return
    }
    return editorFormRef.current?.validateFields().then(async () => {
      const postData = {
        id: id || '',
        "order_type": "BAD_STOCK_OUT", // 字典: SCM_OWN_STOCK_ORDER_TYPE
        order_sub_type, // 字典: SCM_OWN_STOCK_ORDER_SUB_TYPE
        approve_status,
        "detailList": goodsList,
      }
      loadingsSet({
        NEW: false,
        WAIT_APPROVAL: true,
      })
      const res = await addOrUpdate(postData)
      loadingsSet({
        NEW: false,
        WAIT_APPROVAL: false,
      })
      if (res?.code == pubConfig.sCode) {
        pubMsg(res?.message, 'success')
        history.replace('/warehouse/output/scrap')
        return Promise.resolve()
      } else {
        pubMsg(res?.message)
        return Promise.reject()
      }
    }).catch((e) => {
      console.log(e, 'onFinish')
      if (e) {
        pubMsg('无法提交, 请检查填写的信息是否完整或正确')
      }
    })
  }
  // 审核
  const approvalSubmit = async (approve_status: string, remarks = '') => {
    const res = await approve({id, approve_status, remarks})
    if (res?.code == pubConfig.sCode) {
      pubMsg(res?.message, 'success')
      history.goBack()
      return true
    } else {
      pubMsg(res?.message)
      return false
    }
  }
  return <>
    {
      access.canSee('warehouse-output-po-detail')
        ? <ProForm
          style={{minHeight: 'calc(100vh - 90px)', background: '#fff', padding: 24}}
          formRef={formRef}
          submitter={{
            render: () => {
              return !id || edit || approval ? (
                <FooterToolbar>
                  <Button icon={<ArrowLeftOutlined/>} onClick={() => history.replace('/warehouse/output/scrap')}>
                    返回
                  </Button>
                  {
                    approval ? <>
                      <ModalForm title={'审批'} width={600} trigger={<Button ghost danger>审核不通过</Button>} onFinish={async ({remarks}) => approvalSubmit('FAIL_APPROVAL', remarks)}>
                        <ProFormTextArea label={'不通过原因'} name={'remarks'} rules={[pubRequiredRule]} fieldProps={{maxLength: 200}}/>
                      </ModalForm>
                      <Popconfirm
                        title={'确定"审核通过"'}
                        onConfirm={async () => approvalSubmit('PASS_APPROVAL')}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button style={{width: 80}} type="primary">审核通过</Button>
                      </Popconfirm>
                    </> : <>
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
                            确定出库单提交审核
                          </>
                        }
                        onConfirm={async () => onSubmit('WAIT_APPROVAL')}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button loading={loadings.WAIT_APPROVAL} type="primary">确定并提交审核</Button>
                      </Popconfirm>
                    </>
                  }
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
                <ProDescriptions title={'出库单信息'} actionRef={actionRef} dataSource={info} column={4} request={fetchInfo}>
                  <ProDescriptions.Item label={'出库单号'} dataIndex={'order_no'}/>
                  <ProDescriptions.Item label={'创建人'} dataIndex={'create_user_name'}/>
                  <ProDescriptions.Item label={'创建时间'} dataIndex={'create_time'}/>
                  <ProDescriptions.Item label={'状态'} dataIndex={'approve_status'} valueEnum={common?.dicList?.SCM_OWN_STOCK_ORDER_STATUS || {}} />
                  <ProDescriptions.Item label={'不良品出库类型'} dataIndex={'order_sub_type'} valueEnum={common?.dicList?.SCM_OWN_STOCK_ORDER_SUB_TYPE || {}} />
                  {readonly ? <>
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
                  </> : null}
                </ProDescriptions>
              </>
              : null
          }
          <Card title={`出库商品明细 - ${pubFilter(common?.dicList?.SCM_OWN_STOCK_ORDER_SUB_TYPE, order_sub_type as string) || '不良品'}出库`}>
            <EditableProTable
              headerTitle={
                edit || !id ?
                  <SelectGood
                    title={'添加商品(不良品)'}
                    trigger={<Button type={'primary'}>添加不良品商品</Button>}
                    requestApi={'/sc-scm/ownStockManagement/ownStockPage'}
                    requestParams={{stock_type: 'RETURN', queryAvailableBadQty: true}}
                    extraColumns={[
                      {title: <>不良品数量<br/>(未被占用数量)</>, dataIndex: 'availableBadQty', align: 'center', width: 100, hideInSearch: true,},
                    ]}
                    value={goodsList}
                    onChange={(val: any[]) => {
                      const formatVal = val.map((data: any) => {
                        return {...data, availableQty: data.availableBadQty, qty: 0, reason: ''}
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
                {title: '可用不良品数量', dataIndex: 'availableQty', editable: false,},
                {
                  title: `${pubFilter(common?.dicList?.SCM_OWN_STOCK_ORDER_SUB_TYPE, order_sub_type as string) || ''}数量`,
                  dataIndex: 'qty',
                  width: 110,
                  valueType: 'digit',
                  fieldProps: (form, {entry}: any) => {
                    return {
                      precision: 0,
                      max: entry.availableBadQty,
                    }
                  },
                  formItemProps: {
                    rules: [{validator: (_, val) => val ? Promise.resolve() : Promise.reject('输入数值必须 > 0')}]
                  },
                },
                {
                  title: '备注', dataIndex: 'reason', valueType: 'textarea', fieldProps: {
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

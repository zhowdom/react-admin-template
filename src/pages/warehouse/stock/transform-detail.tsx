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
// 良品转不良品 - 详情
const Page: React.FC<{ common: any }> = ({}) => {
  const id: any = history?.location?.query?.id || ''
  const type: 'good_qty' | 'bad_qty' | any = 'good_qty'
  const edit: any = history?.location?.query?.edit || ''
  const readonly = id && !edit
  const formRef = useRef<ProFormInstance>();
  const actionRef: any = useRef<ProDescriptionsActionType>(null)
  const editorFormRef = useRef<EditableFormInstance<any>>();
  const access = useAccess();
  const [info, infoSet] = useState<any>({})
  const [goodsList, goodsListSet] = useState<any>([])
  const [editableKeys, editableKeysSet] = useState<React.Key[]>([]);
  const [loading, loadingSet] = useState(false)
  const reset = () => {
    infoSet({})
    goodsListSet([])
    editableKeysSet([])
    loadingSet(false)
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
  const onSubmit = async () => {
    return editorFormRef.current?.validateFields().then(async () => {
      const postData = {
        id: id || '',
        "order_type": "GOOD_TRANS_BAD", //盘点TAKE_STOCK；良品转不良品GOOD_TRANS_BAD
        "order_sub_type": 'GOOD_TRANS_BAD', //良品盘点TAKE_GOOD_STOCK；不良品盘点TAKE_BAD_STOCK；良品转不良品GOOD_TRANS_BAD
        "detailList": goodsList,
      }
      loadingSet(true)
      const res = await addOrUpdate(postData)
      loadingSet(false)
      if (res?.code == pubConfig.sCode) {
        pubMsg(res?.message, 'success')
        history.replace('/warehouse/stock/transform')
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
                  <Button icon={<ArrowLeftOutlined/>} onClick={() => history.replace('/warehouse/stock/transform')}>
                    返回
                  </Button>
                  <Popconfirm
                    title={
                      <>
                        确定后系统数据将更改
                        <br/>
                        转换单不可以重新编辑
                      </>
                    }
                    onConfirm={async () => onSubmit()}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button loading={loading} type="primary">确定完成转换</Button>
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
                <ProDescriptions title={'转换单信息'} actionRef={actionRef} dataSource={info} column={4} request={fetchInfo}>
                  <ProDescriptions.Item label={'转换单号'} dataIndex={'order_no'}/>
                  <ProDescriptions.Item label={'创建人'} dataIndex={'create_user_name'}/>
                  <ProDescriptions.Item label={'创建时间'} dataIndex={'create_time'}/>
                  <ProDescriptions.Item label={'状态'}>已完成</ProDescriptions.Item>
                  {readonly ? <>
                    <ProDescriptions.Item label={'评审凭证'} contentStyle={{display: 'block'}}>
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
          <Card title={`商品明细 - 良品转不良品`}>
            <EditableProTable
              headerTitle={
                edit || !id ?
                  <SelectGood
                    title={'添加商品(良品)'}
                    trigger={<Button type={'primary'}>添加商品(良品)</Button>}
                    requestApi={'/sc-scm/ownStockManagement/ownStockPage'}
                    requestParams={{stock_type: 'RETURN', queryAvailableGoodQty: true}}
                    extraColumns={[
                      {title: '良品数量', dataIndex: 'good_qty', align: 'center', width: 90, hideInSearch: true,},
                      {title: '不良品数量', dataIndex: 'bad_qty', align: 'center', width: 90, hideInSearch: true,},
                    ]}
                    value={goodsList}
                    onChange={(val: any[]) => {
                      const formatVal = val.map((data: any) => {
                        return {...data, before_change_qty: data[type], qty: 0, reason: ''}
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
                {title: '良品数量', dataIndex: 'before_change_qty', editable: false,},
                {
                  title: `转不良品数量`,
                  dataIndex: 'qty',
                  width: 110,
                  valueType: 'digit',
                  fieldProps: (form, { entry }: any) => {
                    return {
                      precision: 0,
                      max: entry.good_qty,
                    }
                  },
                  formItemProps: {
                    rules: [{validator: (_, val) => val ? Promise.resolve() : Promise.reject('输入数值必须 > 0')}]
                  },
                },
                {
                  title: '转换原因', dataIndex: 'reason', valueType: 'textarea', fieldProps: {
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

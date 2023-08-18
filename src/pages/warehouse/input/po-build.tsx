import {connect} from 'umi';
import {Layout, Divider, Alert, Space} from 'antd'
import type {InputRef} from 'antd'
import {ProFormText, ProDescriptions, EditableProTable, ProForm} from '@ant-design/pro-components'
import {addPartsOrder, partsOrder} from '@/services/pages/warehouse/input'
import {pubConfig, pubMsg, pubNormalize, pubRequiredRule} from "@/utils/pubConfig";
import React, {useMemo, useRef, useState} from "react";
import type {EditableFormInstance, ProFormInstance} from "@ant-design/pro-components";
import SelectInput from '../components/SelectInput'

const {Sider, Content} = Layout;
/*采购入库(包材配件) @zhujing 2023-03-14*/
const Page: React.FC<{ common: any }> = ({common}) => {
  const formRef = useRef<ProFormInstance>();
  const editorFormRef = useRef<EditableFormInstance<any>>();
  const inputRef = useRef<InputRef>(null);
  const [info, infoSet] = useState<any>({})
  const [currentGood, currentGoodSet] = useState<any>(null)
  const [editableKeys, editableKeysSet] = useState<React.Key[]>([]);
  const totalQty = useMemo(() => {
    if (info?.orderSkuList?.length) {
      return info.orderSkuList.reduce((result: any, cur: any) => ({
        delivery_num: result.delivery_num + cur.delivery_num,
        warehousing_num: result.warehousing_num + cur.warehousing_num,
      }), {delivery_num: 0, warehousing_num: 0,})
    } else {
      return {
        delivery_num: 0,
        warehousing_num: 0,
      }
    }
  }, [info])

  const fetchInfo = (keyWords: string) => {
    partsOrder({keyWords}).then(res => {
      if (res?.code == pubConfig.sCode) {
        if (res.data) {
          if (res.data.inboundStatus == 'IN_STORAGE') {
            pubMsg(`快递单号/入库单号: ${keyWords}已经入库, 请勿重复操作`)
          } else {
            if (res.data?.orderSkuList?.length) {
              infoSet({...res.data, orderSkuList: res.data.orderSkuList.map((item: any) => ({...item, warehousing_num: 0}))})
              editableKeysSet(res.data.orderSkuList.map((item: any) => item.goods_sku_id))
            } else {
              infoSet(res.data)
            }
            inputRef.current!.focus({cursor: 'all'})
          }
        } else {
          infoSet({})
          pubMsg('无法查到入库商品明细~')
        }
      } else {
        infoSet({})
        pubMsg(res?.message)
      }
    })
  }
  const reset = () => {
    infoSet({})
    editableKeysSet([])
    currentGood(null)
    pubMsg('界面已重置, 请继续扫描入库！', 'info')
  }
  return <Layout style={{minHeight: 'calc(100vh - 90px)'}}>
    <Sider width={320} theme={'light'} style={{padding: '100px 15px 15px'}}>
      <ProForm
        formRef={formRef}
        layout={'horizontal'}
        labelCol={{flex: '0 0 80px'}}
        labelAlign={'right'}
        autoFocusFirstInput
        submitter={{
          searchConfig: {
            submitText: '确定入库'
          },
          resetButtonProps: {style: {width: 290}},
          submitButtonProps: {style: {width: 290}},
        }}
        onReset={reset}
        onFinish={async ({order_no}) => {
          return editorFormRef.current?.validateFields().then(async () => {
            const res = await addPartsOrder({
              order_no,
              orderSkuList: info?.orderSkuList,
            })
            if (res?.code == pubConfig.sCode) {
              pubMsg(res?.message || '提交成功', 'success')
              formRef?.current?.resetFields()
              return Promise.resolve()
            } else {
              pubMsg(res?.message)
              return Promise.reject()
            }
          }).catch((e) => {
            console.log(e, 'onFinish')
            if (e) {
              pubMsg('未正确或未完整填写入库信息, 无法提交入库')
            }
          })
        }}>
        <h3>请扫描快递单号</h3>
        <ProFormText label={<>快递单号<br/>入库单号</>}
                     name={'order_no'}
                     placeholder={''}
                     normalize={pubNormalize}
                     extra={'说明：请扫描快递单号或者手动输入按回车键（Enter）'}
                     rules={[pubRequiredRule]}
                     addonAfter={
                       <SelectInput
                         value={[info]}
                         requestParams={{inboundStatus: ['UN_SHIPPED', 'IN_TRANSIT']}}
                         onChange={(val: any) => {
                           console.log(val, 'onchange')
                           if (val?.length) {
                             const data = val[0] || {}
                             infoSet({...data, orderSkuList: data?.orderSkuList?.map((item: any) => ({...item, warehousing_num: 0})) || []})
                             formRef.current?.setFieldsValue({order_no: data.order_no})
                             editableKeysSet(data?.orderSkuList.map((item: any) => item.goods_sku_id))
                           }
                         }} dicList={common?.dicList}/>
                     }
                     fieldProps={{
                       autoFocus: true,
                       autoComplete: 'on',
                       onKeyDown: (e: any) => {
                         if (e.key == 'Enter') {
                           fetchInfo(e.target?.value)
                         }
                       },
                     }}/>
        <Divider/>
        <h3>请扫描商品条码</h3>
        <ProFormText label={'商品条形码'}
                     name={'bar_code'}
                     placeholder={''}
                     normalize={pubNormalize}
                     extra={'说明：请扫描商品条形码或者手动输入按回车键（Enter）'}
                     fieldProps={{
                       ref: inputRef,
                       autoComplete: 'on',
                       onKeyDown: (e: any) => {
                         if (e.key == 'Enter') {
                           inputRef.current!.focus({cursor: 'all'})
                           const barCode = e.target?.value
                           if (barCode && info?.orderSkuList?.length) {
                             const tempObj = info.orderSkuList.find((item: any) => item.bar_code == barCode)
                             if (tempObj) {
                               const tempList = info.orderSkuList.map((item: any) => ({...item, warehousing_num: item.bar_code == barCode ? item.warehousing_num + 1 : item.warehousing_num}))
                               infoSet({...info, orderSkuList: tempList})
                               currentGoodSet(tempList.find((item: any) => item.bar_code == barCode))
                               editableKeysSet(tempList.map((item: any) => item.goods_sku_id))
                             } else {
                               pubMsg(`未找到条形码为: ${barCode}的商品`)
                             }
                           }
                         }
                       },
                     }}/>
        <Alert style={{marginBottom: 12}} banner type={'info'} message={<Space direction={'vertical'}>
          <Space><span>发货总数量: {totalQty.delivery_num}</span><span>收货总数量: {totalQty.warehousing_num}</span></Space>
          {currentGood ? <Space><span>当前商品发货数量: {currentGood.delivery_num}</span><span>当前商品收货数量: {currentGood.warehousing_num}</span></Space> : null}
        </Space>}/>
      </ProForm>
    </Sider>
    <Content style={{background: '#fff', borderLeft: '1px solid rgba(0, 0, 0, 0.06)', padding: '15px'}}>
      <ProDescriptions dataSource={info} column={3}>
        <ProDescriptions.Item label={'入库单'} dataIndex={'order_no'}/>
        <ProDescriptions.Item label={'快递单号'} dataIndex={'logistics_order_no'}/>
      </ProDescriptions>
      <Divider style={{margin: '10px 0'}}/>
      <EditableProTable
        headerTitle={'商品明细'}
        rowKey={'goods_sku_id'}
        editableFormRef={editorFormRef}
        defaultSize={'small'}
        bordered
        style={{width: '100%'}}
        cardProps={{bodyStyle: {padding: 0}}}
        scroll={{
          x: 666,
        }}
        loading={false}
        recordCreatorProps={false}
        value={info?.orderSkuList || []}
        onChange={(val) => infoSet({...info, orderSkuList: val})}
        controlled
        editable={{
          type: 'multiple',
          editableKeys,
          onChange: editableKeysSet,
          onValuesChange: (record, recordList) => {
            infoSet({...info, orderSkuList: recordList})
          },
          actionRender: () => [],
        }}
        columns={[
          {title: '序号', dataIndex: '序号', valueType: 'index', width: 60, align: 'center', editable: false,},
          {title: '商品图片', dataIndex: 'image_url', align: 'center', valueType: 'image', width: 80, editable: false,},
          {title: '商品名称', dataIndex: 'sku_name', editable: false,},
          {title: 'SKU', dataIndex: 'sku_code', editable: false,},
          {title: '商品条形码', dataIndex: 'bar_code', editable: false,},
          {
            title: '发货数量', dataIndex: 'delivery_num', valueType: 'digit', fieldProps: {
              precision: 0
            }, editable: false, width: 70,
          },
          {
            title: '收货数量', dataIndex: 'warehousing_num', valueType: 'digit', fieldProps: {
              precision: 0
            }, width: 110,
          },
          {
            title: '备注', dataIndex: 'remark', valueType: 'textarea', fieldProps: {
              maxLength: 100,
            }
          },
        ]}/>
    </Content>
  </Layout>
}
const PageConnect: React.FC<any> = connect(({common}: any) => ({common}))(Page);
export default PageConnect;

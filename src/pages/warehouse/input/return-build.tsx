import {Layout, Divider, Alert, Space, Button} from 'antd'
import type {InputRef} from 'antd'
import {ProFormText, ProDescriptions, ProTable, EditableProTable, ProForm} from '@ant-design/pro-components'
import {getExchangeInfo, addReturnOrder} from '@/services/pages/warehouse/input'
import {getGoodsSkuVendorPage} from '@/services/pages/cooperateProduct';
import {pubConfig, pubMsg, pubNormalize, pubRequiredRule} from "@/utils/pubConfig";
import React, {useMemo, useRef, useState} from "react";
import UploadFileList from '@/components/PubUpload/UploadFileList';
import type {EditableFormInstance, ProFormInstance} from "@ant-design/pro-components";
import SelectGood from '../components/SelectGood'
import {uniqBy} from 'lodash'

const {Sider, Content} = Layout;
/*退货入库 @zhujing 2023-03-14*/
const Page: React.FC = () => {
  const formRef = useRef<ProFormInstance>();
  const editorFormRef = useRef<EditableFormInstance<any>>();
  const editorFormRefManual = useRef<EditableFormInstance<any>>();
  const inputRef = useRef<InputRef>(null);
  const [expressCode, expressCodeSet] = useState<any>('')
  const [info, infoSet] = useState<any>({})
  const [goodsList, goodsListSet] = useState<any>([])
  const [goodsListManual, goodsListManualSet] = useState<any>([])
  const [editableKeys, editableKeysSet] = useState<React.Key[]>([]);
  const [editableKeysManual, editableKeysManualSet] = useState<React.Key[]>([]);
  const totalReturnQty = useMemo(() => {
    if (info?.deliveryPackageItems?.length) {
      return info?.deliveryPackageItems.reduce((result: number, cur: any) => result + cur.planQty, 0)
    } else {
      return 0
    }
  }, [info])
  const totalInputQty = useMemo(() => {
    let tempNum = 0
    if (goodsList.length) {
      tempNum = tempNum + goodsList.reduce((result: number, cur: any) => result + cur.good_qty + cur.bad_qty, 0)
    }
    if (goodsListManual.length) {
      tempNum = tempNum + goodsListManual.reduce((result: number, cur: any) => result + cur.bad_qty, 0)
    }
    return tempNum
  }, [goodsList, goodsListManual])
  const reset = () => {
    infoSet({})
    goodsListSet([])
    goodsListManualSet([])
    editableKeysSet([])
    editableKeysManualSet([])
    expressCodeSet('')
    pubMsg('界面已重置, 请继续扫描入库！', 'info')
  }
  const resetGoods = () => {
    goodsListSet([])
    goodsListManualSet([])
    editableKeysSet([])
    editableKeysManualSet([])
  }
  const fetchInfo = (express_code: string) => {
    getExchangeInfo({express_code}).then(res => {
      if (res?.code == pubConfig.sCode) {
        if (res.data) {
          infoSet(res.data)
        } else {
          infoSet({})
          pubMsg('无法查到单号明细~')
        }
      } else {
        infoSet({})
        pubMsg(res?.message)
      }
    }).finally(() => {
      resetGoods()
      inputRef.current!.focus({cursor: 'all'})
    })
  }
  const fetchGoods = (full_match_bar_code?: string) => {
    return getGoodsSkuVendorPage(
      {
        full_match_bar_code,
        current_page: 1,
        page_size: 999,
      }).then(res => {
      if (res?.code == pubConfig.sCode) {
        if (res.data?.records?.length) {
          return res.data.records[0]
        } else {
          pubMsg('无法查到商品~')
          return
        }
      } else {
        pubMsg(res?.message)
        return
      }
    })
  }
  return <Layout style={{minHeight: 'calc(100vh - 90px)'}}>
    <Sider width={300} theme={'light'} style={{padding: '100px 15px 0 15px'}}>
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
          resetButtonProps: {style: {width: 270}},
          submitButtonProps: {style: {width: 270}},
        }}
        onReset={reset}
        onFinish={async ({express_code}) => {
          return Promise.all([editorFormRef.current?.validateFields(), editorFormRefManual.current?.validateFields()]).then(async () => {
            const res = await addReturnOrder({
              express_code,
              detailList: goodsList.map((item: any) => ({...item, goods_sku_id: item.id})),
              manualDetailList: goodsListManual.map((item: any) => ({...item, sys_file: item.sys_file?.length ? item.sys_file[0] : {}})),
            })
            if (res?.code == pubConfig.sCode) {
              pubMsg(res?.message || '提交成功', 'success')
              formRef?.current?.resetFields()
              reset()
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
        <ProFormText label={'快递单号'}
                     name={'express_code'}
                     placeholder={''}
                     normalize={pubNormalize}
                     extra={'说明：请扫描快递单号或者手动输入按回车键（Enter）'}
                     rules={[pubRequiredRule]}
                     fieldProps={{
                       autoFocus: true,
                       autoComplete: 'on',
                       onKeyDown: (e: any) => {
                         if (e.key == 'Enter') {
                           expressCodeSet(e.target?.value)
                           fetchInfo(e.target?.value)
                         }
                       },
                     }}/>
        <Divider/>
        <h3>请扫描商品条码</h3>
        <ProFormText label={'商品条形码'}
                     name={'full_match_bar_code'}
                     placeholder={''}
                     normalize={pubNormalize}
                     extra={'说明：请扫描商品条形码或者手动输入按回车键（Enter）'}
                     fieldProps={{
                       ref: inputRef,
                       autoComplete: 'on',
                       onKeyDown: (e: any) => {
                         if (e.key == 'Enter') {
                           inputRef.current!.focus({cursor: 'all'})
                           if (goodsList.find((item: any) => item.bar_code == e.target?.value)) {
                             // 扫码同一个条形码, 退货数量+1
                             goodsListSet(goodsList.map((item: any) => ({...item, bad_qty: item.bar_code == e.target?.value ? item.bad_qty + 1 : item.bad_qty})))
                           } else {
                             fetchGoods(e.target?.value).then(data => {
                               if (data) {
                                 let tempList: any[]
                                 if (goodsList.find((item: any) => item.id == data.id)) {
                                   // 扫码同一个条形码, 退货数量+1
                                   tempList = goodsList.map((item: any) => ({...item, bad_qty: item.id == data.id ? item.bad_qty + 1 : item.bad_qty}))
                                 } else {
                                   tempList = [...goodsList, {...data, good_qty: 0, bad_qty: 1, remark: ''}]
                                 }
                                 goodsListSet(tempList)
                                 editableKeysSet(tempList.map(item => item.id))
                               }
                             })
                           }
                         }
                       },
                     }}/>
        <Alert style={{marginBottom: 12}} banner type={'info'} message={<Space>{info?.deliveryPackageItems ? <span>总退货数量: {totalReturnQty}</span> : null}<span>待入库总数量: {totalInputQty}</span></Space>}/>
      </ProForm>
    </Sider>
    <Content style={{background: '#fff', borderLeft: '1px solid rgba(0, 0, 0, 0.06)', padding: '15px'}}>
      <ProDescriptions dataSource={info} column={3}>
        <ProDescriptions.Item label={'订单号'} dataIndex={'erpNo'}/>
        <ProDescriptions.Item label={'销退单号'} dataIndex={'returnOrderCode'}/>
        <ProDescriptions.Item label={'快递单号'} dataIndex={'expressCode'}/>
        <ProDescriptions.Item label={'明细'} span={3} valueType={'textarea'} contentStyle={{display: 'block'}}>
          <ProTable rowKey={'id'} defaultSize={'small'} bordered style={{width: '100%'}}
                    search={false}
                    options={false} pagination={false}
                    cardProps={{bodyStyle: {padding: 0}}}
                    dataSource={info?.deliveryPackageItems || []}
                    columns={[
                      {title: '序号', dataIndex: '序号', valueType: 'index', width: 70,},
                      {title: '商品名称', dataIndex: 'skuName'},
                      {title: 'SKU', dataIndex: 'skuCode'},
                      {title: '商品条形码', dataIndex: 'barCode'},
                      {title: '退货数量', dataIndex: 'planQty'},
                    ]}/>
        </ProDescriptions.Item>
      </ProDescriptions>
      <Divider style={{margin: '10px 0'}}/>
      <EditableProTable
        headerTitle={
          <SelectGood
            disabled={!expressCode}
            requestParams={{business_scope: 'CN'}}
            title={'添加商品明细'}
            value={goodsList}
            onChange={(val: any[]) => {
              const formatVal = val.map((data: any) => ({...data, good_qty: 0, bad_qty: 1, remark: ''}))
              const tempList = uniqBy([...goodsList, ...formatVal], 'id')
              goodsListSet(tempList)
              editableKeysSet(tempList.map(item => item.id))
            }}/>
        }
        rowKey={'id'}
        editableFormRef={editorFormRef}
        defaultSize={'small'}
        bordered
        style={{width: '100%'}}
        cardProps={{bodyStyle: {padding: 0}}}
        scroll={{
          x: 777,
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
          {title: '商品名称', dataIndex: 'sku_name', editable: false,},
          {title: 'SKU', dataIndex: 'sku_code', editable: false,},
          {title: '商品条形码', dataIndex: 'bar_code', editable: false,},
          {
            title: '良品数量', dataIndex: 'good_qty', valueType: 'digit', fieldProps: {
              precision: 0
            }, width: 110,
          },
          {
            title: '不良品数量', dataIndex: 'bad_qty', valueType: 'digit', width: 180,
            fieldProps: (_, {entity}) => ({
              precision: 0,
              addonAfter: <Button style={{paddingLeft: 0, paddingRight: 0, height: 22}} type={'link'} disabled={entity.bad_qty < 1} onClick={() => {
                goodsListSet(goodsList.map((item: any) => entity.bar_code == item.bar_code ? ({...item, good_qty: item.good_qty + 1, bad_qty: item.bad_qty - 1}) : item))
              }}>转1个为良品</Button>,
            }),
          },
          {
            title: '备注', dataIndex: 'remark', valueType: 'textarea', fieldProps: {
              maxLength: 100,
            }
          },
          {
            title: '操作', valueType: 'option', width: 70, align: 'center', fixed: 'right',
          },
        ]}/>
      <EditableProTable headerTitle={'手工录入商品明细'}
                        editableFormRef={editorFormRefManual}
                        rowKey={'tempId'}
                        defaultSize={'small'}
                        bordered
                        style={{width: '100%'}}
                        cardProps={{bodyStyle: {padding: 0}}}
                        scroll={{
                          x: 888,
                        }}
                        loading={false}
                        value={goodsListManual}
                        onChange={goodsListManualSet}
                        editable={{
                          type: 'multiple',
                          editableKeys: editableKeysManual,
                          onChange: editableKeysManualSet,
                          onValuesChange: (record, recordList) => {
                            goodsListManualSet(recordList);
                          },
                          actionRender: (row, config, defaultDoms) => [defaultDoms.delete],
                        }}
                        recordCreatorProps={{
                          creatorButtonText: '添加一行明细',
                          disabled: !expressCode,
                          newRecordType: 'dataSource',
                          record: () => ({
                            tempId: Date.now(),
                            sku_name: '',
                            bad_qty: 1,
                            remark: '',
                            sys_file: {},
                          }),
                        }}
                        columns={[
                          {title: '序号', dataIndex: '序号', valueType: 'index', width: 60, align: 'center', editable: false,},
                          {
                            title: '商品图片', dataIndex: 'sys_file', align: 'center', valueType: 'image', width: 180,
                            renderFormItem: (_, {record}: any) => {
                              return <UploadFileList
                                fileBack={(val: any) => {
                                  // console.log(val[0], 'sys_file')
                                  goodsListManualSet(goodsListManual.map((item: any) => {
                                    if (record.tempId == item.tempId) {
                                      return {...item, sys_file: val[0]}
                                    } else {
                                      return item
                                    }
                                  }))
                                }}
                                businessType="RETURN_ORDER_MANUAL_SKU_IMAGE"
                                listType="picture-card"
                                checkMain={false}
                                accept={['.jpg,.jpeg,.png,.gif']}
                                acceptType={['jpg', 'jpeg', 'png', 'gif']}
                                maxCount="1"
                                size="small"
                              />
                            },
                            renderText: (_, record: any) => record.access_url,
                          },
                          {title: '商品名称', dataIndex: 'sku_name', formItemProps: {rules: [pubRequiredRule]}},
                          {
                            title: '退货数量', dataIndex: 'bad_qty', valueType: 'digit', fieldProps: {
                              precision: 0
                            }
                          },
                          {
                            title: '备注', dataIndex: 'remark', fieldProps: {
                              maxLength: 100,
                            }
                          },
                          {
                            title: '操作', valueType: 'option', width: 70, align: 'center', fixed: 'right', render: (text, record, _, action) => [
                              <a
                                key="editable"
                                onClick={() => {
                                  action?.startEditable?.(record.tempId);
                                }}
                              >
                                编辑
                              </a>,
                              <a
                                key="delete"
                                onClick={() => {
                                  goodsListManualSet(goodsListManual.filter((item: any) => item.id !== record.tempId));
                                }}
                              >
                                删除
                              </a>,
                            ]
                          },
                        ]}/>
    </Content>
  </Layout>
}
export default Page

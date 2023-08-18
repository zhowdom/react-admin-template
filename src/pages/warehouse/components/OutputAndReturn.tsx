import {ModalForm, EditableProTable, ProFormTextArea, ProForm} from '@ant-design/pro-components';
import type {EditableFormInstance, ProFormInstance} from '@ant-design/pro-components';
import React, {useRef, useState} from 'react';
import {pubConfig, pubModal, pubMsg, pubResponse} from '@/utils/pubConfig';
import {detail, outbound, returned} from "@/services/pages/warehouse/stock";
// 出库或者归还
const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  initialValues?: any;
  isReturn?: boolean; // 是否是归还
}> = ({
        title,
        trigger,
        reload,
        initialValues = {},
        isReturn,
      }) => {
  const formRef = useRef<ProFormInstance>();
  const editorFormRef = useRef<EditableFormInstance<any>>();
  const [goodsList, goodsListSet] = useState<any>([])
  const [editableKeys, editableKeysSet] = useState<React.Key[]>([]);

  return (
    <ModalForm
      title={title || '出库'}
      trigger={trigger || <a>出库</a>}
      labelAlign="right"
      layout="horizontal"
      width={900}
      modalProps={{
        destroyOnClose: true,
      }}
      submitter={{
        searchConfig: {submitText: isReturn ? '确认归还' : '确定出库'}
      }}
      formRef={formRef}
      params={{id: initialValues.id}}
      request={async (params) => {
        const res = await detail(params)
        if (res?.code == pubConfig.sCode) {
          if (res.data) {
            const tempList = res.data.detailList
            goodsListSet(tempList)
            if (isReturn) {
              goodsListSet(tempList.map((item: any) => ({...item, returned_qty: item.qty})))
              editableKeysSet(tempList.map((item: any) => item.goods_sku_id))
            } else {
              editableKeysSet([])
            }
            return res.data
          } else {
            pubMsg('无法查到明细~')
            return {}
          }
        } else {
          pubMsg(res?.message)
          return {}
        }
      }}
      onFinish={async ({remarks}) => {
        if (isReturn) {
          return pubModal('确认归还', '确认操作').then(async () => {
            const res = await returned({
              id: initialValues.id,
              detailList: goodsList,
              remarks,
            })
            pubResponse(res, reload)
          })
        } else {
          return pubModal('确认出库并扣减库存', '确认操作').then(async () => {
            const res = await outbound({id: initialValues.id})
            pubResponse(res, reload)
          })
        }
      }}
      onFinishFailed={() => {
        pubMsg('未正确或未完整填写, 无法提交, 请检查~')
      }}
    >
      <ProForm.Item>
        <EditableProTable
          headerTitle={'出库商品明细'}
          rowKey={'goods_sku_id'}
          editableFormRef={editorFormRef}
          defaultSize={'small'}
          bordered
          style={{width: '100%'}}
          cardProps={{bodyStyle: {padding: 0}}}
          scroll={{
            x: 600,
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
            {title: isReturn ? '借出数量' : '数量', dataIndex: 'qty', editable: false, align: 'center'},
            {
              title: `归还数量`,
              dataIndex: 'returned_qty',
              hideInTable: !isReturn,
              width: 110,
              valueType: 'digit',
              fieldProps: (form, {entry}: any) => {
                return {
                  precision: 0,
                  max: entry.qty,
                }
              },
            },
          ]}/>
      </ProForm.Item>
      <ProFormTextArea label={'备注'} name={'remarks'} fieldProps={{maxLength: 200}}/>
    </ModalForm>
  );
};
export default Component;

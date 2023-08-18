import { Button, Modal, Radio, Space, Row, Col } from 'antd';
import { ProFormInstance, ProFormTextArea } from '@ant-design/pro-form';
import { ModalForm, ProFormSelect, ProFormDigit, ProFormDatePicker, ProFormRadio } from '@ant-design/pro-form';
import { useRef, useState } from 'react';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { insert, update, batchShelvesCycle } from '@/services/pages/stockUpIn/rate';
import { pubGetPlatformList } from '@/utils/pubConfirm';
import './index.less'
// 新增/修改汇率

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  selectedRowKeys: any;
  selectedRowKeysSet: any
}> = ({ title, trigger, reload, selectedRowKeys, selectedRowKeysSet }) => {
  const formRef = useRef<ProFormInstance>();
  return (
    <ModalForm
      title='批量修改上架周期'
      trigger={trigger || <Button type="primary" disabled={selectedRowKeys?.length == 0}>批量修改上架周期</Button>} 
      labelAlign="right"
      labelCol={{ flex: '0 0 100px' }}
      layout="horizontal"
      width={500}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        console.log(selectedRowKeys, 'hello')
        console.log(values, '提交')
        let _parm = selectedRowKeys.map((id:any) => {
            return {
                id,
                ...values
            }
        })
        const res = await batchShelvesCycle(_parm);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '操作成功', 'success');
        reload();
        selectedRowKeysSet([]);
        return true;
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
    >
      <p style={{'padding': 'padding: 0 0 10px 33px;', 'color': '#999'}}>提示：当前操作不可撤销，确定需要变更则在填写原因后提交数据；不变更则直接取消；</p>
      <ProFormDigit
        colProps={{ span: 24 }}
        name="shelves_cycle"
        label="上架周期"
        fieldProps={{
          precision: 0,
        }}
        rules={[pubRequiredRule]}
      />

    <ProFormTextArea
        colProps={{ span: 24 }}
        name="remarks"
        label="变更原因"
        fieldProps={{ maxLength: 200 }}
        rules={[pubRequiredRule]}
      />
    
    </ModalForm>
  );
};
export default Component;

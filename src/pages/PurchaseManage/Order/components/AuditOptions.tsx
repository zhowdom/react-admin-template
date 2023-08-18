import { useState, useRef } from 'react';
import { Button, Modal, Spin } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import {
  refuse,
  nullify,
  withdraw,
  cancelWithdraw,
  cancelSubmit,
} from '@/services/pages/purchaseOrder';
import { pubConfig, pubMsg, pubAlert } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const { type, ids, title, selectData, reload, approval_status, isOptions } = props; // isOptions是否批量操作
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const formRef = useRef<ProFormInstance>();
  const open = () => {
    if (ids.length) {
      setTimeout(() => {
        formRef?.current?.setFieldsValue({ id: ids.join(',') });
      }, 200);
    }
    if (isOptions) {
      if (selectData.every((item: any) => approval_status.includes(item.approval_status))) {
        setIsModalVisible(true);
      } else {
        switch (type) {
          case 'refuse': //refuse-审核不通过  approval_status 2
            pubAlert('只有待审核状态才可以审核,请重新选择采购单！');
            break;
          case 'nullify': //nullify-作废  approval_status 1,7,4
            pubAlert('只有新建、已撤回、审核不通过状态才可以作废,请重新选择采购单！');
            break;
          case 'withdraw': //withdraw-从供应商撤回  approval_status 5,8
            pubAlert('只有待签约、已签约状态才可以从供应商撤回,请重新选择采购单！');
            break;
          case 'cancelWithdraw': //cancelWithdraw-取消从供应商撤回  approval_status 6
            pubAlert('只有撤回中状态才可以取消从供应商撤回,请重新选择采购单！');
            break;
          case 'cancelSubmit': //cancelSubmit-撤回提交审核   approval_status 2
            pubAlert('只有待审核状态才可以撤回提交审核,请重新选择采购单！');
            break;
        }
      }
    } else {
      setIsModalVisible(true);
    }
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val?: any) => {
    setIsModalVisible(false);
    if (val) reload();
  };
  // 提交
  const saveSubmit = async (val: any) => {
    setLoading(true);
    let res: any;
    if (type == 'refuse') {
      //refuse-审核不通过
      res = await refuse(val);
    } else if (type == 'nullify') {
      //nullify-作废
      res = await nullify(val);
    } else if (type == 'withdraw') {
      //withdraw-从供应商撤回
      res = await withdraw(val);
    } else if (type == 'cancelWithdraw') {
      //cancelWithdraw-取消从供应商撤回
      res = await cancelWithdraw(val);
    } else if (type == 'cancelSubmit') {
      //cancelSubmit-撤回提交审核
      res = await cancelSubmit(val);
    }
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功！', 'success');
      modalClose(true);
    }
    setLoading(false);
  };

  return (
    <>
      {isOptions ? (
        <Button disabled={!ids?.length} onClick={() => open()}>
          {title}
        </Button>
      ) : (
        <Button onClick={() => open()}>{title}</Button>
      )}
      <Modal
        width={600}
        title={title}
        visible={isModalVisible}
        onOk={modalOk}
        onCancel={() => modalClose()}
        destroyOnClose
        maskClosable={false}
        confirmLoading={loading}
      >
        <Spin spinning={loading}>
          <ProForm
            formRef={formRef}
            onFinish={async (values) => {
              saveSubmit(values);
            }}
            labelAlign="right"
            labelWrap
            submitter={false}
            layout="horizontal"
          >
            <ProFormText name="id" label="ID" hidden />
            <ProFormTextArea
              name="remarks"
              label={`${title}原因`}
              placeholder="请输入原因"
              rules={[{ required: true, message: '请输入原因' }]}
            />
          </ProForm>
        </Spin>
      </Modal>
    </>
  );
};

export default Dialog;

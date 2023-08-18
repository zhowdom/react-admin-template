import { useState, useRef } from 'react';
import { Button, Modal, Spin } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { cancelWithdraw } from '@/services/pages/purchaseOrder';
import { pubConfig, pubMsg, pubAlert } from '@/utils/pubConfig';
import { refuse, withdraw, nullify } from '@/services/pages/updateOrder';

const Dialog = (props: any) => {
  const { type, ids, title, selectData, reload, approval_status, isBatch, ghost } = props; // isBatch是否批量操作
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const formRef = useRef<ProFormInstance>();
  const open = () => {
    console.log(ids);
    if (ids.length) {
      setTimeout(() => {
        formRef?.current?.setFieldsValue({ id: ids.join(',') });
      }, 200);
    }
    if (isBatch) {
      if (selectData.every((item: any) => approval_status.includes(item.approval_status))) {
        setIsModalVisible(true);
      } else {
        switch (type) {
          case 'refuse': //refuse-审核不通过  approval_status 2
            pubAlert('只有待审核状态才可以审核,请重新选择采购单！');
            break;
          case 'nullify': //nullify-作废  approval_status 1,7,4
            pubAlert('只有待审核、审核通过,审核不通过状态才可以作废,请重新选择采购单！');
            break;
          case 'withdraw': //withdraw-从供应商撤回  approval_status 5,8
            pubAlert('只有待签约状态才可以从供应商撤回,请重新选择采购单！');
            break;
          case 'cancelWithdraw': //cancelWithdraw-取消从供应商撤回  approval_status 6
            pubAlert('只有撤回中状态才可以取消从供应商撤回,请重新选择采购单！');
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
      {isBatch ? (
        <Button disabled={!ids?.length} type="primary" ghost onClick={() => open()}>
          {title}
        </Button>
      ) : !ghost ? (
        <a onClick={() => open()} type="primary">
          {title}
        </a>
      ) : (
        <Button onClick={() => open()} type="primary" ghost>
          {title}
        </Button>
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

import { useState, useRef } from 'react';
import { Button, Modal, Spin } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { nullify, refuse, terminate, nullifyApproved } from '@/services/pages/deliveryPlan';
import { pubConfig, pubMsg, pubAlert } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const {
    type,
    ids,
    title,
    selectData,
    reload,
    approval_status,
    isOptions,
    platform_code,
    triggerBtn,
  } = props; // isOptions是否批量操作
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
            pubAlert('只有待审核状态才可以审核,请重新选择发货计划！');
            break;
          case 'nullify': //nullify-作废  approval_status 1,4
            pubAlert('只有新建、审核不通过状态才可以作废,请重新选择发货计划！');
            break;
          case 'nullifyApproved': //nullifyApproved-作废审核通过的  approval_status 3
            pubAlert('只能作废"审核通过"的计划, 请重新选择发货计划！');
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
    } else if (type == 'nullifyApproved') {
      // 作废 - 审核通过状态的操作计划
      res = await nullifyApproved(val);
    } else if (type == 'terminate') {
      //terminate-撤回
      res = await terminate(val);
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
      {isOptions || triggerBtn ? (
        <Button disabled={!ids?.length} onClick={() => open()}>
          {title}
        </Button>
      ) : (
        <a onClick={() => open()}>{title}</a>
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
              saveSubmit({ ...values, platform_code });
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

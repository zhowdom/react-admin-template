import { useRef, useState } from 'react';
import { Modal, Spin } from 'antd';
import ProForm, { ProFormInstance, ProFormText } from '@ant-design/pro-form';
import { pubMsg } from '@/utils/pubConfig';
import CryptoJS from 'crypto-js';
import { updatePassword } from '@/services/base';

const Dialog = (props: any) => {
  const [visible, setVisible] = useState(false); // 弹窗显示
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ProFormInstance>();
  const checkConfirm = (_: any, value: string) => {
    const promise = Promise;
    if (value && value !== formRef?.current?.getFieldValue('newPassword')) {
      return promise.reject('两次输入的密码不匹配!');
    }
    return promise.resolve();
  };
  props.changePassWordModel.current = {
    open: () => {
      setVisible(true);
    },
  };
  // 关闭
  const modalClose = () => {
    setVisible(false);
  };
  // 操作成功
  const modalSuccess = () => {
    setVisible(false);
  };

  const saveSubmit = async (postData: any) => {
    console.log(postData);
    setLoading(true);
    const newData = JSON.parse(JSON.stringify(postData));
    const cryptoKey = 'liyi99.23579abcd'

    newData.oldPassword = CryptoJS.AES.encrypt(
      newData.oldPassword,
      CryptoJS.enc.Utf8.parse(cryptoKey),
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 },
    ).toString();
    newData.newPassword = CryptoJS.AES.encrypt(
      newData.newPassword,
      CryptoJS.enc.Utf8.parse(cryptoKey),
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 },
    ).toString();
    delete newData.confirmNewPassword;

    const res: any = await updatePassword(newData);
    if (res?.code != '0') {
      pubMsg(res?.message);
    } else {
      pubMsg('修改成功', 'success');
      modalSuccess();
    }
    setLoading(false);
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  return (
    <Modal
      width={500}
      title="修改密码"
      open={visible}
      onOk={modalOk}
      onCancel={() => modalClose()}
      destroyOnClose
      maskClosable={false}
      className="transfer-modal"
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          labelAlign="right"
          submitter={false}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 10 }}
          layout="horizontal"
        >
          <ProFormText
            name="oldPassword"
            label="原密码"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            placeholder="请输入原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          />
          <ProFormText
            name="newPassword"
            label="新密码"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            placeholder="请输入新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          />
          <ProFormText
            name="confirmNewPassword"
            label="确认新密码"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            placeholder="请确认新密码"
            rules={[{ required: true, message: '请确认新密码' }, { validator: checkConfirm }]}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};
export default Dialog;

import { useRef, useState } from 'react';
import { Modal, Spin } from 'antd';
import { useModel } from 'umi';
import ProForm, { ProFormInstance, ProFormText } from '@ant-design/pro-form';
import { pubMsg } from '@/utils/pubConfig';
import { updateOneself } from '@/services/base';

const Dialog = (props: any) => {
  const [visible, setVisible] = useState(false); // 弹窗显示
  const [loading, setLoading] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const formRef = useRef<ProFormInstance>();
  props.changeNickModel.current = {
    open: () => {
      setVisible(true);
      console.log(initialState?.currentUser);
      setTimeout(() => {
        formRef?.current?.setFieldsValue({
          id: initialState?.currentUser?.id,
          nickName: initialState?.currentUser?.nickName,
        });
      }, 200);
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
    const res: any = await updateOneself(newData);
    if (res?.code != '0') {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功', 'success');
      setInitialState((s: any) => {
        console.log(s);
        return {
          ...s,
          currentUser: {
            ...s.currentUser,
            nickName: newData.nickName,
          },
        };
      });
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
      title="修改昵称"
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
          <ProFormText name="id" label="ID" hidden />
          <ProFormText
            name="nickName"
            label="昵称"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            placeholder="请输入昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};
export default Dialog;

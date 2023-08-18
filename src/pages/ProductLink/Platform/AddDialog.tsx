import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import { connect } from 'umi';
import ProForm, { ProFormInstance, ProFormText, ProFormSelect } from '@ant-design/pro-form';
import {
  addSysPlatform,
  getSysPlatformById,
  updateSysPlatform,
} from '@/services/pages/storageManage';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const { common } = props;
  console.log(common);
  const [modalType, setModalType] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ProFormInstance>();

  // 获取ID详情
  const getDetail = async (id: any): Promise<any> => {
    const paramData = {
      id: id,
    };
    const res = await getSysPlatformById(paramData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      formRef.current?.setFieldsValue(res.data);
    }
  };

  props.addModel.current = {
    open: (id: any) => {
      setIsModalVisible(true);
      setModalType(id ? 'edit' : 'add');
      if (id) {
        getDetail(id);
      }
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    if (!val) props.handleClose(true);
  };
  // 提交
  const saveSubmit = async (data: any): Promise<any> => {
    if (modalType == 'add') {
      setLoading(true);
      const res = await addSysPlatform(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('添加成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    } else {
      setLoading(true);
      const res = await updateSysPlatform(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('编辑成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    }
  };
  return (
    <Modal
      width={500}
      title={modalType == 'add' ? '新增平台' : '编辑平台'}
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
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
          onFinishFailed={(v) => {
            console.log(v);
          }}
          labelAlign="right"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          submitter={false}
          layout="horizontal"
        >
          <ProFormText name="id" label="ID" hidden />
          <ProFormText name="name" label="name" hidden />
          <ProFormSelect
            name="code"
            label="平台名称"
            rules={[{ required: true, message: '请选择平台' }]}
            valueEnum={common.dicList.SYS_PLATFORM_NAME}
            fieldProps={{
              onChange: (v, option: any) => {
                formRef.current?.setFieldsValue({ name: option?.label });
              },
            }}
          />
          <ProFormSelect
            name="business_scope"
            label="业务范畴"
            rules={[{ required: true, message: '请选择类型' }]}
            valueEnum={common.dicList.SYS_BUSINESS_SCOPE}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

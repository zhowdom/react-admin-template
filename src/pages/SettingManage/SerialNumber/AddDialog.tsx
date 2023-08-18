import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import { connect } from 'umi';
import ProForm, { ProFormDigit, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import {
  sysSerialFindById,
  sysSerialInsert,
  sysSerialUpdateById,
} from '@/services/pages/settinsSerialNumber';

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
    const res = await sysSerialFindById(paramData);
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
      const res = await sysSerialInsert(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('添加成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    } else {
      setLoading(true);
      const res = await sysSerialUpdateById(data);
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
      width={600}
      title={modalType == 'add' ? '新增序列号' : '编辑序列号'}
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
          submitter={false}
        >
          <ProFormText name="id" label="ID" hidden />
          <ProFormText
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          />
          <ProFormText
            name="serial_code"
            label="序列号编码"
            rules={[{ required: true, message: '请输入序列号编码' }]}
          />
          <ProFormDigit
            name="current_value"
            label="当前值"
            rules={[{ required: true, message: '请输入当前值' }]}
          />
          <ProFormDigit
            name="max_value"
            label="最大值"
            rules={[{ required: true, message: '请输入最大值' }]}
          />
          <ProFormDigit
            name="step_value"
            label="增长大小"
            rules={[{ required: true, message: '请输入增长大小' }]}
          />
          <ProFormText name="template" label="模板" />
          <ProFormText name="template_value" label="模板值" />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

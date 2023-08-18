import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import { connect } from 'umi';
import ProForm, { ProFormInstance, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import {
  sysVariableFindById,
  sysVariableInsert,
  sysVariableUpdateById,
} from '@/services/pages/settinsSysVariable';
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
    const res = await sysVariableFindById(paramData);
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
      const res = await sysVariableInsert(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('添加成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    } else {
      setLoading(true);
      const res = await sysVariableUpdateById(data);
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
      title={modalType == 'add' ? '新增变量' : '编辑变量'}
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
            name="variable_name"
            label="变量名称(variable_name)"
            rules={[{ required: true, message: '请输入变量名称' }]}
          />
          <ProFormText
            name="variable_code"
            label="变量CODE(variable_code)"
            rules={[{ required: true, message: '请输入变量CODE' }]}
          />
          <ProFormTextArea
            name="variable_value"
            label="变量值(variable_value)"
            rules={[{ required: true, message: '请输入变量值' }]}
          />
          <ProFormTextArea name="remarks" label="备注" placeholder="备注" />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

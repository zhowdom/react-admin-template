import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import { connect } from 'umi';
import ProForm, {
  ProFormInstance,
  ProFormText,
  ProFormRadio,
  ProFormTextArea,
  ProFormCascader,
} from '@ant-design/pro-form';
import { addSysPort, getSysPortById, updateSysPort } from '@/services/pages/storageManage';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const { common } = props;
  const [modalType, setModalType] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ProFormInstance>();

  // 获取ID详情
  const getDetail = async (id: any): Promise<any> => {
    const paramData = {
      id: id,
    };
    const res = await getSysPortById(paramData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const newData = res.data ? JSON.parse(JSON.stringify(res.data)) : null;
      newData.status = newData.status + '';
      newData.citys = [newData.province_id, newData.city_id];
      formRef.current?.setFieldsValue(newData);
    }
  };

  props.addModel.current = {
    open: (id: any) => {
      setIsModalVisible(true);
      setModalType(id ? 'edit' : 'add');
      if (id) {
        getDetail(id);
      } else {
        setTimeout(() => {
          formRef.current?.setFieldsValue({ status: '1' });
        }, 1);
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
      const res = await addSysPort(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('添加成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    } else {
      setLoading(true);
      const res = await updateSysPort(data);
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
      title={modalType == 'add' ? '新增跨境起运港仓库' : '编辑跨境起运港仓库'}
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
          onFinish={async (values: any) => {
            saveSubmit({ ...values, type: 1 });
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
          <ProFormText
            name="name"
            label="跨境起运港仓库"
            rules={[{ required: true, message: '请输入跨境起运港仓库' }]}
          />
          <>
            <ProFormText name="type" label="类型" hidden initialValue={0} />
            <ProFormText name="province_id" hidden />
            <ProFormText name="province_name" hidden />
            <ProFormText name="city_id" hidden />
            <ProFormText name="city_name" hidden />
            <ProFormCascader
              name="citys"
              label="省(州、区) / 城市"
              placeholder="请选择"
              rules={[{ required: true, message: '请选择城市' }]}
              fieldProps={{
                options: common.cityData2,
                onChange: (v: any, values: any[]) => {
                  console.log(v);
                  console.log(values);
                  formRef.current?.setFieldsValue({
                    province_id: values[0]?.value,
                    province_name: values[0]?.label,
                    city_id: values[1]?.value,
                    city_name: values[1]?.label,
                  });
                },
              }}
            />
          </>

          <ProFormTextArea
            name="address"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          />
          <ProFormRadio.Group
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
            valueEnum={common.dicList.SYS_ENABLE_STATUS}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

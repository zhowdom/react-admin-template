import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
// import { Row, Col, Button } from 'antd';
import ProForm, {
  ProFormInstance,
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-form';
import {
  addLinkManagementTest,
  findByIdLinkManagementTest,
  updateByIdLinkManagementTest,
} from '@/services/pages/settinsLinksManage';
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
    const res = await findByIdLinkManagementTest(paramData);
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
      const res = await addLinkManagementTest(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('添加成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    } else {
      console.log(456);
      setLoading(true);
      const res = await updateByIdLinkManagementTest(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('编辑成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    }
  };

  // // 检查
  // const checkRaw = () => {
  //   const newData = formRef?.current?.getFieldsValue();
  //   console.log(newData?.raw_data)
  // };

  return (
    <Modal
      width={900}
      title={modalType == 'add' ? '新增链接' : '编辑链接'}
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
            console.log(123);
            saveSubmit(values);
          }}
          onFinishFailed={(v) => {
            console.log(v);
          }}
          labelAlign="right"
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 10 }}
          submitter={false}
          layout="horizontal"
        >
          <ProFormText name="id" label="ID" hidden />
          <ProFormSelect
            name="platform_code"
            label="平台类型"
            rules={[{ required: true, message: '请选择平台类型' }]}
            valueEnum={props?.dicList.SYS_PLATFORM_NAME}
            showSearch
            debounceTime={300}
            fieldProps={{
              filterOption: (input: any, option: any) => {
                const trimInput = input.replace(/^\s+|\s+$/g, '');
                if (trimInput) {
                  return option.label.indexOf(trimInput) >= 0;
                } else {
                  return true;
                }
              },
            }}
          />
          <ProFormText
            name="link_id"
            label="链接ID"
            rules={[{ required: true, message: '请输入链接ID' }]}
          />
          <ProFormText name="shop_sku_code" label="店铺SKU" />
          <ProFormTextArea
            name="raw_data"
            label="内容"
            placeholder="要输入转译后的"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            fieldProps={{
              style: { minHeight: 300 },
            }}
          />
          {/* <Row >
            <Col span={3} />
            <Col span={10}>
              <Button type='primary' onClick={checkRaw}>检查</Button>
            </Col>
          </Row> */}
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default Dialog;

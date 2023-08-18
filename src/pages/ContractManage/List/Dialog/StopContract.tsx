import { useState, useRef } from 'react';
import { Modal, Form, Spin } from 'antd';
import { connect } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { terminationContract } from '@/services/pages/contract';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import UploadFileList from '@/components/PubUpload/UploadFileList';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const formRef = useRef<ProFormInstance>();

  props.stopContractModel.current = {
    open: (data?: any) => {
      setIsModalVisible(true);
      if (data) {
        setTimeout(() => {
          formRef.current?.setFieldsValue({ id: data.id });
        }, 100);
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
  const saveSubmit = async (val: any) => {
    const newData = JSON.parse(JSON.stringify(val));
    setLoading(true);
    const res = await terminationContract(newData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('终止合同成功!', 'success');
      modalClose(false);
    }
    setLoading(false);
  };
  // 上传结束后
  const handleUpload = async (data: any) => {
    console.log(data);
    formRef.current?.setFieldsValue({ finish_sys_files: data });
  };
  return (
    <Modal
      width={800}
      title="终止合同"
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
          labelAlign="right"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
          submitter={false}
          layout="horizontal"
        >
          <ProFormText name="id" hidden />
          <ProFormTextArea
            name="remark"
            label="合同终止原因"
            placeholder="合同终止原因"
            rules={[
              { required: true, message: '请输入合同终止原因' },
              { max: 400, message: '最多输入400字' },
            ]}
          />
          <Form.Item
            label="上传终止附件"
            name="finish_sys_files"
            rules={[{ required: true, message: '请上传终止附件' }]}
          >
            <>
              <UploadFileList
                fileBack={handleUpload}
                required
                businessType="VENDOR_CONTRACT"
                listType="picture"
                maxSize="5"
                maxCount="5"
              />
              <div>
                说明：由于合同的签约和终止都有发生法律纠纷的风险，所以终止合同时必须要上传具备法律效应的终止协议文件
              </div>
            </>
          </Form.Item>
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

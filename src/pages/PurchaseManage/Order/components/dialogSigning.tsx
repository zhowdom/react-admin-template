import { useRef, useState } from 'react';
import { Form, Spin, Modal } from 'antd';
import ProForm, { ProFormInstance } from '@ant-design/pro-form';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { uploadSignFile } from '@/services/pages/purchaseOrder';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { uploadContract } from '@/services/pages/updateOrder';

const Dialog = (props: any) => {
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const title = !props?.data?.isR
    ? props?.data?.approval_status == '5'
      ? '确认采购单已签约'
      : '重新上传签约采购单'
    : props?.data?.approval_status == '5'
    ? '上传线下签约合同-R'
    : '重新上传线下签约合同-R';

  // 提交
  const saveSubmit = async (data: any): Promise<any> => {
    data.id = props?.data.id;
    const res = props.change
      ? await uploadContract({ id: data.id, contract: data?.sys_files })
      : await uploadSignFile(data);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功', 'success');
      props.handleClose(true);
    }
    setLoading(false);
  };
  // 上传结束后
  const handleUpload = async (data: any) => {
    formRef.current?.setFieldsValue({ sys_files: data });
  };
  return (
    <Modal
      onOk={() => {
        formRef?.current?.submit();
      }}
      width={500}
      title={title}
      visible={props.isModalVisible}
      onCancel={() => props.handleClose()}
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
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 10 }}
          submitter={false}
          layout="horizontal"
        >
          <Form.Item
            label="上传已签约采购单"
            name="sys_files"
            rules={[{ required: true, message: '请上传已签约采购单' }]}
            extra="只支持.pdf格式"
          >
            <UploadFileList
              fileBack={handleUpload}
              required
              businessType="PURCHASE_ORDER_UPLOAD_SIGN_FILE"
              accept={['.pdf']}
              acceptType={['pdf']}
              // defaultFileList={detailData.sys_files || []}
              maxSize="5"
              maxCount="1"
            />
          </Form.Item>
        </ProForm>
      </Spin>
    </Modal>
  );
};
export default Dialog;

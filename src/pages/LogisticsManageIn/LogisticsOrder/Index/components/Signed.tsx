import { Button, Form, Modal } from 'antd';
import { ModalForm, ProFormDatePicker, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import './index.less';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { signed } from '@/services/pages/logisticsManageIn/logisticsOrder';
import moment from 'moment';

export default (props: any) => {
  const { initialValues, disabled } = props;
  const formRef = useRef<ProFormInstance>();
  const [visible, visibleSet] = useState<boolean>(false);
  const [submitting, submittingSet] = useState<any>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postData, setPostData] = useState<any>({});
  // 二次确认确定
  const handleOk = async () => {
    submittingSet(true);
    const res: any = await signed({
      ...postData,
      pod_date: moment(postData.pod_date).format('YYYY-MM-DD 00:00:00'),
    });
    submittingSet(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功!', 'success');
      props.reload();
      visibleSet(false);
      setIsModalOpen(false);
    }
  };
  // 二次确认弹窗关闭
  const handleCancel = () => {
    setIsModalOpen(false);
    submittingSet(false);
  };
  const handleUpload = (info: any) => {
    formRef?.current?.setFieldsValue({
      pod_files: info,
    });
  };
  return (
    <>
      <ModalForm<{
        name: string;
        company: string;
      }>
        title={'已签收'}
        formRef={formRef}
        trigger={
          initialValues ? (
            <a onClick={() => visibleSet(true)}> {props.trigger}</a>
          ) : (
            <Button ghost type="primary" onClick={() => visibleSet(true)} disabled={disabled}>
              {props.trigger}
            </Button>
          )
        }
        visible={visible}
        className="length210"
        labelAlign="right"
        labelCol={{ flex: '130px' }}
        layout="horizontal"
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          onCancel: () => visibleSet(false),
          confirmLoading: submitting,
          okText: '确定已签收',
        }}
        initialValues={initialValues}
        width={520}
        onFinish={async (values: any) => {
          setPostData(values);
          setIsModalOpen(true);
        }}
      >
        <ProFormText name="id" label="id" hidden />
        <ProFormDatePicker name="actual_warehouse_date" label="实际入仓时间" hidden />
        <ProFormDatePicker
          name="pod_date"
          rules={[
            { required: true, message: '请选择POD提供时间' },
            ({ getFieldValue }: any) => ({
              validator(_: any, value: any) {
                if (
                  !value ||
                  new Date(getFieldValue('actual_warehouse_date')).getTime() <=
                    new Date(value.format('YYYY-MM-DD 00:00:00')).getTime()
                ) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('不可以早于实际入仓时间'));
              },
            }),
          ]}
          placeholder={'请选择POD提供时间'}
          label="POD提供时间"
        />
        <Form.Item
          label="上传签收证明"
          name="pod_files"
          className="files"
          extra="支持PDF、JPG、JPEG、PNG文件格式"
          rules={[{ required: true, message: '请上传签收证明' }]}
        >
          <UploadFileList
            fileBack={handleUpload}
            required
            businessType="LOGISTICS"
            listType="picture-card"
            defaultFileList={initialValues?.pod_files}
            accept={['.png,.jpg,.pdf,.jpeg']}
            acceptType={['png', 'jpg', 'jpeg', 'pdf']}
          />
        </Form.Item>
      </ModalForm>
      <Modal
        className="common-confirm-modal"
        title={<div style={{ fontWeight: 600 }}>确定已签收吗?</div>}
        open={isModalOpen}
        onOk={handleOk}
        width={420}
        onCancel={handleCancel}
        destroyOnClose
        okButtonProps={{ loading: submitting }}
      >
        <Form name="basic" labelCol={{ span: 8 }}>
          <Form.Item label="POD提供时间">{postData?.pod_date ?? '-'}</Form.Item>
        </Form>
        <Form.Item
          label="签收证明"
          name="pod_files"
          className="pod_files"
          style={{ marginLeft: '60px' }}
        >
          <UploadFileList
            fileBack={handleUpload}
            required
            disabled
            businessType="VENDOR_ACCOUNT_PROOF"
            listType="picture-card"
            defaultFileList={postData?.pod_files}
            accept={['.png,.jpg,.pdf,.jpeg']}
            acceptType={['png', 'jpg', 'jpeg', 'pdf']}
          />
        </Form.Item>
      </Modal>
    </>
  );
};

import { Form } from 'antd';
import { ModalForm, ProFormDatePicker, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import './index.less';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { confirmSigned } from '@/services/pages/logisticsManageIn/logisticsOrder';
import moment from 'moment';

export default (props: any) => {
  const { initialValues, reload } = props;
  const formRef = useRef<ProFormInstance>();
  const [submitting, submittingSet] = useState<any>(false);
  // 提交
  const handleOk = async (postData: any) => {
    submittingSet(true);
    const res: any = await confirmSigned({
      ...postData,
      pod_date: moment(postData.pod_date).format('YYYY-MM-DD 00:00:00'),
    });
    submittingSet(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return false;
    } else {
      pubMsg('操作成功!', 'success');
      reload();
      return true;
    }
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
        title={'修改签收证明'}
        formRef={formRef}
        trigger={<a> 修改签收证明</a>}
        className="length210"
        labelAlign="right"
        labelCol={{ flex: '130px' }}
        layout="horizontal"
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          confirmLoading: submitting,
        }}
        initialValues={initialValues}
        width={520}
        onFinish={async (values: any) => {
          return handleOk(values);
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
                    new Date(value).getTime()
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
    </>
  );
};

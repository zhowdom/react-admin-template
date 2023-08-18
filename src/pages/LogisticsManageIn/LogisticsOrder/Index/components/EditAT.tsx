import { ModalForm, ProFormDatePicker, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import './index.less';
import { updateLogisticsOrderTime } from '@/services/pages/logisticsManageIn/logisticsOrder';
import moment from 'moment';
import { Form } from 'antd';
import UploadFileList from '@/components/PubUpload/UploadFileList';

export default (props: any) => {
  const { initialValues, visible, onColse } = props;
  const formRef = useRef<ProFormInstance>();
  const [submitting, submittingSet] = useState<any>(false);
  const handleUpload = (info: any) => {
    formRef?.current?.setFieldsValue({
      pod_files: info,
    });
  };
  return (
    <ModalForm
      title={'修改实际时间'}
      formRef={formRef}
      open={visible}
      className="length210"
      labelAlign="right"
      labelCol={{ flex: '180px' }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        onCancel: () => onColse(false),
        confirmLoading: submitting,
      }}
      initialValues={initialValues}
      width={480}
      onFinish={async (values: any) => {
        submittingSet(true);
        const postData = {
          id: values?.id,
          delivery_date: values?.delivery_date ?? null,
          atd_date: values?.atd_date ?? null,
          ata_date: values?.ata_date ?? null,
          actual_warehouse_date: values?.actual_warehouse_date ?? null,
          pod_date: values?.pod_date ?? null,
          pod_files: values?.pod_files ?? null,
        };
        Object.entries(values).forEach(([key, value]: any) => {
          if (!['pod_files', 'id'].includes(key) && value.indexOf('00:00:00') == -1) {
            postData[key] = moment(postData[key]).format('YYYY-MM-DD 00:00:00');
          }
        });
        const res: any = await updateLogisticsOrderTime(postData);
        submittingSet(false);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功!', 'success');
          onColse(true);
          return true;
        }
      }}
    >
      <ProFormText name="id" label="id" hidden />
      <ProFormDatePicker
        name="delivery_date"
        rules={[{ required: true, message: '请选择实际出厂/发货/装柜时间' }]}
        label="实际出厂/发货/装柜时间"
      />
      {initialValues.status > 2 && (
        <ProFormDatePicker
          name="atd_date"
          dependencies={['delivery_date']}
          rules={[
            { required: true, message: '请选择实际开船时间ATD' },
            ({ getFieldValue }: any) => ({
              validator(_: any, value: any) {
                if (
                  !value ||
                  new Date(getFieldValue('delivery_date')).getTime() <= new Date(value).getTime()
                ) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('应大于等于实际出厂/发货/装柜时间'));
              },
            }),
          ]}
          placeholder={'请选择实际开船时间ATD'}
          label="实际开船时间ATD"
        />
      )}
      {initialValues.status > 3 && (
        <ProFormDatePicker
          name="ata_date"
          rules={[
            { required: true, message: '请选择实际到港时间ATA' },
            ({ getFieldValue }: any) => ({
              validator(_: any, value: any) {
                if (
                  !value ||
                  new Date(getFieldValue('atd_date')).getTime() < new Date(value).getTime()
                ) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('不可以早于实际开船时间'));
              },
            }),
          ]}
          placeholder={'请选择实际到港时间ATA'}
          label="实际到港时间ATA"
        />
      )}
      {initialValues.status > 4 && (
        <ProFormDatePicker
          name="actual_warehouse_date"
          dependencies={['ata_date']}
          fieldProps={{
            disabledDate: (current: any) => current && current > moment(),
          }}
          rules={[
            { required: true, message: '请选择实际入仓时间' },
            ({ getFieldValue }: any) => ({
              validator(_: any, value: any) {
                if (
                  !value ||
                  new Date(getFieldValue('ata_date')).getTime() < new Date(value).getTime()
                ) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('应大于实际到港时间'));
              },
            }),
          ]}
          placeholder={'请选择实际入仓时间'}
          label="实际入仓时间"
        />
      )}
      {initialValues.status > 5 && (
        <>
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
        </>
      )}
    </ModalForm>
  );
};

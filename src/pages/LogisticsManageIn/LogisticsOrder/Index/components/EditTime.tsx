import { ModalForm, ProFormDatePicker, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import './index.less';
import { updateEstimateTime } from '@/services/pages/logisticsManageIn/logisticsOrder';
import moment from 'moment';
import { Form } from 'antd';

export default (props: any) => {
  const { initialValues, visible, onColse } = props;
  const formRef = useRef<ProFormInstance>();
  const [submitting, submittingSet] = useState<any>(false);
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={'修改预计时间'}
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
        const postData: any = {
          id: values?.id,
        };
        if (initialValues?.status == '2') {
          postData.platform_appointment_time = values?.platform_appointment_time
            ? moment(values.platform_appointment_time).format('YYYY-MM-DD 00:00:00')
            : '';
          postData.estimate_time = values?.etd_date
            ? moment(values.etd_date).format('YYYY-MM-DD 00:00:00')
            : '';
        }
        if (initialValues?.status == '3') {
          postData.platform_appointment_time = values?.platform_appointment_time
            ? moment(values.platform_appointment_time).format('YYYY-MM-DD 00:00:00')
            : '';
          postData.estimate_time = values?.eta_date
            ? moment(values.eta_date).format('YYYY-MM-DD 00:00:00')
            : '';
        }
        if (initialValues?.status == '4') {
          postData.platform_appointment_time = values?.platform_appointment_time
            ? moment(values.platform_appointment_time).format('YYYY-MM-DD 00:00:00')
            : '';
        }
        const res: any = await updateEstimateTime(postData);
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
      {initialValues?.status == '2' ? (
        <>
          <Form.Item label="实际出厂/发货/装柜时间">
            {moment(initialValues.delivery_date).format('YYYY-MM-DD')}
          </Form.Item>
          <ProFormDatePicker
            name="etd_date"
            rules={[
              { required: true, message: '请选择预计开船时间ETD' },
              ({ getFieldValue }: any) => ({
                validator(_: any, value: any) {
                  console.log(getFieldValue('delivery_date'));
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
            placeholder={'请选择预计开船时间ETD'}
            label="预计开船时间ETD"
          />
          <ProFormDatePicker
            label={'预计入仓时间'}
            name={'platform_appointment_time'}
            dependencies={['etd_date']}
            rules={[
              { required: true, message: '请选择预计入仓时间' },
              ({ getFieldValue }: any) => ({
                validator(_: any, value: any) {
                  if (
                    !value ||
                    new Date(getFieldValue('etd_date')).getTime() <= new Date(value).getTime()
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('应大于等于预计开船时间ETD'));
                },
              }),
            ]}
          />
        </>
      ) : (
        ''
      )}

      {initialValues?.status == '3' ? (
        <>
          <Form.Item label="实际开船时间ATD">
            {moment(initialValues.atd_date).format('YYYY-MM-DD')}
          </Form.Item>
          <ProFormDatePicker
            name="eta_date"
            rules={[
              { required: true, message: '请选择预计到港时间ETA' },
              ({ getFieldValue }: any) => ({
                validator(_: any, value: any) {
                  console.log(getFieldValue('atd_date'));
                  if (
                    !value ||
                    new Date(getFieldValue('atd_date')).getTime() <= new Date(value).getTime()
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('应大于等于实际开船时间ATD'));
                },
              }),
            ]}
            placeholder={'请选择预计到港时间ETA'}
            label="预计到港时间ETA"
          />
          <ProFormDatePicker
            label={'预计入仓时间'}
            name={'platform_appointment_time'}
            dependencies={['eta_date']}
            rules={[
              { required: true, message: '请选择预计入仓时间' },
              ({ getFieldValue }: any) => ({
                validator(_: any, value: any) {
                  if (
                    !value ||
                    new Date(getFieldValue('eta_date')).getTime() <= new Date(value).getTime()
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('应大于等于预计到港时间ETA'));
                },
              }),
            ]}
          />
        </>
      ) : (
        ''
      )}

      {initialValues?.status == '4' ? (
        <>
          <Form.Item label="实际到港时间ATA">
            {moment(initialValues.ata_date).format('YYYY-MM-DD')}
          </Form.Item>
          <ProFormDatePicker
            label={'预计入仓时间'}
            name={'platform_appointment_time'}
            dependencies={['ata_date']}
            rules={[
              { required: true, message: '请选择预计入仓时间' },
              ({ getFieldValue }: any) => ({
                validator(_: any, value: any) {
                  if (
                    !value ||
                    new Date(getFieldValue('ata_date')).getTime() <= new Date(value).getTime()
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('应大于等于实际到港时间ATA'));
                },
              }),
            ]}
          />
        </>
      ) : (
        ''
      )}
    </ModalForm>
  );
};

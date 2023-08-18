import { ModalForm, ProFormText,ProFormDatePicker } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef } from 'react';
import * as api from '@/services/pages/stockManager';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import moment from 'moment';

// 修改预约信息弹框
const AppointmentModal: React.FC<{
  dataSource: any;
  tableKeySet: any;
  reload: any;
}> = ({ dataSource, tableKeySet, reload }) => {
  const appointmentFormRef = useRef<ProFormInstance>(); // 修改预约信息
  const rulesRequired: any = { required: true, message: '必填' };
  return (
    <ModalForm
      formRef={appointmentFormRef}
      title="修改预约信息"
      trigger={<a type={'link'}>{'修改预约信息'}</a>}
      initialValues={{
        platform_appointment_order_no: dataSource?.platform_appointment_order_no,
        platform_warehousing_order_no: dataSource?.platform_warehousing_order_no,
        platform_appointment_time: dataSource?.platform_appointment_time,
      }}
      width={500}
      layout="horizontal"
      labelAlign="right"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 14 }}
      onFinish={async (values: any) => {
        const res = await api.updatePlatformWarehousing({ ...values, id: dataSource.id });
        if (res.code == pubConfig.sCode) {
          pubMsg(res?.message, 'success');
          tableKeySet(Date.now());
          if (typeof reload === 'function') reload();
          return true;
        } else {
          pubMsg(`提交失败: ${res.message}`);
          return false;
        }
      }}
      onOpenChange={async (visible: boolean) => {
        if (!visible) {
          appointmentFormRef?.current?.resetFields();
        }
      }}
    >
      <ProFormText
        name={'platform_appointment_order_no'}
        label={'平台预约单号'}
        rules={[rulesRequired]}
      />
      <ProFormText
        name={'platform_warehousing_order_no'}
        label={'平台入库单号'}
        rules={[rulesRequired]}
      />
      <ProFormDatePicker
        label="预计平台入库时间"
        name={'platform_appointment_time'}
        rules={[rulesRequired]}
      />
    </ModalForm>
  );
};
export default AppointmentModal;

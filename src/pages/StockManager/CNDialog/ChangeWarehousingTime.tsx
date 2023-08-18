import { ModalForm, ProFormDatePicker } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import * as api from '@/services/pages/stockManager';
import { pubAlert, pubConfig, pubMsg } from '@/utils/pubConfig';

// 修改预计入库时间弹框
const ChangeWarehousingTime: React.FC<{
  disabled: any;
  selectedRowKeys: any;
  selectedRowData: any;
  reload: any;
}> = ({ disabled, selectedRowKeys, selectedRowData, reload }) => {
  const appointmentFormRef = useRef<ProFormInstance>(); // 修改预约信息
  const [visible, visibleSet] = useState<boolean>(false);
  const [submitting, submittingSet] = useState<any>(false);
  const rulesRequired: any = { required: true, message: '必填' };
  // 获取状态及数据统计
  const openModal = async () => {
    const allStatus = selectedRowData.filter((v: any) => v.approval_status == '1');
    console.log(allStatus);
    if (allStatus.length == selectedRowKeys.length) {
      visibleSet(true);
    } else {
      pubAlert('只有新建状态才可以填写预计入库时间！');
    }
  };
  return (
    <>
      <Button size={'small'} type="primary" disabled={disabled} onClick={() => openModal()}>
        批量填写预计入库时间
      </Button>
      <ModalForm
        formRef={appointmentFormRef}
        visible={visible}
        layout={'inline'}
        title="批量填写预计入库时间"
        width={500}
        modalProps={{
          destroyOnClose: true,
          confirmLoading: submitting,
          onCancel: () => visibleSet(false),
        }}
        onFinish={async (values: any) => {
          const order_nos = selectedRowData.map((v: any) => v.order_no);
          submittingSet(true);
          const res = await api.updatePlatformAppointmentTime({
            ...values,
            order_no_array: order_nos,
          });
          if (res.code == pubConfig.sCode) {
            pubMsg(res?.message, 'success');
            visibleSet(false);
            if (typeof reload === 'function') reload();
          } else {
            pubMsg(`提交失败: ${res.message}`);
          }
          submittingSet(false);
        }}
      >
        <ProFormDatePicker
          name="platform_appointment_time"
          label="预计入库时间"
          placeholder={'请选择预计入库时间'}
          rules={[rulesRequired]}
        />
      </ModalForm>
    </>
  );
};
export default ChangeWarehousingTime;

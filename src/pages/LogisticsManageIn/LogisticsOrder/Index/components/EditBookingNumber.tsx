import { ModalForm, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubRequiredLengthRule } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import './index.less';
import { updateBookingNumber } from '@/services/pages/logisticsManageIn/logisticsOrder';

export default (props: any) => {
  const { initialValues, visible, onColse } = props;
  const formRef = useRef<ProFormInstance>();
  const [submitting, submittingSet] = useState<any>(false);
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={'修改订舱号'}
      formRef={formRef}
      open={visible}
      className="length210"
      labelAlign="right"
      labelCol={{ span: 8 }}
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
        const postData = {
          ...values,
        };
        submittingSet(true);
        const res: any = await updateBookingNumber({
          ...postData,
        });
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
      <ProFormText
        name="booking_number"
        label="订舱号"
        rules={[
          { required: true, message: '请输入订舱号' },
          {
            validator: (_: any, value: any) => pubRequiredLengthRule(value, 30),
          },
        ]}
        placeholder={'请输入订舱号'}
      />
    </ModalForm>
  );
};

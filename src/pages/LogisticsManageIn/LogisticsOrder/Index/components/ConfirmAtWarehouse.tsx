import { ModalForm, ProFormDatePicker, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import './index.less';
import { confirmActualWarehouse } from '@/services/pages/logisticsManageIn/logisticsOrder';
import moment from 'moment';

export default (props: any) => {
  const { initialValues, reload } = props;
  const formRef = useRef<ProFormInstance>();
  const [submitting, submittingSet] = useState<any>(false);
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={'确认到仓时间'}
      formRef={formRef}
      className="length210"
      labelAlign="right"
      labelCol={{ span: 8 }}
      layout="horizontal"
      trigger={<a> 确认到仓时间</a>}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        confirmLoading: submitting,
      }}
      initialValues={initialValues}
      width={480}
      onFinish={async (values: any) => {
        const postData = {
          ...values,
        };
        submittingSet(true);
        const res: any = await confirmActualWarehouse({
          ...postData,
          actual_warehouse_date: moment(postData.actual_warehouse_date).format(
            'YYYY-MM-DD 00:00:00',
          ),
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
      }}
    >
      <ProFormText name="id" label="id" hidden />
      <ProFormDatePicker name="ata_date" label="实际到港时间" hidden />
      <div style={{ marginBottom: '20px', fontWeight: 'bold', marginLeft: '38px' }}>
        请确认实际入仓时间，修改确认之后，将不可更改
      </div>
      <ProFormDatePicker
        fieldProps={{
          disabledDate: (current: any) => current && current > moment(),
        }}
        name="actual_warehouse_date"
        dependencies={['ata_date']}
        rules={[
          { required: true, message: '请选择实际入仓时间' },
          ({ getFieldValue }: any) => ({
            validator(_: any, value: any) {
              console.log(typeof value)

              try {
                if (
                  !value ||
                  new Date(getFieldValue('ata_date')).getTime() <
                    new Date(value).getTime()
                ) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('应大于实际到港时间'));
              }  catch(e) {
                console.log(e)
              }

            },
          }),
        ]}
        placeholder={'请选择实际入仓时间'}
        label="实际入仓时间"
      />
    </ModalForm>
  );
};

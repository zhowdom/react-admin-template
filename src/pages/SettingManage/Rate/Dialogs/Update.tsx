import { Button, Modal } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormSelect, ProFormDigit, ProFormDatePicker } from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { insert, update } from '@/services/pages/stockUpIn/rate';
// 新增/修改汇率

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  dicList: any;
  initialValues?: any;
  formatCurrency: any;
}> = ({ title, trigger, reload, initialValues, dicList, formatCurrency }) => {
  const formRef = useRef<ProFormInstance>();

  return (
    <ModalForm
      title={title || '新增 - 汇率 '}
      trigger={trigger || <Button type="primary">新增</Button>}
      labelAlign="right"
      labelCol={{ flex: '0 0 110px' }}
      layout="horizontal"
      width={688}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        let api = insert;
        if (initialValues?.id) {
          values.id = initialValues.id;
          api = update;
        }
        const res = await api(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '操作成功', 'success');
        reload();
        return true;
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
      initialValues={initialValues}
    >
      <ProFormSelect
        colProps={{ span: 12 }}
        name="original_currency"
        label="原币种"
        showSearch
        valueEnum={formatCurrency(dicList?.SC_CURRENCY)}
        rules={[pubRequiredRule]}
        readonly={!!initialValues?.id}
        fieldProps={{
          onChange: () => {
            formRef.current?.setFieldsValue({ target_currency: '' });
          },
        }}
      />
      <ProFormSelect
        colProps={{ span: 12 }}
        label="目标币种"
        name={'target_currency'}
        dependencies={['original_currency']}
        showSearch
        request={async ({ original_currency }) => {
          return Object.keys(dicList?.SC_CURRENCY)
            .map((key: string) => ({ label: key, value: key }))
            .filter((item) => item.value !== original_currency);
        }}
        rules={[pubRequiredRule]}
        readonly={!!initialValues?.id}
      />
      <ProFormDatePicker
        colProps={{ span: 12 }}
        name="month"
        label="月份"
        fieldProps={{
          picker: 'month',
          format: 'YYYY-MM',
        }}
        readonly={!!initialValues?.id}
        rules={[pubRequiredRule]}
      />
      <ProFormDigit
        colProps={{ span: 12 }}
        name="exchange_rate"
        label="汇率"
        fieldProps={{
          precision: 6,
        }}
        rules={[pubRequiredRule]}
      />
    </ModalForm>
  );
};
export default Component;

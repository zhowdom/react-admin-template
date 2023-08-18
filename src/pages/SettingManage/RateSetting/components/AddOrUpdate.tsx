import { Button } from 'antd';
import { ModalForm, ProFormDigit, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { PlusOutlined } from '@ant-design/icons';
import { add, edit } from '@/services/pages/rateSetting';

export default (props: any) => {
  const { dicList, initialValues } = props;
  const SC_CURRENCY: any = dicList?.SC_CURRENCY
    ? JSON.parse(JSON.stringify(dicList?.SC_CURRENCY))
    : {};
  delete SC_CURRENCY.CNY;
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="汇率设置"
      trigger={
        initialValues ? (
          <a> {props.trigger}</a>
        ) : (
          <Button ghost type="primary" icon={<PlusOutlined />}>
            {props.trigger}
          </Button>
        )
      }
      className="item10"
      labelAlign="right"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 16 }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      initialValues={initialValues}
      width={550}
      onFinish={async (values: any) => {
        const res: any = values.id ? await edit(values) : await add(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功!', 'success');
          props.reload();
          return true;
        }
      }}
    >
      <ProFormText name="id" label="id" hidden />
      <ProFormSelect
        readonly={initialValues}
        name="currency"
        label="选择币种"
        valueEnum={SC_CURRENCY}
        placeholder="请选择币种"
        rules={[{ required: true, message: '请选择币种' }]}
      />
      <ProFormDigit
        label="设置汇率"
        name="exchange_rate"
        fieldProps={{ precision: 4 }}
        rules={[
          { required: true, message: '请设置汇率' },
          () => ({
            validator(_, value) {
              if (value == 0) {
                return Promise.reject(new Error('汇率不能为0'));
              }
              if (value > 99999999.9999) {
                return Promise.reject(new Error('应小于100,000,000'));
              }
              return Promise.resolve();
            },
          }),
        ]}
      />
    </ModalForm>
  );
};

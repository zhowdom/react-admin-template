import { Button, Modal } from 'antd';
import { ProFormInstance, ProFormSelect } from '@ant-design/pro-form';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { syncOrder } from '@/services/pages/order';
import { pubGetStoreList } from '@/utils/pubConfirm';

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
}> = ({ title, trigger, reload }) => {
  const formRef = useRef<ProFormInstance>();
  // @ts-ignore
  return (
    <ModalForm
      title={title || `订单同步`}
      trigger={trigger || <Button>订单同步</Button>}
      labelAlign="right"
      labelCol={{ flex: '0 0 80px' }}
      layout="horizontal"
      width={500}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        okText: '同步',
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        const postData = JSON.parse(JSON.stringify(values));
        postData.platformNos = postData.platformNos.split('\n')?.filter((v: any) => v != '');
        const res = await syncOrder([postData]);
        if (res?.code != '0') {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '操作成功!', 'success');
        if (reload) reload();
        return true;
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
    >
      <ProFormSelect
        name="shopId"
        label="店铺"
        showSearch
        colProps={{ span: 24 }}
        debounceTime={300}
        fieldProps={{
          showSearch: true,
        }}
        onChange={(val: any, data: any) => {
          formRef.current?.setFieldsValue({
            shop_name: data.label,
          });
        }}
        request={async () => {
          const res: any = await pubGetStoreList({ business_scope: 'CN' });
          return res.filter((v: any) => ['TM', 'JD_FCS', 'JD_POP', 'DY'].includes(v.platform_code));
        }}
        rules={[
          { required: true, message: '请选择店铺' },
          ({}) => ({
            validator(_, value) {
              if (JSON.stringify(value) === '{}') {
                return Promise.reject(new Error('请选择店铺'));
              }
              return Promise.resolve();
            },
          }),
        ]}
      />
      <ProFormTextArea
        colProps={{ span: 24 }}
        name={'platformNos'}
        rules={[pubRequiredRule]}
        placeholder={'备注内容输入'}
        label="平台单号"
      />
    </ModalForm>
  );
};
export default Component;

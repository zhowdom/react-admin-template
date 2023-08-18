import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { terminate } from '@/services/pages/purchasePlan';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const { id, trigger, reload } = props;
  return (
    <ModalForm
      title={'撤回/撤销'}
      trigger={trigger ? trigger : <a>撤回</a>}
      width={500}
      layout={'horizontal'}
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={async (values: any) => {
        const res = await terminate(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功！', 'success');
          if (typeof reload) reload();
          return true;
        }
      }}
    >
      <ProFormText name="id" label="ID" hidden initialValue={id} />
      <ProFormTextArea
        name="remarks"
        label="备注"
        placeholder="请输入撤回原因"
        rules={[{ required: true, message: '请输入撤回原因' }]}
      />
    </ModalForm>
  );
};

export default Dialog;

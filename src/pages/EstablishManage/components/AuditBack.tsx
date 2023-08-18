import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { cancelEs, cancelFin, cancelPriceApproval } from '@/services/pages/establish';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const { id, trigger, reload, approval_status } = props;
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
        let res: any;
        if (approval_status == '1') {
          res = await cancelEs(values);
        }
        if (approval_status == '4') {
          res = await cancelFin(values);
        }
        if (approval_status == '7') {
          res = await cancelPriceApproval(values);
        }
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('撤回成功', 'success');
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

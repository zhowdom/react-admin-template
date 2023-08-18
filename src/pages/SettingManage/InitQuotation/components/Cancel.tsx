import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { terminate } from '@/services/pages/InitQuotation';

export default (props: any) => {
  return (
    <ModalForm
      title="撤回"
      trigger={<a> 撤回</a>}
      className="item10"
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      initialValues={{
        id: props.id,
      }}
      width={500}
      onFinish={async (values: any) => {
        const res: any = await terminate(values);
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
      <ProFormTextArea
        name="remarks"
        label="备注"
        placeholder="请输入原因"
        rules={[{ required: true, message: '请输入撤回原因' }]}
      />
    </ModalForm>
  );
};

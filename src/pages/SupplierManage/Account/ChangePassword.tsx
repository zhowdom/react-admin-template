import { ModalForm, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef } from 'react';
import { resetPassword } from '@/services/pages/account';
import { pubMsg, pubConfig } from '@/utils/pubConfig';
// 重置密码弹框
const EditDrawer: React.FC<{
  ids: any;
  reload: any;
  trigger: any;
}> = ({ ids, trigger, reload }) => {
  const changeFormRef = useRef<ProFormInstance>();
  return (
    <ModalForm
      title="重置密码"
      trigger={trigger}
      width={400}
      labelAlign="right"
      layout="horizontal"
      formRef={changeFormRef}
      modalProps={{
        destroyOnClose: true,
      }}
      onVisibleChange={async (visible: boolean) => {
        if (visible) {
          console.log(3);
          console.log(ids);
          setTimeout(() => {
            changeFormRef.current?.setFieldsValue({
              ids: ids.join(','),
            });
          }, 100);
        }
      }}
      onFinish={async (values: any) => {
        console.log(values);
        const res = await resetPassword(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功', 'success');
          reload();
          return true;
        }
      }}
      validateTrigger="onBlur"
    >
      <ProFormText label={'IDS'} name="ids" hidden />
      <ProFormText
        label={'新密码'}
        name={'user_pwd'}
        rules={[
          { required: true, message: '请输入新密码' },
          {
            pattern: /^[0-9a-zA-Z]{6,}$/,
            message: '至少6位，只能输入数字、英文！',
          },
        ]}
      />
    </ModalForm>
  );
};
export default EditDrawer;

import { ModalForm, ProFormRadio, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubMsg, pubConfig } from '@/utils/pubConfig';
import { getUserById, updateUser } from '@/services/pages/AmsManage/users';
// 重置密码弹框
const EditDrawer: React.FC<{
  id: any;
  reload: any;
  trigger: any;
}> = ({ id, trigger, reload }) => {
  const changeFormRef = useRef<ProFormInstance>();
  // 获取详情
  const getDetail = async (idT: string) => {
    const res = await getUserById({ userId: idT });
    if (res.code == '0') {
      changeFormRef.current?.setFieldsValue(res.data);
    }
  };
  return (
    <ModalForm
      title={'修改用户'}
      trigger={trigger}
      width={500}
      labelCol={{ flex: '0 0 105px' }}
      wrapperCol={{ span: 16 }}
      labelAlign="right"
      layout="horizontal"
      formRef={changeFormRef}
      modalProps={{
        destroyOnClose: true,
      }}
      onOpenChange={async (visible: boolean) => {
        if (visible) {
          if (id) {
            getDetail(id);
          } else {
            setTimeout(() => {
              changeFormRef.current?.setFieldsValue({
                id,
              });
            }, 100);
          }
        }
      }}
      onFinish={async (values: any) => {
        console.log(values);
        const res = await updateUser(values);
        if (res?.code != pubConfig.sCodeOrder) {
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
      <ProFormText label={'ID'} name="id" hidden />
      <ProFormText label={'账号'} name={'account'} readonly />
      <ProFormText
        label={'姓名'}
        name={'name'}
        rules={[{ required: true, message: '请输入姓名' }]}
      />
      <ProFormText label={'昵称'} name={'nickName'} />
      <ProFormText label={'手机'} name={'phone'} readonly />
      <ProFormText label={'钉钉id'} name={'dingdingId'} readonly />
      <ProFormRadio.Group
        name="sex"
        label="性别"
        options={[
          { label: '男', value: '1' },
          { label: '女', value: '2' },
        ]}
      />
      <ProFormText label={'email'} name={'email'} />
    </ModalForm>
  );
};
export default EditDrawer;

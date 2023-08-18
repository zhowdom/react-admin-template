import { ModalForm, ProFormDigit, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubMsg, pubConfig } from '@/utils/pubConfig';
import { addOrUpdateMenu, } from '@/services/pages/AmsManage/menus';
// 重置密码弹框
const EditDrawer: React.FC<{
  type: string;
  data?: any;
  reload: any;
  trigger: any;
}> = ({ type, data, trigger, reload }) => {
  const changeFormRef = useRef<ProFormInstance>();

  return (
    <ModalForm
      title={type == 'edit' ? '编辑按钮' : '添加按钮'}
      trigger={trigger}
      width={450}
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
          if (data) {
            if (type == 'add') {
              setTimeout(() => {
                changeFormRef.current?.setFieldsValue({
                  parentId: data?.id,
                  routeUrl: data?.routeUrl,
                });
              }, 100);
            } else {
              setTimeout(() => {
                changeFormRef.current?.setFieldsValue({
                  ...data,
                });
              }, 100);
            }
          }
        }
      }}
      onFinish={async (values: any) => {
        console.log(values);
        const newData = JSON.parse(JSON.stringify(values));
        const res = await addOrUpdateMenu(newData);
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
      <ProFormText label={'type'} name="type" initialValue={'2'} hidden />
      <ProFormText label={'appId'} name="appId" initialValue={'1626436189152845826'} hidden />
      <ProFormText label={'parentId'} name="parentId" initialValue={'0'} hidden />
      <ProFormText label={'routeUrl'} name="routeUrl" hidden />
      <ProFormText
        label={'按钮名称'}
        name={'name'}
        rules={[{ required: true, message: '请输入按钮名称' }]}
        fieldProps={{autoComplete: 'on'}}
      />
      <ProFormText
        label={'前端code'}
        name={'path'}
        rules={[{ required: true, message: '请输入前端code' }]}
        fieldProps={{autoComplete: 'on'}}
      />
      <ProFormDigit
        label={'排序'}
        name={'menuOrder'}
        initialValue={99}
        rules={[{ required: true, message: '请输入排序' }]}
      />
    </ModalForm>
  );
};
export default EditDrawer;

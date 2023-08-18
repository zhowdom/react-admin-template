import { ModalForm, ProFormDigit, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubMsg, pubConfig } from '@/utils/pubConfig';
import { appAddOrUpdate, getAppInfo } from '@/services/pages/AmsManage/app';
// 重置密码弹框
const EditDrawer: React.FC<{
  id: any;
  reload: any;
  trigger: any;
}> = ({ id, trigger, reload }) => {
  const changeFormRef = useRef<ProFormInstance>();
  // 获取详情
  const getDetail = async (idT: string) => {
    const res = await getAppInfo({ appId: idT });
    if (res.code == '0') {
      changeFormRef.current?.setFieldsValue(res.data);
    }
  };
  return (
    <ModalForm
      title={id ? '修改应用' : '添加应用'}
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
        const res = await appAddOrUpdate(values);
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
      <ProFormText
        label={'系统名称'}
        name={'name'}
        rules={[{ required: true, message: '请输入应用名称' }]}
      />
      <ProFormText
        label={'编码'}
        name={'code'}
        rules={[{ required: true, message: '请输入编码' }]}
      />
      <ProFormDigit
        label={'排序'}
        name={'orderNum'}
        rules={[{ required: true, message: '请输入排序' }]}
      />
    </ModalForm>
  );
};
export default EditDrawer;

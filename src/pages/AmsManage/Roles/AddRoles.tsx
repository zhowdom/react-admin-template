import { ModalForm, ProFormTextArea, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubMsg, pubConfig } from '@/utils/pubConfig';
import { roleAddOrUpdate } from '@/services/pages/AmsManage/roles';
// 重置密码弹框
const EditDrawer: React.FC<{
  rowData?: any;
  reload: any;
  trigger: any;
}> = ({ rowData, trigger, reload }) => {
  const changeFormRef = useRef<ProFormInstance>();

  return (
    <ModalForm
      title={rowData ? '修改角色' : '添加角色'}
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
          if (rowData) {
            setTimeout(() => {
              changeFormRef.current?.setFieldsValue({
                ...rowData,
              });
            }, 100);
          }
        }
      }}
      onFinish={async (values: any) => {
        console.log(values);
        const res = await roleAddOrUpdate(values);
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
        label={'角色名称'}
        name={'name'}
        rules={[{ required: true, message: '请输入角色名称' }]}
      />
      <ProFormText
        label={'编码'}
        name={'code'}
        rules={[{ required: true, message: '请输入编码' }]}
      />
      <ProFormTextArea
        label={'描述'}
        name={'remark'}
        rules={[{  message: '请输入描述' }]}
      />
    </ModalForm>
  );
};
export default EditDrawer;

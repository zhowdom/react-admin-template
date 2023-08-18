import { ModalForm, ProFormRadio, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef, useState } from 'react';
import { pubMsg, pubConfig } from '@/utils/pubConfig';
import {
  getUserById,
  getUserRoleByUserIdAndRoleId,
  updateUser,
} from '@/services/pages/AmsManage/users';
import { Form, Spin } from 'antd';
import './index.less'
// 重置密码弹框
const EditDrawer: React.FC<{
  id: any;
  trigger: any;
}> = ({ id, trigger }) => {
  const changeFormRef = useRef<ProFormInstance>();
  const [detail, setDetail] = useState<any>({});
  const [roleList, setRoleList] = useState<any>([]);
  const [loading, setLoading] = useState<any>({});
  // 获取已有角色
  const getUserRole = async (idT: any) => {
    const res = await getUserRoleByUserIdAndRoleId({ userId: idT });
    if (res.code == '0') {
      setRoleList(res.data.roles ? JSON.parse(JSON.stringify(res.data.roles)) : []);
    }
  };
  // 获取详情
  const getDetail = async (idT: string) => {
    setLoading(true);
    const res = await getUserById({ userId: idT });
    if (res.code == '0') {
      changeFormRef.current?.setFieldsValue(res.data);
      setDetail(res.data);
      getUserRole(idT);
    }
    setLoading(false);
  };
  return (
    <ModalForm
      className="userForm"
      title={'查看用户详情'}
      trigger={trigger}
      width={500}
      labelCol={{ flex: '0 0 80px' }}
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
          return true;
        }
      }}
      validateTrigger="onBlur"
    >
      <Spin spinning={loading}>
        <ProFormText label={'ID'} name="id" hidden />
        <ProFormText label={'账号'} name={'account'} readonly />
        <ProFormText label={'姓名'} name={'name'} readonly />
        <ProFormText label={'职位'} name={'position'} readonly />
        <ProFormText label={'手机'} name={'phone'} readonly />
        <ProFormText label={'钉钉id'} name={'dingdingId'} readonly />
        <ProFormRadio.Group
          name="sex"
          label="性别"
          readonly
          options={[
            { label: '男', value: '1' },
            { label: '女', value: '2' },
          ]}
        />
        <ProFormText label={'email'} name={'email'} readonly />
        <Form.Item label="状态">
          {detail.status == '0' && '已离职'}
          {detail.status == '1' && '在职'}
          {detail.status == '2' && '试用期'}
        </Form.Item>
        <Form.Item label="角色">
          <div className="userRole">
            {roleList?.map((v: any) => (
              <span key={v.code}>{`${v.name}(${v.code})`}</span>
            ))}
          </div>
        </Form.Item>
      </Spin>
    </ModalForm>
  );
};
export default EditDrawer;

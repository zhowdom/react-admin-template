import { Button, Modal,Form } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
  ProForm,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useRef } from 'react';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { tagAdd, tagPage } from '@/services/pages/SettingManage';
import ProductLine from '@/components/PubForm/ProductLine';

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  isParent?: boolean;
  initialValues?: any;
}> = ({ title, trigger, reload, isParent, initialValues }) => {
  const formRef = useRef<ProFormInstance>();

  return (
    <ModalForm
      title={title || isParent ? '添加 - 父标签' : '添加 - 子标签'}
      trigger={trigger || <Button type="primary">{isParent ? '添加父标签' : '添加子标签'}</Button>}
      labelAlign="right"
      labelCol={{span: 4 }}
      wrapperCol={{ span: 16 }}
      layout="horizontal"
      width={688}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        const postData = {
          ...values,
          categoryId: values.categoryId[1],
          categoryName: values.categoryId[2],
        };
        const res = await tagAdd(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '操作成功', 'success');
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
      initialValues={
        initialValues
          ? { ...initialValues, status: initialValues.status.toString() }
          : { status: '1' }
      }
    >
      <Form.Item name="categoryId" label="产品线" rules={[pubRequiredRule]} style={{width: '100%'}} >
        <ProductLine single={true} />
      </Form.Item>
      {!isParent ? (
        <ProFormSelect
          colProps={{ span: 24 }}
          name="parentId"
          label="父标签"
          dependencies={['categoryId']}
          request={async ({ categoryId }: any) => {
            formRef.current?.setFieldsValue({
              parentId: '',
            });
            if (categoryId && categoryId[1]) {
              const res = await tagPage({
                pageSize: 9999,
                pageIndex: 1,
                parentId: '0',
                status: '1',
                categoryId: categoryId[1],
              });
              if (res?.code == pubConfig.sCode && res?.data?.list) {
                return res.data.list.map((item: any) => ({
                  ...item,
                  label: item.labelName,
                  value: item.id,
                }));
              }
              return [];
            }
            return [];
          }}
          rules={[pubRequiredRule]}
        />
      ) : null}
      <ProFormText
        colProps={{ span: 24 }}
        name="labelName"
        label={isParent ? '标签名' : '子标签名'}
        fieldProps={{ maxLength: 20 }}
        rules={[pubRequiredRule]}
      />
      <ProFormRadio.Group
        colProps={{ span: 24 }}
        name="status"
        label="状态"
        rules={[pubRequiredRule]}
        options={[
          { label: '启用', value: '1' },
          { label: '禁用', value: '0' },
        ]}
      />
      <ProFormTextArea
        colProps={{ span: 24 }}
        label={'描述'}
        name={'remark'}
        fieldProps={{ maxLength: 200 }}
      />
    </ModalForm>
  );
};
export default Component;

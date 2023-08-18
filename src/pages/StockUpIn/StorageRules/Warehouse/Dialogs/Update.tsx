import { Button, Modal } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  ModalForm,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubGetPlatformList } from '@/utils/pubConfirm';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { insert, update } from '@/services/pages/stockUpIn/warehouse';

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  dicList: any;
  initialValues?: any;
}> = ({ title, trigger, reload, initialValues, dicList }) => {
  const formRef = useRef<ProFormInstance>();

  return (
    <ModalForm
      title={title || '新增 - 跨境平台仓 '}
      trigger={trigger || <Button type="primary">新增</Button>}
      labelAlign="right"
      labelCol={{ flex: '0 0 110px' }}
      layout="horizontal"
      width={688}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        let api = insert;
        if (initialValues?.id) {
          values.id = initialValues.id;
          api = update;
        }
        const res = await api(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '操作成功', 'success');
        reload();
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
        initialValues ? { ...initialValues, status: initialValues.status.toString() } : {}
      }
    >
      <ProFormSelect
        colProps={{ span: 12 }}
        name="platform_id"
        label="平台"
        showSearch
        debounceTime={300}
        request={() => pubGetPlatformList({ business_scope: 'IN' })}
        rules={[pubRequiredRule]}
        readonly={!!initialValues?.id}
      />
      <ProFormSelect
        colProps={{ span: 12 }}
        name="site"
        label="站点"
        showSearch
        debounceTime={300}
        valueEnum={dicList?.SYS_PLATFORM_SHOP_SITE || []}
        rules={[pubRequiredRule]}
        readonly={!!initialValues?.id}
      />
      <ProFormText
        colProps={{ span: 12 }}
        name="warehousing_code"
        label="仓库代码"
        fieldProps={{ maxLength: 200 }}
        rules={[pubRequiredRule]}
        readonly={!!initialValues?.id}
      />
      <ProFormText
        colProps={{ span: 12 }}
        name="warehousing_name"
        label="仓库名称"
        fieldProps={{ maxLength: 200 }}
        rules={[pubRequiredRule]}
      />
      <ProFormRadio.Group
        colProps={{ span: 24 }}
        name="warehousing_type"
        label="仓库类型"
        valueEnum={dicList?.CROSS_PLATFORM_WAREHOUSING_TYPE || {}}
      />
      <ProFormText
        colProps={{ span: 24 }}
        name="address"
        label="仓库地址"
        fieldProps={{ maxLength: 300 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 12 }}
        name="zip_code"
        label="邮编"
        fieldProps={{ maxLength: 300 }}
        rules={[pubRequiredRule]}
      />
      <ProFormRadio.Group
        colProps={{ span: 24 }}
        name="status"
        label="状态"
        rules={[pubRequiredRule]}
        valueEnum={dicList?.SYS_ENABLE_STATUS || {}}
      />
      <ProFormTextArea
        colProps={{ span: 24 }}
        label={'备注'}
        placeholder={'请输入备注说明'}
        name={'remarks'}
      />
    </ModalForm>
  );
};
export default Component;

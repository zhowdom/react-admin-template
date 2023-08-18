import { Button } from 'antd';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { addCompany, updateCompany } from '@/services/pages/logisticsManageIn/company';

export default (props: any) => {
  const { initialValues, dicList } = props;
  const formRef = useRef<ProFormInstance>();
  const [visible, visibleSet] = useState<boolean>(false);
  const [submitting, submittingSet] = useState<any>(false);
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={initialValues ? '编辑' : '添加'}
      formRef={formRef}
      trigger={
        initialValues ? (
          <a onClick={() => visibleSet(true)}> {props.trigger}</a>
        ) : (
          <Button ghost type="primary" icon={<PlusOutlined />} onClick={() => visibleSet(true)}>
            {props.trigger}
          </Button>
        )
      }
      visible={visible}
      className="item10"
      labelAlign="right"
      labelCol={{ span: 8 }}
      wrapperCol={{ flex: '304px' }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        onCancel: () => visibleSet(false),
        confirmLoading: submitting,
      }}
      initialValues={{
        id: initialValues?.id,
        status:
          typeof initialValues?.status == 'number'
            ? `${initialValues?.status}`
            : initialValues?.status ?? '1',
        name: initialValues?.name,
      }}
      width={550}
      onFinish={async (values: any) => {
        const postData = {
          ...values,
          type: 2,
          business_scope: 'IN',
        };
        submittingSet(true);
        const res: any = values.id ? await updateCompany(postData) : await addCompany(postData);
        submittingSet(false);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功!', 'success');
          props.reload();
          visibleSet(false);
          return true;
        }
      }}
    >
      <ProFormText name="id" label="id" hidden />
      <ProFormText
        name={'name'}
        placeholder={'请输入'}
        label="跨境船公司/快递公司"
        rules={[{ required: true, message: '请输入跨境船公司/快递公司' }]}
      />

      <ProFormSelect
        name="status"
        label="状态"
        valueEnum={dicList?.SYS_ENABLE_STATUS}
        placeholder="请选择状态"
        rules={[{ required: true, message: '请选择状态' }]}
      />
    </ModalForm>
  );
};

import { Button } from 'antd';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { insertLogisticsPort, updateLogisticsPort } from '@/services/pages/logisticsManageIn/ports';

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
      title={initialValues ? '编辑港口' : '添加港口'}
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
      labelCol={{ span: 6 }}
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
        type:
          typeof initialValues?.type == 'number' ? `${initialValues?.type}` : initialValues?.type,
        country:
          typeof initialValues?.country == 'number'
            ? `${initialValues?.country}`
            : initialValues?.country,
        name: initialValues?.name,
        status:
          typeof initialValues?.status == 'number'
            ? `${initialValues?.status}`
            : initialValues?.status ?? '1',
      }}
      width={550}
      onFinish={async (values: any) => {
        console.log(values, '港口名称');
        const postData = {
          ...values,
        };
        submittingSet(true);
        const res: any = initialValues?.id
          ? await updateLogisticsPort(postData)
          : await insertLogisticsPort(postData);
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
      <ProFormSelect
        name="type"
        label="港口类型"
        readonly={initialValues}
        valueEnum={dicList?.SYS_PORT_TYPE}
        placeholder="请选择港口类型"
        rules={[{ required: !initialValues, message: '请选择港口类型' }]}
      />

      <ProFormSelect
        name="country"
        label="国家"
        valueEnum={dicList?.SYS_PORT_COUNTRY}
        placeholder="请选择国家"
        rules={[{ required: true, message: '请选择国家' }]}
      />
      <ProFormText
        name={'name'}
        placeholder={'请输入'}
        label="港口名称"
        rules={[{ required: true, message: '请输入港口名称' }]}
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

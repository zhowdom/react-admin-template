import { Button } from 'antd';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { addDesWare, updateDesWare } from '@/services/pages/logisticsManageIn/desPortWare';

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
      title={initialValues ? '编辑跨境目的港仓库' : '添加跨境目的港仓库'}
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
        ...initialValues,
        status:
          typeof initialValues?.status == 'number'
            ? `${initialValues?.status}`
            : initialValues?.status ?? '1',
      }}
      width={550}
      onFinish={async (values: any) => {
        const postData = {
          ...values,
          type: 2,
        };
        submittingSet(true);
        const res: any = values.id ? await updateDesWare(postData) : await addDesWare(postData);
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
        label="跨境目的港仓库"
        rules={[{ required: true, message: '请输入跨境目的港仓库' }]}
      />

      <ProFormSelect
        name="status"
        label="状态"
        valueEnum={dicList?.VENDOR_SIGNING_STATUS}
        placeholder="请选择状态"
        rules={[{ required: true, message: '请选择状态' }]}
      />
    </ModalForm>
  );
};

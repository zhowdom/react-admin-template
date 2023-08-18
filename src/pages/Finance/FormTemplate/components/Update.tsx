import { ModalForm, ProFormRadio, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './index.less';
import { useRef, useState } from 'react';
import { findCodeByName, addTemplate, editTemplate } from '@/services/pages/form-template';

const Dialog = (props: any) => {
  const { record, reload } = props;
  const [loading, loadingSet] = useState(false);
  const formRef: any = useRef<ProFormInstance>();
  const [preName, preNameSet] = useState(record?.process_template_name);
  // 获取表单CODE
  const getCodeAction = () => {
    formRef?.current?.validateFields(['process_template_name']).then(async () => {
      loadingSet(true);
      const res = await findCodeByName({
        templateName: formRef?.current?.getFieldValue('process_template_name'),
      });
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
        formRef?.current?.setFieldsValue({
          process_code: '',
        });
        loadingSet(false);
      } else {
        formRef?.current?.setFieldsValue({
          process_code: res.data,
        });
        preNameSet(formRef?.current?.getFieldValue('process_template_name'));
        loadingSet(false);
      }
    });
  };
  return (
    <ModalForm
      formRef={formRef}
      className="form-template-modal"
      title={record ? '编辑' : '添加模板'}
      trigger={
        record ? (
          <a>编辑</a>
        ) : (
          <Button type="primary" ghost icon={<PlusOutlined />}>
            添加模板
          </Button>
        )
      }
      width={500}
      layout={'horizontal'}
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      initialValues={record ? { ...record, dock_sys_flag: `${Number(record.dock_sys_flag)}` } : {}}
      labelCol={{ flex: '130px' }}
      wrapperCol={{ flex: '250px' }}
      onFinish={async (values: any) => {
        if (values.process_template_name != preName) {
          pubMsg('表单模板名称已修改,请重新获取表单CODE', 'warning');
          return;
        }
        values.dock_sys_flag = !!Number(values.dock_sys_flag);
        const res = values?.id ? await editTemplate(values) : await addTemplate(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功！', 'success');
          if (typeof reload) reload();
          return true;
        }
      }}
    >
      <ProFormText name="id" label="ID" hidden initialValue={record?.id} />
      <Space>
        <ProFormText
          style={{ width: '382px' }}
          name="process_template_name"
          label="表单模板名称"
          readonly={record}
          extra={!record && '说明：需对接的钉钉表单名称'}
          rules={[{ required: true, message: '请输入表单模板名称' }]}
        />
        {!record && (
          <Button
            type="primary"
            style={{ marginBottom: '48px' }}
            onClick={getCodeAction}
            loading={loading}
          >
            确定
          </Button>
        )}
      </Space>
      <div style={{ marginTop: record ? '-6px' : '-15px' }}>
        <ProFormText
          required={false}
          name="process_code"
          label="表单CODE"
          readonly
          wrapperCol={{ flex: '300px' }}
          rules={[{ required: true, message: '请点击确定获取表单CODE' }]}
        />
      </div>
      <ProFormText
        name="request_funds_type"
        label="请款费用类型"
        rules={[{ required: true, message: '请输入请款费用类型' }]}
      />
      <ProFormRadio.Group
        name="dock_sys_flag"
        label="是否对接到系统"
        placeholder="请选择"
        rules={[{ required: true, message: '请选择是否对接到系统' }]}
        valueEnum={{
          1: { text: '是' },
          0: { text: '否' },
        }}
      />
    </ModalForm>
  );
};

export default Dialog;

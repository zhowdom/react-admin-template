import { Form, Modal } from 'antd';
import { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import { pubGetUserList } from '@/utils/pubConfirm';
import './index.less';
import { updateSpreadUser } from '@/services/pages/link';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

export default (props: any) => {
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="变更推广人员"
      trigger={<a> 变更推广</a>}
      className="item10"
      labelAlign="right"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 16 }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      width={550}
      onFinish={async (values: any) => {
        const postData = {
          id: props?.record?.id,
          spread_user_id: values?.spread_user?.value,
          spread_user_name: values?.spread_user?.name,
        };
        const res = await updateSpreadUser(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('变更成功!', 'success');
          props.reload();
          return true;
        }
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
    >
      <Form.Item label="当前推广">{props?.record?.spread_user_name || '-'}</Form.Item>
      <ProFormSelect
        name="spread_user"
        label="变更后推广"
        showSearch
        debounceTime={300}
        fieldProps={{
          filterOption: (input: any, option: any) => {
            const trimInput = input.replace(/^\s+|\s+$/g, '');
            if (trimInput) {
              return option.label.indexOf(trimInput) >= 0;
            } else {
              return true;
            }
          },
          labelInValue: true,
        }}
        request={async (v) => {
          const res: any = await pubGetUserList(v);
          return res;
        }}
        rules={[
          { required: true, message: '请选择变更后推广' },
          ({}) => ({
            validator(_, value) {
              if (JSON.stringify(value) === '{}') {
                return Promise.reject(new Error('请选择变更后推广'));
              }
              return Promise.resolve();
            },
          }),
        ]}
      />
    </ModalForm>
  );
};

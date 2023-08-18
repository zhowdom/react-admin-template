import { Form, Modal } from 'antd';
import { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import { pubProLineList } from '@/utils/pubConfirm';
import './index.less';
import { updateCategoryId } from '@/services/pages/link';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { useState } from 'react';

export default (props: any) => {
  // 获取产品线
  const [proLine, setProLine] = useState([]);
  const getProLineListAction = async () => {
    const res: any = await pubProLineList({ business_scope: props.record.business_scope });
    setProLine(res);
  };
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="修改产品线"
      trigger={<a>修改产品线</a>}
      className="item10"
      labelAlign="right"
      labelCol={{ flex: '120px' }}
      wrapperCol={{ span: 16 }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onVisibleChange={(visible) => {
        // 关闭重置
        if (!visible) {
          setProLine([]);
        } else {
          getProLineListAction();
        }
      }}
      width={520}
      onFinish={async (values: any) => {
        console.log(values);

        const res = await updateCategoryId({
          category_id: values?.category?.value,
          id: props.record.id,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('修改成功!', 'success');
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
      <Form.Item label="当前产品线">
        {props?.record.business_scope && props.record.category_name
          ? `${pubFilter(props.dicList?.SYS_BUSINESS_SCOPE, props.record.business_scope)}-${
              props.record.category_name
            }`
          : '-'}
      </Form.Item>
      <ProFormSelect
        name="category"
        label="变更后产品线"
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
        options={proLine || []}
        rules={[
          { required: true, message: '请选择变更后产品线' },
          ({}) => ({
            validator(_, value) {
              if (JSON.stringify(value) === '{}') {
                return Promise.reject(new Error('请选择变更后产品线'));
              }
              return Promise.resolve();
            },
          }),
        ]}
      />
    </ModalForm>
  );
};

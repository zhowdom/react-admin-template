import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import { connect } from 'umi';
import ProForm, { ProFormInstance, ProFormText, ProFormSelect } from '@ant-design/pro-form';
import { sysCloudWarehousingUpdateExpress } from '@/services/pages/storageManage';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const { common } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ProFormInstance>();

  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };

  props.addModel.current = {
    open: (row: any) => {
      setIsModalVisible(true);
      setTimeout(() => {
        formRef.current?.setFieldsValue({ id: row?.id, express_code: row?.express_code });
      }, 1);
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    if (!val) props.handleClose(true);
  };

  // 提交
  const saveSubmit = async (data: any): Promise<any> => {
    setLoading(true);
    const res = await sysCloudWarehousingUpdateExpress(data);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('修改成功！', 'success');
      modalClose(false);
    }
    setLoading(false);
  };
  return (
    <Modal
      width={600}
      title={'修改默认快递'}
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          onFinishFailed={(v) => {
            console.log(v);
          }}
          labelAlign="right"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          submitter={false}
          layout="horizontal"
        >
          <ProFormText name="id" label="ID" hidden />
          <ProFormSelect
            name="express_code"
            label="默认快递"
            showSearch
            debounceTime={300}
            fieldProps={{
              ...selectProps,
            }}
            rules={[{ required: true, message: '请选择快递' }]}
            valueEnum={common.dicList.CLOUD_WAREHOUSE_EXPRESS}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

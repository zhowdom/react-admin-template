import { useState, useRef } from 'react';
import { Button, Modal, Spin } from 'antd';
import { connect } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { planRefuse } from '@/services/pages/purchasePlan';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const { id, selectRows, reload } = props;
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const formRef = useRef<ProFormInstance>();
  const open = (ids?: any) => {
    setIsModalVisible(true);
    if (ids.length) {
      setTimeout(() => {
        formRef?.current?.setFieldsValue({ ids: ids.join(',') });
      }, 200);
    }
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    if (!val) reload();
  };
  // 提交
  const saveSubmit = async (val: any) => {
    setLoading(true);
    const res = await planRefuse(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功！', 'success');
      modalClose(false);
    }
    setLoading(false);
  };

  return (
    <>
      {id ? (
        <a onClick={() => open([id])}>审核不通过</a>
      ) : (
        <Button disabled={!selectRows?.length} onClick={() => open(selectRows)}>
          审核不通过
        </Button>
      )}
      <Modal
        width={600}
        title="审核不通过"
        open={isModalVisible}
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
            labelAlign="right"
            labelWrap
            submitter={false}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            layout="horizontal"
          >
            <ProFormText name="ids" label="ID" hidden />
            <ProFormTextArea
              name="remarks"
              label="备注原因"
              placeholder="请输入审核不通过原因"
              rules={[{ required: true, message: '请输入审核不通过原因' }]}
            />
          </ProForm>
        </Spin>
      </Modal>
    </>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

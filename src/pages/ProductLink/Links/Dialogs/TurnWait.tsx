import { Col, Modal, Row } from 'antd';
import { ModalForm, ProFormTextArea, ProForm } from '@ant-design/pro-components';
import { transferInReview } from '@/services/pages/link';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';

export default (props: any) => {
  const formItemLayout1 = {
    labelCol: { span: 4 },
    wrapperCol: { span: 21 },
  };
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="发起评审"
      trigger={<a>发起评审</a>}
      labelAlign="right"
      labelCol={{ span: 8 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      width={600}
      onFinish={async (values: any) => {
        const res = await transferInReview({
          ...values,
          link_management_id: props?.record?.id,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('已提交!', 'success');
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
      <Row gutter={20}>
        <Col span={12}>
          <ProForm.Item label={'链接名称'}>{props?.record?.link_name}</ProForm.Item>
        </Col>
        <Col span={12}>
          <ProForm.Item label={'当前生命周期'}>
            {pubFilter(props?.dicList?.LINK_MANAGEMENT_LIFE_CYCLE, props?.record?.life_cycle)}
          </ProForm.Item>
        </Col>
        <Col span={24}>
          <ProFormTextArea
            label="评审原因："
            name="reason"
            {...formItemLayout1}
            rules={[{ required: true, message: '请选输入评审原因' }]}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

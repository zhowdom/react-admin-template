import { Col, Modal, Row } from 'antd';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { initiateForbidCooperation } from '@/services/pages/supplier';
import PubDingDept from '@/components/PubForm/PubDingDept';

export default (props: any) => {
  const formItemLayout = {
    labelCol: { flex: '130px' },
    wrapperCol: { span: 21 },
  };

  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="禁止合作"
      trigger={<a>禁止合作</a>}
      labelAlign="right"
      {...formItemLayout}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      className="supplier-detail"
      width={900}
      initialValues={{ ...props?.data, vendor_id: props?.data?.id } || {}}
      onFinish={async (values: any) => {
        PubDingDept(
          async (dId: any) => {
            const res = await initiateForbidCooperation(
              {
                ...values,
              },
              dId,
            );
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              return false;
            } else {
              pubMsg('操作成功!', 'success');
              props._ref?.current?.reload();
              return true;
            }
          },
          (err: any) => {
            console.log(err);
          },
        );
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
    >
      <Row gutter={20}>
        <ProFormText name="vendor_id" hidden />
        <Col span={12}>
          <ProFormText name="name" readonly label="供应商名称" />
        </Col>
        <Col span={12}>
          <ProFormSelect
            name="vendor_status"
            label="当前状态"
            readonly
            valueEnum={props?.dicList?.VENDOR_COOPERATION_STATUS}
          />
        </Col>
        <Col span={24}>
          <ProFormTextArea
            label="禁止合作原因"
            name="reason"
            rules={[{ required: true, message: '请输入禁止合作原因' }]}
          />
        </Col>
        <Col span={24}>
          <ProFormTextArea
            label="未完结采购单及货款情况"
            name="situation"
            rules={[{ required: true, message: '请输入未完结采购单及货款情况' }]}
          />
        </Col>
        <Col span={24}>
          <ProFormTextArea
            label="未完结采购单处理意见"
            name="opinion"
            rules={[{ required: true, message: '请输入未完结采购单处理意见' }]}
          />
        </Col>
        <Col span={24}>
          <ProFormTextArea
            label="风险点"
            name="risk"
            rules={[{ required: true, message: '请输入风险点' }]}
          />
        </Col>
        <Col span={24}>
          <ProFormTextArea
            label="售后解决方案"
            name="after_solution"
            rules={[{ required: true, message: '请输入售后解决方案' }]}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

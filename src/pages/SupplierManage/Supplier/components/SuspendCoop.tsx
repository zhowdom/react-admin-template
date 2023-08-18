import { Col, Modal, Row } from 'antd';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { initiateSuspendCooperation } from '@/services/pages/supplier';
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
      title="暂停合作"
      trigger={<a>暂停合作</a>}
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
            const res = await initiateSuspendCooperation(
              {
                ...values,
              },
              dId,
            );
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              return false;
            } else {
              pubMsg('操作成功', 'success');
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
            label="暂停合作原因"
            name="reason"
            rules={[{ required: true, message: '请输入暂停合作原因' }]}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

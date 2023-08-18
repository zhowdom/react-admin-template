import { Col, Form, Modal, Row } from 'antd';
import ProForm, {
  ProFormCheckbox,
  ProFormDateRangePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { transferInReview } from '@/services/pages/link';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import './index.less';
import { useRef, useState } from 'react';
import UploadFileList from '@/components/PubUpload/UploadFileList';

export default (props: any) => {
  const formItemLayout = {
    labelCol: { flex: '130px' },
    wrapperCol: { span: 13 },
  };
  const [show, setShow] = useState(false);
  const formRef = useRef<ProFormInstance>();
  props.cRef.current = {
    show: () => {
      setShow(true);
    },
  };
  const hideModal = () => {
    setShow(false);
  };
  const handleUpload = (info: any) => {
    formRef?.current?.setFieldsValue({
      proof: info,
    });
  };
  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then(async () => {
        const res = await transferInReview({
          ...formRef.current?.getFieldsValue(),
          link_management_id: props?.record?.id,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('已提交!', 'success');
          props.reload();
          props.getStatistics();
          return true;
        }
      })
      .catch(() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      });
  };
  return (
    <Modal
      title="创建结算方式变更协议"
      visible={show}
      width={720}
      onCancel={hideModal}
      destroyOnClose
      maskClosable={false}
      onOk={handleOk}
    >
      <ProForm
        formRef={formRef}
        {...formItemLayout}
        initialValues={props?.data || {}}
        labelAlign="right"
        labelWrap
        submitter={false}
        layout="horizontal"
      >
        <Row gutter={20}>
          <Col span={24}>
            <ProFormSelect
              name="vendor_status"
              label="合同类型"
              readonly
              valueEnum={props?.dicList?.SYS_CONTRACT_TEMPLATE_TYPE}
            />
          </Col>
          <Col span={24}>
            <ProFormText name="vendor_name" readonly label="供应商(乙方)" />
          </Col>
          <Col span={24}>
            <ProFormText name="subject_name" readonly label="签约主体(甲方)" />
          </Col>
          <Col span={24}>
            <ProFormSelect
              name="payment_method"
              label="结算方式"
              valueEnum={props.dicList.VENDOR_PAYMENT_METHOD}
              placeholder={props.disabled ? '--' : '请选择结算方式'}
              rules={[{ required: !props.disabled, message: '请选择结算方式' }]}
            />
          </Col>
          <ProFormDependency name={['payment_method']}>
            {({ payment_method }) => {
              return ['8', '9', '10', '11', '12', '13'].includes(payment_method) ? (
                <Col span={24}>
                  <ProFormDigit
                    name="prepayment_percentage"
                    label="预付比例"
                    placeholder="请输入预付比例"
                    min={0}
                    max={100}
                    fieldProps={{ precision: 2, addonAfter: '%' }}
                    rules={[{ required: true, message: '请输入预付比例' }]}
                  />
                </Col>
              ) : (
                ''
              );
            }}
          </ProFormDependency>
          <Col span={24}>
            <ProFormSelect
              name="create_type"
              label="创建方式"
              valueEnum={props.dicList.VENDOR_PAYMENT_METHOD}
              placeholder="请选择结算方式"
              rules={[{ required: true, message: '请选择结算方式' }]}
            />
          </Col>
          <ProFormDependency name={['create_type']}>
            {({ create_type }) => {
              return create_type ? (
                <>
                  <Col span={24}>
                    <Form.Item
                      label="上传合同附件"
                      name="proof"
                      extra="支持PDF、Word、JPG、JPEG、PNG、EXCEL文件格式"
                      rules={[{ required: true, message: '请上传附件' }]}
                    >
                      <UploadFileList
                        fileBack={handleUpload}
                        required
                        businessType="PURCHASE_ORDER_REQUEST_FUNDS"
                        defaultFileList={props?.detailData?.proof}
                        accept={['.png,.jpg,.docx,.pdf,.doc,.xls,.xlsx']}
                        acceptType={['png', 'jpg', 'docx', 'pdf', 'doc', 'xls', 'xlsx']}
                      />
                    </Form.Item>
                  </Col>
                  {false && (
                    <>
                      <Col span={24} className="c-check">
                        <ProFormText
                          name="j_key"
                          label="甲方签约关键字"
                          extra="选择甲方无需签约，甲方不需要在合同签章，直接发给乙方签约，合同生效"
                          rules={[{ required: true, message: '请输入甲方签约关键字' }]}
                        />
                        <ProFormCheckbox name="yes_no1" label="" labelCol={{ span: 0 }}>
                          无需签约
                        </ProFormCheckbox>
                      </Col>

                      <Col span={24} className="c-check">
                        <ProFormText
                          name="y_key"
                          label="乙方签约关键字"
                          extra="选择乙方无需签约，甲方签约成功即合同生效"
                          rules={[{ required: true, message: '请输入乙方签约关键字' }]}
                        />
                        <ProFormCheckbox name="yes_no2" label="" labelCol={{ span: 0 }}>
                          无需签约
                        </ProFormCheckbox>
                      </Col>
                      <Col span={24}>
                        <ProFormDigit
                          name="amount"
                          label="违约责任金额"
                          placeholder="请输入违约责任金额"
                          fieldProps={{ precision: 2, addonAfter: '万' }}
                          min={0}
                          rules={[{ required: true, message: '请输入违约责任金额' }]}
                        />
                      </Col>
                    </>
                  )}
                  <Col span={24}>
                    <ProFormDateRangePicker
                      name="time"
                      fieldProps={{ format: 'YYYY-MM-DD' }}
                      label="合同起止日期"
                      rules={[{ required: true, message: '请选择合同起止日期' }]}
                    />
                  </Col>
                  <Col span={24}>
                    <ProFormRadio.Group
                      name="associate_purchase_framework"
                      label="是否关联框架合同"
                      radioType="button"
                      extra="选择关联框架合同，则框架合同续签或终止时会自动终止该合同"
                      placeholder="请选择是否关联框架合同"
                      rules={[{ required: true, message: '请选择是否关联框架合同' }]}
                      valueEnum={props?.dicList?.SC_YES_NO}
                    />
                  </Col>

                  <Col span={24}>
                    <ProFormTextArea
                      wrapperCol={{ span: 20 }}
                      label="签约说明"
                      name="reason"
                      rules={[{ required: true, message: '请输入签约说明' }]}
                    />
                  </Col>
                </>
              ) : (
                <></>
              );
            }}
          </ProFormDependency>
        </Row>
      </ProForm>
    </Modal>
  );
};

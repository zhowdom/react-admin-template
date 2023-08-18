import { useRef, useState } from 'react';
import { Col, Form, Modal, Row } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormSelect } from '@ant-design/pro-form';
import ProForm, { ProFormDependency, ProFormText } from '@ant-design/pro-form';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { addBankAccount, editBankAccount } from '@/services/pages/supplier';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { history } from 'umi';
import PubDingDept from '@/components/PubForm/PubDingDept';

const Dialog = (props: any) => {
  const formItemLayout = {
    labelCol: { span: 9 },
    wrapperCol: { span: 13 },
  };
  const formItemLayout1 = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  };

  const formRef = useRef<ProFormInstance>();
  const [file, setFile] = useState<any>(props?.state?.dialogForm?.proof_files);
  const handleUpload = (info: any) => {
    formRef?.current?.setFieldsValue({
      proof_files: info,
    });
  };
  const [loading, setLoading] = useState(false);
  // 提交表单
  const handleOk = () => {
    formRef?.current?.submit();
  };
  // 新增或修改主体
  const updateForm = async (data: any) => {
    const postData = {
      ...data,
      vendor_id: history?.location?.query?.id || null,
      id: props?.state?.dialogForm?.id || null,
    };
    setFile(postData.proof_files);
    if (props?.state?.dialogForm?.id) {
      // 编辑
      PubDingDept(
        async (dId: any) => {
          const res = await editBankAccount(postData, dId);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            setLoading(false);
          } else {
            setFile([]);
            props.handleClose();
            setLoading(false);
            pubMsg('已提交', 'success');
          }
        },
        (err: any) => {
          console.log(err);
        },
      );
    } else {
      // 新增
      const res = await addBankAccount(postData);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
        setLoading(false);
      } else {
        setFile([]);
        props.handleClose();
        setLoading(false);
        pubMsg('已提交', 'success');
      }
    }
  };
  return (
    <Modal
      className="account-modal"
      width={800}
      title={
        props?.state?.dialogForm?.id
          ? props?.state?.dialogForm?.view
            ? '查看详情'
            : '账户变更'
          : '新增账户信息'
      }
      visible={props?.state?.isModalVisible}
      onOk={handleOk}
      onCancel={() => {
        setFile([]);
        props.handleClose();
      }}
      destroyOnClose
      confirmLoading={loading}
      okText={loading ? '提交中' : '确定'}
    >
      <ProForm
        formRef={formRef}
        onFinish={async (values) => {
          setLoading(true);
          updateForm(values);
        }}
        labelAlign="right"
        {...formItemLayout}
        submitter={false}
        initialValues={props.state.dialogForm}
        layout="horizontal"
      >
        <Row>
          <Col span={12}>
            <ProFormSelect
              readonly={props.state.dialogForm.view}
              name="currency"
              label="账户币种"
              valueEnum={props?.dicList?.SC_CURRENCY}
              rules={[{ required: true, message: '请选择账户类型' }]}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              readonly={props.state.dialogForm.view}
              name="bank_name"
              label="开户银行"
              placeholder="请输入开户银行"
              rules={[{ required: true, message: '请输入开户银行' }]}
              extra={props.state.dialogForm.view ? false : ' 输入开户银行，需精确到支行'}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              readonly={props.state.dialogForm.view}
              name="bank_account_name"
              label="账户名"
              placeholder="请输入账户名"
              rules={[{ required: true, message: '请输入账户名' }]}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              readonly={props.state.dialogForm.view}
              name="bank_account"
              label="银行账号"
              placeholder="请输入银行账号"
              rules={[
                { required: true, message: '请输入银行账号' },
                { pattern: /^[0-9]*$/, message: '请输入正确格式的银行账号' },
              ]}
            />
          </Col>
          <ProFormDependency name={['currency']}>
            {({ currency }) => {
              if (currency == 'USD') {
                return (
                  <Row>
                    <Col span={12}>
                      <ProFormText
                        readonly={props.state.dialogForm.view}
                        name="bank_routing"
                        label="Bank Routing#"
                        placeholder="请输入"
                        rules={[{ required: true, message: '请输入' }]}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        readonly={props.state.dialogForm.view}
                        name="swift"
                        label="SWIFT"
                        placeholder="请输入"
                        rules={[{ required: true, message: '请输入' }]}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        readonly={props.state.dialogForm.view}
                        name="bank_address"
                        label="Bank Address"
                        placeholder="请输入"
                        rules={[{ required: true, message: '请输入' }]}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        readonly={props.state.dialogForm.view}
                        name="company_address"
                        label="Company Address"
                        placeholder="请输入"
                        rules={[{ required: true, message: '请输入' }]}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        readonly={props.state.dialogForm.view}
                        name="phone_number"
                        label="Phone Number"
                        placeholder="请输入"
                        rules={[{ required: true, message: '请输入' }]}
                      />
                    </Col>
                  </Row>
                );
              }
            }}
          </ProFormDependency>
          <Col span={24}>
            <Form.Item
              {...formItemLayout1}
              label="上传凭证"
              name="proof_files"
              extra="支持扩展名.png,.jpg,.docx,.pdf,.doc"
              rules={[{ required: true, message: '请上传凭证' }]}
              style={{ marginLeft: '18px' }}
            >
              <UploadFileList
                fileBack={handleUpload}
                required
                disabled={props.state.dialogForm.view}
                businessType="VENDOR_ACCOUNT_PROOF"
                listType="picture-card"
                defaultFileList={props?.state?.dialogForm?.proof_files || file}
                accept={['.png,.jpg,.docx,.pdf,.doc']}
                acceptType={['png', 'jpg', 'docx', 'pdf', 'doc']}
              />
              <div style={{ color: '#ff0000' }}>*对公账户必须上传开户许可证</div>
            </Form.Item>
          </Col>
        </Row>
      </ProForm>
    </Modal>
  );
};
export default Dialog;

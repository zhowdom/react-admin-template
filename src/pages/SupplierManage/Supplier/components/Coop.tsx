import { Col, Form, Modal, Row } from 'antd';
import {
  ModalForm,
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import './index.less';
import {
  initiateOfficialCooperation,
  initiateTemporaryCooperation,
} from '@/services/pages/supplier';
import { useRef, useState } from 'react';
import { history } from 'umi';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import PubDingDept from '@/components/PubForm/PubDingDept';

export default (props: any) => {
  const { coopRef } = props;
  const formRef = useRef<ProFormInstance>();
  const formItemLayout = {
    labelCol: { flex: '148px' },
    wrapperCol: { span: 20 },
  };
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any>({});
  const [type, setType] = useState<number>(1);
  coopRef.current = {
    show: (postData: any, t: number) => {
      setData(postData);
      setType(t);
      setVisible(true);
    },
  };
  const handleUpload = (info: any) => {
    formRef?.current?.setFieldsValue({
      questionnaire_files: info,
    });
  };
  const handleUploadQf = (info: any) => {
    formRef?.current?.setFieldsValue({
      media_files: info,
    });
  };
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={type === 1 ? '临时合作申请' : '正式合作申请'}
      labelAlign="right"
      visible={visible}
      {...formItemLayout}
      formRef={formRef}
      layout="horizontal"
      initialValues={{
        payment_method: data?.payment_method,
        prepayment_percentage: data?.prepayment_percentage,
        worth: data?.portrait?.worth,
        advantage: data?.portrait?.advantage,
        inferiority: data?.portrait?.inferiority,
        questionnaire_files: data?.portrait?.questionnaire_files,
        media_files: data?.portrait?.media_files,
      }}
      modalProps={{
        onCancel: () => setVisible(false),
        destroyOnClose: true,
        maskClosable: false,
        bodyStyle: {
          padding: '30px 40px',
        },
      }}
      width={900}
      onFinish={async (values: any) => {
        const postData = {
          id: history?.location?.query?.id || null,
          ...data,
          ...values,
          portrait: {
            ...data?.portrait,
            worth: values?.worth,
            advantage: values?.advantage,
            inferiority: values?.inferiority,
            questionnaire_files: values?.questionnaire_files,
            media_files: values?.media_files,
          },
        };
        PubDingDept(
          async (dId: any) => {
            const res =
              type === 1
                ? await initiateTemporaryCooperation(postData, dId)
                : await initiateOfficialCooperation(postData, dId);
            if (res?.code != pubConfig.sCode) {
              Modal.confirm({
                title: '提示',
                icon: <ExclamationCircleOutlined />,
                content: res?.message,
                okText: '关闭',
                cancelText: '取消',
                cancelButtonProps: {
                  style: {
                    display: 'none',
                  },
                },
                onOk: () => setVisible(false),
              });
            } else {
              pubMsg('已提交!', 'success');
              setTimeout(() => {
                history.push('/supplier-manage/supplier');
              }, 200);
              setVisible(false);
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
        <Col span={24}>
          <ProFormTextArea
            name="worth"
            fieldProps={{
              autoSize: { minRows: 2, maxRows: 6 },
            }}
            required
            label="引入供应商目的价值"
            placeholder="价格，交期，品质配合等方面分析供应商价值"
            rules={[
              () => ({
                validator(_, value) {
                  const temp = value ? value.trim() : value;
                  if (!temp && !props.disabled) {
                    return Promise.reject(new Error('请输入引入供应商目的价值'));
                  }
                  if (value.length > 250) {
                    return Promise.reject(new Error('最多输入250字'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
        </Col>
        <Col span={24}>
          <ProFormTextArea
            fieldProps={{
              autoSize: { minRows: 2, maxRows: 6 },
            }}
            required
            placeholder="价格，交期，品质配合等方面分析供应商优势"
            rules={[
              () => ({
                validator(_, value) {
                  const temp = value ? value.trim() : value;
                  if (!temp && !props.disabled) {
                    return Promise.reject(new Error('请输入供应商优势'));
                  }
                  if (value.length > 400) {
                    return Promise.reject(new Error('最多输入400字'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            label="供应商优势"
            name="advantage"
          />
        </Col>
        <Col span={24}>
          <ProFormTextArea
            fieldProps={{
              autoSize: { minRows: 2, maxRows: 6 },
            }}
            required
            rules={[
              () => ({
                validator(_, value) {
                  const temp = value ? value.trim() : value;
                  if (!temp && !props.disabled) {
                    return Promise.reject(new Error('请输入供应商劣势'));
                  }
                  if (value.length > 250) {
                    return Promise.reject(new Error('最多输入250字'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            label="供应商劣势"
            placeholder="分析供应商劣势"
            name="inferiority"
          />
        </Col>
        <Col span={24}>
          <Form.Item
            required
            rules={[
              () => ({
                validator(_, value) {
                  const unDeleteFiles = value?.filter((file: any) => file.delete != 1);
                  if (!unDeleteFiles?.length) {
                    return Promise.reject(new Error('请上传资料调查表'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            wrapperCol={{ span: 12 }}
            label="资料调查表"
            name="questionnaire_files"
            valuePropName="questionnaire_files"
            extra="只支持word,pdf,excel文件"
          >
            <UploadFileList
              disabled={props.disabled}
              required={!props.disabled}
              fileBack={handleUpload}
              businessType="VENDOR_QUESTIONNAIRE"
              listType="picture"
              checkMain={false}
              defaultFileList={data?.portrait?.questionnaire_files}
              accept={['.docx,.doc,.pdf,.xls,.xlsx']}
              acceptType={['docx', 'doc', 'pdf', 'xls', 'xlsx']}
              maxSize="5"
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            required
            wrapperCol={{ span: 12 }}
            rules={[
              () => ({
                validator(_, value) {
                  const unDeleteFiles = value?.filter((file: any) => file.delete != 1);
                  if (!unDeleteFiles?.length) {
                    return Promise.reject(new Error('请上传供应商图片/视频'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            label="供应商图片/视频"
            name="media_files"
            valuePropName="media_files"
            extra="支持.jpg,.jpeg,.png,.mp4格式,最多可以传20张图片，5个视频，图片最大20M,视频最大100M"
          >
            <UploadFileList
              required
              fileBack={handleUploadQf}
              businessType="VENDOR_MEDIA"
              listType="picture"
              fileData={{
                pic: {
                  size: 20,
                  count: 20,
                },
                video: {
                  size: 100,
                  count: 5,
                },
              }}
              checkMain={false}
              defaultFileList={data?.portrait?.media_files}
              accept={['.jpg,.jpeg,.png,.mp4,.mp3']}
              acceptType={['jpg', 'jpeg', 'png', 'mp4', 'mp3']}
            />
          </Form.Item>
        </Col>
        {type === 1 && (
          <>
            <Col span={24}>
              <ProFormSelect
                wrapperCol={{ span: 12 }}
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
                      wrapperCol={{ span: 12 }}
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
              <ProFormTextArea
                label="临时合作申请原因"
                name="reason"
                rules={[{ required: true, message: '请输入临时合作申请原因' }]}
              />
            </Col>
          </>
        )}
      </Row>
    </ModalForm>
  );
};

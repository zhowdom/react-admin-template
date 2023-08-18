import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import { connect, history } from 'umi';
import { ProFormDatePicker, ProFormDependency, ProFormDigit } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import {
  accountStatementOrderApproval,
  updateAccountStatementOrder,
  accountStatementOrderAnApplication,
  addOtherFunds,
  updateOtherFunds,
} from '@/services/pages/reconciliationPurchase';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import UploadFileList from '@/components/PubUpload/UploadFileList';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<any>({});
  const formRef = useRef<ProFormInstance>();
  const [isRequired, setIsRequired] = useState(false);
  const handleUpload = async (data: any) => {
    formRef.current?.setFieldsValue({ sys_files: data });
  };
  props.aduitNoModel.current = {
    open: (id?: any, type?: any, required?: any, data?: any) => {
      setIsModalVisible(true);
      setIsRequired(required);
      console.log(data, 'data');
      if (id) {
        switch (type) {
          case 'approve':
            setModalType({
              type: type,
              title: '审批通过',
            });
            break;
          case 'refuse':
            setModalType({
              type: type,
              title: '驳回',
            });
            break;
          case 'uploadAccount':
            setModalType({
              type: type,
              title: '更新账单',
            });
            break;
          case 'addAudit':
            setModalType({
              type: type,
              title: '申请对账',
              latest_payment_date: data,
            });
            break;
          case 'addOtherFee':
            setModalType({
              type: type,
              title: data.isEdit ? '修改其他费用' : '添加其他费用',
              currency: data.currency,
              isEdit: data.isEdit,
              data: data,
            });
            break;
        }
        setTimeout(() => {
          formRef?.current?.setFieldsValue({ id: id });
        }, 200);
      }
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val?: any) => {
    setIsModalVisible(false);
    props.handleClose(val);
  };
  // 提交
  const saveSubmit = async (val: any) => {
    setLoading(true);
    val.operate = modalType?.type;
    let res: any = null;
    if (modalType?.type == 'approve' || modalType?.type == 'refuse') {
      res = await accountStatementOrderApproval(val);
    } else if (modalType?.type == 'uploadAccount') {
      res = await updateAccountStatementOrder(val);
    } else if (modalType?.type == 'addAudit') {
      res = await accountStatementOrderAnApplication(val);
    } else if (modalType?.type == 'addOtherFee') {
      const postData = JSON.parse(JSON.stringify(val));
      if (!modalType.isEdit) {
        postData.business_id = postData.id;
        delete postData.id;
        res = await addOtherFunds(postData);
      } else {
        postData.business_id = postData.id;
        postData.id = modalType.data.id;
        res = await updateOtherFunds(postData);
      }
    }
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功！', 'success');
      modalClose(true);
      if (!['addOtherFee', 'uploadAccount'].includes(modalType?.type)) {
        history.goBack();
      }
    }
    setLoading(false);
  };

  return (
    <Modal
      width={600}
      title={modalType?.title}
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={() => modalClose()}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
      className="red"
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          labelAlign="right"
          submitter={false}
          layout="horizontal"
          labelCol={{
            flex: ['addOtherFee', 'addAudit'].includes(modalType.type) ? '104px' : '50px',
          }}
          initialValues={modalType.isEdit ? modalType.data : undefined}
        >
          <ProFormText name="id" label="ID" hidden />
          {modalType.type === 'addAudit' ? (
            <>
              <ProFormDatePicker
                initialValue={modalType.latest_payment_date}
                name="latest_payment_date"
                label="最迟付款时间"
                placeholder="请选择最后付款时间"
                extra="最迟付款时间根据对账单账期自动计算,可根据实际情况手动选择,如果所选时间在当前计算时间之前,则必须在备注处说明原因"
                rules={[{ required: true, message: `请选择最后付款时间` }]}
              />
              <ProFormDependency name={['latest_payment_date']}>
                {({ latest_payment_date }) => {
                  const required =
                    new Date(latest_payment_date).getTime() <
                    new Date(modalType.latest_payment_date + ' 00:00:00').getTime();
                  return (
                    <ProFormTextArea
                      name="remark"
                      label="备注"
                      placeholder={`请输入${modalType?.title}备注`}
                      rules={[{ required: required, message: `请输入${modalType?.title}备注` }]}
                    />
                  );
                }}
              </ProFormDependency>
            </>
          ) : modalType.type === 'addOtherFee' ? (
            <>
              <ProForm.Item label="结算币种">{modalType.currency}</ProForm.Item>
              <ProFormText
                name="funds_type"
                label="费用类型"
                rules={[{ required: true, message: `请输入费用类型` }]}
              />
              <ProFormDigit
                label="费用金额"
                name="amount"
                rules={[
                  { required: true, message: '请输入费用金额' },
                  () => ({
                    validator(_, value) {
                      if (value == 0) {
                        return Promise.reject(new Error('不能为0'));
                      }
                      if (value < 0) {
                        return Promise.reject(new Error('请输入大于0的数值'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              />
              <ProFormTextArea
                name="remark"
                label="费用说明"
                placeholder={`请输入费用说明`}
                rules={[{ required: true, message: `请输入费用说明` }]}
              />
              <ProForm.Item
                label="附件"
                name="sys_files"
                extra="支持常用文档和图片以及压缩包格式文件，单个不能超过50M"
              >
                <UploadFileList
                  fileBack={handleUpload}
                  required
                  businessType="OTHER_FUNDS"
                  listType="text"
                  maxSize="50"
                  defaultFileList={modalType?.data?.sys_files}
                />
              </ProForm.Item>
            </>
          ) : (
            <ProFormTextArea
              name="remark"
              label="备注"
              placeholder={`请输入${modalType?.title}备注`}
              rules={[{ required: isRequired, message: `请输入${modalType?.title}备注` }]}
            />
          )}
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

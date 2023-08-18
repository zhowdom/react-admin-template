import { useState, useRef } from 'react';
import { Modal, Spin, Form, Alert } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { warehousingOrderUpdateByDate } from '@/services/pages/reconciliationPurchase';
import moment from 'moment';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import NewDatePicker from '@/components/PubForm/NewDatePicker';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const formRef = useRef<ProFormInstance>();
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 },
  };
  const checkConfirm = (_: any, value: string) => {
    const promise = Promise;
    if (value && (!value[0] || !value[1])) {
      return promise.reject('请选择账单期间!');
    }
    return promise.resolve();
  };
  props.editTimeModel.current = {
    open: (id: string) => {
      setIsModalVisible(true);
      setTimeout(() => {
        formRef?.current?.setFieldsValue({ id: id });
      }, 200);
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
    const newD = JSON.parse(JSON.stringify(val))
    newD.begin_time = moment(newD.dateTime[0]).format('YYYY-MM-DD');
    newD.end_time = moment(newD.dateTime[1]).format('YYYY-MM-DD');
    delete newD.dateTime;
    setLoading(true);
    let res: any = null;
    res = await warehousingOrderUpdateByDate(newD);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功！', 'success');
      modalClose(true);
    }
    setLoading(false);
  };

  return (
    <Modal
      width={600}
      title='更新账单'
      open={isModalVisible}
      onOk={modalOk}
      onCancel={() => modalClose()}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
      className="red"
    >
      <Spin spinning={loading}>
        <Alert
          message="账单期间修改后，系统会根据新的账单期间去获取入库数据来更新对账单，请谨慎操作！"
          type="error"
          style={{ marginBottom: '15px' }}
        />
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          labelAlign="right"
          submitter={false}
          layout="horizontal"
          {...formItemLayout}
        >
          <ProFormText name="id" hidden />
          <Form.Item label="账单期间" {...formItemLayout} name="dateTime"
            rules={[{ required: true, message: '请选择账单期间' }, { validator: checkConfirm }]}>
            <NewDatePicker />
          </Form.Item>
          <ProFormTextArea
            name="remark"
            label="备注"
            placeholder={`请输入备注`}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default Dialog;

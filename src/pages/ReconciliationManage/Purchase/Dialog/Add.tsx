import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import { connect } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ProFormText,
  ProFormSelect,
  ProFormDateRangePicker,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { addAccountStatementOrder } from '@/services/pages/reconciliationPurchase';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetVendorList } from '@/utils/pubConfirm';
import moment from 'moment';

const Dialog = (props: any) => {
  const { common } = props;
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const formRef = useRef<ProFormInstance>();
  props.addModel.current = {
    open: (business_scope: string) => {
      setIsModalVisible(true);
      setTimeout(() => {
        formRef.current?.setFieldsValue({ business_scope: business_scope });
      }, 100);
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
  const saveSubmit = async (val: any) => {
    setLoading(true);
    val.begin_time = val?.time?.[0] ? val?.time?.[0] : null;
    val.end_time = val?.time?.[1] ? val?.time?.[1] : null;
    const res = await addAccountStatementOrder(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功！', 'success');
      modalClose(false);
    }
    setLoading(false);
  };

  return (
    <Modal
      width={600}
      title="创建对账单"
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
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
        >
          <ProFormText name="business_scope" label="业务范畴" hidden />
          <ProFormSelect
            name="order_type"
            label="对账单类型"
            rules={[{ required: true, message: '请选择对账单类型' }]}
            initialValue="1"
            readonly
            valueEnum={common.dicList.ACCOUNT_STATEMENT_ORDER_ORDER_TYPE}
          />
          <ProFormSelect
            name="vendor_id"
            label="供应商"
            rules={[{ required: true, message: '请选择供应商' }]}
            showSearch
            debounceTime={300}
            fieldProps={{
              filterOption: (input: any, option: any) => {
                const trimInput = input.replace(/^\s+|\s+$/g, '');
                if (trimInput) {
                  return option.label.indexOf(trimInput) >= 0;
                } else {
                  return true;
                }
              },
            }}
            request={async (v) => {
              const res: any = await pubGetVendorList(v);
              return res;
            }}
          />
          <ProFormDateRangePicker
            name="time"
            label="账单期间"
            rules={[{ required: true, message: '请选择账单期间' }]}
            fieldProps={{
              disabledDate: (current: any) => {
                return current && current > moment().endOf('day');
              },
            }}
          />
          <ProFormTextArea name="remark" label="账单备注" placeholder="请输入账单备注" />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

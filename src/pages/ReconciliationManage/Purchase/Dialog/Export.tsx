import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import { connect } from 'umi';
import ProForm, {
  ProFormSelect,
  ProFormInstance,
  ProFormText,
  ProFormDatePicker,
} from '@ant-design/pro-form';
import { exportAccountStatementOrder } from '@/services/pages/reconciliationPurchase';
import { pubMsg } from '@/utils/pubConfig';
import { pubGetVendorList } from '@/utils/pubConfirm';

const Dialog = (props: any) => {
  const { common } = props;
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const formRef = useRef<ProFormInstance>();
  props.exportModel.current = {
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
    const res = await exportAccountStatementOrder(val);
    const type = res.response.headers.get('content-type');
    if (type.indexOf('application/json') > -1) {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `付款报表.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
      modalClose(true);
    }
    setLoading(false);
  };

  return (
    <Modal
      width={600}
      title="导出付款报表"
      visible={isModalVisible}
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
          <ProFormDatePicker
            name="month"
            label="最迟付款月份"
            fieldProps={{
              picker: 'month',
              format: 'YYYY-MM',
            }}
            rules={[{ required: true, message: '请选择月份' }]}
          />
          <ProFormSelect
            name="vendor_id"
            label="选择供应商"
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
          <ProFormSelect
            name="approval_status"
            label="账单状态"
            valueEnum={common.dicList.ACCOUNT_STATEMENT_STATUS}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

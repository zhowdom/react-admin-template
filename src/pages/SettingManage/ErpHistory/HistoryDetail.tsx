import React, { useRef } from 'react';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';

const HistoryDetail: React.FC<{
  detail: any;
  title: any;
  dicList: any;
}> = ({ detail, title, dicList }) => {
  const formRef = useRef<ProFormInstance>();
  return (
    <ModalForm
      formRef={formRef}
      title={title || '详情'}
      trigger={<a key="detail">详情</a>}
      layout="horizontal"
      labelAlign="right"
      className="light-form-item-row"
      labelCol={{ flex: '90px' }}
      modalProps={{ destroyOnClose: true, maskClosable: false }}
      onVisibleChange={(visible: boolean) => {
        if (visible) {
          console.log(detail);
          setTimeout(() => {
            formRef.current?.setFieldsValue({ ...detail });
          }, 1);
        }
      }}
      submitter={false}
    >
      <ProFormText label="业务名称" name="business_name" readonly />
      <ProFormText label="业务编码" name="business_code" readonly />
      <ProFormSelect label="状态" name="status" readonly valueEnum={dicList?.SYNC_MESSAGE_STATUS} />

      <ProFormText label="业务ID" name="business_id" readonly />
      <ProFormText label="业务单号" name="business_no" readonly />
      <ProFormSelect
        label="数据来源"
        name="data_sources"
        readonly
        valueEnum={dicList?.SYS_DATA_SOURCES}
      />
      <ProFormSelect
        label="操作类型"
        name="operation_type"
        readonly
        valueEnum={dicList?.SYNC_OPERATION_TYPE}
      />
      <ProFormText label="处理时间" name="process_time" readonly />
      <ProFormText label="异常原因" name="sync_exception_message" readonly />
    </ModalForm>
  );
};
export default HistoryDetail;

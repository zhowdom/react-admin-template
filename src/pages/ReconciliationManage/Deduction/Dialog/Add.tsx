import { useState, useRef } from 'react';
import { Modal, Spin, Empty, Form } from 'antd';
import { connect } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormDigit,
} from '@ant-design/pro-form';
import { addSysBusinessDeduction } from '@/services/pages/reconciliationDeduction';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetVendorList, pubGetSigningList } from '@/utils/pubConfirm';
import UploadFileList from '@/components/PubUpload/UploadFileList';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const formRef = useRef<ProFormInstance>();
  props.addModel.current = {
    open: () => {
      setIsModalVisible(true);
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
    val.main_name = val.main_data.label;
    val.main_id = val.main_data.value;
    const res = await addSysBusinessDeduction(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功！', 'success');
      modalClose(false);
    }
    setLoading(false);
  };
  // 上传结束后
  const handleUpload = async (data: any) => {
    formRef.current?.setFieldsValue({ sys_files: data });
  };

  return (
    <Modal
      width={600}
      title="创建扣款单"
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
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
        >
          <ProFormSelect
            name="business_id"
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
          <ProFormText name="business_type" label="business_type" initialValue="1" hidden />
          <ProFormSelect
            name="main_data"
            label="采购主体"
            showSearch
            placeholder="请选择采购主体"
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
              labelInValue: true,
              notFoundContent: (
                <Empty
                  className="pub-empty-blue"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="没有满足所选供应商的采购主体"
                />
              ),
            }}
            request={async (v) => {
              const res: any = await pubGetSigningList({ key_word: v?.keyWords });
              return res;
            }}
            rules={[{ required: true, message: '请选择采购主体' }]}
          />
          <ProFormDigit
            name="amount"
            label="申请金额"
            placeholder="请输入申请金额"
            rules={[{ required: true, message: '请输入申请金额' }]}
            min={0}
            fieldProps={{
              precision: 2,
              maxLength: 125,
            }}
          />
          <ProFormTextArea
            name="reason"
            label="扣款原因"
            placeholder="请输入扣款原因"
            rules={[{ required: true, message: '请输入扣款原因' }]}
          />
          <Form.Item
            label="附件"
            name="sys_files"
            extra="只支持.word,.excel,.pdf以及图片格式，可上传多个文件，单个文件不超过100M"
          >
            <UploadFileList
              fileBack={handleUpload}
              businessType="BUSINESS_DEDUCTION"
              listType="picture"
              accept={['.docx,.doc,.xlsx,.xls,.pdf,.png,.jpg,.jpeg']}
              acceptType={['docx', 'doc', 'xlsx', 'xls', 'pdf', 'png', 'jpg', 'jpeg']}
              maxSize="100"
            />
          </Form.Item>
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { acceptTypes, pubConfig, pubMsg } from '@/utils/pubConfig';
import './index.less';
import { useRef } from 'react';
import { Divider } from 'antd';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { priceValue } from '@/utils/filter';
import { confirmReceipt } from '@/services/pages/deposit';

const Dialog = (props: any) => {
  const { record, reload } = props;
  const formRef: any = useRef<ProFormInstance>();
  // 上传结束后
  const handleUpload = async (data: any) => {
    console.log(data);
    formRef.current?.setFieldsValue({ fileInfoList: data });
  };
  return (
    <ModalForm
      formRef={formRef}
      className="deposit-modal"
      title="收款"
      trigger={<a>收款</a>}
      width={630}
      layout={'horizontal'}
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      grid
      initialValues={{
        receipt_no: record.receipt_no,
        process_instance_id: record.process_instance_id,
        deposit_amount: priceValue(record.deposit_amount),
        received_amount: priceValue(record.received_amount),
        settlement_currency: record.settlement_currency,
      }}
      labelCol={{ flex: '120px' }}
      onFinish={async (values: any) => {
        const postData = {
          receipt_no: values?.receipt_no,
          receive_amount: values?.receive_amount,
          actual_collection_time: values?.actual_collection_time,
          fileInfoList: values?.fileInfoList,
          remark: values?.remark,
        };
        const res = await confirmReceipt(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功！', 'success');
          if (typeof reload) reload();
          return true;
        }
      }}
    >
      <ProFormText name="receipt_no" label="receipt_no" hidden initialValue={record?.receipt_no} />

      <ProFormText readonly name="process_instance_id" label="来源单号" colProps={{ span: 12 }} />
      <ProFormSelect
        name="settlement_currency"
        colProps={{ span: 12 }}
        label="结算币种"
        readonly
        valueEnum={props?.dicList?.SC_CURRENCY}
      />

      <ProFormText readonly name="deposit_amount" label="押金金额" colProps={{ span: 12 }} />
      <ProFormText readonly name="received_amount" label="已收金额" colProps={{ span: 12 }} />
      <Divider />
      <ProFormDigit
        label={'本次收款金额'}
        name={'receive_amount'}
        wrapperCol={{ flex: '130px' }}
        rules={[{ required: true, message: '请输入本次收款金额' }]}
      />
      <ProFormDatePicker
        name="actual_collection_time"
        label="实际收款时间"
        wrapperCol={{ flex: '130px' }}
        rules={[{ required: true, message: '请选择实际收款时间' }]}
      />
      <ProForm.Item
        label="收款凭证"
        name="fileInfoList"
        rules={[{ required: true, message: '请上传收款凭证' }]}
        extra="支持常用文档和图片以及压缩包格式文件，单个不能超过50M"
      >
        <UploadFileList
          fileBack={handleUpload}
          required
          defaultFileList={undefined}
          businessType="REQUEST_FUNDS_DEPOSIT"
          accept={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
          acceptType={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
          acceptMessage="上传格式不对，请检查上传文件"
          maxSize="50"
        />
      </ProForm.Item>
      <ProFormTextArea
        colProps={{ span: 24 }}
        label={'备注'}
        placeholder={'请输入备注'}
        name={'remark'}
      />
    </ModalForm>
  );
};

export default Dialog;

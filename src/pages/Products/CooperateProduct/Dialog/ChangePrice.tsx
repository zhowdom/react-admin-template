import React, { useRef } from 'react';
import { Button, Form } from 'antd';
import { EditableProTable } from '@ant-design/pro-table';
import ProForm, {
  ModalForm,
  ProFormInstance,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import PubDingDept from '@/components/PubForm/PubDingDept';
import { goodsSkuChangePrice } from '@/services/pages/cooperateProduct';

const ChangePrice: React.FC<{
  priceDetailList: any;
  dataSource: any;
  reload?: any;
  title?: any;
  dicList: any;
  reset?: any;
}> = ({ priceDetailList = [], reload, title, dicList, dataSource, reset }) => {
  const [editForm] = Form.useForm();
  console.log(priceDetailList);
  const editableKeys = priceDetailList.map((item: any) => item.id);
  const formRef = useRef<ProFormInstance>();
  return (
    <ModalForm
      formRef={formRef}
      title={title || '价格变更'}
      trigger={
        <Button disabled={!priceDetailList.length} type={'primary'}>
          {title || '价格变更'}
        </Button>
      }
      layout="horizontal"
      labelAlign="right"
      labelCol={{ flex: '90px' }}
      modalProps={{ destroyOnClose: true, maskClosable: false }}
      initialValues={{ priceDetailList }}
      validateTrigger="onBlur"
      onFinish={async (values: any) => {
        values.priceDetailList.forEach((item: any) => {
          item.goods_sku_vendor_id = item.id;
        });

        console.log(values);

        PubDingDept(
          async (dId: any) => {
            const res: any = await goodsSkuChangePrice(values, dId);
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              return false;
            }
            console.log(44);
            pubMsg(res.message, 'success');
            if (reload) reload();
            if (reset) reset();
            return true;
          },
          (err: any) => {
            console.log(err);
            return false;
          },
        );
      }}
      onVisibleChange={(val) => {
        console.log(33);
        if (reset && !val) reset();
      }}
    >
      <ProFormText initialValue={dataSource.value} name={'vendor_id'} hidden />
      <ProFormText initialValue={1} name={'change_type'} hidden />
      <ProFormText initialValue={dataSource.label} label={'供应商'} name={'vendor_name'} readonly />
      <ProForm.Item label={'报价明细'}>
        <EditableProTable
          name="priceDetailList"
          request={async () => ({
            data: priceDetailList,
            success: true,
          })}
          value={priceDetailList}
          columns={[
            {
              title: '款式编码',
              dataIndex: 'sku_code',
              align: 'center',
              editable: false,
            },
            {
              title: '款式名称',
              dataIndex: 'sku_name',
              align: 'center',
              editable: false,
            },
            {
              title: 'ERP编码',
              dataIndex: 'erp_sku',
              align: 'center',
              editable: false,
            },
            {
              title: '变更前价格',
              dataIndex: 'before_price',
              align: 'center',
              width: 100,
              editable: false,
            },
            {
              title: '变更前币种',
              dataIndex: 'before_currency',
              align: 'center',
              width: 100,
              editable: false,
              valueEnum: dicList?.SC_CURRENCY || [],
            },
            {
              title: '变更后价格',
              dataIndex: 'after_price',
              align: 'center',
              width: 100,
              valueType: 'digit',
              fieldProps: {
                min: 0,
                precision: 2,
              },
              formItemProps: {
                rules: [pubRequiredRule],
              },
            },
            {
              title: '变更后币种',
              dataIndex: 'after_currency',
              align: 'center',
              width: 100,
              editable: false,
              valueEnum: dicList?.SC_CURRENCY || [],
            },
          ]}
          cardProps={{ bodyStyle: { padding: 0 } }}
          rowKey="id"
          bordered
          recordCreatorProps={false}
          editable={{
            type: 'multiple',
            editableKeys,
            form: editForm,
            actionRender: () => [],
          }}
        />
      </ProForm.Item>
      <ProFormTextArea
        name="remarks"
        label="变更原因"
        placeholder="变更原因"
        fieldProps={{ maxLength: 400 }}
        rules={[{ max: 400, message: '最多输入400字' }, pubRequiredRule]}
      />
      <ProForm.Item
        label="报价单"
        name="sys_files"
        rules={[{ required: true, message: '请上传上传报价单' }]}
        extra="支持常用文档和图片以及压缩包格式文件，单个不能超过50M"
      >
        <UploadFileList
          fileBack={(sys_files: any) => {
            formRef.current?.setFieldsValue({ sys_files });
          }}
          required
          businessType="GOODS_SKU_CHANGE_PRICE_QUOTATION_SHEET"
          listType="text"
          maxSize="50"
        />
      </ProForm.Item>
    </ModalForm>
  );
};
export default ChangePrice;

import {
  ModalForm,
  ProFormSelect,
  ProFormDatePicker,
  ProFormDigit,
  ProFormField,
  ProFormText,
  ProFormTextArea,
  ProForm,
  ProFormDependency,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { Divider } from 'antd';
import { requestFundsDetail, requestFundsSubmit, requestDetail } from '@/services/pages/sample';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import PubDingDept from '@/components/PubForm/PubDingDept';
import moment from 'moment';
import { priceValue } from '@/utils/filter';
import { getBankCountList } from '@/services/pages/supplier';
import { pubGetSigningList, pubGetVendorList } from '@/utils/pubConfirm';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import './index.less';

const Component: React.FC<{
  id: string;
  title?: string;
  trigger?: string;
  dicList: any;
  reload?: any;
  viewDetail?: any;
}> = ({ trigger, dicList, id, title, reload, viewDetail }) => {
  const [dataSource, dataSourceSet] = useState<any>({});
  const [submitting, submittingSet] = useState<any>(false);
  const [visible, visibleSet] = useState<boolean>(false);
  const [isRead, isReadSet] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();
  const getBankCountListAction = async (vendor_id: string): Promise<any> => {
    const postData = {
      vendor_id,
    };
    const res = await getBankCountList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    formRef.current?.setFieldsValue(res?.data?.[0] || {});
  };
  const handleUpload = (info: any, key: string) => {
    console.log(info, key);
    formRef?.current?.setFieldsValue({
      [key]: info,
    });
    formRef?.current?.validateFields([key]);
  };
  return (
    <ModalForm
      title={title || '样品请款'}
      trigger={<a onClick={() => visibleSet(true)}>{trigger || '请款'}</a>}
      visible={visible}
      layout="horizontal"
      labelAlign={'right'}
      labelCol={{ flex: '0 0 134px' }}
      grid
      className={viewDetail ? 'mb7' : ''}
      formRef={formRef}
      modalProps={{
        destroyOnClose: true,
        confirmLoading: submitting,
        onCancel: () => visibleSet(false),
      }}
      submitter={
        viewDetail
          ? false
          : {
              searchConfig: {
                submitText: '提交审批',
              },
            }
      }
      params={{ id }}
      request={async (params) => {
        if (!viewDetail) {
          const res: any = await requestFundsDetail(params);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            return {
              data: [],
              success: false,
            };
          }
          if (!res?.data?.requested_amount) {
            getBankCountListAction(res?.data?.vendor_id);
          }

          if (res?.data?.requested_amount > 0) {
            isReadSet(true);
          }
          dataSourceSet(res.data);
          console.log(res.data);
          return res.data || {};
        } else {
          const res: any = await requestDetail(params);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            return {};
          }
          if (!res?.data?.requested_amount) {
            getBankCountListAction(res?.data?.vendor_id);
          }

          if (res?.data?.requested_amount > 0) {
            isReadSet(true);
          }
          const data = {
            ...res.data.purchaseSampleOrder,
            ...res.data,
          };
          dataSourceSet(data);

          return data || {};
        }
      }}
      onFinish={async (values) => {
        console.log(values);
        values.order_id = dataSource.id;
        values.purchaseSampleOrder = {
          vendor_id: values.vendor_id,
          procurement_subject_id: values.procurement_subject_id,
          order_amount: values.order_amount,
          currency: values.currency,
          mould_ascription: values.mould_ascription,
          mould_files: values.mould_files,
        };
        return PubDingDept(
          async (dId: any) => {
            submittingSet(true);
            const res = await requestFundsSubmit(values, dId);
            submittingSet(false);
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              return;
            }
            pubMsg(res.message, 'success');
            visibleSet(false);
            if (typeof reload == 'function') reload();
            return true;
          },
          (err: any) => {
            console.log(err);
          },
        );
      }}
    >
      <ProFormText
        colProps={{ span: 24 }}
        label={'样品单号'}
        name={'order_no'}
        readonly
        formItemProps={{ className: 'mb7' }}
      />
      <ProFormSelect
        formItemProps={{ className: 'mb7' }}
        name="vendor_id"
        label="供应商"
        readonly={isRead || viewDetail}
        colProps={{ span: 12 }}
        rules={[{ required: !(isRead || viewDetail), message: '请选择供应商' }]}
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
        onChange={(val: any) => {
          getBankCountListAction(val);
        }}
        request={async (v) => {
          const res: any = await pubGetVendorList(v);
          return res;
        }}
      />
      <ProFormSelect
        formItemProps={{ className: 'mb7' }}
        readonly={isRead || viewDetail}
        name="procurement_subject_id"
        label="采购主体"
        colProps={{ span: 12 }}
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
        }}
        request={async (v) => {
          const res: any = await pubGetSigningList({ key_word: v?.keyWords });
          return res;
        }}
        rules={[{ required: !(isRead || viewDetail), message: '请选择采购主体' }]}
      />
      <ProFormDigit
        formItemProps={{ className: 'mb7' }}
        colProps={{ span: 12 }}
        label={'总开模金额'}
        readonly={isRead || viewDetail}
        name={'order_amount'}
        rules={[
          { required: !(isRead || viewDetail), message: '请输入总开模金额' },
          {
            validator: (_, v) => {
              if (v > 0) return Promise.resolve();
              return Promise.reject('本次请款金额 > 0');
            },
          },
        ]}
        fieldProps={{
          precision: 2,
        }}
      />
      <ProFormSelect
        name="currency"
        rules={[{ required: !(isRead || viewDetail), message: '请选择币种' }]}
        formItemProps={{ className: 'mb7' }}
        colProps={{ span: 12 }}
        label="结算币种"
        readonly={isRead || viewDetail}
        valueEnum={dicList?.SC_CURRENCY}
        placeholder="请选择币种"
        onChange={(val: string) => {
          dataSourceSet((pre: any) => {
            return {
              ...pre,
              currency: val,
            };
          });
        }}
      />
      <ProFormSelect
        colProps={{ span: 12 }}
        name="mould_ascription"
        label="模具归属权"
        formItemProps={{ className: 'mb7' }}
        readonly={isRead || viewDetail}
        valueEnum={dicList?.PURCHASE_SAMPLE_ORDER_ASCRIPTION}
        placeholder="请选择模具归属权"
        rules={[{ required: !(isRead || viewDetail), message: '请选择模具归属权' }]}
      />
      <ProForm.Item
        required={!isRead && !viewDetail}
        formItemProps={{ className: 'mb7' }}
        rules={[
          () => ({
            validator(_, value) {
              const unDeleteFiles = value?.filter((file: any) => file.delete != 1);
              if (!unDeleteFiles?.length) {
                return Promise.reject(new Error('请上传合同'));
              }
              return Promise.resolve();
            },
          }),
        ]}
        label="开模合同："
        name="mould_files"
        extra={
          isRead || viewDetail
            ? undefined
            : 'word、excel、pdf和jpg格式文件，不得超过20M，可上传多个文件'
        }
      >
        <UploadFileList
          fileBack={(val: any, init: boolean) => {
            if (!init) {
              handleUpload(val, 'mould_files');
            }
          }}
          required
          disabled={isRead || viewDetail}
          businessType={'PURCHASE_SAMPLE_ORDER_MOULD_CONTRACT'}
          checkMain={false}
          defaultFileList={dataSource?.mould_files}
          accept={['.docx,.doc,.xls,.xlsx,.pdf,.jpg,.jpeg']}
          acceptType={['docx', 'doc', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg']}
          maxSize="20"
        />
      </ProForm.Item>
      <Divider style={{ marginTop: '-12px' }} />

      <ProFormField
        colProps={{ span: 12 }}
        label={'已请款金额'}
        mode={'read'}
        text={priceValue(dataSource.requested_amount)}
      />

      <ProFormDependency name={['order_amount', 'requested_amount']}>
        {({ order_amount, requested_amount }) => {
          return (
            <>
              <ProFormField
                colProps={{ span: 12 }}
                label={'可请款金额'}
                mode={'read'}
                tooltip={'可请款金额 = 样品单金额 - 已请款金额'}
                text={priceValue(order_amount - requested_amount)}
                formItemProps={{ className: 'emphasize-value-green' }}
              />
              <ProFormDigit
                colProps={{ span: 12 }}
                label={'本次请款金额'}
                name={'amount'}
                readonly={viewDetail}
                rules={[
                  { required: !(isRead || viewDetail), message: '请输入本次请款金额' },
                  {
                    validator: (_, v) => {
                      if (v <= 0) {
                        return Promise.reject('本次请款金额 > 0');
                      }
                      if (v > order_amount - requested_amount) {
                        return Promise.reject('本次请款金额应大于可请款金额');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                fieldProps={{
                  precision: 2,
                }}
                formItemProps={{ className: 'emphasize-label-bold' }}
              />
            </>
          );
        }}
      </ProFormDependency>

      <br />
      <ProFormText
        readonly={viewDetail}
        colProps={{ span: 12 }}
        label={'供应商收款账户名'}
        name={'bank_account_name'}
        rules={viewDetail ? undefined : [pubRequiredRule]}
      />
      <ProFormText
        readonly={viewDetail}
        colProps={{ span: 12 }}
        label={'开户行'}
        name={'bank_name'}
        rules={viewDetail ? undefined : [pubRequiredRule]}
      />
      <ProFormText
        readonly={viewDetail}
        colProps={{ span: 12 }}
        label={'银行账号'}
        name={'bank_account'}
        rules={viewDetail ? undefined : [pubRequiredRule]}
      />
      <ProFormDependency name={['currency']}>
        {({ currency }) => {
          return (
            currency == 'USD' && (
              <>
                <ProFormText
                  readonly={viewDetail}
                  colProps={{ span: 12 }}
                  name="bank_routing"
                  label="Bank Routing#"
                  placeholder="请输入"
                  rules={viewDetail ? undefined : [pubRequiredRule]}
                />
                <ProFormText
                  readonly={viewDetail}
                  colProps={{ span: 12 }}
                  name="swift"
                  label="SWIFT"
                  placeholder="请输入"
                  rules={viewDetail ? undefined : [pubRequiredRule]}
                />
                <ProFormText
                  readonly={viewDetail}
                  colProps={{ span: 12 }}
                  name="bank_address"
                  label="Bank Address"
                  placeholder="请输入"
                  rules={viewDetail ? undefined : [pubRequiredRule]}
                />
                <ProFormText
                  readonly={viewDetail}
                  colProps={{ span: 12 }}
                  name="company_address"
                  label="Company Address"
                  placeholder="请输入"
                  rules={viewDetail ? undefined : [pubRequiredRule]}
                />
                <ProFormText
                  readonly={viewDetail}
                  colProps={{ span: 12 }}
                  name="phone_number"
                  label="Phone Number"
                  placeholder="请输入"
                  rules={viewDetail ? undefined : [pubRequiredRule]}
                />
              </>
            )
          );
        }}
      </ProFormDependency>

      <ProFormDatePicker
        readonly={viewDetail}
        colProps={{ span: 12 }}
        label={'要求付款时间'}
        name={'requirement_pay_time'}
        rules={viewDetail ? undefined : [pubRequiredRule]}
        fieldProps={{
          disabledDate: (current: any) => current && current < moment().add(-1, 'day'),
        }}
      />
      <ProFormTextArea
        readonly={viewDetail}
        colProps={{ span: 24 }}
        label={'请款说明'}
        name={'reason'}
        rules={viewDetail ? undefined : [pubRequiredRule]}
      />
    </ModalForm>
  );
};
export default Component;

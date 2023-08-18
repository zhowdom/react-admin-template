import {
  ModalForm,
  ProDescriptions,
  ProFormDatePicker,
  ProFormDigit,
  ProFormField,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { Divider } from 'antd';
import { requestFundsDetail, requestFundsSubmit } from '@/services/pages/sample';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import PubDingDept from '@/components/PubForm/PubDingDept';
import moment from 'moment';
import { priceValue } from '@/utils/filter';
import { getBankCountList } from '@/services/pages/supplier';

const Component: React.FC<{
  id: string;
  title?: string;
  trigger?: string;
  dicList: any;
  reload?: any;
}> = ({ trigger, dicList, id, title, reload }) => {
  const [dataSource, dataSourceSet] = useState<any>({});
  const [submitting, submittingSet] = useState<any>(false);
  const [visible, visibleSet] = useState<boolean>(false);
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
  return (
    <ModalForm
      title={title || '样品请款'}
      trigger={<a onClick={() => visibleSet(true)}>{trigger || '请款'}</a>}
      visible={visible}
      layout="horizontal"
      labelAlign={'right'}
      labelCol={{ flex: '0 0 134px' }}
      grid
      formRef={formRef}
      modalProps={{
        destroyOnClose: true,
        confirmLoading: submitting,
        onCancel: () => visibleSet(false),
      }}
      submitter={{
        searchConfig: {
          submitText: '提交审批',
        },
      }}
      onFinish={async (values) => {
        values.order_id = dataSource.id;
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
      <ProDescriptions
        labelStyle={{ justifyContent: 'flex-end', minWidth: '134px' }}
        column={2}
        dataSource={dataSource}
        columns={[
          {
            title: '样品单号',
            dataIndex: 'order_no',
            copyable: true,
          },
          {
            title: '采购主体',
            dataIndex: 'procurement_subject_name',
            className: 'emphasize-value-bold',
          },
          {
            title: '供应商',
            dataIndex: 'vendor_name',
            className: 'emphasize-value-bold',
          },
          {
            title: '样品单金额',
            dataIndex: 'order_amount',
            className: 'emphasize-value-green',
            renderText: (text: any) => priceValue(text),
          },
          {
            title: '已请款金额',
            tooltip: '已请款金额 = 已付款的金额 + 请款中的金额',
            dataIndex: 'requested_amount',
            renderText: (text: any) => priceValue(text),
          },
          {
            title: '结算币种',
            dataIndex: 'currency',
            valueEnum: dicList?.SC_CURRENCY,
          },
        ]}
      >
        <ProDescriptions.Item span={2} label={'样品清单'}>
          <ProTable
            style={{ flex: 1 }}
            cardProps={{ bodyStyle: { padding: 0 } }}
            search={false}
            options={false}
            pagination={false}
            columns={[
              {
                title: '款式名称',
                dataIndex: 'sku_name',
              },
              {
                title: '采购数量',
                dataIndex: 'quantity',
                align: 'right',
              },
            ]}
            size={'small'}
            bordered
            rowKey={'id'}
            params={{ id }}
            request={async (params) => {
              const res: any = await requestFundsDetail(params);
              if (res?.code != pubConfig.sCode) {
                pubMsg(res?.message);
                return {
                  data: [],
                  success: false,
                };
              }

              getBankCountListAction(res?.data?.vendor_id);
              dataSourceSet(res.data);
              return {
                data: res.data?.purchaseSampleOrderSkuList || [],
                success: true,
              };
            }}
          />
        </ProDescriptions.Item>
      </ProDescriptions>
      <Divider />
      <ProFormDigit
        colProps={{ span: 12 }}
        label={'本次请款金额'}
        name={'amount'}
        rules={[
          pubRequiredRule,
          {
            validator: (_, v) => {
              if (v > 0) return Promise.resolve();
              return Promise.reject('本次请款金额 > 0');
            },
          },
        ]}
        min={0}
        max={dataSource.order_amount - dataSource.requested_amount}
        fieldProps={{
          precision: 2,
        }}
        formItemProps={{ className: 'emphasize-label-bold' }}
      />
      <ProFormField
        colProps={{ span: 12 }}
        label={'可请款金额'}
        mode={'read'}
        tooltip={'可请款金额 = 样品单金额 - 已请款金额'}
        text={priceValue(dataSource.order_amount - dataSource.requested_amount)}
        formItemProps={{ className: 'emphasize-value-green' }}
      />
      <ProFormText
        colProps={{ span: 12 }}
        label={'供应商收款账户名'}
        name={'bank_account_name'}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 12 }}
        label={'开户行'}
        name={'bank_name'}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 12 }}
        label={'银行账号'}
        name={'bank_account'}
        rules={[pubRequiredRule]}
      />
      {dataSource?.currency == 'USD' && (
        <>
          <ProFormText
            colProps={{ span: 12 }}
            name="bank_routing"
            label="Bank Routing#"
            placeholder="请输入"
            rules={[pubRequiredRule]}
          />
          <ProFormText
            colProps={{ span: 12 }}
            name="swift"
            label="SWIFT"
            placeholder="请输入"
            rules={[pubRequiredRule]}
          />
          <ProFormText
            colProps={{ span: 12 }}
            name="bank_address"
            label="Bank Address"
            placeholder="请输入"
            rules={[pubRequiredRule]}
          />
          <ProFormText
            colProps={{ span: 12 }}
            name="company_address"
            label="Company Address"
            placeholder="请输入"
            rules={[pubRequiredRule]}
          />
          <ProFormText
            colProps={{ span: 12 }}
            name="phone_number"
            label="Phone Number"
            placeholder="请输入"
            rules={[pubRequiredRule]}
          />
        </>
      )}
      <ProFormDatePicker
        colProps={{ span: 12 }}
        label={'要求付款时间'}
        name={'requirement_pay_time'}
        rules={[pubRequiredRule]}
        fieldProps={{
          disabledDate: (current: any) => current && current < moment().add(-1, 'day'),
        }}
      />
      <ProFormTextArea
        colProps={{ span: 24 }}
        label={'请款说明'}
        name={'reason'}
        rules={[pubRequiredRule]}
      />
    </ModalForm>
  );
};
export default Component;

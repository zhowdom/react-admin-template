import { Button, Form, Space } from 'antd';
import {
  ModalForm,
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { PlusOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import './index.less';
import { getSysPlatformPage } from '@/services/pages/storageManage';
import { add, edit } from '@/services/pages/InitQuotation';

export default (props: any) => {
  const { initialValues, dicList } = props;
  const formRef = useRef<ProFormInstance>();
  const [visible, visibleSet] = useState<boolean>(false);
  const [submitting, submittingSet] = useState<any>(false);
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={initialValues ? '编辑头程报价' : '添加头程报价'}
      formRef={formRef}
      trigger={
        initialValues ? (
          <a onClick={() => visibleSet(true)}> {props.trigger}</a>
        ) : (
          <Button ghost type="primary" icon={<PlusOutlined />} onClick={() => visibleSet(true)}>
            {props.trigger}
          </Button>
        )
      }
      visible={visible}
      className="item10"
      labelAlign="right"
      labelCol={{ span: 6 }}
      wrapperCol={{ flex: '304px' }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        onCancel: () => visibleSet(false),
        confirmLoading: submitting,
      }}
      initialValues={
        initialValues
          ? {
              ...initialValues,
              plat: `${initialValues.platform_id}-${initialValues.platform_code}-${initialValues.platform_name}`,
            }
          : undefined
      }
      width={550}
      onFinish={async (values: any) => {
        const postData = {
          ...values,
          platform_id: values?.plat?.split('-')?.[0],
          platform_name: values?.plat?.split('-')?.[2],
          platform_code: values?.plat?.split('-')?.[1],
          billing_unit: 'KG',
        };
        submittingSet(true);
        const res: any = values.id ? await edit(postData) : await add(postData);
        submittingSet(false);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功!', 'success');
          props.reload();
          visibleSet(false);
          return true;
        }
      }}
    >
      <ProFormText name="id" label="id" hidden />
      {initialValues && (
        <Form.Item label="平台/站点">
          {initialValues?.platform_name && initialValues?.shop_site
            ? `${initialValues.platform_name}-${pubFilter(
                dicList.FIRST_TRANSPORT_QUOTE_SHOP_SITE,
                initialValues?.shop_site,
              )}`
            : '-'}
        </Form.Item>
      )}
      <div className="sites-group-formItem" style={{ marginTop: initialValues ? '-24px' : 0 }}>
        <ProFormGroup>
          <ProFormSelect
            hidden={initialValues}
            wrapperCol={{ span: 18 }}
            labelCol={{ span: 10 }}
            name="plat"
            label="平台/站点"
            placeholder="选择平台"
            rules={[{ required: true, message: '请选择平台' }]}
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
              const res: any = await getSysPlatformPage({
                ...v,
                business_scope: 'IN',
                name: 'AmazonSC',
                current_page: 1,
                page_size: 10,
              });
              return res?.data?.records?.map((i: any) => {
                return {
                  value: `${i.id}-${i.code}-${i.name}`,
                  label: i.name,
                };
              });
            }}
          />

          <ProFormSelect
            hidden={initialValues}
            name="shop_site"
            label=""
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 18 }}
            valueEnum={dicList?.FIRST_TRANSPORT_QUOTE_SHOP_SITE}
            rules={[{ required: true, message: '请选择站点' }]}
            placeholder="选择站点"
            showSearch
            allowClear
          />
        </ProFormGroup>
      </div>
      <ProFormSelect
        readonly={initialValues}
        name="shipping_method"
        label="运输方式"
        valueEnum={dicList?.FIRST_TRANSPORT_QUOTE_SHIPPING_METHOD}
        placeholder="请选择运输方式"
        rules={[{ required: !initialValues, message: '请选择运输方式' }]}
        extra={
          initialValues ? undefined : (
            <Space size={20}>
              <span>普船&快船： 龙舟普船、龙舟快船</span>
            </Space>
          )
        }
      />
      <ProFormSelect
        readonly={initialValues}
        name="product_type"
        label="产品类型"
        valueEnum={dicList?.STORAGE_FEE_BELONG_CLASSIFY}
        placeholder="请选择产品类型"
        rules={[{ required: !initialValues, message: '请选择产品类型' }]}
      />

      <div className="full-item">
        <ProFormDigit
          label="整柜价格"
          name="fcl_price"
          fieldProps={{ precision: 2 }}
          wrapperCol={{ flex: '353px' }}
          rules={[
            { required: true, message: '请输入整柜价格' },
            () => ({
              validator(_, value) {
                if (value == 0) {
                  return Promise.reject(new Error('整柜价格不能为0'));
                }
                return Promise.resolve();
              },
            }),
          ]}
          addonAfter="/柜(62m³)"
        />
        <ProFormDigit
          label="拼柜价格"
          name="lcl_price"
          addonAfter="/m³"
          fieldProps={{ precision: 2 }}
          rules={[
            { required: true, message: '请输入拼柜价格' },
            () => ({
              validator(_, value) {
                if (value == 0) {
                  return Promise.reject(new Error('拼柜价格不能为0'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        />
      </div>

      <ProFormSelect
        name="currency"
        label="报价币种"
        valueEnum={dicList?.SC_CURRENCY}
        placeholder="请选择报价币种"
        rules={[{ required: true, message: '请选择报价币种' }]}
      />
    </ModalForm>
  );
};

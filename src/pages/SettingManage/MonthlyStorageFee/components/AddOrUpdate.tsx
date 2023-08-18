import { Button, Form } from 'antd';
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
import { useRef } from 'react';
import './index.less';
import { getSysPlatformPage } from '@/services/pages/storageManage';
import { add, edit } from '@/services/pages/monthlyStorageFee';

export default (props: any) => {
  const { initialValues, dicList } = props;
  const formRef = useRef<ProFormInstance>();

  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={initialValues ? '编辑月仓储费报价' : '添加月仓储费报价'}
      formRef={formRef}
      trigger={
        initialValues ? (
          <a> {props.trigger}</a>
        ) : (
          <Button ghost type="primary" icon={<PlusOutlined />}>
            {props.trigger}
          </Button>
        )
      }
      className="item10"
      labelAlign="right"
      labelCol={{ flex: '122px' }}
      wrapperCol={{ flex: '304px' }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      initialValues={
        initialValues
          ? {
              ...initialValues,
              plat: `${initialValues.platform_id}-${initialValues.platform_code}-${initialValues.platform_name}`,
            }
          : undefined
      }
      width={800}
      onFinish={async (values: any) => {
        const postData = {
          ...values,
          platform_id: values?.plat?.split('-')?.[0],
          platform_name: values?.plat?.split('-')?.[2],
          platform_code: values?.plat?.split('-')?.[1],
        };
        const res: any = initialValues ? await edit(postData) : await add(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功!', 'success');
          props.reload();
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
      <Form.Item label="标准件" required wrapperCol={{ span: 19 }} className="label-h-56">
        <div className="inner-bg">
          <ProFormGroup>
            <ProFormDigit
              required={false}
              label="淡季"
              name={['standardParts', 'low_season_price']}
              fieldProps={{ precision: 2 }}
              rules={[
                { required: true, message: '请输入' },
                () => ({
                  validator(_, value) {
                    if (value == 0) {
                      return Promise.reject(new Error('不能为0'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            />
            <ProFormDigit
              required={false}
              label="旺季"
              name={['standardParts', 'peak_season_price']}
              rules={[
                { required: true, message: '请输入' },
                () => ({
                  validator(_, value) {
                    if (value == 0) {
                      return Promise.reject(new Error('不能为0'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              fieldProps={{ precision: 2 }}
            />
            <ProFormText
              name={['standardParts', 'belong_classify']}
              label="low_season"
              hidden
              initialValue={1}
            />
            <ProFormText
              name={['standardParts', 'low_season']}
              label="low_season"
              hidden
              initialValue={1}
            />
            <ProFormText
              name={['standardParts', 'peak_season']}
              label="low_season"
              hidden
              initialValue={2}
            />
            <ProFormText
              name={['standardParts', 'standardPartsId']}
              label="standardPartsId"
              hidden
            />
          </ProFormGroup>
        </div>
      </Form.Item>
      <Form.Item label="大尺寸" required wrapperCol={{ span: 19 }} className="label-h-56">
        <div className="inner-bg">
          <ProFormGroup>
            <ProFormDigit
              label="淡季"
              required={false}
              name={['largeSize', 'low_season_price']}
              rules={[
                { required: true, message: '请输入' },
                () => ({
                  validator(_, value) {
                    if (value == 0) {
                      return Promise.reject(new Error('不能为0'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              fieldProps={{ precision: 2 }}
            />
            <ProFormDigit
              label="旺季"
              required={false}
              name={['largeSize', 'peak_season_price']}
              rules={[
                { required: true, message: '请输入' },
                () => ({
                  validator(_, value) {
                    if (value == 0) {
                      return Promise.reject(new Error('不能为0'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              fieldProps={{ precision: 2 }}
            />
            <ProFormText
              name={['largeSize', 'belong_classify']}
              label="low_season"
              hidden
              initialValue={2}
            />
            <ProFormText
              name={['largeSize', 'low_season']}
              label="low_season"
              hidden
              initialValue={1}
            />
            <ProFormText
              name={['largeSize', 'peak_season']}
              label="low_season"
              hidden
              initialValue={2}
            />
            <ProFormText
              name={['largeSize', 'largeSizeId']}
              label="largeSizeId"
              hidden
              initialValue={2}
            />
          </ProFormGroup>
        </div>
      </Form.Item>

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

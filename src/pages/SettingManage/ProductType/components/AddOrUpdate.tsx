import { Button, Form } from 'antd';
import {
  ModalForm,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { PlusOutlined } from '@ant-design/icons';
import { useRef } from 'react';
import './index.less';
import { getSysPlatformPage,getSysPlatformList } from '@/services/pages/storageManage';
import { add, edit } from '@/services/pages/productType';

export default (props: any) => {
  const { initialValues, dicList } = props;
  const formRef = useRef<ProFormInstance>();
  const labels = {
    10: '最长边',
    20: '次长边',
    30: '最短边',
    40: '最长边+周长',
    50: '计费重',
  };
  const initTypes = [
    {
      type_standard: 10,
      standard_condition: '1',
      unit: 'cm',
    },
    {
      type_standard: 20,
      standard_condition: '1',
      unit: 'cm',
    },
    {
      type_standard: 30,
      standard_condition: '1',
      unit: 'cm',
    },
    {
      type_standard: 40,
      standard_condition: '1',
      unit: 'cm',
    },
    {
      type_standard: 50,
      standard_condition: '1',
      unit: '磅',
    },
  ];
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={initialValues ? '编辑产品类型' : '添加产品类型'}
      formRef={formRef}
      trigger={
        initialValues ? (
          <a key='edit'> {props.trigger}</a>
        ) : (
          <Button key='adds' ghost type="primary" icon={<PlusOutlined />}>
            {props.trigger}
          </Button>
        )
      }
      className="item10 pro-type"
      labelAlign="right"
      labelCol={{ flex: '120px' }}
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
              shop_site: initialValues?.shop_site,
            }
          : {
              standardList: initTypes,
              lowSeasonFba: {
                billing_type: '1',
                weight_unit: '磅',
              },
              peakSeasonFba: {
                billing_type: '1',
                weight_unit: '磅',
              },
            }
      }
      width={850}
      onFinish={async (values: any) => {
        // 都为不计算不能添加
        if (
          values.standardList.every((v: any) => {
            return v.standard_condition == '7';
          })
        ) {
          pubMsg('类型标准至少需要一个限制条件，请确认标准设置是否正确！');
          return;
        }
        const data = JSON.parse(JSON.stringify(values.standardList));
        for (const item of data) {
          if (item.standard_condition == 7 && !item.fixed_value) {
            item.fixed_value = 0;
          }
        }
        const postData = {
          ...values,
          platform_id: values?.plat?.split('-')?.[0],
          platform_name: values?.plat?.split('-')?.[2],
          platform_code: values?.plat?.split('-')?.[1],
          shop_site: values.shop_site,
          standardList: data,
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
      onFinishFailed={(e) => {
        console.log(e);
      }}
    >
      <ProFormText name="id" label="id" hidden />
      <ProFormSelect
        name="belong_classify"
        label="尺寸类型"
        valueEnum={dicList?.STORAGE_FEE_BELONG_CLASSIFY}
        placeholder="请选择"
        rules={[{ required: true, message: '请选择' }]}
      />
      <ProFormText
        name="name"
        label="产品类型名"
        placeholder="请输入产品类型名"
        rules={[{ required: true, message: '请输入产品类型名' }]}
      />
      <ProFormDependency name={['standardList']}>
        {({ standardList }) => {
          return (
            <Form.Item label="类型标准" required wrapperCol={{ span: 19 }} className="label-h-56">
              <div className="inner-bg">
                {initTypes.map((item: any, index: number) => (
                  <ProFormGroup key={item.type_standard}>
                    <ProFormText name={['standardList', index, 'id']} label="id" hidden />
                    <ProFormText name={['standardList', index, 'unit']} label="单位" hidden />
                    <ProFormText
                      name={['standardList', index, 'type_standard']}
                      label="type_standard"
                      hidden
                    />
                    <ProFormSelect
                      required={false}
                      name={['standardList', index, 'standard_condition']}
                      label={labels[item.type_standard]}
                      rules={[{ required: true, message: '请选择' }]}
                      allowClear={false}
                      valueEnum={dicList?.PRODUCT_VALUATION_TYPE_STANDARD_CONDITION}
                    />
                    {standardList?.[index]?.standard_condition == '1' ? (
                      <>
                        <ProFormDigit
                          dependencies={[['standardList', index, 'end_value']]}
                          placeholder="请输入最小值"
                          name={['standardList', index, 'start_value']}
                          fieldProps={{ precision: 2 }}
                          hasFeedback
                          rules={[
                            { required: true, message: '请输入最小值' },
                            (form: any) => ({
                              validator(_, value) {
                                const end_value = form.getFieldValue([
                                  'standardList',
                                  index,
                                  'end_value',
                                ]);
                                if (value == 0) {
                                  return Promise.reject(new Error('最小值不能为0'));
                                }
                                if (value >= end_value) {
                                  return Promise.reject(new Error('应小于最大值'));
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        />
                        -
                        <ProFormDigit
                          dependencies={[['standardList', index, 'start_value']]}
                          placeholder="请输入最大值"
                          name={['standardList', index, 'end_value']}
                          fieldProps={{ precision: 2 }}
                          hasFeedback
                          rules={[
                            { required: true, message: '请输入最大值' },
                            (form: any) => ({
                              validator(_, value) {
                                const start_value = form.getFieldValue([
                                  'standardList',
                                  index,
                                  'start_value',
                                ]);
                                if (value == 0) {
                                  return Promise.reject(new Error('最大值不能为0'));
                                }
                                if (value <= start_value) {
                                  return Promise.reject(new Error('应大于最小值'));
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        />
                        <span className="lh32">{item.type_standard == 50 ? '磅' : 'cm'}</span>
                      </>
                    ) : (
                      <>
                        <ProFormDigit
                          placeholder="请输入数值"
                          name={['standardList', index, 'fixed_value']}
                          fieldProps={{ precision: 2 }}
                          rules={[
                            {
                              required: standardList?.[index]?.standard_condition != '7',
                              message: '请输入数值',
                            },
                            () => ({
                              validator(_, value) {
                                if (value == 0) {
                                  return Promise.reject(new Error('数值不能为0'));
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        />
                        <span className="lh32">{item.type_standard == 50 ? '磅' : 'cm'}</span>
                      </>
                    )}
                  </ProFormGroup>
                ))}
              </div>
            </Form.Item>
          );
        }}
      </ProFormDependency>
      <ProFormDependency name={['lowSeasonFba']}>
        {({ lowSeasonFba }) => {
          return (
            <Form.Item
              label={
                <div>
                  派送费规则
                  <br />
                  (淡季)
                </div>
              }
              required
              wrapperCol={{ span: 19 }}
              className="label-h-56"
            >
              <div className="inner-bg s">
                <ProFormText name={['lowSeasonFba', 'weight_unit']} label="单位" hidden />
                <ProFormText name={['lowSeasonFba', 'id']} label="id" hidden />
                <ProFormGroup>
                  <ProFormSelect
                    style={{ width: '110px' }}
                    required={false}
                    name={['lowSeasonFba', 'billing_type']}
                    rules={[{ required: true, message: '请选择' }]}
                    allowClear={false}
                    valueEnum={dicList?.PRODUCT_VALUATION_TYPE_FBA_BILLING_TYPE}
                  />
                  {lowSeasonFba?.billing_type == '1' ? (
                    <>
                      <ProFormDigit
                        placeholder="请输入数值"
                        name={['lowSeasonFba', 'fixed_price']}
                        fieldProps={{ precision: 2 }}
                        rules={[
                          { required: true, message: '请输入数值' },
                          () => ({
                            validator(_, value) {
                              if (value == 0) {
                                return Promise.reject(new Error('数值不能为0'));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      />
                    </>
                  ) : (
                    <>
                      <ProFormDigit
                        placeholder="请输入首重价格"
                        name={['lowSeasonFba', 'first_weight_price']}
                        fieldProps={{ precision: 2 }}
                        rules={[
                          { required: true, message: '请输入首重价格' },
                          () => ({
                            validator(_, value) {
                              if (value == 0) {
                                return Promise.reject(new Error('首重价格不能为0'));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      />
                      +
                      <ProFormDigit
                        placeholder="请输入续重价格"
                        name={['lowSeasonFba', 'continued_weight_price']}
                        fieldProps={{ precision: 2 }}
                        rules={[
                          { required: true, message: '请输入续重价格' },
                          () => ({
                            validator(_, value) {
                              if (value == 0) {
                                return Promise.reject(new Error('续重价格不能为0'));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      />
                      <span className="lh32"> /磅</span>
                      <br />
                      <ProFormDigit
                        required={false}
                        label="首重重量"
                        placeholder="请输入首重重量"
                        name={['lowSeasonFba', 'first_weight']}
                        rules={[
                          { required: true, message: '请输入首重重量' },
                          () => ({
                            validator(_, value) {
                              if (value == 0) {
                                return Promise.reject(new Error('首重重量不能为0'));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      />
                      <span className="lh32">磅</span>
                    </>
                  )}
                </ProFormGroup>
              </div>
            </Form.Item>
          );
        }}
      </ProFormDependency>
      <ProFormDependency name={['peakSeasonFba']}>
        {({ peakSeasonFba }) => {
          return (
            <Form.Item
              label={
                <div>
                  派送费规则
                  <br />
                  (旺季)
                </div>
              }
              required
              wrapperCol={{ span: 19 }}
              className="label-h-56"
            >
              <div className="inner-bg s">
                <ProFormText name={['peakSeasonFba', 'weight_unit']} label="单位" hidden />
                <ProFormText name={['peakSeasonFba', 'id']} label="id" hidden />
                <ProFormGroup>
                  <ProFormSelect
                    style={{ width: '110px' }}
                    required={false}
                    name={['peakSeasonFba', 'billing_type']}
                    rules={[{ required: true, message: '请选择' }]}
                    allowClear={false}
                    valueEnum={dicList?.PRODUCT_VALUATION_TYPE_FBA_BILLING_TYPE}
                  />
                  {peakSeasonFba?.billing_type == '1' ? (
                    <>
                      <ProFormDigit
                        placeholder="请输入数值"
                        name={['peakSeasonFba', 'fixed_price']}
                        fieldProps={{ precision: 2 }}
                        rules={[
                          { required: true, message: '请输入数值' },
                          () => ({
                            validator(_, value) {
                              if (value == 0) {
                                return Promise.reject(new Error('数值不能为0'));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      />
                    </>
                  ) : (
                    <>
                      <ProFormDigit
                        placeholder="请输入首重价格"
                        fieldProps={{ precision: 2 }}
                        rules={[
                          { required: true, message: '请输入首重价格' },
                          () => ({
                            validator(_, value) {
                              if (value == 0) {
                                return Promise.reject(new Error('首重价格不能为0'));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                        name={['peakSeasonFba', 'first_weight_price']}
                      />
                      +
                      <ProFormDigit
                        placeholder="请输入续重价格"
                        name={['peakSeasonFba', 'continued_weight_price']}
                        fieldProps={{ precision: 2 }}
                        rules={[
                          { required: true, message: '请输入续重价格' },
                          () => ({
                            validator(_, value) {
                              if (value == 0) {
                                return Promise.reject(new Error('续重价格不能为0'));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      />
                      <span className="lh32"> /磅</span>
                      <br />
                      <ProFormDigit
                        required={false}
                        label="首重重量"
                        placeholder="请输入首重重量"
                        name={['peakSeasonFba', 'first_weight']}
                        rules={[
                          { required: true, message: '请输入首重重量' },
                          () => ({
                            validator(_, value) {
                              if (value == 0) {
                                return Promise.reject(new Error('首重重量不能为0'));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      />
                      <span className="lh32">磅</span>
                    </>
                  )}
                </ProFormGroup>
              </div>
            </Form.Item>
          );
        }}
      </ProFormDependency>

      <ProFormSelect
        name="currency"
        label="计费币种"
        valueEnum={dicList?.SC_CURRENCY}
        placeholder="请选择计费币种"
        rules={[{ required: true, message: '请选择计费币种' }]}
      />
      <div className="proType-group-formItem">
        <ProFormGroup>
          <ProFormSelect
            wrapperCol={{ span: 18 }}
            labelCol={{ flex: '114px' }}
            name="plat"
            label="适用平台/站点"
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
            disabled={initialValues}
            request={async (v) => {
              const res: any = await getSysPlatformList({
                ...v,
                business_scope: 'IN',
                codes: ['AMAZON_SC','WALMART'],
              });
              return res?.data?.map((i: any) => {
                return {
                  value: `${i.id}-${i.code}-${i.name}`,
                  label: i.name,
                };
              });
            }}
          />

          <ProFormSelect
            name="shop_site"
            label=""
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
            valueEnum={dicList?.FIRST_TRANSPORT_QUOTE_SHOP_SITE}
            rules={[{ required: true, message: '请选择站点' }]}
            placeholder="选择站点"
            showSearch
            allowClear
          />
        </ProFormGroup>
        <div className="priority-input">
          <ProFormDigit
            label="优先级"
            name="priority"
            wrapperCol={{ flex: '620px' }}
            rules={[
              { required: true, message: '请输入优先级' },
              () => ({
                validator(_, value) {
                  if (value == 0) {
                    return Promise.reject(new Error('汇率不能为0'));
                  }
                  if (value > 99999999.9999) {
                    return Promise.reject(new Error('应小于100,000,000'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            extra=" 当产品信息同时满足多个产品类型的标准时，按优先
            级数值从小到大优先匹配，优先级设置不能重复"
          />
        </div>
      </div>
    </ModalForm>
  );
};

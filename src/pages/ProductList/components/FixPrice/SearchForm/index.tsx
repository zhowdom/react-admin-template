import { getSysPlatformPage } from '@/services/pages/storageManage';
import ProForm, {
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
  ProFormRadio,
  ProFormFieldSet,
  ProFormDependency,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useEffect, useRef } from 'react';

export default (props: any) => {
  const { dicList, value, goodsSkus, showResult, _ref, loading } = props;
  const formRef = useRef<ProFormInstance>();
  _ref.current = {
    resetFields: () => {
      const key = `CUSTOMTAB${value}`;
      sessionStorage.setItem(`${key}`, JSON.stringify(formRef.current?.getFieldsValue()));
      formRef?.current?.resetFields();
    },
  };
  const init = {
    goods_sku_id: goodsSkus?.[0]?.value,
    purchase_currency: 'CNY',
    platform_id: '1531560384958316546',
    shop_site: 'US',
    shipping_method: '1',
    cabinet_type: '2',
    customs_declaration_ratio: 29,
    customs_declaration: 25,
    platform_rate: 15,
    return_cost: 2,
    domestic_shipping: 0,
    other_fee: 0,
    other_fee_currency: 'USD',
  };

  useEffect(() => {
    const data: any = sessionStorage.getItem(`CUSTOMTAB${value}`)
      ? JSON.parse(sessionStorage.getItem(`CUSTOMTAB${value}`) as string)
      : null;
    if (data) {
      formRef.current?.setFieldsValue(data);
    }
  }, [value]);
  return (
    <ProForm
      omitNil={false}
      formRef={formRef}
      layout="horizontal"
      labelCol={{ flex: value == '1' ? '125px' : '145px' }}
      wrapperCol={{ span: 16 }}
      onFinish={async (values: any) => {
        const postData = {
          ...values,
          calculated_type: value,
        };
        for (const key in postData) {
          if (!(postData[key] || postData[key] == 0) && Object.keys(init).includes(key)) {
            postData[key] = init[key];
          }
        }
        showResult(postData);
      }}
      submitter={{
        // 配置按钮文本
        searchConfig: {
          resetText: '重置',
          submitText: '计算',
        },
        submitButtonProps: {
          loading,
          className: 'submit',
        },
        // 配置按钮的属性
        resetButtonProps: {
          style: {
            // 隐藏重置按钮
            display: 'none',
          },
        },
      }}
    >
      {value === 1 && (
        <ProFormSelect
          name="goods_sku_id"
          label="选择款式"
          fieldProps={{
            options: goodsSkus,
            getPopupContainer: (triggerNode) => triggerNode.parentNode,
          }}
          placeholder="选择选择款式"
          showSearch
          allowClear={false}
          initialValue={init.goods_sku_id}
        />
      )}
      {value === 2 && (
        <>
          <div className={'group-lwhw-formItem'}>
            <ProFormFieldSet
              name="list1"
              label="包装尺寸"
              required
              type="group"
              rules={[
                {
                  validator: (_, v) => {
                    if (!v) {
                      return Promise.reject(new Error('包装尺寸不能为空'));
                    }
                    if (typeof v?.[0] == 'number' && v?.[0] <= 0) {
                      return Promise.reject(new Error('长度请输入大于0的数值'));
                    }
                    if (typeof v?.[1] == 'number' && v?.[1] <= 0) {
                      return Promise.reject(new Error('宽度请输入大于0的数值'));
                    }
                    if (typeof v?.[2] == 'number' && v?.[2] <= 0) {
                      return Promise.reject(new Error('高度请输入大于0的数值'));
                    }
                    if (typeof v?.[3] == 'number' && v?.[3] <= 0) {
                      return Promise.reject(new Error('重量请输入大于0的数值'));
                    }
                    if (!v?.[0]) {
                      return Promise.reject(new Error('请输入长度'));
                    }
                    if (!v?.[1]) {
                      return Promise.reject(new Error('请输入宽度'));
                    }
                    if (!v?.[2]) {
                      return Promise.reject(new Error('请输入高度'));
                    }
                    if (!v?.[3]) {
                      return Promise.reject(new Error('请输入重量'));
                    }

                    return Promise.resolve();
                  },
                },
              ]}
              transform={(v: any) => ({
                package_length: v[0],
                package_width: v[1],
                package_high: v[2],
                package_weight: v[3],
              })}
            >
              <ProFormDigit label="" placeholder="长" />
              <ProFormDigit label="" placeholder="宽" />
              <ProFormDigit label="" placeholder="高" />
              <ProFormDigit label="" placeholder="重量" />
            </ProFormFieldSet>
            <ProFormFieldSet
              name="list"
              label="箱规"
              required
              type="group"
              rules={[
                {
                  validator: (_, v) => {
                    const reg: any = /^[1-9]\d*$/;
                    if (typeof v?.[0] == 'number' && v?.[0] <= 0) {
                      return Promise.reject(new Error('长度请输入大于0的数值'));
                    }
                    if (typeof v?.[1] == 'number' && v?.[1] <= 0) {
                      return Promise.reject(new Error('宽度请输入大于0的数值'));
                    }
                    if (typeof v?.[2] == 'number' && v?.[2] <= 0) {
                      return Promise.reject(new Error('高度请输入大于0的数值'));
                    }
                    if (typeof v?.[3] == 'number' && (!reg.test(v?.[3]) || v?.[3] <= 0)) {
                      return Promise.reject(new Error('装箱数请输入正整数'));
                    }
                    if (!v) {
                      return Promise.reject(new Error('箱规不能为空'));
                    }
                    if (!v?.[0]) {
                      return Promise.reject(new Error('请输入长度'));
                    }
                    if (!v?.[1]) {
                      return Promise.reject(new Error('请输入宽度'));
                    }
                    if (!v?.[2]) {
                      return Promise.reject(new Error('请输入高度'));
                    }
                    if (!v?.[3]) {
                      return Promise.reject(new Error('请输入装箱数'));
                    }

                    return Promise.resolve();
                  },
                },
              ]}
              transform={(v: any) => ({
                box_length: v[0],
                box_width: v[1],
                box_high: v[2],
                box_pics: v[3],
              })}
            >
              <ProFormDigit label="" placeholder="长" />
              <ProFormDigit label="" placeholder="宽" />
              <ProFormDigit label="" placeholder="高" />
              <ProFormDigit label="" placeholder="装箱数" />
            </ProFormFieldSet>
          </div>

          <div className="group-formItem-dec">
            <ProFormGroup>
              <ProFormDigit
                name="purchase_price"
                label="采购进价(不含税价)"
                rules={[{ required: true, message: '请输入采购进价' }]}
                fieldProps={{ precision: 2 }}
              />
              <ProFormSelect
                name="purchase_currency"
                label=""
                labelCol={{ span: 0 }}
                wrapperCol={{ flex: '154px' }}
                valueEnum={() => {
                  const enumList = dicList?.SC_CURRENCY
                    ? JSON.parse(JSON.stringify(dicList?.SC_CURRENCY))
                    : {};
                  return {
                    CNY: enumList.CNY,
                    USD: enumList.USD,
                  };
                }}
                initialValue={init.purchase_currency}
                placeholder="请选择币别"
                showSearch
                allowClear={false}
                fieldProps={{
                  getPopupContainer: (triggerNode) => triggerNode.parentNode,
                }}
              />
            </ProFormGroup>
          </div>
        </>
      )}

      <ProFormSelect
        name="platform_id"
        label="平台"
        allowClear={false}
        wrapperCol={value == 1 ? { span: 16 } : { flex: '266px' }}
        placeholder="选择平台"
        fieldProps={{
          filterOption: (input: any, option: any) => {
            const trimInput = input.replace(/^\s+|\s+$/g, '');
            if (trimInput) {
              return option.label.indexOf(trimInput) >= 0;
            } else {
              return true;
            }
          },
          getPopupContainer: (triggerNode) => triggerNode.parentNode,
        }}
        initialValue={init.platform_id}
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
              value: `${i.id}`,
              label: i.name,
            };
          });
        }}
      />

      <ProFormSelect
        name="shop_site"
        label="站点"
        wrapperCol={value == 1 ? { span: 16 } : { flex: '266px' }}
        valueEnum={dicList?.FIRST_TRANSPORT_QUOTE_SHOP_SITE}
        placeholder="选择站点"
        showSearch
        allowClear={false}
        initialValue={init.shop_site}
        fieldProps={{
          getPopupContainer: (triggerNode) => triggerNode.parentNode,
          onChange: (val: any) => {
            const initObj = {
              US: 'USD',
              GB: 'GBP',
              DE: 'EUR',
            };
            formRef?.current?.setFieldsValue({
              currency: initObj[val],
            });
          },
        }}
      />
      <div className={value == '1' ? 'group-formItem' : 'group-formItem long'}>
        <ProFormGroup>
          <ProFormSelect
            labelCol={{ flex: '92px' }}
            name="shipping_method"
            label="运输方式"
            valueEnum={dicList?.FIRST_TRANSPORT_QUOTE_SHIPPING_METHOD}
            placeholder="请选择运输方式"
            initialValue={init.shipping_method}
            fieldProps={{
              getPopupContainer: (triggerNode) => triggerNode.parentNode,
            }}
            allowClear={false}
          />

          <ProFormSelect
            name="cabinet_type"
            label=""
            labelCol={{ span: 0 }}
            wrapperCol={{ flex: '152px' }}
            valueEnum={dicList?.PRODUCT_VALUATION_CALCULATED_CABINET_TYPE}
            placeholder="请选择装柜类型"
            showSearch
            allowClear={false}
            initialValue={init.cabinet_type}
            fieldProps={{
              getPopupContainer: (triggerNode) => triggerNode.parentNode,
            }}
          />
        </ProFormGroup>
      </div>
      {value == '1' ? (
        <ProFormDigit
          label="关税申报比例(%)"
          placeholder="默认为29"
          name="customs_declaration_ratio"
          fieldProps={{ precision: 2 }}
          rules={[
            () => ({
              validator(_, v) {
                if (v < 0 || v > 100) {
                  return Promise.reject(new Error('请输入0-100数值'));
                }

                return Promise.resolve();
              },
            }),
          ]}
        />
      ) : (
        <div className="group-formItem-dec">
          <ProFormGroup>
            <ProFormDigit
              label="关税率&申报比例(%)"
              name="customs_declaration"
              fieldProps={{ precision: 2 }}
              placeholder="默认为25"
              rules={[
                () => ({
                  validator(_, v) {
                    if (v < 0 || v > 100) {
                      return Promise.reject(new Error('请输入0-100数值'));
                    }

                    return Promise.resolve();
                  },
                }),
              ]}
            />

            <ProFormDigit
              label=""
              name="customs_declaration_ratio"
              fieldProps={{ precision: 2 }}
              wrapperCol={{ span: 24 }}
              placeholder="默认为29"
              rules={[
                () => ({
                  validator(_, v) {
                    if (v < 0 || v > 100) {
                      return Promise.reject(new Error('请输入0-100数值'));
                    }

                    return Promise.resolve();
                  },
                }),
              ]}
            />
          </ProFormGroup>
        </div>
      )}

      <ProFormDigit
        label="平台费率(%)"
        name="platform_rate"
        fieldProps={{ precision: 2 }}
        wrapperCol={value == 1 ? { span: 16 } : { flex: '266px' }}
        placeholder="默认为15"
        rules={[
          () => ({
            validator(_, v) {
              if (v < 0 || v > 100) {
                return Promise.reject(new Error('请输入0-100数值'));
              }

              return Promise.resolve();
            },
          }),
        ]}
      />
      <ProFormDigit
        label="退货成本(%)"
        name="return_cost"
        fieldProps={{ precision: 2 }}
        wrapperCol={value == 1 ? { span: 16 } : { flex: '266px' }}
        placeholder="默认为2"
        rules={[
          () => ({
            validator(_, v) {
              if (v < 0 || v > 100) {
                return Promise.reject(new Error('请输入0-100数值'));
              }

              return Promise.resolve();
            },
          }),
        ]}
      />
      <ProFormDigit
        label="国内运费(人民币)"
        name="domestic_shipping"
        wrapperCol={value == 1 ? { span: 16 } : { flex: '266px' }}
        fieldProps={{ precision: 2 }}
        placeholder="默认为0"
      />
      <div className="group-formItem-dec">
        <ProFormGroup>
          <ProFormDigit
            name="other_fee"
            label="其他费用"
            fieldProps={{ precision: 2 }}
            placeholder="默认为0"
          />
          <ProFormSelect
            name="other_fee_currency"
            label=""
            labelCol={{ span: 0 }}
            wrapperCol={{ flex: '154px' }}
            valueEnum={() => {
              const enumList = dicList?.SC_CURRENCY
                ? JSON.parse(JSON.stringify(dicList?.SC_CURRENCY))
                : {};
              return {
                CNY: enumList.CNY,
                USD: enumList.USD,
              };
            }}
            initialValue={init.other_fee_currency}
            placeholder="请选择币别"
            showSearch
            allowClear={false}
            fieldProps={{
              getPopupContainer: (triggerNode) => triggerNode.parentNode,
            }}
          />
        </ProFormGroup>
      </div>
      <ProFormRadio.Group
        name="low_season"
        label="淡旺季"
        placeholder="请选择"
        valueEnum={dicList?.STORAGE_FEE_SEASON}
        initialValue={'1'}
      />
      <ProFormRadio.Group
        name="currency"
        label="计价币种"
        placeholder="请选择"
        valueEnum={() => {
          const enumList = dicList?.SC_CURRENCY
            ? JSON.parse(JSON.stringify(dicList?.SC_CURRENCY))
            : {};
          return {
            CNY: enumList.CNY,
            USD: enumList.USD,
            EUR: enumList.EUR,
            GBP: enumList.GBP,
          };
        }}
        initialValue="USD"
      />
      <ProFormDependency name={['market_rate', 'operating_gross_margin', 'selling_price']}>
        {({ market_rate, operating_gross_margin, selling_price }) => {
          return (
            <div className="inner-bg">
              <div className={operating_gross_margin && selling_price ? 'hidden-error' : ''}>
                <ProFormDigit
                  label="市场费率(%)"
                  name="market_rate"
                  wrapperCol={value == 1 ? { span: 16 } : { flex: '266px' }}
                  disabled={
                    (operating_gross_margin || operating_gross_margin == 0) &&
                    (selling_price || selling_price == 0)
                  }
                  fieldProps={{ precision: 2 }}
                  rules={[
                    {
                      required: !(
                        (operating_gross_margin || operating_gross_margin == 0) &&
                        (selling_price || selling_price == 0)
                      ),
                      message: '请输入市场费率',
                    },
                    () => ({
                      validator(_, v) {
                        if (v < 0 || v > 100) {
                          return Promise.reject(new Error('请输入0-100数值'));
                        }

                        return Promise.resolve();
                      },
                    }),
                  ]}
                />
              </div>
              <div className={market_rate && selling_price ? 'hidden-error' : ''}>
                <ProFormDigit
                  wrapperCol={value == 1 ? { span: 16 } : { flex: '266px' }}
                  label="运营毛利率(%)"
                  name="operating_gross_margin"
                  fieldProps={{ precision: 2 }}
                  disabled={
                    (market_rate || market_rate == 0) && (selling_price || selling_price == 0)
                  }
                  rules={[
                    {
                      required: !(
                        (market_rate || market_rate == 0) &&
                        (selling_price || selling_price == 0)
                      ),
                      message: '请输入运营毛利率',
                    },
                    () => ({
                      validator(_, v) {
                        if (v < 0 || v > 100) {
                          return Promise.reject(new Error('请输入0-100数值'));
                        }

                        return Promise.resolve();
                      },
                    }),
                  ]}
                />
              </div>
              <div className={market_rate && operating_gross_margin ? 'hidden-error' : ''}>
                <ProFormDigit
                  label="售价"
                  wrapperCol={value == 1 ? { span: 16 } : { flex: '266px' }}
                  name="selling_price"
                  fieldProps={{ precision: 2 }}
                  disabled={
                    (market_rate || market_rate == 0) &&
                    (operating_gross_margin || operating_gross_margin == 0)
                  }
                  required={
                    !(
                      (market_rate || market_rate == 0) &&
                      (operating_gross_margin || operating_gross_margin == 0)
                    )
                  }
                  rules={[
                    {
                      validator(a: any, v: any) {
                        if (
                          !v &&
                          v != 0 &&
                          !(
                            (market_rate || market_rate == 0) &&
                            (operating_gross_margin || operating_gross_margin == 0)
                          )
                        ) {
                          return Promise.reject(new Error('请输入售价'));
                        }
                        if (
                          v <= 0 &&
                          !(
                            (market_rate || market_rate == 0) &&
                            (operating_gross_margin || operating_gross_margin == 0)
                          )
                        ) {
                          return Promise.reject(new Error('请输入大于0的数值'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                />
              </div>
            </div>
          );
        }}
      </ProFormDependency>
    </ProForm>
  );
};

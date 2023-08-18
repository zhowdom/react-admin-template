import { useEffect, useRef, useState } from 'react';
import { DatePicker, Form, Modal, Alert } from 'antd';
import {
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { addPlan, editPlan, planEditById, insertYunCang, beforeInheritanceNum } from '@/services/pages/deliveryPlan';
import { pubGetPlatformList, pubGetStoreList, pubSelectGoodsSku } from '@/utils/pubConfirm';
import moment from 'moment';
import SelectDependency from '@/components/PubForm/SelectDependency';

const Dialog = (props: any) => {
  const disabledDate = (current: any) => {
    return current && new Date(current).getTime() + 24 * 60 * 60 < new Date().getTime();
  };
  const cangList: any = JSON.parse(JSON.stringify(props?.dicList?.SYS_PLATFORM_WAREHOUSING_PLATFORM));
  delete cangList.WLN

  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
    labelInValue: true,
  };
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState<string>('');
  const [datesData, setDatesData] = useState<any>({});
  const [skuMessage, skuMessageSet] = useState<any>('');
  // 改变SKU时，提示，但不阻止提交
  const changeSku = async (sku: any) => {
    console.log(sku)
    const res = await beforeInheritanceNum({
      goods_sku_id: sku,
      business_scope: 'CN'
    });
    console.log(res)
    if (res.data?.num) {
      skuMessageSet(`当前SKU关联69码继承前SKU【${res.data?.sku_code}】,还有PMC在制数量${res.data?.num}个，请先规划继承前SKU出货！`)
    } else {
      skuMessageSet('')
    }
  };
  // 编辑回显赋值
  useEffect(() => {
    setDates(
      props?.dialogForm?.shipment_begin_cycle_time
        ? `${moment(props?.dialogForm?.shipment_begin_cycle_time).format('MM.DD')}-${moment(
          props?.dialogForm?.shipment_end_cycle_time,
        ).format('MM.DD')}`
        : '',
    );
    setDatesData((pre: any) => {
      return {
        ...pre,
        shipment_begin_cycle_time: props?.dialogForm?.shipment_begin_cycle_time,
        shipment_end_cycle_time: props?.dialogForm?.shipment_end_cycle_time,
        cycle_time: props?.dialogForm?.cycle_time,
      };
    });
    changeSku(props?.dialogForm?.goods_sku_id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.dialogForm?.shipment_begin_cycle_time, props?.dialogForm?.shipment_end_cycle_time]);
  const handleOk = () => {
    formRef?.current?.submit();
  };
  // 新增或修改计划
  const updateForm = async (postData: any) => {
    let res;
    // 编辑
    if (props.dialogForm?.id) {
      res =
        props.dialogForm?.customType === 'update'
          ? await planEditById(postData)
          : await editPlan(postData);
      // 新增
    } else {
      res = props.pT == '2' ? await insertYunCang(postData) : await addPlan(postData);
    }
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
    } else {
      setLoading(false);
      const msg = props.dialogForm?.id
        ? props.dialogForm?.customType === 'update'
          ? '修改成功'
          : '编辑成功'
        : '新增成功';
      pubMsg(msg, 'success');
      props.handleClose();
    }
  };

  return (
    <Modal
      width={600}
      title={
        props.dialogForm?.id
          ? props.dialogForm?.customType === 'update'
            ? '修改发货计划'
            : '编辑发货计划'
          : '添加发货计划'
      }
      open={props.isModalVisible}
      afterClose={()=>{
        skuMessageSet('')
        setDates('');
      }}
      onOk={handleOk}
      onCancel={() => {
        props.handleClose(true);
      }}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
      className="supplier-detail"
      okText={loading ? '提交中' : '确定'}
    >
      <ProForm
        className="supplier-detail"
        formRef={formRef}
        onFinish={async (values) => {
          let postData = {
            ...values,
            platform_id:
              props.pT == '1' ? values?.platform_id?.value || props.pId : values.platform_id,
            platform_name: props.pT == '1' ? values?.platform_id?.label : values.platform_name,
            shop_id: values?.shop_id?.value,
            shop_name: values?.shop_id?.label,
            id: props.dialogForm?.id,
            business_scope: props?.business_scope,
            ...datesData,
          };
          if (props.pT == '2' && values?.storage && values.storage[0]) {
            if (typeof values?.storage[0] == 'object') {
              postData = {
                ...postData,
                platform_warehousing_type: values.storage[0]?.value,
                warehouse_name: values.storage[1]?.label,
                warehouse_id: values.storage[1]?.value,
                platform_id: values.storage[1]?.data?.platform_id,
                platform_name: values.storage[1]?.data?.platform_name,
                platform_code: values.storage[1]?.data?.platform_code,
              };
            } else {
              postData = {
                ...postData,
                platform_warehousing_type: values.storage[0],
              };
            }
            delete postData.storage;
          }
          console.log(values, postData, 'postData');
          setLoading(true);
          updateForm(postData);
        }}
        onFinishFailed={(E) => {
          console.log(E);
        }}
        labelAlign="right"
        labelCol={{ flex: '140px' }}
        submitter={false}
        initialValues={{
          ...props.dialogForm,
          cycle: props?.dialogForm?.shipment_begin_cycle_time
            ? moment(props?.dialogForm?.shipment_begin_cycle_time)
            : null,
          platform_id: props?.dialogForm?.platform_id,
          platform_name: props?.dialogForm?.platform_name,
        }}
        layout="horizontal"
      >
        <div className={props.dialogForm?.id ? 'disabled' : ''}>
          {props.pT == '1' && (
            <>
              <ProFormSelect
                readonly={props.dialogForm?.id}
                name="platform_id"
                label="平台"
                rules={[
                  { required: true, message: '请选择平台' },
                  ({ }) => ({
                    validator(_, value) {
                      if (JSON.stringify(value) === '{}') {
                        return Promise.reject(new Error('请选择平台'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
                fieldProps={{
                  onChange: () => {
                    formRef?.current?.setFieldsValue({
                      shop_id: null,
                      goods_sku_id: null,
                      goods_sku_name: null,
                      shop_sku_code: null,
                    });
                  },
                  ...selectProps,
                }}
                showSearch
                debounceTime={300}
                request={async () => {
                  const res: any = await pubGetPlatformList();
                  return res.filter(
                    (v: any) =>
                      v.business_scope == props.business_scope &&
                      !['1552846034395881473', '1580120899712675841'].includes(v.value),
                  );
                }}
              />
              <Form.Item noStyle shouldUpdate>
                {(form) => {
                  const pId = form.getFieldValue('platform_id')?.value;
                  // 天猫,京东POP 店铺只读,且与平台名称一致
                  const tmPopObj = {
                    '1531560417090879489': '天猫',
                    '1532170842660691969': '京东POP',
                  };
                  return tmPopObj[pId] ? (
                    <Form.Item label="店铺">
                      <span style={{ paddingTop: '2px' }}>{tmPopObj[pId]}</span>
                    </Form.Item>
                  ) : (
                    <ProFormSelect
                      readonly={props.dialogForm?.id}
                      name="shop_id"
                      label="店铺"
                      showSearch
                      debounceTime={300}
                      fieldProps={{
                        onChange: () => {
                          formRef?.current?.setFieldsValue({
                            goods_sku_id: null,
                            goods_sku_name: null,
                            shop_sku_code: null,
                          });
                        },
                        ...selectProps,
                      }}
                      params={{
                        platform_id: form.getFieldValue('platform_id'),
                      }}
                      request={async () => {
                        if (!pId) {
                          return [];
                        }
                        const res: any = await pubGetStoreList({ platform_id: pId });
                        return res;
                      }}
                      rules={[
                        {
                          required: ['1531896104457621506', '1532170822712582145'].includes(pId),
                          message: '请选择店铺',
                        },
                        ({ }) => ({
                          validator(_, value) {
                            if (JSON.stringify(value) === '{}') {
                              return Promise.reject(new Error('请选择店铺'));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    />
                  );
                }}
              </Form.Item>
            </>
          )}
          {props.pT == '2' && (
            <>
              {props.dialogForm?.id ? (
                <>
                  <ProForm.Item label={'仓库类型'}>
                    {pubFilter(
                      props?.dicList?.SYS_PLATFORM_WAREHOUSING_PLATFORM || {},
                      props.dialogForm?.platform_warehousing_type,
                    )}
                  </ProForm.Item>
                  <ProForm.Item label={'仓库名称'}>{props.dialogForm?.warehouse_name}</ProForm.Item>
                </>
              ) : (
                <ProForm.Item
                  label={'仓库'}
                  name={'storage'}
                  rules={[
                    { required: true, message: '请选择仓库' },
                    {
                      validator(_, value) {
                        if (!value[1] || JSON.stringify(value[1]) === '{}') {
                          return Promise.reject(new Error('请选择仓库'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <SelectDependency
                    disabledStatus={0}
                    width={120}
                    labelInValue
                    valueEnum={cangList || {}}
                    requestUrl={'/sc-scm/orderDeliveryWarehouse/page'}
                    requestParam={'platform_code'}
                    placeholder={['类型', '仓库选择']}
                  />
                </ProForm.Item>
              )}
              <ProFormText
                name="platform_warehousing_type"
                label="platform_warehousing_type"
                hidden
              />
              <ProFormText name="warehouse_name" label="warehouse_name" hidden />
              <ProFormText name="warehouse_id" label="warehouse_id" hidden />
              <ProFormText name="platform_id" label="platform_id" hidden />
              <ProFormText name="platform_name" label="platform_name" hidden />
            </>
          )}
        </div>

        <ProFormDependency name={['platform_id', 'shop_id']}>
          {({ platform_id, shop_id }) => {
            return (
              <ProFormSelect
                name="goods_sku_id"
                label="SKU"
                readonly={props.dialogForm?.customType === 'update'}
                rules={[{ required: true, message: '请选择SKU' }]}
                showSearch
                debounceTime={300}
                fieldProps={{
                  onChange: (sku: string, data: any) => {
                    // console.log(data);
                    changeSku(sku)
                    formRef.current?.setFieldsValue({
                      goods_sku_name: data?.data?.sku_name,
                      stock_no: data?.data?.stock_no,
                      pics: data?.data?.pics,
                    });
                  },
                }}
                params={{
                  platform_id:
                    platform_id?.value == '1532170822712582145' ||
                      platform_id?.value == '1531896104457621506'
                      ? platform_id?.value
                      : null,
                  shop_id: shop_id?.value,
                }}
                request={async (v) => {
                  // 国内发货计划：
                  // ①京东自营 和 京东FCS，需要按平台、店铺级联，必须要有链接才能创建发货计划；
                  // ②京东POP 和 天猫，不需要限制平台和店铺，不需要限制是否有链接；

                  // 跨境发货计划：
                  // 必须按平台、店铺级联，必须有链接才能创建发货计划；
                  // console.log(platform_id);
                  // console.log(shop_id);
                  if (
                    (platform_id?.value == '1532170822712582145' ||
                      platform_id?.value == '1531896104457621506') &&
                    (!platform_id?.value || !shop_id?.value)
                  )
                    return [];
                  const res: any = await pubSelectGoodsSku({
                    key_code: v.keyWords,
                    business_scope: 'CN',
                    sku_type: 1,
                    ...v,
                  });
                  return res.flatMap((val: any) =>
                    val?.data?.stock_no
                      ? [
                        {
                          ...val,
                          label: `${val.data.stock_no}（${val.data.sku_name}）${val.data.bar_code}`,
                          value: val.data.id,
                        },
                      ]
                      : [],
                  );
                }}
              />
            );
          }}
        </ProFormDependency>
        {
          skuMessage ? (
            <Alert message={skuMessage} type="error" style={{ marginBottom: '10px' }} />
          ) : ''
        }
        <ProFormDependency name={['goods_sku_id']}>
          {({ goods_sku_id }) => {
            if (goods_sku_id) {
              return <ProFormText name="pics" label="箱规(每箱数量)" readonly />;
            } else {
              return '';
            }
          }}
        </ProFormDependency>
        <ProFormText name="goods_sku_name" label="goods_sku_name" hidden />
        <ProFormText name="stock_no" label="stock_no" hidden />
        <ProFormDigit
          fieldProps={{
            maxLength: 125,
            precision: 0,
          }}
          min={1}
          label="计划发货数量"
          name="num"
          placeholder="请输入计划发货数量"
          rules={[
            ({ }) => ({
              validator(_, value) {
                if (!value && value != 0) {
                  return Promise.reject(new Error('请输入计划发货数量'));
                }
                if (props?.dialogForm?.approval_status != '7') {
                  return Promise.resolve();
                }
                if (value > props?.dialogForm?.num) {
                  return Promise.reject(new Error('不能超过最初的计划数量'));
                }
                if (value < props?.dialogForm?.generate_warehousing_order_num) {
                  return Promise.reject(new Error('不能小于入库单已关联的计划数量'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        />
        <Form.Item
          extra={dates}
          label="出货周期"
          name="cycle"
          rules={[{ required: true, message: '请选择出货周期' }]}
        >
          {/*@ts-ignore*/}
          <DatePicker
            placeholder="请选择出货周期"
            picker="week"
            onChange={(data: any, dataString: string) => {
              if (data) {
                const start = moment(data).weekday(0).format('MM.DD'); //本周一
                const end = moment(data).weekday(6).format('MM.DD'); //本周日
                setDates(`${start}-${end}`);
                setDatesData((pre: any) => {
                  return {
                    ...pre,
                    shipment_begin_cycle_time: moment(data).weekday(0).format('YYYY-MM-DD'),
                    shipment_end_cycle_time: moment(data).weekday(6).format('YYYY-MM-DD'),
                    cycle_time: dataString,
                  };
                });
              } else {
                setDates('');
                setDatesData({});
              }
            }}
          />
        </Form.Item>
        <ProFormText name="start" label="start" hidden />
        <ProFormText name="end" label="end" hidden />
        <ProFormDatePicker
          fieldProps={{
            disabledDate: disabledDate,
          }}
          name="warehousing_time"
          label="要求平台入库时间"
          placeholder="请选择要求平台入库时间"
          rules={[{ required: true, message: '请选择要求平台入库时间' }]}
        />
      </ProForm>
    </Modal>
  );
};
export default Dialog;

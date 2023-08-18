import { useEffect, useRef, useState } from 'react';
import { DatePicker, Form, Modal } from 'antd';
import {
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import {
  addPlan,
  editPlan,
  freeListLinkManagementSkuByShopId,
  planEditById,
  getDays,
} from '@/services/pages/deliveryPlan';
import { pubGetPlatformList, pubGetStoreList } from '@/utils/pubConfirm';
import moment from 'moment';

const Dialog = ({ dicList, ...props }: any) => {
  const disabledDate = (current: any) => {
    return current && new Date(current).getTime() + 24 * 60 * 60 < new Date().getTime();
  };
  const selectProps = {
    showSearch: true,
    labelInValue: true,
    allowClear: false,
  };
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState<string>('');
  const [chosedParmas, setChosedParmas] = useState<any>({});  // 选择的参数，页面可见的数据的集合 判断用
  const [datesData, setDatesData] = useState<any>({});

  // 编辑回显赋值
  useEffect(() => {
    setDates(
      props?.dialogForm?.shipment_begin_cycle_time
        ? `${moment(props?.dialogForm?.shipment_begin_cycle_time).format('MM.DD')}-${moment(
          props?.dialogForm?.shipment_end_cycle_time,
        ).format('MM.DD')}`
        : `${moment().startOf('W').format('MM.DD')}-${moment().endOf('W').format('MM.DD')}`,
    );
    setDatesData((pre: any) => {
      return {
        ...pre,
        shipment_begin_cycle_time:
          props?.dialogForm?.shipment_begin_cycle_time ||
          moment().startOf('W').format('YYYY-MM-DD'),
        shipment_end_cycle_time:
          props?.dialogForm?.shipment_end_cycle_time || moment().endOf('W').format('YYYY-MM-DD'),
        cycle_time: props?.dialogForm?.cycle_time || moment().format('YYYY-W[周]'),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.dialogForm?.shipment_begin_cycle_time, props?.dialogForm?.shipment_end_cycle_time]);

  useEffect(() => {
    setChosedParmas({
      ...chosedParmas,
      platform_id: props?.dialogForm?.platform_id?.value,
      shop_id: props?.dialogForm?.shop_id?.value,
      shipping_method: props?.dialogForm?.shipping_method?.value,
    });
  }, [props?.dialogForm])
  const handleOk = () => {
    formRef?.current?.submit();
  };
  // 计算要求平台入库时间 出货周的最后一天  + 国内运输周期 + 国外运输周期
  const countWarehouseDate = (startDate?: any, days?: number) => {
    if (startDate && (days || days == 0)) {
      formRef.current?.setFieldsValue({
        warehousing_time: startDate.add(days, 'd'),
      });
    } else {
      formRef.current?.setFieldsValue({
        warehousing_time: null,
      });
    }
  };
  const getDaysAction = (param: any, start?: any) => {
    // console.log(param)
    getDays({
      ...param
    }).then((res) => {
      if (res?.code == pubConfig.sCode) {
        const startDate = start || moment(formRef.current?.getFieldValue('cycle')).endOf('W');
        countWarehouseDate(startDate, res.data);
      } else {
        countWarehouseDate();
      }
    });

  };
  // 新增或修改计划
  const updateForm = async (postData: any) => {
    const res = props.dialogForm?.id
      ? props.dialogForm?.customType === 'update'
        ? await planEditById(postData)
        : await editPlan(postData)
      : await addPlan(postData);
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
  // @ts-ignore
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
      afterClose={() => {
        setChosedParmas({
          ...chosedParmas,
          platform_id: null,
          shop_id: null,
          shipping_method: null,
        });
      }}
      open={props.isModalVisible}
      onOk={handleOk}
      onCancel={() => {
        props.handleClose(true);
        setDates(
          props?.dialogForm?.shipment_begin_cycle_time
            ? `${moment(props?.dialogForm?.shipment_begin_cycle_time).format('MM.DD')}-${moment(
              props?.dialogForm?.shipment_end_cycle_time,
            ).format('MM.DD')}`
            : `${moment().startOf('W').format('MM.DD')}-${moment().endOf('W').format('MM.DD')}`,
        );
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
          const postData = {
            ...values,
            platform_id: values?.platform_id?.value || props.pId,
            platform_name: values?.platform_id?.label,
            shop_id: values?.shop_id?.value,
            shop_name: values?.shop_id?.label,
            id: props.dialogForm?.id,
            business_scope: props?.business_scope,
            goods_sku_id: values.goods_sku_id.slice(0, values.goods_sku_id.indexOf('_')),
            ...datesData,
          };
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
            : moment(),
          platform_id: props?.dialogForm?.platform_id,
        }}
        layout="horizontal"
      >
        <div className={props.dialogForm?.id ? 'disabled' : ''}>
          <ProFormSelect
            disabled={props.dialogForm?.id}
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
              onChange: (val) => {
                setChosedParmas({
                  ...chosedParmas,
                  platform_id: val?.value,
                  shop_id: null
                })
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
                  !['1580120899712675841'].includes(v.value),
              );
            }}
          />
          <Form.Item noStyle shouldUpdate>
            {(form) => {
              const pId = form.getFieldValue('platform_id')?.value;
              return (
                <ProFormSelect
                  disabled={props.dialogForm?.id}
                  name="shop_id"
                  label="店铺"
                  showSearch
                  debounceTime={300}
                  fieldProps={{
                    onChange: (item) => {
                      setChosedParmas({
                        ...chosedParmas,
                        shop_id: item?.value,
                      })
                      formRef?.current?.setFieldsValue({
                        goods_sku_id: null,
                        goods_sku_name: null,
                        shop_sku_code: null,
                        num: null,
                        week: null,
                        shipping_method: null,
                        warehousing_time: null,
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
                    { required: true, message: '请选择店铺' },
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
        </div>

        <Form.Item noStyle shouldUpdate>
          {(form) => {
            const shop_id = form.getFieldValue('shop_id')?.value;
            return (
              <ProFormSelect
                name="goods_sku_id"
                label="SKU"
                readonly={props.dialogForm?.customType === 'update'}
                rules={[{ required: true, message: '请选择SKU' }]}
                showSearch
                debounceTime={300}
                fieldProps={{
                  onChange: (_: string, data: any) => {
                    if (data) {
                      formRef.current?.setFieldsValue({
                        goods_sku_name: data?.sku_name,
                        shop_sku_code: data?.shop_sku_code,
                        pics: data?.pics,
                        shipping_method: data?.shipping_method,
                      });
                      const newSKU = {
                        ...chosedParmas,
                        shipping_method: data.shipping_method,// 运输方式
                        box_type: data.box_type,// 装柜方式
                        belong_classify: data.belong_classify, // 尺寸属性
                        delivery_route: data.delivery_route,  // 发货途径
                      }
                      setChosedParmas(newSKU);
                      getDaysAction(newSKU)
                    }
                  },
                }}
                params={{
                  shop_id,
                }}
                request={async (v) => {
                  if (!shop_id) {
                    return [];
                  }
                  const res: any = await freeListLinkManagementSkuByShopId({
                    ...v,
                    shop_sku_code: v.keyWords,
                  });
                  return res.data.flatMap((val: any) =>
                    val?.shop_sku_code
                      ? [
                        {
                          ...val,
                          label: `${val?.shop_sku_code}（${val?.sku_name}）`,
                          value: `${val?.goods_sku_id}_${val.shop_sku_code}`,
                        },
                      ]
                      : [],
                  );
                }}
              />
            );
          }}
        </Form.Item>
        <ProFormText name="shop_sku_code" label="shop_sku_code" hidden />
        <ProFormText name="goods_sku_name" label="goods_sku_name" hidden />
        <ProFormText name="stock_no" label="stock_no" hidden />
        <ProFormDependency name={['shop_sku_code']}>
          {({ shop_sku_code }) => {
            if (shop_sku_code) {
              return <ProFormText name="pics" label="箱规(每箱数量)" readonly />;
            } else {
              return '';
            }
          }}
        </ProFormDependency>
        <ProFormDependency name={['pics']}>
          {({ pics }) => (
            <ProFormDigit
              name="num"
              label="计划发货数量"
              min={1}
              fieldProps={{ precision: 0 }}
              rules={[
                { required: true, message: '请输入计划发货数量' },
                {
                  validator(a: any, value: any) {
                    // 部分入库修改为 已建入库单数量 或整箱
                    if (
                      props?.dialogForm?.approval_status == '7' &&
                      props.dialogForm?.customType === 'update' &&
                      (!(value % pics) ||
                        value == props?.dialogForm?.generate_warehousing_order_num) &&
                      props?.dialogForm?.generate_warehousing_order_num != 0
                    ) {
                      return Promise.resolve();
                    }
                    if (value % pics) {
                      return Promise.reject(
                        new Error(`非整箱, 请输入箱规(每箱数量):${pics}的整数倍`),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            />
          )}
        </ProFormDependency>
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
            allowClear={false}
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
                getDaysAction(chosedParmas, moment(data).endOf('W'))
              } else {
                setDates('');
                setDatesData({});

              }
            }}
          />
        </Form.Item>
        <ProFormSelect
          label={'运输方式'}
          name={'shipping_method'}
          rules={[{ required: true, message: '请选择运输方式' }]}
          valueEnum={dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || {}}
          fieldProps={{
            onChange: (val) => {
              const newSKU = {
                ...chosedParmas,
                shipping_method: val,
              }
              setChosedParmas(newSKU);
              getDaysAction(newSKU)
            },
          }}
        />
        <ProFormText name="start" label="start" hidden />
        <ProFormText name="end" label="end" hidden />
        <ProFormDatePicker
          fieldProps={{
            disabledDate: disabledDate,
            allowClear: false,
          }}
          name="warehousing_time"
          label="要求物流入仓时间"
          placeholder="请选择要求物流入仓时间"
          rules={[{ required: true, message: '请选择要求物流入仓时间' }]}
        />
      </ProForm>
    </Modal>
  );
};
export default Dialog;

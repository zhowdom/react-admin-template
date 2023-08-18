import { useState, useRef } from 'react';
import { DatePicker, Form, Modal, Spin } from 'antd';
import { connect } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormDatePicker,
  ProFormDependency,
} from '@ant-design/pro-form';
import {
  planInsert,
  planUpdateById,
  getPlanfindById,
  planEditById,
} from '@/services/pages/purchasePlan';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
// import { pubGetPlatformList, pubGetStoreList } from '@/utils/pubConfirm';
import moment from 'moment';
import { freeListLinkManagementSku } from '@/services/pages/deliveryPlan';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modelType, setModelType] = useState('add');
  const [dates, setDates] = useState<string>('');
  const [datesData, setDatesData] = useState<any>({});
  const formRef = useRef<ProFormInstance>();
  const [status, setStatus] = useState<any>();
  const [num, setNum] = useState<any>();
  // 获取沟通详情
  const getBusinessOutDetail = async (id: string, ordered_qty?: number): Promise<any> => {
    const res = await getPlanfindById({
      id: id,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setDates(
        res?.data?.required_order_begin_time
          ? `${moment(res?.data?.required_order_begin_time).format('MM.DD')}-${moment(
              res?.data?.required_order_end_time,
            ).format('MM.DD')}`
          : '',
      );
      const newData = res.data;
      if (res.data?.status == '5') {
        setStatus(res?.data?.status);
        setNum(ordered_qty);
      }
      setDatesData((pre: any) => {
        return {
          ...pre,
          required_order_begin_time: newData.required_order_begin_time,
          required_order_end_time: newData.required_order_end_time,
          cycle_time: newData.cycle_time,
        };
      });
      const allSku: any = await freeListLinkManagementSku({});
      const chosedSku = allSku.data.find(
        (k: any) =>
          `${k?.platform_id}${k?.shop_id}${k?.goods_sku_id}${k?.shop_sku_code}` ==
          `${newData?.platform_id}${newData?.shop_id}${newData?.goods_sku_id}${newData?.shop_sku_code}`,
      );
      formRef?.current?.setFieldsValue({
        ...newData,
        chosed_id: `${newData?.platform_id}${newData?.shop_id}${newData?.goods_sku_id}${newData?.shop_sku_code}`,
        pics: chosedSku?.pics,
        cycle: res?.data?.required_order_begin_time
          ? moment(res?.data?.required_order_begin_time)
          : null,
      });
    }
  };
  props.addPlanModel.current = {
    open: (id?: any, customType?: any, ordered_qty?: number) => {
      console.log(id);
      setIsModalVisible(true);
      if (id) {
        setModelType(customType || 'edit');
        getBusinessOutDetail(id, ordered_qty);
      } else {
        setModelType('add');
        setTimeout(() => {
          const start = moment(new Date()).weekday(0).format('MM.DD'); //本周一
          const end = moment(new Date()).weekday(6).format('MM.DD'); //本周日
          setDates(`${start}-${end}`);
          const nowWeek = Number(moment().format('WW'));
          setDatesData((pre: any) => {
            return {
              ...pre,
              required_order_begin_time: moment(new Date()).weekday(0).format('YYYY-MM-DD'),
              required_order_end_time: moment(new Date()).weekday(6).format('YYYY-MM-DD'),
              cycle: moment(new Date()),
              cycle_time: `${moment().format('YYYY')}-${nowWeek}周`,
            };
          });
          formRef?.current?.setFieldsValue({
            cycle: moment(new Date()),
          });
        }, 500);
      }
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setDates('');
    setIsModalVisible(false);
    if (!val) props.handleClose(true);
  };
  // 添加
  const saveAdd = async (val: any) => {
    setLoading(true);
    const res = await planInsert(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('添加成功！', 'success');
      modalClose(false);
    }
    setLoading(false);
  };
  // 修改编辑
  const saveUpdate = async (val: any) => {
    setLoading(true);
    const res = modelType == 'update' ? await planEditById(val) : await planUpdateById(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg(modelType == 'update' ? '修改成功！' : '编辑成功！', 'success');
      modalClose(false);
    }
    setLoading(false);
  };
  // 提交
  const saveSubmit = async (val: any) => {
    const newData = JSON.parse(JSON.stringify(val));
    // newData.required_order_begin_time = newData.required_order_time[0];
    // newData.required_order_end_time = newData.required_order_time[1];
    // delete newData.required_order_time;
    if (newData.expected_in_storage_time <= newData.vendor_shipment_time)
      return pubMsg('预计入库时间应大于供应商出货时间！');
    if (newData.vendor_shipment_time <= newData.required_order_end_time)
      return pubMsg('供应商出货时间要大于下单时间！');
    return modelType === 'add' ? saveAdd(newData) : saveUpdate(newData);
  };
  // const selectProps = {
  //   showSearch: true,
  //   filterOption: (input: any, option: any) => {
  //     const trimInput = input.replace(/^\s+|\s+$/g, '');
  //     if (trimInput) {
  //       return option.label.indexOf(trimInput) >= 0;
  //     } else {
  //       return true;
  //     }
  //   },
  //   labelInValue: true,
  // };
  return (
    <Modal
      width={720}
      title={
        modelType == 'add'
          ? '添加采购计划'
          : modelType == 'update'
          ? '修改采购计划'
          : '编辑采购计划'
      }
      open={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            const postData = {
              ...values,
              ...datesData,
              business_scope: 'IN',
            };
            saveSubmit(postData);
          }}
          labelAlign="right"
          labelWrap
          submitter={false}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
        >
          <ProFormText name="id" label="ID" hidden />
          <ProFormText name="plan_no" label="plan_no" hidden />
          <ProFormSelect
            name="chosed_id"
            label="SKU"
            readonly={modelType == 'update'}
            rules={[{ required: true, message: '请选择SKU' }]}
            showSearch
            debounceTime={300}
            fieldProps={{
              onChange: (sku: string, data: any) => {
                formRef.current?.setFieldsValue({
                  shop_sku_code: data?.shop_sku_code,
                  goods_sku_id: data?.goods_sku_id,
                  goods_sku_name: data?.sku_name,
                  platform_id: data?.platform_id,
                  platform_name: data?.platform_name,
                  shop_id: data?.shop_id,
                  shop_name: data?.shop_name,
                  pics: data?.pics,
                  vendor_shipment_time: moment(new Date())
                    .weekday(6)
                    .add('day', data?.delivery_day),
                });
                // delivery_day 交期
                // domestic_transport_cycle 国内运输周期
                // shipping_cycle 船期
                // foreign_transport_cycle 国外运输周期
                // shelves_cycle 上架周期
                if (
                  data?.delivery_day &&
                  data?.domestic_transport_cycle &&
                  data?.shipping_cycle &&
                  data?.foreign_transport_cycle &&
                  data?.shelves_cycle
                ) {
                  formRef.current?.setFieldsValue({
                    expected_in_storage_time: moment(new Date())
                      .weekday(6)
                      .add(
                        'day',
                        data?.delivery_day +
                          data?.domestic_transport_cycle +
                          data?.shipping_cycle +
                          data?.foreign_transport_cycle +
                          data?.shelves_cycle,
                      ),
                  });
                }
              },
            }}
            request={async (v) => {
              const res: any = await freeListLinkManagementSku({
                ...v,
                shop_sku_code: v.keyWords,
                sku_type: '1',
                exclude_sales_status: ['4'],
              });
              return res.data.flatMap((val: any) =>
                val?.shop_sku_code
                  ? [
                      {
                        ...val,
                        label: `${val?.shop_sku_code}（${val?.sku_name}）`,
                        value: `${val?.platform_id}${val?.shop_id}${val?.goods_sku_id}${val?.shop_sku_code}`,
                      },
                    ]
                  : [],
              );
            }}
          />
          <ProFormDependency name={['goods_sku_id']}>
            {({ goods_sku_id }) => {
              if (goods_sku_id) {
                return <ProFormText name="pics" label="箱规(每箱数量)" readonly />;
              } else {
                return '';
              }
            }}
          </ProFormDependency>
          <ProFormText name="shop_sku_code" label="shop_sku_code" hidden />
          <ProFormText name="goods_sku_id" label="goods_sku_id" hidden />
          <ProFormText name="goods_sku_name" label="goods_sku_name" hidden />
          <ProFormText name="platform_id" label="platform_id" hidden />
          <ProFormText name="platform_name" label="platform_name" hidden />
          <ProFormText name="shop_id" label="shop_id" hidden />
          <ProFormText name="shop_name" label="shop_name" hidden />
          <ProFormDependency name={['goods_sku_id', 'pics']}>
            {({ goods_sku_id, pics }) => {
              return goods_sku_id ? (
                <ProFormDigit
                  name="num"
                  label="计划下单数量"
                  width={'sm'}
                  min={1}
                  fieldProps={{ precision: 0 }}
                  rules={[
                    { required: true, message: '请输入计划下单数量' },
                    {
                      required: true,
                      validator(a: any, value: any) {
                        // 部分已下单修改允许整箱货已下单数量
                        if (
                          modelType == 'update' &&
                          status == '5' &&
                          (!(value % pics) || value == num) &&
                          num != 0
                        ) {
                          return Promise.resolve();
                        } else if (value % pics) {
                          return Promise.reject(new Error('非整箱！'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                />
              ) : (
                ''
              );
            }}
          </ProFormDependency>

          <Form.Item
            extra={dates}
            label="要求下单时间"
            name="cycle"
            rules={[{ required: true, message: '请选择要求下单时间' }]}
          >
            <DatePicker
              style={{ width: '216px' }}
              placeholder="请选择要求下单时间"
              picker="week"
              onChange={(data: any, dataString: string) => {
                if (data) {
                  const start = moment(data).weekday(0).format('MM.DD'); //本周一
                  const end = moment(data).weekday(6).format('MM.DD'); //本周日
                  setDates(`${start}-${end}`);
                  setDatesData((pre: any) => {
                    return {
                      ...pre,
                      required_order_begin_time: moment(data).weekday(0).format('YYYY-MM-DD'),
                      required_order_end_time: moment(data).weekday(6).format('YYYY-MM-DD'),
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
          <ProFormDatePicker
            width={'sm'}
            name="vendor_shipment_time"
            label="供应商出货时间(货好时间)"
            rules={[{ required: true, message: '请选择供应商出货时间' }]}
          />
          <ProFormDatePicker
            width={'sm'}
            name="expected_in_storage_time"
            label="要求入库时间"
            rules={[{ required: true, message: '请选择预计入库时间' }]}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

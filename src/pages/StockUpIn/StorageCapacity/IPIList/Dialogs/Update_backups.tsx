import { Button, Col, DatePicker, Form, Modal, Row } from 'antd';
import type { InputRef } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormDependency, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { useContext, useReducer, useRef, useState } from 'react';
import { pubFreeGetStoreList } from '@/utils/pubConfirm';
import './index.less';
import { pubConfig, pubMsg, pubMyFilter } from '@/utils/pubConfig';
import { IPIContext } from '../context';
import moment from 'moment';
import { insert, update, getIpi } from '@/services/pages/stockUpIn/IPI';

export default (props: any) => {
  const formRef = useRef<ProFormInstance>();
  const inputRef = {
    ref1: useRef<InputRef>(null),
    ref2: useRef<InputRef>(null),
    ref3: useRef<InputRef>(null),
    ref4: useRef<InputRef>(null),
    ref5: useRef<InputRef>(null),
    ref6: useRef<InputRef>(null),
    ref7: useRef<InputRef>(null),
    ref8: useRef<InputRef>(null),
  };
  const [dates, setDates] = useState<string>('');
  const [datesData, setDatesData] = useState<any>({});
  const [shopList, shopListSet] = useState<any>([]);
  const dicList = useContext(IPIContext);
  const disabledDate = (current: any) => {
    console.log(current, 'ct')
    return (
      current &&
      new Date(current).getTime() + 24 * 60 * 60 >
        moment().week(moment().week()).endOf('week').valueOf()
    );
  };
  const initialState = { saveType: null };
  const reducer = (state: { saveType: number | null }, action: any) => {
    switch (action.type) {
      case 'save':
        return {
          saveType: 1,
        };
      case 'saveNext':
        return {
          saveType: 2,
        };
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const setDefault = (cycle: any, cycle_time: any, res: any) => {
    formRef.current?.setFieldsValue({
      standard_capacity_uom: res?.data?.standard_capacity_uom,
      big_capacity_uom: res?.data?.big_capacity_uom,
      cycle,
    });
    const start = cycle.weekday(0).format('MM.DD'); //本周一
    const end = cycle.weekday(6).format('MM.DD'); //本周日
    setDates(`${start}-${end}`);
    const cycle_time_begin = cycle.weekday(0).format('YYYY-MM-DD');
    const cycle_time_end = cycle.weekday(6).format('YYYY-MM-DD');
    setDatesData((pre: any) => {
      return {
        ...pre,
        cycle_time_begin,
        cycle_time_end,
        cycle_time,
      };
    });
  };
  const getDefaultUnit = (shop_id: string) => {
    getIpi({ shop_id }).then((res) => {
      if (res?.code == pubConfig.sCode) {
        if (res?.data) {
          const cycle = moment(res?.data?.cycle_time_begin);
          const cycle_time = cycle.add(1, 'week').format('YYYY-WW周');
          if (dates) {
            Modal.confirm({
              width: 500,
              title: `店铺【${pubMyFilter(shopList, res.data.shop_id)}】在【${
                res.data.cycle_time
              }】有IPI记录，是否使用上次计量单位并添加【${cycle_time}】数据`,
              onOk: () => {
                setDefault(cycle, cycle_time, res);
              },
            });
          } else {
            setDefault(cycle, cycle_time, res);
          }
        }
      }
    });
  };
  return (
    <ModalForm
      title={props?.record?.id ? '编辑' : '新增'}
      trigger={props?.record?.id ? <a>编辑</a> : <Button type="primary">新增</Button>}
      labelAlign="right"
      labelCol={{ flex: '123px' }}
      layout="horizontal"
      onVisibleChange={(visible) => {
        // 关闭重置
        if (!visible) {
          dispatch({ type: null });
          setDates('');
        } else {
          setDates(
            props?.record?.cycle_time_begin
              ? `${moment(props?.record?.cycle_time_begin).format('MM.DD')}-${moment(
                  props?.record?.cycle_time_end,
                ).format('MM.DD')}`
              : '',
          );
          if (props?.record?.cycle_time_begin) {
            setDatesData(() => {
              return {
                cycle_time_begin: props?.record?.cycle_time_begin,
                cycle_time_end: props?.record?.cycle_time_end,
                cycle_time: props?.record?.cycle_time,
              };
            });
          }
        }
      }}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      width={932}
      className="stock"
      initialValues={
        {
          ...props?.record,
          cycle: props?.record?.cycle_time_begin ? moment(props?.record?.cycle_time_begin) : null,
        } || {}
      }
      submitter={{
        searchConfig: {
          submitText: '保存',
        },
        render: (prop: any, defaultDoms) => {
          return props?.record?.id
            ? [...defaultDoms]
            : [
                defaultDoms[0],
                <Button
                  key="save"
                  type="primary"
                  onClick={() => {
                    dispatch({ type: 'save' });
                    prop.submit();
                  }}
                >
                  保存并关闭
                </Button>,
                <Button
                  key="saveNext"
                  ghost
                  type="primary"
                  onClick={() => {
                    dispatch({ type: 'saveNext' });
                    prop.submit();
                  }}
                >
                  保存并添加下一条
                </Button>,
              ];
        },
      }}
      onFinish={async (values: any) => {
        const postData = {
          ...values,
          ...datesData,
        };
        const res = props?.record?.id ? await update(postData) : await insert(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('保存成功!', 'success');
          props?.reload();
          // 保存并添加下一条
          if (state.saveType === 2 && !props?.record?.id) {
            formRef.current?.resetFields();
            return false;
            // 保存并关闭
          } else {
            return true;
          }
        }
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
    >
      <Row className="stock-input">
        <ProFormText name="id" label="id" hidden />
        <Col span={12}>
          <ProFormSelect
            readonly={props?.record?.id}
            name="shop_id"
            label="店铺"
            showSearch
            debounceTime={300}
            wrapperCol={{ flex: '292px' }}
            fieldProps={{
              showSearch: true,
              onChange: (shop_id: any) => {
                getDefaultUnit(shop_id);
              },
            }}
            request={async () => {
              const res: any = await pubFreeGetStoreList({ business_scope: 'IN' });
              shopListSet(res);
              return res;
            }}
            rules={[
              { required: true, message: '请选择店铺' },
              ({}) => ({
                validator(_, value) {
                  if (JSON.stringify(value) === '{}') {
                    return Promise.reject(new Error('请选择店铺'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
        </Col>
        <Col span={12} className="mb0">
          <Form.Item
            extra={!props?.record?.id ? dates : ''}
            label="时间周期"
            name="cycle"
            wrapperCol={{ flex: '292px' }}
            rules={[{ required: true, message: '请选择时间周期' }]}
          >
            {props?.record?.id ? (
              `${datesData?.cycle_time} (${moment(datesData?.cycle_time_begin).format(
                'MM.DD',
              )}-${moment(datesData?.cycle_time_end).format('MM.DD')})`
            ) : (
              /*@ts-ignore*/
              <DatePicker
                placeholder="请选择时间周期"
                picker="week"
                disabledDate={disabledDate}
                onChange={(data: any, dataString: string) => {
                  if (data) {
                    const start = moment(data).weekday(0).format('MM.DD'); //本周一
                    const end = moment(data).weekday(6).format('MM.DD'); //本周日
                    setDates(`${start}-${end}`);
                    const cycle_time_begin = moment(data).weekday(0).format('YYYY-MM-DD');
                    const cycle_time_end = moment(data).weekday(6).format('YYYY-MM-DD');
                    setDatesData((pre: any) => {
                      return {
                        ...pre,
                        cycle_time_begin,
                        cycle_time_end,
                        cycle_time: dataString,
                      };
                    });
                  } else {
                    setDates('');
                    setDatesData({});
                  }
                }}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={24}>
          <ProFormText
            required
            rules={[
              () => ({
                validator(_, value) {
                  const reg = /^[0-9]*[1-9][0-9]*$/;
                  if (reg.test(value)) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject(
                      new Error(!value && value != '0' ? '请输入IPI分数' : '只能填写正整数'),
                    );
                  }
                },
              }),
            ]}
            wrapperCol={{ flex: '292px' }}
            name="marks"
            label="IPI分数"
            placeholder="请输入IPI分数"
            fieldProps={{
              ref: inputRef.ref1,
              onFocus: () => {
                setTimeout(() => inputRef.ref1?.current?.focus({ cursor: 'all' }), 0);
              },
            }}
          />
        </Col>
        {/*标准件*/}
        <Col span={10} className="custom-group">
          <ProFormText
            required
            rules={[
              () => ({
                validator(_, value) {
                  const reg = /^[1-9]{1}\d{0,16}(\.\d{1,2})?$|^0(\.\d{1,2})?$/;
                  if (reg.test(value)) {
                    if (Number(value) == 0) {
                      return Promise.reject(new Error('输入正数,最多保留两位小数'));
                    }
                    return Promise.resolve();
                  } else {
                    // 为空
                    if (!value) {
                      return Promise.reject(new Error('必填项'));
                    }
                    return Promise.reject(new Error('输入正数,最多保留两位小数'));
                  }
                },
              }),
            ]}
            name="standard_capacity_used"
            label="标准件已用库容"
            placeholder="体积"
            fieldProps={{
              ref: inputRef.ref2,
              onFocus: () => {
                setTimeout(() => inputRef.ref2?.current?.focus({ cursor: 'all' }), 0);
              },
            }}
          />
          <ProFormDependency name={['standard_capacity_used']}>
            {() => {
              return (
                <ProFormSelect
                  name="standard_capacity_uom"
                  label=""
                  labelCol={{ span: 0 }}
                  valueEnum={dicList.IPI_UOM}
                  rules={[{ required: true, message: '请选择单位' }]}
                  placeholder="单位"
                  showSearch
                  allowClear
                  style={{ marginLeft: '2px' }}
                />
              );
            }}
          </ProFormDependency>
        </Col>
        <Col span={7}>
          <ProFormText
            required
            rules={[
              () => ({
                validator(_, value) {
                  const reg = /^[0-9]*[1-9][0-9]*$/;
                  if (!reg.test(value)) {
                    return Promise.reject(
                      new Error(!value && value != '0' ? '请输入最高库存水平' : '只能填写正整数'),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            name="standard_stock_max_used"
            label="最高库存水平"
            placeholder="标准件"
            fieldProps={{
              ref: inputRef.ref3,
              onFocus: () => {
                setTimeout(() => inputRef.ref3?.current?.focus({ cursor: 'all' }), 0);
              },
              onChange: () => {
                formRef.current?.validateFields(['standard_stock_used']);
              },
            }}
          />
        </Col>
        <Col span={7}>
          <ProFormText
            required
            rules={[
              () => ({
                validator(_, value) {
                  const reg = /^[0-9]*[1-9][0-9]*$/;
                  if (!reg.test(value)) {
                    return Promise.reject(
                      new Error(!value && value != '0' ? '必填项' : '只能填写正整数'),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            name="standard_stock_used"
            label="库存限额使用量"
            placeholder="标准件"
            fieldProps={{
              ref: inputRef.ref4,
              onFocus: () => {
                setTimeout(() => inputRef.ref4?.current?.focus({ cursor: 'all' }), 0);
              },
            }}
          />
        </Col>
        {/*大件*/}
        <Col span={10} className="custom-group">
          <ProFormText
            required
            rules={[
              () => ({
                validator(_, value) {
                  const reg = /^[1-9]{1}\d{0,16}(\.\d{1,2})?$|^0(\.\d{1,2})?$/;
                  if (reg.test(value)) {
                    if (Number(value) == 0) {
                      return Promise.reject(new Error('输入正数,最多保留两位小数'));
                    }
                    return Promise.resolve();
                  } else {
                    // 为空
                    if (!value) {
                      return Promise.reject(new Error('必填项'));
                    }
                    return Promise.reject(new Error('输入正数,最多保留两位小数'));
                  }
                },
              }),
            ]}
            name="big_capacity_used"
            label="大件已用库容"
            placeholder="体积"
            fieldProps={{
              ref: inputRef.ref5,
              onFocus: () => {
                setTimeout(() => inputRef.ref5?.current?.focus({ cursor: 'all' }), 0);
              },
            }}
          />
          <ProFormDependency name={['big_capacity_used']}>
            {() => {
              return (
                <ProFormSelect
                  name="big_capacity_uom"
                  label=""
                  labelCol={{ span: 0 }}
                  valueEnum={dicList.IPI_UOM}
                  rules={[{ required: true, message: '请选择单位' }]}
                  placeholder="单位"
                  showSearch
                  allowClear
                  style={{ marginLeft: '2px' }}
                />
              );
            }}
          </ProFormDependency>
        </Col>
        <Col span={7}>
          <ProFormText
            required
            rules={[
              () => ({
                validator(_, value) {
                  const reg = /^[0-9]*[1-9][0-9]*$/;
                  if (!reg.test(value)) {
                    return Promise.reject(
                      new Error(!value && value != '0' ? '请输入最高库存水平' : '只能填写正整数'),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            name="big_stock_max_used"
            label="最高库存水平"
            placeholder="大件"
            fieldProps={{
              ref: inputRef.ref6,
              onFocus: () => {
                setTimeout(() => inputRef.ref6?.current?.focus({ cursor: 'all' }), 0);
              },
              onChange: () => {
                formRef.current?.validateFields(['big_stock_used']);
              },
            }}
          />
        </Col>
        <Col span={7}>
          <ProFormText
            required
            rules={[
              () => ({
                validator(_, value) {
                  const reg = /^[0-9]*[1-9][0-9]*$/;
                  if (!reg.test(value)) {
                    return Promise.reject(
                      new Error(!value && value != '0' ? '必填项' : '只能填写正整数'),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            name="big_stock_used"
            label="库存限额使用量"
            placeholder="大件"
            fieldProps={{
              ref: inputRef.ref7,
              onFocus: () => {
                setTimeout(() => inputRef.ref7?.current?.focus({ cursor: 'all' }), 0);
              },
            }}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

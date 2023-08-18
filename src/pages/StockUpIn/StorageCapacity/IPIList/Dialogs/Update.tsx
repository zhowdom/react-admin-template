import { Button, Col, DatePicker, Form, Modal, Row, InputRef } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormDependency, ProFormSelect, ProFormText, ProFormDigit } from '@ant-design/pro-form';
import { EditableProTable, ProCard, ProFormField } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useContext, useReducer, useRef, useState, useEffect } from 'react';
import { pubFreeGetStoreList } from '@/utils/pubConfirm';
import { pubConfig, pubMsg, pubMyFilter, handleCutZero } from '@/utils/pubConfig';
import { IPIContext } from '../context';
import moment from 'moment';
import { insert, insertv2, update, updatev2, getIpi, queryCurrentUnit, getNextIpi } from '@/services/pages/stockUpIn/IPI';
import { printFn, rnd } from '@/utils/pubConfirm';
import './index.less';

export default (props: any) => {
  const formRef = useRef<ProFormInstance>();
  const inputRef = {
    ref1: useRef<InputRef>(null),
    ref2: useRef<InputRef>(null),
    ref3: useRef<InputRef>(null),
  };
  // const reg0d = /^([0]|[1-9][0-9]*)$/; // 0及以上正整数
  const reg0d = /^[1-9]+\d*(\.\d{1,2})?$|^(0|0\.\d{1,2})$/; // 只允许输入0及以上正数，小数点允许保留2位
  const columns = [
    {
      title: '月份',
      dataIndex: 'month',
      align: 'center',
      editable: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
      width: '25%',
    },
    {
      title: '基本容量限制（初始分配）',
      className: 'needColor',
      align: 'center',
      dataIndex: 'standard_capacity',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
        controls: false,
        formatter: (value: any) => {
          return value;
        },
      },
      formItemProps: {
        rules: [{
          validator: async (rule: any, value: any) => {
            if (reg0d.test(value)) {
              return Promise.resolve();
            } else {
              return Promise.reject(
                new Error(!value && value != '0' ? '此项为必填项' : '请输入非负且最多保留2位小数'),
              );
            }
          }
        }]
      },
      width: '25%',
    },
    {
      title: '限制提高总额（已扩容）',
      className: 'needColor',
      align: 'center',
      dataIndex: 'limit_capacity',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
        controls: false,
        formatter: (value: any) => {
          return value;
        },
      },
      formItemProps: {
        rules: [{
          validator: async (rule: any, value: any) => {
            if (reg0d.test(value)) {
              return Promise.resolve();
            } else {
              return Promise.reject(
                new Error(!value && value != '0' ? '此项为必填项' : '请输入非负且最多保留2位小数'),
              );
            }
          }
        }]
      },
      width: '25%',
    },
    {
      title: (
        <>
          <div>待处理请求</div>
          <div>（扩容申请中）</div>
        </>
      ),
      align: 'center',
      dataIndex: 'apply_capacity',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
        controls: false,
        formatter: (value: any) => {
          return value;
        },
      },
      formItemProps: {
        rules: [{
          validator: async (rule: any, value: any) => {
            if (reg0d.test(value)) {
              return Promise.resolve();
            } else {
              return Promise.reject(
                new Error(!value && value != '0' ? '此项为必填项' : '请输入非负且最多保留2位小数'),
              );
            }
          }
        }]
      },
      width: '25%',
    },
  ];
  const queryNowDate = (nextMonth:number) => {
    let _year = new Date().getFullYear();
    let _month = new Date().getMonth() + 1;
    return _month > 12 ? `${_year + 1}-${_month - 12 + nextMonth}月` : `${_year}-${_month + nextMonth}月`
  }

  const defaultData_add = [
    {
      id: 11,
      month: queryNowDate(0),
      standard_capacity: 0,
      limit_capacity: 0,
      apply_capacity: 0
    },
    {
      id: 22,
      month: queryNowDate(1),
      standard_capacity: 0,
      limit_capacity: 0,
      apply_capacity: 0
    },
    {
      id: 33,
      month: queryNowDate(2),
      standard_capacity: 0,
      limit_capacity: 0,
      apply_capacity: 0
    },
    {
      id: 44,
      month: queryNowDate(3),
      standard_capacity: 0,
      limit_capacity: 0,
      apply_capacity: 0
    }
  ]
  const defaultData_bigs_add = [
    {
      id: 55,
      month: queryNowDate(0),
      standard_capacity: 0,
      limit_capacity: 0,
      apply_capacity: 0
    },
    {
      id: 66,
      month: queryNowDate(1),
      standard_capacity: 0,
      limit_capacity: 0,
      apply_capacity: 0
    },
    {
      id: 77,
      month: queryNowDate(2),
      standard_capacity: 0,
      limit_capacity: 0,
      apply_capacity: 0
    },
    {
      id: 88,
      month: queryNowDate(3),
      standard_capacity: 0,
      limit_capacity: 0,
      apply_capacity: 0
    }
  ]

  const [editableKeys, setEditableRowKeys] = useState<any>([]);
  const [editableKeys_bigs, setEditableRowKeys_bigs] = useState<any>([]);
  const [dataSource, setDataSource] = useState<any>([]);
  const [dataSource_bigs, setDataSource_bigs] = useState<any>([]);

  const [leftKey, leftKeySet] = useState<any>(0);
  const [leftKey_bigs, leftKey_bigSet] = useState<any>(0);



  
  const [dates, setDates] = useState<string>('');
  const [datesData, setDatesData] = useState<any>({});
  const [shopList, shopListSet] = useState<any>([]);
  const [autoPercent_bigs, setautoPercent_bigs] = useState<any>(props?.record?.big_used_ratio || '') // bigs:已使用容量input状态值比例(default || blur)
  const [autoPercent, setautoPercent] = useState<any>(props?.record?.standard_used_ratio || '')
  const [capacitystandard, setcapacitystandard] = useState(props?.record?.standard_capacity_used || '') // bigs:已使用容量input状态值(default || blur)
  const [capacitybigs, setcapacitybigs] = useState(props?.record?.big_capacity_used || '')

  const dicList = useContext(IPIContext);
  const calcRunner = (dataSource:any, val:any) => {
    let plusRes = (+dataSource[0]?.standard_capacity || 0) + (+dataSource[0]?.limit_capacity || 0)
    if (!plusRes) return ''
    return ((printFn(val / plusRes))* 100).toFixed(2) + '%'
  }
  const disabledDate = (current: any) => {
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
  // const setDefault = (cycle: any, cycle_time: any, res: any) => {
  //   formRef.current?.setFieldsValue({
  //     standard_capacity_uom: res?.data?.standard_capacity_uom,
  //     big_capacity_uom: res?.data?.big_capacity_uom,
  //     capacity_uom: res?.data?.capacity_uom,
  //     cycle,
  //   });
  //   const start = cycle.weekday(0).format('MM.DD'); //本周一
  //   const end = cycle.weekday(6).format('MM.DD'); //本周日
  //   setDates(`${start}-${end}`);
  //   const cycle_time_begin = cycle.weekday(0).format('YYYY-MM-DD');
  //   const cycle_time_end = cycle.weekday(6).format('YYYY-MM-DD');
  //   setDatesData((pre: any) => {
  //     return {
  //       ...pre,
  //       cycle_time_begin,
  //       cycle_time_end,
  //       cycle_time,
  //     };
  //   });
  // };
  const setDefault = (res: any) => {
    formRef.current?.setFieldsValue({
      capacity_uom: res?.data?.capacity_uom
    });
  };
  const getDefaultUnit = (shop_id: string) => {
    // getIpi({ shop_id }).then((res) => {
    //   if (res?.code == pubConfig.sCode) {
    //     if (res?.data) {
    //       const cycle = moment(res?.data?.cycle_time_begin);
    //       const cycle_time = cycle.add(1, 'week').format('YYYY-WW周');
    //       if (dates) {
    //         Modal.confirm({
    //           width: 500,
    //           title: `店铺【${pubMyFilter(shopList, res.data.shop_id)}】在【${
    //             res.data.cycle_time
    //           }】有IPI记录，是否使用上次计量单位并添加【${cycle_time}】数据`,
    //           onOk: () => {
    //             setDefault(cycle, cycle_time, res);
    //           },
    //         });
    //       } else {
    //         setDefault(cycle, cycle_time, res);
    //       }
    //     }
    //   }
    // })

    queryCurrentUnit({ shop_id }).then((res) => {
      if (res?.code == pubConfig.sCode) {
        if (res?.data) {
          // const cycle = moment(res?.data?.cycle_time_begin);
          // const cycle_time = cycle.add(1, 'week').format('YYYY-WW周');
          if (dates) {
            setDefault(res);
          } else {
            setDefault(res);
          }
        }
      }
    })
  };
  const autoCalcPercent = (dataSource:any, e:any, originType:any):any => {
    let capacity:number
    capacity = +e || 0;
    originType == 'standard' ? setcapacitystandard(capacity) : setcapacitybigs(capacity)
    // [`setcapacity${originType}`](capacity)
    return calcRunner(dataSource, capacity)
  }

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
          // 左右table数据渲染处理，以及table可编辑状态keys集合
          if (props?.record?.id) {
            // 编辑时row数据回显
            setDataSource((props?.record && props?.record?.standards || []));
            setDataSource_bigs((props?.record && props?.record?.bigs || []));
            setEditableRowKeys((props?.record && props?.record?.standards || []).map((item:any) => item.id));
            setEditableRowKeys_bigs((props?.record && props?.record?.bigs || []).map((item:any) => item.id));
          } else {
            // 新增时fill默认数据
            setDataSource(defaultData_add);
            setDataSource_bigs(defaultData_bigs_add);
            setEditableRowKeys(defaultData_add.map((item:any) => item.id));
            setEditableRowKeys_bigs(defaultData_bigs_add.map((item:any) => item.id));
            console.log(moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'), 'add one day')

            setDatesData(() => {
              return {
                cycle_time_begin: moment().weekday(0).format('YYYY-MM-DD'),
                cycle_time_end: moment().weekday(6).format('YYYY-MM-DD'),
                cycle_time: moment().format('YYYY-WW周'),
              };
            });

            formRef.current?.setFieldsValue({
              cycle: moment(),
              standards: defaultData_add,
              bigs: defaultData_bigs_add,
            });
          }
          const start = moment().weekday(0).format('MM.DD'); //本周一（当前日期）
          const end = moment().weekday(6).format('MM.DD'); //本周日（当前日期）
          setDates(
            props?.record?.cycle_time_begin
              ? `${moment(props?.record?.cycle_time_begin).format('MM.DD')}-${moment(
                  props?.record?.cycle_time_end,
                ).format('MM.DD')}`
              : (`${start}-${end}`)
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
      width={1100}
      className="stock"
      initialValues={
        {
          ...props?.record,
          cycle: props?.record?.cycle_time_begin ? moment(props?.record?.cycle_time_begin) : moment(),
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
          standards: dataSource.map((item:any) => {
            let {month, standard_capacity, limit_capacity, apply_capacity, id} = item
            return {
              month,
              standard_capacity,
              limit_capacity,
              apply_capacity,
              // capacity_used, // useless
              id: props?.record?.id ? id : null
            }
          }),
          bigs: dataSource_bigs.map((item:any) => {
            let {month, standard_capacity, limit_capacity, apply_capacity, id} = item
            return {
              month,
              standard_capacity,
              limit_capacity,
              apply_capacity,
              // capacity_used, // useless
              id: props?.record?.id ? id : null
            }
          }),
        };
        console.log(postData, '提交：')
        const res = props?.record?.id ? await updatev2(postData) : await insertv2(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('保存成功!', 'success');
          props?.reload();
          setDates('');
          setautoPercent('');
          setautoPercent_bigs('');
          setcapacitystandard('');
          setcapacitybigs('');
          // 保存并添加下一条
          if (state.saveType === 2 && !props?.record?.id) {
            formRef.current?.resetFields();
            const resNext = await getNextIpi({cycle_time: datesData.cycle_time})
            formRef.current?.setFieldsValue({
              shop_id: resNext?.data?.shop_id,
              capacity_uom: resNext?.data?.capacity_uom,
            });
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
            label="周期"
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
                    const _currentClickedDay = moment(data).format("YYYY-MM-DD"); // 当前用户点击的是哪一天
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
                    const commRun = (item:any, index:any) => {
                      let {month, ...a} = item
                      let myMonth:any;
                      // 处理跨年
                      if ((Number(_currentClickedDay.split('-')[1]) + index) > 12) {
                        myMonth = (Number(_currentClickedDay.split('-')[0]) + 1) + '-' + (Number(_currentClickedDay.split('-')[1]) + index - 12) + '月'
                      } else {
                        myMonth = _currentClickedDay.split('-')[0] + '-' + (Number(_currentClickedDay.split('-')[1]) + index) + '月'
                      }
                      return {
                        month: myMonth,
                        ...a
                      }
                    }
                    let whileAlterDate_tableDataBigs = dataSource_bigs.map((item:any, index:any) => {
                      return commRun(item, index)
                    })
                    let whileAlterDate_tableData = dataSource.map((item:any, index:any) => {
                      return commRun(item, index)
                    })
                    formRef.current?.setFieldsValue({ // must
                      standards: whileAlterDate_tableData,
                      bigs: whileAlterDate_tableDataBigs
                    });
                    setDataSource(whileAlterDate_tableData)
                    setDataSource_bigs(whileAlterDate_tableDataBigs) // 通过set改变状态值
                    leftKeySet(new Date().getTime());
                    leftKey_bigSet(new Date().getTime());
                    
                  } else {
                    setDates('');
                    setDatesData({});
                  }
                }}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={12}>
          <ProFormDigit
            required
            rules={[
              () => ({
                validator(_, value) {
                  if (reg0d.test(value)) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject(
                      new Error(!value && value != '0' ? '请输入IPI分数' : '请输入非负且最多保留2位小数'),
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
              precision: 2,
              formatter: (v: any) => {
                return handleCutZero(String(v));
              },
              onFocus: () => {
                setTimeout(() => inputRef.ref1?.current?.focus({ cursor: 'all' }), 0);
              },
            }}
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            name="capacity_uom"
            label="库存单位"
            wrapperCol={{ flex: '292px' }}
            valueEnum={dicList.IPI_UOM}
            rules={[{ required: true, message: '请选择单位' }]}
            placeholder="单位"
            showSearch
            allowClear
            style={{ marginLeft: '2px' }}
            />
        </Col>
        
        <Col span={11}>
          {/*标准件左*/}
          <div className='mscontainer rt'>

          <Row>
          <Col span={16}>
            <ProFormDigit
                required
                rules={[
                  () => ({
                    validator(_, value) {
                      if (!reg0d.test(value)) {
                        return Promise.reject(
                          new Error(!value && value != '0' ? '必填项' : '请输入非负且最多保留2位小数'),
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
                name="standard_capacity_used"
                label="已使用容量"
                placeholder=""
                fieldProps={{
                  ref: inputRef.ref2,
                  precision: 2,
                  formatter: (v: any) => {
                    return handleCutZero(String(v));
                  },
                  onFocus: () => {
                    setTimeout(() => inputRef.ref2?.current?.focus({ cursor: 'all' }), 0);
                  },
                  onChange: (e) => {
                    let res = autoCalcPercent(dataSource, e, 'standard')
                    setautoPercent(res)
                  }
                }}
              />
            </Col>
            <Col span={8}><span className='calcPerc'>{autoPercent}</span></Col>
          </Row>
          <Form.Item
            label=""
            name="standards"
            required
            rules={[
              () => ({
                validator(_, value) {
                  let res = (dataSource || []).every((v:any) => reg0d.test(v.apply_capacity) && reg0d.test(v.limit_capacity) && reg0d.test(v.standard_capacity))
                  if (!res) {
                    return Promise.reject(
                      new Error(''),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <EditableProTable
                rowKey="id"
                scroll={{
                  x: 390,
                }}
                headerTitle=""
                className="myAlterTable"
                bordered
                maxLength={5}
                key={leftKey}
                // 关闭默认的新建按钮
                recordCreatorProps={false}
                columns={columns}
                defaultValue={props?.record?.id ? dataSource : defaultData_add}
                // value={props?.record?.id ? dataSource : defaultData_add}
                value={dataSource}
                // onChange={setDataSource}
                editable={{
                  type: 'multiple',
                  // editableKeys: props?.record?.id ? editableKeys:defaultData_add.map((item:any) => item.id),
                  editableKeys: editableKeys,
                  actionRender: (row, config, defaultDoms) => {
                    return [defaultDoms.delete];
                  },
                  onValuesChange: (record, recordList) => {
                    // formRef.current?.setFieldsValue({
                    //   standards: recordList,
                    // });
                    setDataSource(recordList);
                    let res = calcRunner(recordList, capacitystandard)
                    setautoPercent(res)
                  },
                  onChange: setEditableRowKeys,
                }}
              />
              </Form.Item>
          </div>
        </Col>
        <Col span={11} offset={2}>
        {/*大件右*/}
        <div className='mscontainer'>
          <Row>
          <Col span={16}>
            <ProFormDigit
                required
                rules={[
                  () => ({
                    validator(_, value) {
                      if (!reg0d.test(value)) {
                        return Promise.reject(
                          new Error(!value && value != '0' ? '必填项' : '请输入非负且最多保留2位小数'),
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
                name="big_capacity_used"
                label="已使用容量"
                placeholder=""
                fieldProps={{
                  ref: inputRef.ref3,
                  precision: 2,
                  formatter: (v: any) => {
                    return handleCutZero(String(v));
                  },
                  onFocus: () => {
                    setTimeout(() => inputRef.ref3?.current?.focus({ cursor: 'all' }), 0);
                  },
                  onChange: (e) => {
                    let res = autoCalcPercent(dataSource_bigs, e, 'bigs')
                    setautoPercent_bigs(res)
                  }
                }}
              />
            </Col>
            <Col span={8}><span className='calcPerc'>{autoPercent_bigs}</span></Col>
          </Row>
          
          <Form.Item
            label=""
            name="bigs"
            required
            rules={[
              () => ({
                validator(_, value) {
                  let res = (dataSource_bigs || []).every((v:any) => reg0d.test(v.apply_capacity) && reg0d.test(v.limit_capacity) && reg0d.test(v.standard_capacity))
                  if (!res) {
                    return Promise.reject(
                      new Error(''),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
          <EditableProTable
                rowKey="id"
                scroll={{
                  x: 390,
                }}
                headerTitle=""
                bordered
                className="myAlterTable"
                maxLength={5}
                key={leftKey_bigs}
                // 关闭默认的新建按钮
                recordCreatorProps={false}
                columns={columns}
                // params={id}  // params与request是配套一起使用
                // request={async () => ({
                //   data: props?.record?.id ? dataSource_bigs : defaultData_bigs_add,
                //   total: 3,
                //   success: true,
                // })}
                defaultValue={props?.record?.id ? dataSource_bigs : defaultData_bigs_add}
                value={dataSource_bigs}
                onChange={setDataSource_bigs}
                editable={{
                  type: 'multiple',
                  // editableKeys: props?.record?.id ? editableKeys_bigs:defaultData_bigs_add.map((item:any) => item.id),
                  editableKeys: editableKeys_bigs,
                  actionRender: (row, config, defaultDoms) => {
                    return [defaultDoms.delete];
                  },
                  onValuesChange: (record, recordList) => {
                    // formRef.current?.setFieldsValue({
                    //   bigs: recordList,
                    // });
                    setDataSource_bigs(recordList);
                    let res = calcRunner(recordList, capacitybigs)
                    setautoPercent_bigs(res)
                  },
                  onChange: setEditableRowKeys_bigs,
                }}
              />
              </Form.Item>
          </div>
        </Col>
        <Col span={4} className='shadowBoxs'><span>已确认</span><span>估计值</span></Col>

        
      </Row>
    </ModalForm>
  );
};

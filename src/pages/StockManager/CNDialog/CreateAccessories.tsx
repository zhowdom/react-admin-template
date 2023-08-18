import ProForm, {
  DrawerForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormRadio,
  ProFormDependency,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import { Button, Col, DatePicker, Form, Row } from 'antd';
import PubDivider from '@/components/PubForm/PubDivider';
import { pubFilter } from '@/utils/pubConfig';
import RangeTimeDay from '@/components/PubForm/RangeTimeDay';
import * as api from '@/services/pages/stockManager';
import ListInnerTable from '../ListInnerTable';
import {
  findByPlatformId,
  getSysPlatformWarehousingPage,
  tcPage,
} from '@/services/pages/storageManage';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import moment from 'moment';
import { pubGetStoreList } from '@/utils/pubConfirm';
import './index.less';
import SelectDependency from '@/components/PubForm/SelectDependency';

// 创建配件入库
const Comp: React.FC<{
  dataSource: any;
  common: any;
  reload: any;
  tableKeySet: any;
  access: any;
  plat: any;
  pId: any;
  trigger?: any;
}> = ({ dataSource, common, reload, tableKeySet, plat, pId, trigger }) => {
  const drawerFormRef = useRef<ProFormInstance>(); // 编辑drawer
  const formItemLayout = { labelCol: { flex: '140px' } };
  const rulesRequired: any = { required: true, message: '必填' };
  const [warehouse, warehouseSet] = useState<any[]>([]); // 仓库列表
  const [dates, setDates] = useState<string>('');
  const [datesData, setDatesData] = useState<any>({});
  const [originList, setOriginList] = useState<any>([]);

  // 初始化数据
  class InitData {
    source: any;

    constructor(source: any) {
      this.source = source;
    }

    // 初始化装箱
    orderSkuList(): any[] {
      this.source?.orderSkuList?.map((sku: any) => ({
        ...sku,
        specificationList: sku.specificationList.map((specification: any) => ({
          ...specification,
          num:
            sku?.specificationList.length > 1 || specification.num
              ? specification.num
              : Number(Number(sku.delivery_plan_current_num / specification.pics).toFixed(0)),
        })),
      }));
      return this.source?.orderSkuList;
    }

    // 初始化中转仓预约入库时间
    transfer_appointment(): any[] {
      if (this.source?.transfer_appointment_begin) {
        return [this.source?.transfer_appointment_begin, this.source?.transfer_appointment_end];
      } else {
        return [
          moment(new Date().getTime() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 14:00'),
          moment(new Date().getTime() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD 14:30'),
        ];
      }
    }

    // 初始化要求平台入库时间
    required_warehousing_time(): string {
      return (
        this.source?.required_warehousing_time ||
        moment(new Date().getTime() + 24 * 60 * 60 * 1000 * 5).format('YYYY-MM-DD')
      );
    }

    // 初始化预计平台入库时间
    platform_appointment_time(): string {
      return (
        this.source?.platform_appointment_time ||
        moment(new Date().getTime() + 24 * 60 * 60 * 1000 * 5).format('YYYY-MM-DD')
      );
    }

    // 初始化周期数据
    handleCycle(): void {
      const start = moment(this.source?.shipment_begin_cycle_time || new Date())
        .weekday(0)
        .format('MM.DD'); //本周一
      const end = moment(this.source?.shipment_end_cycle_time || new Date())
        .weekday(6)
        .format('MM.DD'); //本周日
      setDates(`${start}-${end}`);
      setDatesData((pre: any) => {
        return {
          ...pre,
          shipment_begin_cycle_time: moment(this.source?.shipment_begin_cycle_time || new Date())
            .weekday(0)
            .format('YYYY-MM-DD'),
          shipment_end_cycle_time: moment(this.source?.shipment_end_cycle_time || new Date())
            .weekday(6)
            .format('YYYY-MM-DD'),
          cycle_time: moment(this.source?.shipment_begin_cycle_time || new Date()).format(
            'YYYY-W[周]',
          ),
        };
      });
    }
  }

  // 删除sku
  const deleteAction = (goods_sku_id: string) => {
    console.log(goods_sku_id);
    const orderSkuList = drawerFormRef.current
      ?.getFieldValue('orderSkuList')
      .filter((v: any) => v.goods_sku_id != goods_sku_id);
      console.log(orderSkuList)
    drawerFormRef?.current?.setFieldsValue({
      orderSkuList,
    });
  };
  // 转换数据
  const transformDataAction = (values: any) => {
    if (values?.transfer_appointment && plat?.indexOf('京东') > -1) {
      values.transfer_appointment_begin =
        moment(values.transfer_appointment[0]).format('YYYY-MM-DD HH:mm') + ':00' || '';
      values.transfer_appointment_end =
        moment(values.transfer_appointment[1]).format('YYYY-MM-DD HH:mm') + ':00' || '';
    }
    values.id = dataSource.id;
    values?.orderSkuList?.forEach((item: any) => {
      item.specificationList.forEach((v: any) => {
        v.weight ??= v.unit_weight;
      });
    });
    return values;
  };
  // 删除过的sku标识delete=1
  const markDeleteAction = (values: any) => {
    const transformData = transformDataAction(values);
    const orderSkuList = transformData?.orderSkuList
      ? JSON.parse(JSON.stringify(transformData?.orderSkuList))
      : [];
    if (originList?.length) {
      originList.forEach((v: any) => {
        if (
          !transformData?.orderSkuList?.filter((item: any) => item.goods_sku_id === v.goods_sku_id)
            ?.length
        ) {
          v.delete = 1;
          orderSkuList.push(v);
        } else {
          // 已有数据删除后再次添加,初始化部分数据
          orderSkuList?.forEach((item: any) => {
            if (item.goods_sku_id === v.goods_sku_id) {
              item.order_id = v.order_id;
              item.order_no = v.order_no;
              // 箱规相关
              item.specificationList.forEach((c: any) => {
                const cur = c.is_default
                  ? v?.specificationList?.filter((d: any) => d?.is_default)?.[0]
                  : v?.specificationList?.filter((d: any) => !d?.is_default)?.[0];
                c.id = cur?.id;
                c.order_id = cur?.order_id;
                c.order_no = cur?.order_no;
                if (item?.specificationList?.length < v?.specificationList?.length) {
                  item.specificationList.push({
                    ...v?.specificationList?.filter((d: any) => !d?.is_default)?.[0],
                    delete: 1,
                  });
                }
              });
            }
          });
        }
      });
    }
    // console.log(orderSkuList, 'orderSkuList');
    return {
      ...transformData,
      ...datesData,
      orderSkuList,
    };
  };
  // 周期改变
  const cycleChangeAction = (data: any, dataString: string) => {
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
  };
  const init = new InitData(dataSource);
  return (
    <DrawerForm
      formRef={drawerFormRef}
      title={trigger ? '编辑入库单(配件)' : '创建入库单(配件)'}
      trigger={
        trigger || (
          <Button size={'small'} type="primary" ghost>
            创建配件入库单
          </Button>
        )
      }
      onOpenChange={async (visi: boolean) => {
        if(visi){
          init.handleCycle();
          setOriginList(
            dataSource?.orderSkuList?.length ? JSON.parse(JSON.stringify(dataSource.orderSkuList)) : [],
          );
        }
        if (visi && plat === '汇业仓') {
          const res = await getSysPlatformWarehousingPage({
            current_page: 1,
            page_size: 999,
            platform_id: pId, // 区域
          });
          if (res && res.code == pubConfig.sCode) {
            const data = res.data.records.map((item: any) => ({
              ...item,
              label: item.warehousing_name,
              value: item.id,
            }));
            drawerFormRef.current?.setFieldsValue({
              warehouse_id: data?.[0]?.value,
              warehouse_name: data?.[0]?.warehousing_name || data?.[0]?.label || '汇业仓',
              warehouse_contacts: data?.[0]?.contacts,
              warehouse_contacts_phone: data?.[0]?.phone,
              warehouse_address: data?.[0]?.address,
              warehouse_area: '华南',
              warehouse_area_id: '1562655635236950017',
            });
            warehouseSet(data);
            return data;
          } else {
            pubMsg(`${res.message}`);
          }
        }
      }}
      layout="horizontal"
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
        width: '90%',
        // contentWrapperStyle: { maxWidth: '1500px' },
      }}
      className="create-accessories stockDrawer"
      request={async () => {
        // 箱数为 0 并且无备用箱规时, 设置默认 箱数
        return {
          ...dataSource,
          orderSkuList: init.orderSkuList(),
          need_transfer: dataSource?.need_transfer || 0,
          platform_name: plat,
          platform_id: pId,
          transfer_appointment: init.transfer_appointment(),
          required_warehousing_time: init.required_warehousing_time(),
          platform_appointment_time: init.platform_appointment_time(),
          cycle: moment(dataSource?.shipment_begin_cycle_time) || moment(),
          platform_warehousing_type: dataSource?.platform_warehousing_type || null,
          warehouse_id: dataSource?.warehouse_id || null,
          warehouse: [
            dataSource?.platform_warehousing_type || null,
            dataSource?.warehouse_id || null,
          ],
        };
      }}
      onFinish={async (values: any) => {
        try {
          console.log(values, 'values')
          console.log(dataSource, 'dataSource')
          const postData = markDeleteAction({ ...dataSource, ...values });
          console.log(postData.orderSkuList, 'postData')
          // 提交数据
          const res = !dataSource?.id
            ? await api.insertParts(postData)
            : await api.updatePartsById(postData);
          if (res.code == pubConfig.sCode) {
            pubMsg(res?.message, 'success');
            tableKeySet(Date.now());
            if (typeof reload === 'function') reload();
            return true;
          } else {
            pubMsg(`提交失败: ${res.message}`);
            return false;
          }
        } catch (e) {
          console.log(e);
          return false;
        }
      }}
      submitter={{
        searchConfig: {
          resetText: '关闭',
          submitText: '提交',
        },
        render: (props: any, dom: any) => dom,
      }}
    >
      <PubDivider title="入库单信息" />
      <Row gutter={20} className="light-form-item-row">
        <Col span={6}>
          <Form.Item label="入库单号" {...formItemLayout}>
            {dataSource.order_no}
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="入库单类型" {...formItemLayout}>
            {pubFilter(
              common?.dicList?.WAREHOUSING_ORDER_WAREHOUSING_TYPE,
              dataSource?.warehousing_type,
            )}
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="状态" {...formItemLayout}>
            {pubFilter(common?.dicList?.WAREHOUSING_ORDER_STATUS, dataSource.approval_status) ??
              '新建'}
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="创建人" {...formItemLayout}>
            {dataSource.create_user_name ??
              JSON.parse(localStorage.getItem('userInfo') as string)?.user?.name}
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="创建时间" {...formItemLayout}>
            {dataSource.create_time}
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="供应商" {...formItemLayout}>
            {dataSource.vendor_name}
          </Form.Item>
        </Col>
        <Col span={6}>
          <ProFormDatePicker
            label="要求平台入库时间"
            {...formItemLayout}
            name={'required_warehousing_time'}
            rules={[rulesRequired]}
            fieldProps={{
              disabledDate: (current: any) => current && current < moment().add(-1, 'day'),
            }}
          />
        </Col>
        <Col span={6}>
          <Form.Item
            extra={dates}
            label="出货周期"
            {...formItemLayout}
            name="cycle"
            rules={[{ required: true, message: '请选择出货周期' }]}
          >
            {/*@ts-ignore*/}
            <DatePicker
              placeholder="请选择出货周期"
              picker="week"
              defaultValue={moment(datesData?.shipment_begin_cycle_time)}
              onChange={cycleChangeAction}
            />
          </Form.Item>
        </Col>
      </Row>
      {/*货件信息*/}
      {plat == '汇业仓' && (
        <>
          <ProFormText label="平台" name="platform_id" {...formItemLayout} hidden />
          <ProFormText label="平台" name="platform_name" {...formItemLayout} hidden />
        </>
      )}

      {plat != '汇业仓' && (
        <>
          <PubDivider title="货件信息" />
          <Row gutter={20} className="light-form-item-row">
            <Col span={6}>
              <ProFormText label="平台" name="platform_id" {...formItemLayout} hidden />
              <ProFormText label="平台" name="platform_name" {...formItemLayout} readonly />
            </Col>
            {!['云仓', '天猫', '京东POP', '汇业仓'].includes(plat) && (
              <Col span={6}>
                <ProFormText label="店铺" name="shop_name" {...formItemLayout} hidden />
                <ProFormSelect
                  name="shop_id"
                  label="店铺"
                  showSearch
                  {...formItemLayout}
                  debounceTime={300}
                  fieldProps={{
                    showSearch: true,
                    onChange: (val: any, data: any) => {
                      drawerFormRef.current?.setFieldsValue({
                        shop_name: data.label,
                      });
                    },
                  }}
                  params={{
                    platform_id: pId,
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
            )}
          </Row>
        </>
      )}

      {/*装箱设置*/}
      <PubDivider title="装箱设置" />
      <ProForm.Item name={'orderSkuList'} rules={[{ required: true, message: '请选择商品' }]}>
        <ListInnerTable
          showHeader={true}
          formRef={drawerFormRef}
          type={'cn'}
          from={'EditDrawer'}
          operationType={'packSet'}
          isParts={true}
          pId={pId}
          deleteAction={deleteAction}
          plat={plat}
        />
      </ProForm.Item>

      {/*货件物流信息*/}
      <PubDivider title="物流信息" />
      {!['云仓', '汇业仓'].includes(plat) && (
        <Row gutter={20} className={'light-form-item-row-space'}>
          <Col span={8}>
            <ProFormText label="收货区域id" name="warehouse_area_id" hidden noStyle />
            <Form.Item noStyle shouldUpdate>
              {() => {
                return (
                  <ProFormSelect
                    name="warehouse_area"
                    {...formItemLayout}
                    label="收货区域"
                    rules={[{ required: true, message: '请选择收货区域' }]}
                    params={{
                      id: pId,
                    }}
                    fieldProps={{
                      onChange: (val: any, data: any) => {
                        drawerFormRef.current?.setFieldsValue({
                          warehouse_area_id: data?.data?.id,
                          warehouse_id: null,
                        });
                      },
                    }}
                    request={async (v) => {
                      if (!v.id) {
                        return [];
                      }
                      const res = await findByPlatformId({ ...v });
                      if (res?.code != pubConfig.sCode) {
                        pubMsg(res?.message);
                        return [];
                      }
                      const newArray = res?.data.map((item: any) => {
                        return {
                          value: item.region,
                          label: item.region,
                          data: item,
                        };
                      });
                      return newArray;
                    }}
                  />
                );
              }}
            </Form.Item>
          </Col>
        </Row>
      )}
      {plat === '汇业仓' && (
        <>
          <ProFormText label="收货区域id" name="warehouse_area_id" {...formItemLayout} hidden />
          <ProFormText label="收货区域" name="warehouse_area" {...formItemLayout} hidden />
          <ProFormText label="收货仓库" {...formItemLayout} name="warehouse_name" readonly />
          <ProFormText label="收货仓库id" name="warehouse_id" hidden noStyle />
        </>
      )}
      <Row gutter={20} className={'light-form-item-row-space'}>
        {plat != '汇业仓' &&
          (['云仓'].includes(plat) ? (
            <Col span={8}>
              <ProFormText name="platform_warehousing_type" hidden noStyle />
              <ProFormText name="warehouse_name" hidden noStyle />
              <ProFormText name="warehouse_id" hidden noStyle />
              <ProForm.Item
                transform={() => ({})}
                required
                label={'收货仓库'}
                {...formItemLayout}
                name={'warehouse'}
                rules={[
                  {
                    validator: (_, val) => {
                      if (!(val[0] && val[1])) {
                        return Promise.reject('请选择仓库');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <SelectDependency
                  onChange={(val: any) => {
                    if (val[1] && val[1]?.value) {
                      drawerFormRef?.current?.setFieldsValue({
                        platform_warehousing_type: val[0]?.value || val[0],
                        warehouse_id: val[1]?.value,
                        warehouse_name: val[1]?.label,
                        warehouse_contacts: val[1]?.data?.contacts,
                        warehouse_contacts_phone: val[1]?.data?.phone,
                        warehouse_address: val[1]?.data?.complete_address,
                      });
                    } else {
                      drawerFormRef?.current?.setFieldsValue({
                        platform_warehousing_type: '',
                        warehouse_id: '',
                        warehouse_name: '',
                        warehouse_contacts: '',
                        warehouse_contacts_phone: '',
                        warehouse_address: '',
                      });
                    }
                  }}
                  disabledStatus={0}
                  labelInValue
                  valueEnum={common?.dicList?.SYS_PLATFORM_WAREHOUSING_PLATFORM || {}}
                  requestUrl={'/sc-scm/orderDeliveryWarehouse/page'}
                  requestParam={'platform_code'}
                  placeholder={['类型类型', '仓库选择']}
                />
              </ProForm.Item>
            </Col>
          ) : (
            <ProFormDependency name={['warehouse_area_id']}>
              {({ warehouse_area_id }) =>
                warehouse_area_id ? (
                  <Col span={8}>
                    <ProFormText label="收货仓库名称" name="warehouse_name" hidden noStyle />
                    <ProFormSelect
                      label="收货仓库"
                      name="warehouse_id"
                      {...formItemLayout}
                      showSearch
                      rules={[rulesRequired]}
                      fieldProps={{
                        onSelect: (id: any) => {
                          const data = warehouse.find((item) => item.id === id);
                          if (data?.id) {
                            drawerFormRef?.current?.setFieldsValue({
                              warehouse_name: data?.warehousing_name || data?.label,
                              warehouse_contacts: data?.contacts,
                              warehouse_contacts_phone: data?.phone,
                              warehouse_address: data?.address,
                            });
                          }
                        },
                      }}
                      params={{
                        region_id: warehouse_area_id,
                      }}
                      request={async (v: any) => {
                        const res = await getSysPlatformWarehousingPage({
                          current_page: 1,
                          page_size: 999,
                          platform_id: pId, // 区域
                          ...v, // 店铺
                        });
                        if (res && res.code == pubConfig.sCode) {
                          const data = res.data.records.map((item: any) => ({
                            ...item,
                            label: item.warehousing_name || item.warehouse_name,
                            value: item.id,
                          }));
                          warehouseSet(data);
                          return data;
                        } else {
                          pubMsg(`操作失败, ${res.message}`);
                        }
                        return [];
                      }}
                    />
                  </Col>
                ) : null
              }
            </ProFormDependency>
          ))}

        <ProFormDependency name={['warehouse_id', 'warehouse_area_id']}>
          {({ warehouse_id, warehouse_area_id }) =>
            warehouse_id && (['云仓', '汇业仓'].includes(plat) || warehouse_area_id) ? (
              <>
                <Col span={8}>
                  <ProFormText
                    label="仓库联系人"
                    name={'warehouse_contacts'}
                    {...formItemLayout}
                    readonly
                  />
                </Col>
                <Col span={8}>
                  <ProFormText
                    label="联系人电话"
                    name={'warehouse_contacts_phone'}
                    {...formItemLayout}
                    readonly
                  />
                </Col>
                <Col span={24}>
                  <ProFormText
                    label="仓库详细地址"
                    name={'warehouse_address'}
                    {...formItemLayout}
                    readonly
                  />
                </Col>
              </>
            ) : (
              <></>
            )
          }
        </ProFormDependency>

        {plat?.indexOf('京东') > -1 ? (
          <Col span={24}>
            <ProFormRadio.Group
              label="是否需要中转"
              name={'need_transfer'}
              {...formItemLayout}
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </Col>
        ) : null}
        <ProFormDependency name={['need_transfer']}>
          {({ need_transfer }) => {
            return need_transfer == 1 ? (
              <Col span={24}>
                <Row>
                  <Col span={7}>
                    <ProFormSelect
                      label="中转仓"
                      width={'sm'}
                      name="tc_warehouse_id"
                      {...formItemLayout}
                      showSearch
                      rules={[rulesRequired]}
                      fieldProps={{
                        onSelect: (id: any, d: any) => {
                          if (d?.id) {
                            drawerFormRef?.current?.setFieldsValue({
                              tc_warehouse_contacts: d?.contacts,
                              tc_warehouse_phone: d?.phone,
                              tc_warehouse_address: d?.address,
                            });
                          }
                        },
                      }}
                      request={async () => {
                        const res = await tcPage({
                          current_page: 1,
                          page_size: 999,
                          status: '1', // 启用状态
                        });
                        if (res && res.code == pubConfig.sCode) {
                          return res.data.records.map((item: any) => ({
                            ...item,
                            label: item.tc_name,
                            value: item.id,
                          }));
                        }
                        return [];
                      }}
                    />
                  </Col>
                  <Col span={7}>
                    <ProFormText
                      label="仓库联系人"
                      name={'tc_warehouse_contacts'}
                      width={'sm'}
                      {...formItemLayout}
                      readonly
                    />
                  </Col>
                  <Col span={7}>
                    <ProFormText
                      label="联系人电话"
                      name={'tc_warehouse_phone'}
                      width={'sm'}
                      {...formItemLayout}
                      readonly
                    />
                  </Col>
                  <Col span={10}>
                    <ProFormText
                      label="中转仓地址"
                      name={'tc_warehouse_address'}
                      {...formItemLayout}
                      readonly
                    />
                  </Col>
                </Row>
              </Col>
            ) : null;
          }}
        </ProFormDependency>
        <Col span={24}>
          <Row>
            {!['云仓', '汇业仓'].includes(plat) && (
              <>
                <Col span={8}>
                  <ProFormText
                    label="平台预约单号"
                    {...formItemLayout}
                    name={'platform_appointment_order_no'}
                    rules={[
                      () => ({
                        validator(_, value) {
                          if (value?.length > 50) {
                            return Promise.reject(new Error('超过50个字符，请检查单号正确性'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  />
                </Col>
                <Col span={8}>
                  <ProFormText
                    label="平台入库单号"
                    {...formItemLayout}
                    name={'platform_warehousing_order_no'}
                    rules={
                      plat == '天猫'
                        ? [
                            rulesRequired,
                            () => ({
                              validator(_, value) {
                                if (value?.length > 50) {
                                  return Promise.reject(
                                    new Error('超过50个字符，请检查单号正确性'),
                                  );
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]
                        : [
                            () => ({
                              validator(_, value) {
                                if (value?.length > 50) {
                                  return Promise.reject(
                                    new Error('超过50个字符，请检查单号正确性'),
                                  );
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]
                    }
                  />
                </Col>
              </>
            )}
            <Col span={8}>
              <ProFormDatePicker
                label="预计平台入库时间"
                labelCol={{ flex: '140px' }}
                name={'platform_appointment_time'}
                rules={[rulesRequired]}
                fieldProps={{
                  disabledDate: (current: any) => current && current < moment().add(-1, 'day'),
                }}
              />
            </Col>
          </Row>
        </Col>
        <ProFormDependency name={['need_transfer']}>
          {({ need_transfer }) => {
            return need_transfer == 1 ? (
              <Col span={24}>
                <ProForm.Item
                  label="中转仓预约入库时间"
                  labelCol={{ flex: '160px' }}
                  name={'transfer_appointment'}
                  rules={[rulesRequired]}
                >
                  <RangeTimeDay />
                </ProForm.Item>
              </Col>
            ) : null;
          }}
        </ProFormDependency>
      </Row>
    </DrawerForm>
  );
};
export default Comp;

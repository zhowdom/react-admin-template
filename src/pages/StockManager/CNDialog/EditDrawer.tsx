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
import { Col, Form, Row, DatePicker, Space, Button } from 'antd';
import PubDivider from '@/components/PubForm/PubDivider';
import { pubFilter } from '@/utils/pubConfig';
import RangeTimeDay from '@/components/PubForm/RangeTimeDay';
import * as api from '@/services/pages/stockManager';
import ListInnerTable from '../ListInnerTable';
import { getSysPlatformWarehousingPage, tcPage } from '@/services/pages/storageManage';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import moment from 'moment';
import SelectDependency from '@/components/PubForm/SelectDependency';
import StockOrderDetail_table from '@/components/Reconciliation/StockOrderDetail_table';
import { useAccess } from 'umi';
import './index.less';
// 入库单编辑/详情抽屉弹框
const EditDrawer: React.FC<{
  dataSource: any;
  common: any;
  reload: any;
  tableKeySet: any;
  access: any;
  plat: any;
  trigger?: any;
}> = ({ dataSource, common, reload, tableKeySet, plat, trigger }) => {
  const drawerFormRef = useRef<ProFormInstance>(); // 编辑drawer
  const formItemLayout = { labelCol: { flex: '130px' } };
  const rulesRequired: any = { required: true, message: '必填' };
  const [warehouse, warehouseSet] = useState<any[]>([]); // 仓库列表
  const [dates, setDates] = useState<string>('');
  const [datesData, setDatesData] = useState<any>({});
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  let modalType = 'save'
  const access = useAccess();
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
  // 初始化数据
  class InitData {
    source: any;

    constructor(source: any) {
      this.source = source;
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
  const init = new InitData(dataSource);
  useEffect(() => {
    init.handleCycle();
  }, []);
  return (
    <DrawerForm
      formRef={drawerFormRef}
      title={'入库单编辑'}
      trigger={trigger || <a>编辑</a>}
      layout="horizontal"
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
        // contentWrapperStyle: { maxWidth: '1500px' },
      }}
      width="90%"
      request={async () => {
        // 箱数为 0 并且无备用箱规时, 设置默认 箱数
        return {
          ...dataSource,
          orderSkuList: dataSource.orderSkuList.map((sku: any) => ({
            ...sku,
            specificationList: sku.specificationList.map((specification: any) => ({
              ...specification,
              num:
                sku?.specificationList.length > 1 || specification.num
                  ? specification.num
                  : Number(Number(sku.delivery_plan_current_num / specification.pics).toFixed(0)),
            })),
          })),
          need_transfer: dataSource.need_transfer || 0,
          transfer_appointment: dataSource.transfer_appointment_begin
            ? [dataSource.transfer_appointment_begin, dataSource.transfer_appointment_end]
            : [
              moment(dataSource.create_time).add(1, 'day').format('YYYY-MM-DD') + ' 14:00:00',
              moment(dataSource.create_time).add(1, 'day').format('YYYY-MM-DD') + ' 14:30:00',
            ],
          platform_appointment_time:
            dataSource.platform_appointment_time || moment(dataSource.create_time).add(5, 'day'),
          platform_warehousing_type: dataSource?.platform_warehousing_type || null,
          warehouse_id: dataSource?.warehouse_id || null,
          warehouse: [
            dataSource?.platform_warehousing_type || null,
            dataSource?.warehouse_id || null,
          ],
          cycle: dataSource?.shipment_begin_cycle_time
            ? moment(dataSource?.shipment_begin_cycle_time)
            : moment(),
          required_warehousing_time:
            dataSource.required_warehousing_time || moment(dataSource.create_time).add(5, 'day'),
        };
      }}
      onFinish={async (values: any) => {
        setBtnLoading(true);
        if (values?.transfer_appointment && dataSource?.platform_name?.indexOf('京东') > -1) {
          values.transfer_appointment_begin =
            moment(values.transfer_appointment[0]).format('YYYY-MM-DD HH:mm') + ':00' || '';
          values.transfer_appointment_end =
            moment(values.transfer_appointment[1]).format('YYYY-MM-DD HH:mm') + ':00' || '';
        }
        values.id = dataSource.id;
        /*console.log(values, 'values');
        return;*/
        const res = await api[`${modalType == 'save' ? 'updateWarehousingOrder' : 'saveToSyncVendor'}`]({
          ...values,
          ...datesData,
        });
        setBtnLoading(false);
        if (res.code == pubConfig.sCode) {
          pubMsg(res?.message, 'success');
          tableKeySet(Date.now());
          if (typeof reload === 'function') reload();
          return true;
        } else {
          pubMsg(`提交失败: ${res.message}`);
          return false;
        }
      }}
      className="stockDrawer"

      submitter={{
        render: (data: any, doms: any) => (
          <Space>
            {doms[0]}
            {
              access.canSee('stockManager_synchVendor_cn') ? (
                <Button
                  loading={btnLoading}
                  type="primary"
                  key="save"
                  onClick={async () => {
                    modalType = 'saveAndScy'
                    data.form?.submit?.();
                  }}
                >
                  同步至供应商和平台
                </Button>
              ) : ""
            }
            <Button
              loading={btnLoading}
              type="primary"
              key="save"
              onClick={async () => {
                modalType = 'save'
                data.form?.submit?.();
              }}
            >
              提交
            </Button>
          </Space>
        ),
      }}
    >
      <PubDivider title="入库单信息" />
      <Row gutter={20} className="light-form-item-row">
        <Col span={8}>
          <Form.Item label="入库单号" {...formItemLayout}>
            {dataSource.order_no}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="入库单类型" {...formItemLayout}>
            {pubFilter(
              common?.dicList?.WAREHOUSING_ORDER_WAREHOUSING_TYPE,
              dataSource?.warehousing_type,
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="状态" {...formItemLayout}>
            {pubFilter(common?.dicList?.WAREHOUSING_ORDER_STATUS, dataSource.approval_status)}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="创建人" {...formItemLayout}>
            {dataSource.create_user_name}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="创建时间" {...formItemLayout}>
            {dataSource.create_time}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="供应商" {...formItemLayout}>
            {dataSource.vendor_name}
          </Form.Item>
        </Col>
        {dataSource?.warehousing_type != 2 && (
          <Col span={8}>
            <Form.Item label="要求平台入库时间" {...formItemLayout}>
              {dataSource.required_warehousing_time}
            </Form.Item>
          </Col>
        )}
        {dataSource?.warehousing_type == 2 && (
          <>
            <Col span={8}>
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
            <Col span={8}>
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
          </>
        )}

        {dataSource?.warehousing_type == 1 ||
          (dataSource?.warehousing_type == 2 && (
            <>
              <Col span={8}>
                <Form.Item label="关联原入库单号" {...formItemLayout}>
                  {dataSource.source_order_no}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="原平台入库单号" {...formItemLayout}>
                  {dataSource.source_platform_warehousing_order_no}
                </Form.Item>
              </Col>
            </>
          ))}
      </Row>
      {/*货件信息*/}
      <PubDivider title="货件信息" />
      <Row gutter={20} className="light-form-item-row">
        <Col span={8}>
          <ProForm.Item
            label={
              dataSource?.warehousing_type == 1 || dataSource?.warehousing_type == 2
                ? '原发货计划编号'
                : '发货计划编号'
            }
            name="delivery_plan_no"
            {...formItemLayout}
          >
            {dataSource?.delivery_plan_nos || dataSource?.delivery_plan_no}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProFormText label="平台" name="platform_name" {...formItemLayout} readonly />
        </Col>
        {plat != '云仓' && (
          <Col span={8}>
            <ProFormText label="店铺" name="shop_name" {...formItemLayout} readonly />
          </Col>
        )}
      </Row>
      {/*装箱设置*/}
      <PubDivider title="装箱设置" />
      <ProForm.Item name={'orderSkuList'}>
        <ListInnerTable
          showHeader={true}
          formRef={drawerFormRef}
          type={'cn'}
          from={'EditDrawer'}
          operationType={'packSet'}
        />
      </ProForm.Item>

      {/*货件物流信息*/}
      <PubDivider title="物流信息" />
      <Row gutter={20} className={'light-form-item-row-space'}>
        <Col span={8}>
          <ProFormText label="收货区域" name="warehouse_area" {...formItemLayout} readonly />
          <ProFormText label="收货区域名称" name="warehouse_name" hidden noStyle />
        </Col>
        {plat == '云仓' ? (
          <Col span={16}>
            <ProFormText label="平台入库单号" {...formItemLayout} name="platform_warehousing_order_no" readonly />
          </Col>
        ) : ""}
        <Col span={8}>
          {plat == '云仓' ? (
            <>
              <ProFormText name="platform_warehousing_type" hidden noStyle />
              <ProFormText name="warehouse_id" hidden noStyle />
              <ProFormText name="warehouse_name" hidden noStyle />
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
                  readonly={[true, false]}
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
            </>
          ) : (
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
              request={async () => {
                const res = await getSysPlatformWarehousingPage({
                  current_page: 1,
                  page_size: 999,
                  platform_id: dataSource.platform_id, // 区域
                  region_id: dataSource.warehouse_area_id, // 店铺
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
          )}
        </Col>
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
        {dataSource?.platform_name?.indexOf('京东') > -1 ? (
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
            {plat != '云仓' && (
              <>
                <Col span={8}>
                  <ProFormText
                    label="平台预约单号"
                    {...formItemLayout}
                    name={'platform_appointment_order_no'}
                  />
                </Col>
                <Col span={8}>
                  <ProFormText
                    label="平台入库单号"
                    {...formItemLayout}
                    name={'platform_warehousing_order_no'}
                    rules={dataSource.platform_name == '天猫' ? [rulesRequired] : []}
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
      {/*入库单关联采购单 - 国内*/}
      <PubDivider title="关联采购单信息" />
      <StockOrderDetail_table id={dataSource?.id} business_scope="CN" />
    </DrawerForm>
  );
};
export default EditDrawer;

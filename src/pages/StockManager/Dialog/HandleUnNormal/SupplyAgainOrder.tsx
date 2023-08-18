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
import { Col, Form, Row, Tag, DatePicker } from 'antd';
import PubDivider from '@/components/PubForm/PubDivider';
import RangeTimeDay from '@/components/PubForm/RangeTimeDay';
import * as api from '@/services/pages/stockManager';
import ListInnerTable from '../../ListInnerTable';
import { getSysPlatformWarehousingPage, tcPage } from '@/services/pages/storageManage';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import moment from 'moment';
import SelectDependency from '@/components/PubForm/SelectDependency';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { arraySum } from '@/utils/pubConfirm';
// 入库单编辑/详情抽屉弹框
const EditDrawer: React.FC<{
  dataSource: any;
  common: any;
  reload: any;
  tableKeySet: (key: number) => any;
  tableKey: any;
  exception_less_type: any;
  curPlan?: any;
  trigger?: any;
}> = ({
  dataSource,
  common,
  reload,
  tableKeySet,
  tableKey,
  exception_less_type,
  trigger,
  curPlan,
}) => {
  const drawerFormRef = useRef<ProFormInstance>(); // 编辑drawer
  const formItemLayout = { labelCol: { flex: '130px' } };
  const rulesRequired: any = { required: true, message: '必填' };
  const [warehouse, warehouseSet] = useState<any[]>([]); // 仓库列表
  const [vendorId, setVendorId] = useState<any>('');
  const [sForm] = Form.useForm();
  const [editableKeys, setEditableKeys] = useState<string[]>([]);
  const columnsSupplier: ProColumns<Record<string, any>>[] = [
    {
      title: '选择',
      dataIndex: 'choseVendor',
      align: 'center',
      width: 50,
      valueType: 'radio',
      initialValue: '1',
      valueEnum: { 1: { text: ' ' } },
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
      width: 120,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '供应商代码',
      dataIndex: 'vendor_code',
      align: 'center',
      width: 90,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
      width: 120,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan2 }),
    },
    {
      title: 'SKU',
      dataIndex: dataSource?.business_scope == 'CN' ? 'stock_no' : 'shop_sku_code',
      align: 'center',
      width: 100,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan2 }),
    },
    {
      title: '总未交货数量',
      dataIndex: 'total_undelivered_num',
      width: 110,
      editable: false,
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan2 }),
    },
    {
      title: '单号',
      dataIndex: 'p_order_no',
      align: 'center',
      width: 110,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan3 }),
    },
    {
      title: '单据类型',
      dataIndex: 'type',
      align: 'center',
      width: 100,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan3 }),
      render: (_: any, record: any) => {
        return record.type == '1' ? '采购单' : '';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'p_create_time',
      align: 'center',
      width: 96,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan3 }),
    },
    {
      title: '指定优先商品',
      dataIndex: 'choseOrderSkuType',
      width: 120,
      valueType: 'checkbox',
      valueEnum: (record: any) => {
        return { 1: { text: record.goods_sku_type == '1' ? '采购商品' : '备品(赠品)' } };
      },
      fieldProps: (_: any, record: any) => ({
        disabled: !(record.entity.vendor_id == vendorId),
      }),
      onCell: (record: any) => ({ rowSpan: record.rowSpan4 }),
    },
    {
      title: '未交货数量',
      dataIndex: 'undelivered_num',
      width: 100,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan4 }),
    },
    {
      title: '采购主体',
      dataIndex: 'p_order_main_name',
      width: 160,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan4 }),
      render: (_: any, record: any) => (
        <div>
          {record.p_order_main_name}
          {record.tax_refund == 1 && dataSource?.business_scope != 'CN' ? (
            <Tag color="green" style={{ marginLeft: '2px' }}>
              可退税
            </Tag>
          ) : (
            ''
          )}
        </div>
      ),
    },
    {
      title: '采购单结算币种',
      dataIndex: 'currency',
      align: 'center',
      width: 120,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan4 }),
      valueEnum: common?.dicList?.SC_CURRENCY || {},
    },
  ];
  const [dates, setDates] = useState<string>('');
  const [datesData, setDatesData] = useState<any>({});
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
  // 提交处理sku数据
  const handleSkus = (values: any) => {
    const submitData: any = {};
    const newData = values.dataSource;
    console.log(newData);
    const vendorData = newData.find((v: any) => vendorId == v.vendor_id);
    // console.log(vendorData);
    console.log(newData);
    if (!vendorData || !vendorData.vendor_id) {
      pubMsg('请选择关联采购单', 'info');
      return;
    }

    submitData.order_id = dataSource?.id;
    submitData.vendor_id = vendorData.vendor_id;
    submitData.vendor_code = vendorData.vendor_code;
    submitData.vendor_name = vendorData.vendor_name;
    submitData.purchaseOrderSkuList = [];

    // 取选中的SKU，SKU可能有多个 当没有选中后面的时候，SKU给空
    const choseData = newData.filter((v: any) => v.choseOrderSkuType.length); // 选中的商品/备品的集合
    console.log(choseData, 'choseData');
    if (!choseData.length) {
      submitData.purchaseOrderSkuList = [];
    } else {
      // 选中的 SKUid 集合
      const skuIds = [...new Set(choseData.map((v: any) => v.goods_sku_id))];
      skuIds.forEach((item: any) => {
        // 选中的 商品/备品 数据集合
        const typeData = choseData
          .filter((v: any) => v.goods_sku_id == item)
          .map((k: any) => ({
            purchase_order_sku_id: k.purchase_order_sku_ids || k.purchase_order_sku_id,
            goods_sku_type: k.goods_sku_type,
          }));
        submitData.purchaseOrderSkuList.push({
          goods_sku_id: item,
          purchaseOrderSkuTypeList: typeData,
        });
      });
      // console.log(skuIds);
    }
    return submitData;
  };
  // 初始化数据
  class InitData {
    source: any;

    constructor(source: any) {
      this.source = source;
    }
    // 初始化周期数据
    handleCycle(): void {
      const start = moment(new Date()).weekday(0).format('MM.DD'); //本周一
      const end = moment(new Date()).weekday(6).format('MM.DD'); //本周日
      setDates(`${start}-${end}`);
      setDatesData((pre: any) => {
        return {
          ...pre,
          shipment_begin_cycle_time: moment(new Date()).weekday(0).format('YYYY-MM-DD'),
          shipment_end_cycle_time: moment(new Date()).weekday(6).format('YYYY-MM-DD'),
          cycle_time: moment(new Date()).format('YYYY-W[周]'),
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
      title={'创建补发入库单'}
      trigger={trigger}
      layout="horizontal"
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
        width: '90%',
        contentWrapperStyle: { maxWidth: '1500px' },
      }}
      params={{ order_id: dataSource.order_id, tableKey: tableKey || '' }}
      request={async () => {
        /*获取异常入库单详情*/
        const resDetail = await api.getOutsideOrderInfo({
          order_no: dataSource.order_no,
          goods_sku_id: dataSource.goods_sku_id,
        });
        if (resDetail.code == pubConfig.sCode) {
          /*获取关联的供应商采购单*/
          const res = await api.findSelectPurchaseOrder({
            order_id: resDetail?.data?.id,
            goods_sku_id: resDetail?.data?.goods_sku_id,
            vendor_id: resDetail?.data?.vendor_id,
            warehousing_type: 2,
          });
          if (res.code == pubConfig.sCode) {
            const newData: any = [];
            res.data.forEach((v: any, vindex: number) => {
              if (v.skuPurchaseOrderList) {
                // 供应商要合并的集合，取每个 sku的合 和每个sku下面 采购单的合 和每个采购单下面 商品/备品的合
                const skuNum = v.skuPurchaseOrderList.map((sku: any) =>
                  sku.orderDetails.map((order: any) => order.orderSkuTypeList.length),
                );
                const skuNum1 = skuNum.flat(2); // 多维转一维
                // console.log(skuNum1);
                v.skuPurchaseOrderList.forEach((k: any, kindex: number) => {
                  if (k.orderDetails) {
                    // SKU要合并的集合，取每个 sku 下面 采购单的合 和每个采购单下面 商品/备品的合
                    const orderNum = k.orderDetails.map(
                      (order: any) => order.orderSkuTypeList.length,
                    );
                    // console.log(orderNum, '*');
                    // SKU显示的总未交货数量 前端算，取最后一层的值相加
                    const undelivered_num_list = k.orderDetails.map((numK: any) =>
                      numK.orderSkuTypeList.map((numH: any) => numH.undelivered_num),
                    );
                    const undelivered_num_list1 = undelivered_num_list.flat(2); // 多维转一维
                    // console.log(undelivered_num_list1, '*');
                    k.orderDetails.forEach((h: any, hindex: number) => {
                      if (h.orderSkuTypeList) {
                        const typeNum = h.orderSkuTypeList.length;
                        // console.log(typeNum);
                        h.orderSkuTypeList.forEach((t: any, tindex: number) => {
                          newData.push({
                            ...v,
                            ...k,
                            ...h,
                            ...t,
                            total_undelivered_num: arraySum(undelivered_num_list1),
                            choseOrderSkuType: [],
                            rowSpan1: !kindex && !hindex && !tindex ? arraySum(skuNum1) : 0,
                            rowSpan2: !hindex && !tindex ? arraySum(orderNum) : 0,
                            rowSpan3: !tindex ? typeNum : 0,
                            rowSpan4: 1,
                          });
                        });
                      }
                    });
                  } else {
                    newData.push({
                      ...v,
                      ...k,
                      rowSpan1: !vindex ? arraySum(skuNum) : 0,
                      rowSpan2: 1,
                      rowSpan3: 1,
                      rowSpan4: 1,
                    });
                  }
                });
              } else {
                newData.push({ ...v, rowSpan1: 1, rowSpan2: 1, rowSpan3: 1, rowSpan4: 1 });
              }
            });
            const dd = newData.map((s: any) => s.purchase_order_sku_id);
            setEditableKeys(dd);
            setVendorId(resDetail?.data?.vendor_id);
            return {
              ...dataSource,
              platform_appointment_order_no: null,
              platform_warehousing_order_no: null,
              platform_appointment_time: null,
              dataSource: newData,
              orderSkuList: dataSource.orderSkuList.filter((item: any) => item.goods_sku_id == dataSource.goods_sku_id).map((sku: any) => ({
                ...sku,
                delivery_plan_current_num: curPlan,
                specificationList: sku.specificationList.map((specification: any) => ({
                  ...specification,
                  num: Number(Number(curPlan / specification.pics).toFixed(0)),
                })),
              })),
              need_transfer: dataSource.need_transfer || 0,
              transfer_appointment: dataSource.transfer_appointment_begin
                ? [dataSource.transfer_appointment_begin, dataSource.transfer_appointment_end]
                : [
                    moment(dataSource.create_time).add(1, 'day').format('YYYY-MM-DD') + ' 14:00:00',
                    moment(dataSource.create_time).add(1, 'day').format('YYYY-MM-DD') + ' 14:30:00',
                  ],
              platform_warehousing_type: dataSource?.platform_warehousing_type || null,
              warehouse_id: dataSource?.warehouse_id || null,
              warehouse: [
                dataSource?.platform_warehousing_type || null,
                dataSource?.warehouse_id || null,
              ],
              cycle: moment(),
              required_warehousing_time: moment(
                new Date().getTime() + 24 * 60 * 60 * 1000 * 5,
              ).format('YYYY-MM-DD'),
            };
          } else {
            pubMsg(res.message);
            return { dataSource: [] };
          }
        } else {
          pubMsg(resDetail.message);
          return { dataSource: [] };
        }
      }}
      onFinish={async (values: any) => {
        if (values?.transfer_appointment && dataSource?.platform_name?.indexOf('京东') > -1) {
          values.transfer_appointment_begin =
            moment(values.transfer_appointment[0]).format('YYYY-MM-DD HH:mm') + ':00' || '';
          values.transfer_appointment_end =
            moment(values.transfer_appointment[1]).format('YYYY-MM-DD HH:mm') + ':00' || '';
        }
        values.id = dataSource.id;
        const submitData = handleSkus({
          ...values,
        });
        const res = await api.createReissueWarehousingOrder({
          ...values,
          exception_less_type,
          ...datesData,
          selectPurchaseOrder: submitData,
        });
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
      submitter={{
        searchConfig: {
          resetText: '关闭',
          submitText: '确定并提交',
        },
        render: (props: any, dom: any) => dom,
      }}
    >
      <PubDivider title="入库单信息" />
      <Row gutter={20} className="light-form-item-row">
        <Col span={8}>
          <Form.Item label="入库单类型" {...formItemLayout}>
            补发入库单
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="状态" {...formItemLayout}>
            新建
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="创建人" {...formItemLayout}>
            {JSON.parse(localStorage.getItem('userInfo') as string)?.user?.name}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="供应商" {...formItemLayout}>
            {dataSource.vendor_name}
          </Form.Item>
        </Col>
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
              //   defaultValue={moment(datesData?.shipment_begin_cycle_time)}
              onChange={cycleChangeAction}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="关联原入库单号" {...formItemLayout}>
            {dataSource.order_no}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="原平台入库单号" {...formItemLayout}>
            {dataSource.platform_warehousing_order_no}
          </Form.Item>
        </Col>
      </Row>
      {/*货件信息*/}
      <PubDivider title="货件信息" />
      <Row gutter={20} className="light-form-item-row">
        <Col span={8}>
          <ProForm.Item
            label="原发货计划编号"
            name="delivery_plan_no"
            {...formItemLayout}
          >
            {dataSource.delivery_plan_nos || dataSource.delivery_plan_no}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProFormText label="平台" name="platform_name" {...formItemLayout} readonly />
        </Col>
        {dataSource.platform_name != '云仓' && (
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
          order_type={dataSource.order_type}
        />
      </ProForm.Item>

      {/*货件物流信息*/}
      <PubDivider title="物流信息" />
      <Row gutter={20} className={'light-form-item-row-space'}>
        <Col span={24}>
          <ProFormText label="收货区域" name="warehouse_area" {...formItemLayout} readonly />
          <ProFormText label="收货区域名称" name="warehouse_name" hidden noStyle />
        </Col>
        <Col span={8}>
          {dataSource.platform_name == '云仓' ? (
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
            {dataSource.platform_name != '云仓' && (
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
      <PubDivider title="关联采购单" />
      <Form.Item className={'mb-0'} noStyle name={'dataSource'}>
        <EditableProTable
          size={'small'}
          rowKey="purchase_order_sku_id"
          dateFormatter="string"
          bordered
          columns={columnsSupplier}
          recordCreatorProps={false}
          editable={{
            type: 'multiple',
            editableKeys,
            form: sForm,
            onValuesChange: (record: any, recordList: any) => {
              drawerFormRef.current?.setFieldsValue({
                dataSource: recordList,
              });
              // 当选中供应商是时，其他的供应商下的已选中给取消掉
              if (record.choseVendor) {
                setVendorId(record.vendor_id);
                const otherKey = recordList
                  .filter((eKey: any) => eKey.vendor_id != record.vendor_id)
                  .map((sKey: any) => sKey.purchase_order_sku_id);
                otherKey.forEach((item: any) => {
                  sForm.setFieldsValue({
                    [item]: {
                      choseVendor: '',
                      choseOrderSkuType: [],
                    },
                  });
                });
              }
            },
          }}
          tableAlertRender={false}
          search={false}
          toolBarRender={false}
          pagination={false}
          scroll={{ x: 1300, y: 600 }}
        />
      </Form.Item>
      <div>说明:</div>
      <ul style={{ paddingInlineStart: '20px' }}>
        <li>1，系统默认逻辑：先扣采购单正常采购商品、再扣该采购单备品，然后扣维修单；</li>
        <li>
          2，指定扣减逻辑：先扣指定采购单正常采购商品，再扣该指定采购单备品，然后扣指定维修单，指定单据不够库存，则继续先扣未指定采购单采购商品和备品，再扣未指定维修单；
        </li>
        <li>3，同一类型单据，按创建时间，先建先出；</li>
        <li>4，只能选择一个供应商出货；</li>
      </ul>
    </DrawerForm>
  );
};
export default EditDrawer;

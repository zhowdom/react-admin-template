import ProForm, {
  DrawerForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef, useState } from 'react';
import { Button, Col, Popconfirm, Row, Space } from 'antd';
import ListInnerTable from '../ListInnerTable';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import PubDivider from '@/components/PubForm/PubDivider';
import { divide, pubGetLogisticsPortList, pubGetSysPortList } from '@/utils/pubConfirm';
import * as api from '@/services/pages/stockManager';
import moment from 'moment';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { useAccess } from 'umi';
import StockOrderDetail_table from '@/components/Reconciliation/StockOrderDetail_table';

// 表单抽屉弹框-编辑物流信息
const EditDrawerLogistics: React.FC<{
  dataSource: any;
  reload: any;
  common: any;
}> = ({ dataSource, reload, common }) => {
  const editDrawerLogisticsFormRef = useRef<ProFormInstance>(); // 编辑物流信息drawer
  const formItemLayout = {
    labelCol: { flex: '130px' },
  };
  const access = useAccess();
  const [address, setAddress] = useState(dataSource?.harbor_addr);
  const [loading, setLoading] = useState(false);
  const rulesRequired: any = { required: true, message: '必填' };
  return (
    <DrawerForm
      formRef={editDrawerLogisticsFormRef}
      title={'编辑入库单 - 物流信息'}
      trigger={<a>{'编辑物流信息'}</a>}
      layout="horizontal"
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
        width: '90%',
        contentWrapperStyle: { maxWidth: '1600px' },
      }}
      onVisibleChange={async (visible: boolean) => {
        if (visible) {
          setAddress(dataSource?.harbor_addr);
        }
      }}
      initialValues={dataSource}
      onFinish={async (values: any) => {
        values.id = dataSource.id;
        values.harbor_addr = address;
        const res = await api.updateInboundLogistics(values);
        if (res.code == pubConfig.sCode) {
          pubMsg(res?.message, 'success');
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
          submitText: '确定',
        },
        render: (data: any, doms: any) => (
          <Space>
            {[2].includes(Number(dataSource.approval_status)) &&
            access.canSee('stockManager_save_notify') ? (
              <Popconfirm
                title={
                  <div>
                    确定需通知采购发货?
                    <br />
                    注意: 请确保货件和物流信息的必填信息已填写
                  </div>
                }
                onConfirm={async () => {
                  editDrawerLogisticsFormRef?.current
                    ?.validateFields()
                    .then(async () => {
                      const values: any = editDrawerLogisticsFormRef?.current?.getFieldsValue();
                      values.id = dataSource.id;
                      values.harbor_addr = address;
                      Object.entries(values).forEach(([key, value]: any) => {
                        if (
                          [
                            'delivery_time',
                            'closing_time',
                            'platform_appointment_time',
                            'arrival_time',
                          ].includes(key) &&
                          value
                        ) {
                          values[key] = moment(value).format('YYYY-MM-DD');
                        }
                      });

                      const postData = {};
                      for (const key in values) {
                        if (values[key] != null) {
                          postData[key] = values[key];
                        }
                      }
                      setLoading(true);
                      const res = await api.updateInboundLogistics(postData);
                      if (res.code == pubConfig.sCode) {
                        const res1 = await api.notifyPurchaseDelivery({ ids: dataSource.id });
                        if (res.code == pubConfig.sCode) {
                          pubMsg(res1?.message, 'success');
                          if (typeof reload === 'function') reload();
                          setLoading(false);
                        } else {
                          setLoading(false);
                          pubMsg(`提交失败: ${res1.message}`);
                        }
                      } else {
                        pubMsg(`提交失败: ${res.message}`);
                        setLoading(false);
                      }
                    })
                    .catch((e: any) => {
                      console.log(e);
                      setLoading(false);
                      pubMsg(`请检查表单正确性`, 'warning');
                    });
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button type="primary" ghost loading={loading}>
                  提交并通知采购发货
                </Button>
              </Popconfirm>
            ) : (
              ''
            )}
            {doms}
          </Space>
        ),
      }}
      onFinishFailed={(error) => {
        console.error(error);
      }}
    >
      {/* 入库单信息 */}
      <PubDivider title="入库单信息" />
      <Row gutter={20} className="light-form-item-row">
        <Col span={8}>
          <ProFormText label="入库单号" name="order_no" {...formItemLayout} readonly />
        </Col>
        <Col span={8}>
          <ProForm.Item label="状态" {...formItemLayout}>
            {common?.dicList?.WAREHOUSING_ORDER_IN_STATUS[dataSource.approval_status]?.detail_name}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item label="创建人" {...formItemLayout}>
            {dataSource.create_user_name}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item label="创建时间" {...formItemLayout}>
            {dataSource.create_time}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item label="供应商" {...formItemLayout}>
            {dataSource.vendor_name}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item label="要求物流入仓时间" {...formItemLayout}>
            {dataSource.required_warehousing_time}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item required label={'供应商出货城市'} {...formItemLayout}>
            <Space>
              <ProFormSelect
                name={'shipment_province'}
                noStyle
                width={'sm'}
                placeholder={'选择省份'}
                rules={[{ required: true, message: '' }]}
                fieldProps={{
                  onChange: () =>
                    editDrawerLogisticsFormRef?.current?.setFieldsValue({ shipment_city: '' }),
                  options: common.cityData2.map((item: any) => ({
                    label: item.label,
                    value: item.label,
                  })),
                }}
                readonly
              />
              <ProFormDependency name={['shipment_province']}>
                {({ shipment_province }) => {
                  const selectedProvince =
                    common.cityData2.find((item: any) => item.label === shipment_province) || {};
                  const cityList =
                    selectedProvince && selectedProvince.children
                      ? selectedProvince.children.map((item: any) => ({
                          label: item.label,
                          value: item.label,
                        }))
                      : [];
                  return (
                    <ProFormSelect
                      noStyle
                      readonly
                      name={'shipment_city'}
                      width={'sm'}
                      placeholder={'选择城市'}
                      fieldProps={{ options: cityList }}
                      rules={[{ required: true, message: '' }]}
                    />
                  );
                }}
              </ProFormDependency>
            </Space>
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProFormDatePicker
            {...formItemLayout}
            label={'供应商出库时间(货好时间)'}
            name={'delivery_time'}
            rules={[rulesRequired]}
            readonly
          />
        </Col>
      </Row>

      {/* 货件信息 */}
      <PubDivider title="货件信息" />
      <Row gutter={20} className="light-form-item-row">
        <Col span={8}>
          <ProForm.Item label="发货计划编号" {...formItemLayout}>
            {dataSource.delivery_plan_nos || dataSource.delivery_plan_no}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item label="平台" {...formItemLayout}>
            {dataSource.platform_name}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item label="店铺" {...formItemLayout}>
            {dataSource.shop_name}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProFormText label="平台目的仓库" name="warehouse_name" readonly {...formItemLayout} />
        </Col>
        <Col span={8}>
          <ProFormText
            label="货件号(Shipment ID)"
            name="shipment_id"
            readonly
            labelCol={{ flex: '0 0 141px' }}
          />
        </Col>
        <Col span={8}>
          <ProFormText
            label="追踪号(Reference ID)"
            name="reference_id"
            readonly
            labelCol={{ flex: '0 0 144px' }}
          />
        </Col>
        <Col span={8}>
          <ProFormText
            label="warehousing_order_in_id"
            name="warehousing_order_in_id"
            hidden
            readonly
          />
        </Col>
      </Row>

      {/* 装箱设置 */}
      <PubDivider title="装箱设置" />
      <ProForm.Item name={'orderSkuList'}>
        <ListInnerTable showHeader readonly from={'EditDrawer'} operationType={'logisticsSet'} />
      </ProForm.Item>
      <Row gutter={24} className={'label-width-110'}>
        <Col span={6}>
          <ProForm.Item className={'mb-0'} label="到港数量">
            {dataSource.arrival_num}
          </ProForm.Item>
        </Col>
        <Col span={6}>
          <ProForm.Item className={'mb-0'} label="入库数量(平台仓)">
            {dataSource.warehousing_num}
          </ProForm.Item>
        </Col>
        <Col span={6}>
          <ProForm.Item className={'mb-0'} label="下载FNSKU">
            <ShowFileList data={dataSource.sys_files_fnsku && [dataSource.sys_files_fnsku]} />
          </ProForm.Item>
        </Col>
        <Col span={6}>
          <ProForm.Item className={'mb-0'} label="下载箱唛">
            <ShowFileList
              data={dataSource.sys_files_shipping_mark && [dataSource.sys_files_shipping_mark]}
            />
          </ProForm.Item>
        </Col>
        <Col span={6}>
          <ProForm.Item className={'mb-0'} label="货件编号">
            {dataSource.shipment_no}
          </ProForm.Item>
        </Col>
        <Col span={6}>
          <ProForm.Item className={'mb-0'} label="总体积(m³)">
            {divide(dataSource.total_volume, 1000000)}
          </ProForm.Item>
        </Col>
        <Col span={6}>
          <ProForm.Item className={'mb-0'} label="总重(kg)">
            {divide(dataSource.total_weight, 1000)}
          </ProForm.Item>
        </Col>
      </Row>

      {/* 物流信息 */}
      <PubDivider title="物流信息" />
      <Row gutter={20} className={'light-form-item-row-space'}>
        <Col span={24}>
          <ProForm.Item label={'运输方式'} {...formItemLayout}>
            {pubFilter(
              common?.dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD,
              dataSource?.shipping_method,
            )}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProFormSelect
            label={'跨境起运港仓库'}
            name={'harbor'}
            rules={[rulesRequired]}
            request={async () => {
              const res: any = await pubGetSysPortList({ type: 1 });
              return res.map((v: any) => {
                return {
                  ...v,
                  disabled: v.status != '1',
                };
              });
            }}
            fieldProps={{
              onChange: (val: any, data: any) => {
                setAddress(`${data.data.province_name}${data.data.city_name}${data.data.address}`);
              },
            }}
            {...formItemLayout}
          />
        </Col>
        <Col span={8}>
          <ProForm.Item {...formItemLayout} label={'送货地址'}>
            <pre>{address}</pre>
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProFormDatePicker
            label={'截仓时间'}
            name={'closing_time'}
            rules={[rulesRequired]}
            fieldProps={{
              disabledDate: (current: any) => current && current < moment().add(-1, 'day'),
            }}
          />
        </Col>
        <Col span={8}>
          <ProForm.Item label={'到港物流服务商'} {...formItemLayout}>
            {dataSource.logistics_company}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item label={'到港运单号'} {...formItemLayout}>
            {dataSource.logistics_order_no}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item label={'到港运费'} {...formItemLayout}>
            {dataSource.logistics_freight}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProFormDatePicker
            readonly
            label={'到港时间'}
            name={'arrival_time'}
            {...formItemLayout}
          />
        </Col>
        <Col span={8}>
          <ProForm.Item label={'国内入库操作人'} {...formItemLayout}>
            {dataSource.arrival_user_name || ''}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProFormText name="to_port_name" label={'目的港口名称'} hidden {...formItemLayout} />
          <ProForm.Item label={'目的港口'} {...formItemLayout}>
            {dataSource.to_port_name || ''}
          </ProForm.Item>
          {/* <ProFormSelect
            name="to_port_id"
            label={'目的港口'}
            placeholder="目的港口"
            request={async () => {
              const res: any = await pubGetLogisticsPortList({ type: 2 });
              return res;
            }}
            fieldProps={{
              onChange: (v: any, d: any) => {
                editDrawerLogisticsFormRef.current?.setFieldsValue({ to_port_name: d?.label });
              },
            }}
            {...formItemLayout}
          /> */}
        </Col>
      </Row>

      {/*跨境在途信息*/}
      <PubDivider title="跨境在途信息" />
      <Row gutter={20} className={'light-form-item-row-space'}>
        <Col span={8}>
          <ProFormText label={'订舱号'} name={'booking_number'} {...formItemLayout} />
        </Col>
        <Col span={8}>
          {/* <ProFormDatePicker
            label={'预计入仓时间'}
            name={'platform_appointment_time'}
            {...formItemLayout}
          /> */}
          <ProForm.Item label={'预计入仓时间'} {...formItemLayout}>
            {dataSource.platform_appointment_time}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item label={'实际平台入库时间'} tooltip={"因接口无法获取平台真实实际入库时间，此时间为供应链系统同步获取平台入库数量的时间，供应链系统每天都会同步平台收货数量和状态"} {...formItemLayout}>
            {dataSource.warehousing_time}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item label={'平台入库操作人'} {...formItemLayout}>
            {dataSource.warehousing_user_name}
          </ProForm.Item>
        </Col>
      </Row>
      {/*入库单关联采购单 - 跨境*/}
      <PubDivider title="关联采购单信息" />
      <StockOrderDetail_table id={dataSource?.id} business_scope="IN" />
    </DrawerForm>
  );
};
export default EditDrawerLogistics;

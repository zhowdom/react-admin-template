import ProForm, {
  DrawerForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef, useState } from 'react';
import { Col, Row, Space } from 'antd';
import PubDivider from '@/components/PubForm/PubDivider';
import * as api from '@/services/pages/stockManager';
import { divide } from '@/utils/pubConfirm';
import ListInnerTable from '../ListInnerTable';
import { pubConfig, pubModal, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import StockOrderDetail_table from '@/components/Reconciliation/StockOrderDetail_table';
import { CheckOutlined } from '@ant-design/icons';
// 表单抽屉弹框-编辑货件信息
const EditDrawer: React.FC<{ dataSource: any; reload: any; common: any }> = ({
  dataSource,
  reload,
  common,
}) => {
  const formItemLayout = {
    labelCol: { flex: '130px' },
  };
  const formItemLayout1 = {
    labelCol: { flex: '145px' },
  };
  const rulesRequired: any = { required: true, message: '必填' };
  const editDrawerFormRef = useRef<ProFormInstance>(); // 编辑箱规drawer
  const [deFn, setDeFn] = useState<any>([]);
  const [idRight, setIdRight] = useState<any>({});
  // 箱数为 0 并且无备用箱规时, 设置默认 箱数
  const initialValues: any = {
    ...dataSource,
    // 每箱数量默认本次计划发货数量, 要在父获取
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
  };
  // 提交
  const submitAction = async (values: any, resolve: any) => {
    const res = await api.updateShelfInfo(values);
    resolve(true);
    if (res.code == pubConfig.sCode) {
      pubMsg(res?.message, 'success');
      if (typeof reload === 'function') reload();
    } else {
      pubMsg(`提交失败: ${res.message}`);
    }
  };
  return (
    <DrawerForm
      formRef={editDrawerFormRef}
      title="编辑入库单 - 货件信息"
      trigger={<a>编辑货件信息</a>}
      layout="horizontal"
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
        width: '90%',
        contentWrapperStyle: { maxWidth: '1600px' },
      }}
      onVisibleChange={async (visible: boolean) => {
        if (visible) {
          const res = await api.getFnSkuFile({
            shop_id: dataSource.shop_id,
            goods_sku_id: dataSource.goods_sku_id,
          });
          if (res?.code != pubConfig.sCode) {
            setDeFn([]);
            pubMsg(res?.message);
          } else {
            if (!dataSource.sys_files_fnsku) {
              setDeFn(res.data || []);
            }
          }
        } else {
          setDeFn([]);
          setIdRight(false);
        }
      }}
      initialValues={initialValues}
      onFinish={(values: any) => {
        values.id = dataSource.id;
        values.sys_files_fnsku =
          values?.sys_files_fnsku?.delete === 1 ? null : values.sys_files_fnsku;
        return new Promise(async (resolve, reject) => {
          const res = await api.verificationShipmentId({
            shipment_id: values.shipment_id,
            order_id: dataSource.id,
          });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            setIdRight({});
          } else {
            setIdRight(res.data);
            if (res?.data?.isRepeat == '1') {
              pubModal('货件号重复！是否确定继续？')
                .then(async () => {
                  submitAction(values, resolve);
                })
                .catch(() => {
                  reject();
                });
            } else {
              submitAction(values, resolve);
            }
          }
        });
      }}
    >
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
      </Row>
      <Row gutter={20} className="light-form-item-row-space">
        <Col span={16}>
          <ProForm.Item required label={'供应商出货城市'}>
            <Space>
              <ProFormSelect
                name={'shipment_province'}
                noStyle
                placeholder={'选择省份'}
                {...formItemLayout}
                rules={[{ required: true, message: '' }]}
                fieldProps={{
                  onChange: () => editDrawerFormRef?.current?.setFieldsValue({ shipment_city: '' }),
                  options: common.cityData2.map((item: any) => ({
                    label: item.label,
                    value: item.label,
                  })),
                }}
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
                      name={'shipment_city'}
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
          />
        </Col>
      </Row>
      {/* 货件信息 */}
      <PubDivider title="货件信息" />
      <Row gutter={20} className="light-form-item-row">
        <Col span={8}>
          <ProForm.Item label="发货计划编号" {...formItemLayout1}>
            {dataSource.delivery_plan_nos || dataSource.delivery_plan_no}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item label="入库单关联采购单号" {...formItemLayout1}>
            <div
              style={{
                maxWidth: '200px',
                maxHeight: '100px',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                padding: '0 6px',
              }}
            >
              {dataSource.purchase_order_nos
                ? dataSource.purchase_order_nos
                    .split(',')
                    .map((item: any) => <span key={item}>{item}</span>)
                : '未知'}
            </div>
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProForm.Item label="平台" {...formItemLayout1}>
            {dataSource.platform_name}
          </ProForm.Item>
        </Col>
      </Row>
      <Row gutter={20} className="light-form-item-row-space">
        <Col span={8}>
          <ProForm.Item label="店铺" {...formItemLayout1}>
            {dataSource.shop_name}
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProFormText
            rules={[pubRequiredRule]}
            label="平台目的仓库"
            name="warehouse_name"
            {...formItemLayout1}
          />
        </Col>
        <Col span={8} className="after-style">
          <ProFormText
            formItemProps={{ labelCol: { flex: '155px' } }}
            rules={[pubRequiredRule]}
            label="货件号(Shipment ID)"
            name="shipment_id"
            {...formItemLayout1}
            fieldProps={{
              onBlur: async (e) => {
                const res = await api.verificationShipmentId({
                  shipment_id: e.target.value,
                  order_id: dataSource.id,
                });
                if (res?.code != pubConfig.sCode) {
                  pubMsg(res?.message);
                  setIdRight({});
                } else {
                  setIdRight(res.data);
                }
              },
              addonAfter:
                idRight?.isVer == '1' ? <CheckOutlined style={{ color: '#389e0d' }} /> : undefined,
            }}
          />
        </Col>
        <Col span={8}>
          <ProFormText
            formItemProps={{ labelCol: { flex: '155px' } }}
            rules={[pubRequiredRule]}
            label="追踪号(Reference ID)"
            name="reference_id"
            {...formItemLayout1}
          />
        </Col>
        <Col span={8}>
          <ProFormText
            label="warehousing_order_in_id"
            name="warehousing_order_in_id"
            hidden
            readonly
            {...formItemLayout1}
          />
        </Col>
      </Row>
      {/* 装箱设置 */}
      <PubDivider title="装箱设置" />
      <ProForm.Item name={'orderSkuList'}>
        <ListInnerTable
          showHeader={true}
          formRef={editDrawerFormRef}
          type={'in'}
          operationType={'packSet'}
          readonly={dataSource.approval_status == '2'}
          from={'EditDrawer'}
        />
      </ProForm.Item>
      <Row gutter={20}>
        <Col span={12}>
          <ProForm.Item
            label="上传FNSKU"
            name="sys_files_fnsku"
            extra="支持上传zip, rar, pdf格式文件, 最多一个(非必填)"
          >
            <UploadFileList
              fileBack={(data: any) =>
                editDrawerFormRef?.current?.setFieldsValue({ sys_files_fnsku: data[0] })
              }
              businessType="WAREHOUSING_ORDER"
              defaultFileList={
                dataSource.sys_files_fnsku && [dataSource.sys_files_fnsku]
                  ? [dataSource.sys_files_fnsku]
                  : deFn
              }
              accept={['.zip,.rar,.pdf']}
              acceptType={['zip', 'rar', 'pdf']}
              acceptMessage="格式不正确(只接收: zip, rar, pdf格式文件)"
              maxSize="100"
              maxCount="1"
            />
          </ProForm.Item>
        </Col>
        <Col span={12}>
          <ProForm.Item
            label="上传箱唛"
            name="sys_files_shipping_mark"
            extra="支持上传zip, rar, pdf格式文件, 大小 < 100M, 最多一个(非必填)"
          >
            <UploadFileList
              fileBack={(data: any) => {
                editDrawerFormRef?.current?.setFieldsValue({ sys_files_shipping_mark: data[0] });
              }}
              businessType="WAREHOUSING_ORDER"
              defaultFileList={
                dataSource.sys_files_shipping_mark && [dataSource.sys_files_shipping_mark]
              }
              accept={['.zip,.rar,.pdf']}
              acceptType={['zip', 'rar', 'pdf']}
              acceptMessage="格式不正确(只接收: zip, rar, pdf格式文件)"
              maxSize="100"
              maxCount="1"
            />
          </ProForm.Item>
        </Col>
        <Col span={8}>
          <ProFormText label="货件编号" name="shipment_no" />
        </Col>
        <Col span={6}>
          <ProForm.Item label="总体积(m³)">{divide(dataSource.total_volume, 1000000)}</ProForm.Item>
        </Col>
        <Col span={6}>
          <ProForm.Item label="总重(kg)">{divide(dataSource.total_weight, 1000)}</ProForm.Item>
        </Col>
      </Row>
      {/*入库单关联采购单 - 跨境*/}
      <PubDivider title="关联采购单信息" />
      <StockOrderDetail_table id={dataSource?.id} business_scope="IN" />
    </DrawerForm>
  );
};
export default EditDrawer;

import { useRef, useState } from 'react';
import { Spin, Row, Col, Form, Space, Popconfirm, Button } from 'antd';
import ProForm, {
  DrawerForm,
  ProFormDatePicker,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { warehousingOrderFindById } from '@/services/pages/reconciliationPurchase';
import PubDivider from '@/components/PubForm/PubDivider';
import { divide, pubGetSysPortList } from '@/utils/pubConfirm';
import StockTable from './StockTable';
import moment from 'moment';
import './index.less';
import { useAccess } from 'umi';
import { notifyPurchaseDelivery, updateInboundLogistics } from '@/services/pages/stockManager';

const Dialog = (props: any) => {
  const { dicList, reload, isEdit, warehousing_order_in_id, people, isDetail, ids } = props;
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [refreshKey, refreshKeySet] = useState<any>(0);
  const [address, setAddress] = useState('');
  const rulesRequired: any = { required: true, message: '必填' };
  const formItemLayout = {
    labelCol: { flex: '130px' },
  };
  const editDrawerLogisticsFormRef = useRef<ProFormInstance>(); // 编辑物流信息drawer
  const access = useAccess();
  // 详情
  const getOrderDetail = async (id: string): Promise<any> => {
    setLoading(true);
    const res = await warehousingOrderFindById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const newData = JSON.parse(JSON.stringify(res.data));
      newData.orderSkuList.forEach((v: any) => {
        v.arrival_num = newData?.warehousingOrderIn?.arrival_num;
        /*合计箱规中国内入库箱数*/
        v.arrival_actual_num = v.specificationList.reduce(
          (previousValue: any, currentValue: any) =>
            previousValue + currentValue.arrival_actual_num,
          0,
        );
      });
      setDetail(newData);
      editDrawerLogisticsFormRef.current?.setFieldsValue({
        ...newData.warehousingOrderIn,
      });
      setAddress(newData?.warehousingOrderIn?.harbor_addr);
    }
    setLoading(false);
  };

  return (
    <DrawerForm
      title={isEdit ? '编辑物流信息' : '详情'}
      trigger={props?.title ? props?.title : <a>详情</a>}
      layout="horizontal"
      width="80%"
      drawerProps={{
        destroyOnClose: true,
      }}
      params={{ refreshKey }}
      request={async () => {
        getOrderDetail(props?.id);
        return Promise.resolve({ success: true });
      }}
      labelCol={{ flex: '130px' }}
      labelWrap={true}
      initialValues={detail}
      className="logisticsPlan-detail-drawer"
      onFinish={async (values: any) => {
        values.id = detail.id;
        values.harbor_addr = address;
        values.warehousing_order_in_id = warehousing_order_in_id;
        const res = await updateInboundLogistics(values);
        if (res.code == pubConfig.sCode) {
          pubMsg(res?.message, 'success');
          if (typeof reload === 'function') reload();
          refreshKeySet(new Date().getTime());
          return true;
        } else {
          pubMsg(`提交失败: ${res.message}`);
          return false;
        }
      }}
      formRef={editDrawerLogisticsFormRef}
      submitter={{
        searchConfig: {
          resetText: '关闭',
          submitText: '确定',
        },
        render: (data: any, doms: any) =>
          isDetail ? (
            doms[0]
          ) : (
            <Space>
              {[2].includes(Number(detail.approval_status)) &&
              access.canSee('scm_logisticsPlanIn_stock_noticeDelivery') ? (
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
                        values.id = detail.id;
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

                        const postData: any = {};
                        for (const key in values) {
                          if (values[key] != null) {
                            postData[key] = values[key];
                          }
                        }
                        postData.warehousing_order_in_id = warehousing_order_in_id;
                        setLoading(true);
                        const res = await updateInboundLogistics(postData);
                        if (res.code == pubConfig.sCode) {
                          const res1 = await notifyPurchaseDelivery({ ids: detail.id });
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
      <Spin spinning={loading}>
        <PubDivider title="发货计划信息" />
        <Row gutter={20}>
          <Col span={8}>
            <Form.Item label="发货计划编号">
              {detail.delivery_plan_nos || detail.delivery_plan_no}
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="PMC负责人">{people?.pmc_name}</Form.Item>
          </Col>
        </Row>
        <PubDivider title="入库单信息" />
        <Row gutter={20}>
          <Col span={8}>
            <Form.Item label="入库单号">{detail?.order_no}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="入库单状态">
              {pubFilter(dicList.WAREHOUSING_ORDER_IN_STATUS, detail?.approval_status)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="入库单创建时间">{detail?.create_time}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="采购负责人">{people?.purchase_name}</Form.Item>
          </Col>
          <Col span={8}>
            <ProForm.Item label={'供应商出货城市'}>
              {detail?.warehousingOrderIn?.shipment_province}-
              {detail?.warehousingOrderIn?.shipment_city}
            </ProForm.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="供应商货好时间">{detail?.delivery_time}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="供应商">{detail?.vendor_name}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="退税抬头">{detail?.tax_refund_company_name}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="货件号(Shipment ID)">{ids?.shipment_id}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="追踪号(Reference ID)">{ids?.reference_id}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="平台目的仓库">{detail?.warehouse_name}</Form.Item>
          </Col>
        </Row>
        <Col span={24}>
          <StockTable defaultData={detail?.orderSkuList || []} />
        </Col>
        <Row gutter={20} style={{ marginTop: '10px' }}>
          <Col span={8}>
            <Form.Item label="总体积(m³)">
              {detail?.total_volume ? divide(detail?.total_volume, 1000000) : '-'}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="总重(kg)">
              {detail?.total_weight ? divide(detail?.total_weight, 1000) : '-'}
            </Form.Item>
          </Col>
        </Row>
        <PubDivider title="跨境物流信息" />
        <Row gutter={20}>
          <Col span={8}>
            <ProFormSelect
              label={'跨境起运港仓库'}
              name={'harbor'}
              readonly={!isEdit}
              rules={[rulesRequired]}
              request={async () => {
                const res: any = await pubGetSysPortList({ type: 1 });
                return res
                  .map((v: any) => {
                    return {
                      ...v,
                      disabled: v.status != '1',
                    };
                  })
                  .sort((a: any, b: any) => b.status - a.status);
              }}
              fieldProps={{
                onChange: (val: any, data: any) => {
                  setAddress(
                    `${data.data.province_name}${data.data.city_name}${data.data.address}`,
                  );
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
              readonly={!isEdit}
              fieldProps={{
                disabledDate: (current: any) => current && current < moment().add(-1, 'day'),
              }}
            />
          </Col>
          <Col span={8}>
            <Form.Item label="实际运输方式">
              {pubFilter(
                dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD,
                detail?.warehousingOrderIn?.shipping_method,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <ProFormText
              label={'订舱号'}
              name={'booking_number'}
              {...formItemLayout}
              readonly={!isEdit}
            />
          </Col>
          <Col span={8}>
            <Form.Item label="物流负责人">{people?.principal_name}</Form.Item>
          </Col>
        </Row>
      </Spin>
    </DrawerForm>
  );
};

export default Dialog;

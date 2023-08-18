import { useState } from 'react';
import { Spin, Row, Col, Form } from 'antd';
import ProForm, { DrawerForm } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { warehousingOrderFindById } from '@/services/pages/reconciliationPurchase';
import './style.less';
import { priceValue } from '@/utils/filter';
import PubDivider from '@/components/PubForm/PubDivider';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import { divide, IsGrey } from '@/utils/pubConfirm';
import StockOrderItem from './StockOrderItem';
import StockOrderDetail_table from './StockOrderDetail_table';

const Dialog = (props: any) => {
  const { dicList, from, reload } = props;
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [row, setRow] = useState<any>([]);
  const [refreshKey, refreshKeySet] = useState<any>(0);
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
    }
    setLoading(false);
  };

  const columns: any[] = [
    {
      title: '采购单号',
      dataIndex: 'purchase_order_no',
      align: 'center',
    },
    {
      title: '商品名称',
      dataIndex: 'goods_sku_name',
      align: 'center',
    },
    {
      title: '不含税单价',
      dataIndex: 'no_tax_price',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.no_tax_price);
      },
    },
    {
      title: '税额',
      dataIndex: 'tax',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.tax);
      },
    },
    {
      title: '含税单价',
      dataIndex: 'price',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.price);
      },
    },
    {
      title: '到港数量',
      dataIndex: 'arrival_num',
      align: 'center',
    },
    {
      title: '采购总额',
      dataIndex: 'total_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.total_amount);
      },
    },
    {
      title: '运费',
      dataIndex: 'freight_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.freight_amount);
      },
    },
    {
      title: '总计',
      dataIndex: 'total',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.total);
      },
    },
    {
      title: '采购单扣款金额',
      dataIndex: 'deduction_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.deduction_amount);
      },
    },
    {
      title: '已预付金额',
      dataIndex: 'prepayment_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.prepayment_amount);
      },
    },
    {
      title: '还需支付金额',
      dataIndex: 'payable_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.payable_amount);
      },
    },
  ];
  return (
    <DrawerForm
      title="入库单详情"
      trigger={props?.title ? props?.title : <a>查看入库单</a>}
      layout="horizontal"
      width="80%"
      drawerProps={{
        destroyOnClose: true,
      }}
      params={{ refreshKey }}
      request={async () => {
        getOrderDetail(props?.id);
        setRow([props?.data]);
        return Promise.resolve({ success: true });
      }}
      labelCol={{ flex: '130px' }}
      labelWrap={true}
      initialValues={detail}
      className="purchase-order-detail-drawer"
      submitter={false}
    >
      <Spin spinning={loading}>
        {from == 'purchase' ? (
          <>
            <PubDivider title="账单明细" />
            <ProTable
              rowKey="id"
              search={false}
              options={false}
              bordered={true}
              pagination={false}
              dataSource={row}
              columns={columns}
              className="p-table-0"
              size="small"
            />
          </>
        ) : (
          ''
        )}
        <PubDivider title="入库单信息" />
        <Row gutter={20}>
          <Col span={8}>
            <Form.Item label="入库单号">{detail?.order_no}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="供应商">{detail?.vendor_name}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="状态">
              {pubFilter(dicList.WAREHOUSING_ORDER_IN_STATUS, detail?.approval_status)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="创建人">{detail?.create_user_name}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="创建时间">{detail?.create_time}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="要求物流入仓时间">{detail?.required_warehousing_time}</Form.Item>
          </Col>
          <Col span={8}>
            <ProForm.Item label={'供应商出货城市'}>
              {detail?.warehousingOrderIn?.shipment_province}-
              {detail?.warehousingOrderIn?.shipment_city}
            </ProForm.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="供应商出库时间(货好时间)">{detail?.delivery_time}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="退税抬头">{detail?.tax_refund_company_name}</Form.Item>
          </Col>
        </Row>
        <PubDivider title="货件信息" />
        <Row gutter={20}>
          <Col span={8}>
            <Form.Item label="发货计划编号">
              {detail?.delivery_plan_nos || detail?.delivery_plan_no}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="平台">{detail?.platform_name}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="店铺">{detail?.shop_name}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="平台目的仓库">{detail?.warehouse_name}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="货件号(Shipment ID)">
              {detail?.warehousingOrderIn?.shipment_id}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="追踪号(Reference ID)">
              {detail?.warehousingOrderIn?.reference_id}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="货件异常处理状态">
              {pubFilter(
                dicList?.WAREHOUSING_SHIPMENT_PROCESS_STATUS || {},
                detail.shipment_process_status,
              ) || '-'}
            </Form.Item>
          </Col>
        </Row>
        <PubDivider title="装箱设置" />
        <StockOrderItem
          data={detail}
          dataList={detail?.orderSkuList}
          business="IN"
          refreshKeySet={refreshKeySet}
          reload={reload}
          dicList={dicList}
        />
        <Row gutter={20}>
          <Col span={8}>
            <Form.Item label="入库数量(平台仓)">{detail?.warehousing_num}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="下载FNSKU">
              <ShowFileList
                data={
                  detail?.warehousingOrderIn?.sys_files_fnsku && [
                    detail?.warehousingOrderIn?.sys_files_fnsku,
                  ]
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="下载箱唛">
              <ShowFileList
                data={
                  detail?.warehousingOrderIn?.sys_files_shipping_mark && [
                    detail?.warehousingOrderIn?.sys_files_shipping_mark,
                  ]
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="货件编号">{detail?.warehousingOrderIn?.shipment_no}</Form.Item>
          </Col>
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
          <Col span={8}>
            <Form.Item label="国内入库箱数">
              {detail?.orderSkuList?.reduce(
                (previousValue: any, currentValue: any) =>
                  previousValue +
                  (currentValue.arrival_actual_num === null ? 0 : currentValue.arrival_actual_num),
                0,
              )}
            </Form.Item>
          </Col>
        </Row>
        <PubDivider title="物流信息" />
        <Row gutter={20}>
          <Col span={8}>
            <Form.Item label="运输方式">
              {pubFilter(
                dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD,
                detail?.warehousingOrderIn?.shipping_method,
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="跨境起运港仓库">{detail?.warehousingOrderIn?.harbor_name}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="送货地址">{detail?.warehousingOrderIn?.harbor_addr}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="截仓时间">{detail?.warehousingOrderIn?.closing_time}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="到港物流服务商">{detail?.logistics_company}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="到港运单号">{detail?.logistics_order_no}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="到港运费">{!IsGrey && detail?.logistics_freight}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="到港时间">{detail?.warehousingOrderIn?.arrival_time}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="国内入库操作人">
              {detail?.warehousingOrderIn?.arrival_user_name || ''}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="目的港口名称">
              {detail?.warehousingOrderIn?.to_port_name || ''}
            </Form.Item>
          </Col>
        </Row>
        <PubDivider title="跨境在途信息" />
        <Row gutter={20}>
          <Col span={6}>
            <Form.Item label="订舱号">{detail?.warehousingOrderIn?.booking_number}</Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="预计入仓时间">{detail?.platform_appointment_time}</Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="实际入仓时间">{detail?.actual_warehouse_date}</Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="实际平台入库时间"
              tooltip="因接口无法获取平台真实实际入库时间，此时间为供应链系统同步获取平台入库数量的时间，供应链系统每天都会同步平台收货数量和状态"
            >
              {detail?.warehousing_time}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="系统入库时间">{detail?.warehousing_sys_time}</Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="平台入库操作人">{detail?.warehousing_user_name}</Form.Item>
          </Col>
        </Row>
        {detail?.vendor_id ? (
          <>
            <PubDivider title="关联采购单信息" />
            <StockOrderDetail_table id={props?.id} business_scope="IN" />
          </>
        ) : (
          ''
        )}
      </Spin>
    </DrawerForm>
  );
};

export default Dialog;

import { useState } from 'react';
import { Spin, Row, Col, Form, Button } from 'antd';
import { DrawerForm } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { warehousingOrderFindById } from '@/services/pages/reconciliationPurchase';
import './style.less';
import { dateFormat, priceValue } from '@/utils/filter';
import { Access } from 'umi';
import StockOrderItem from './StockOrderItem';
import { divide, IsGrey } from '@/utils/pubConfirm';
import PubDivider from '@/components/PubForm/PubDivider';
import * as api from '@/services/pages/stockManager';
import StockOrderDetail_table from './StockOrderDetail_table';
import PubWeekRender from '../PubWeekRender';

const Dialog = (props: any) => {
  const { dicList, access, from, tableKeySet, reload, isParts, recordS, common } = props;
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [row, setRow] = useState<any>([]);
  const [refreshKey, refreshKeySet] = useState<any>(0);

  // 下载箱唛/出货清单
  const exportPdf = async (apiMethod: any) => {
    const res: any = await api[apiMethod]({ id: props?.id });
    const type = res.response.headers.get('content-type');
    if (type === 'application/json') {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], {
        type: 'application/pdf;chartset=UTF-8',
      });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName =
        apiMethod === 'exportBoxLabel'
          ? `(${detail.order_no})箱唛.pdf`
          : `(${detail.order_no})出货清单.pdf`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
  };
  // 详情
  const getOrderDetail = async (id: string): Promise<any> => {
    setLoading(true);
    const res = await warehousingOrderFindById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setDetail(res.data);
    }
    setLoading(false);
  };

  const columns: any = [
    {
      title: '采购下单时间',
      dataIndex: 'create_time',
      width: 120,
      align: 'center',
      render: (_: any, record: any) => {
        return dateFormat(record.create_time);
      },
    },
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
      title: '含税单价',
      dataIndex: 'price',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.price);
      },
    },
    {
      title: '入库数量',
      dataIndex: 'warehousing_num',
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
      title: '已预付金额',
      dataIndex: 'prepayment_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.prepayment_amount);
      },
    },
  ];
  return (
    <DrawerForm
      title="入库单详情"
      trigger={props?.title ? props?.title : <a>查看入库单</a>}
      layout="horizontal"
      width="90%"
      drawerProps={{
        destroyOnClose: true,
      }}
      params={{ refreshKey }}
      request={async () => {
        // console.log('detail request');
        getOrderDetail(props?.id);
        setRow([props?.data]);
        return Promise.resolve({ success: true });
      }}
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
        ) : null}
        <PubDivider title="入库单信息" />
        <Row gutter={15}>
          <Col span={8}>
            <Form.Item label="入库单号">{detail?.order_no}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="入库单类型">
              {pubFilter(dicList?.WAREHOUSING_ORDER_WAREHOUSING_TYPE, detail?.warehousing_type)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="供应商">{detail?.vendor_name}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="状态">
              {pubFilter(dicList?.WAREHOUSING_ORDER_STATUS, detail?.approval_status)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="创建人">{detail?.create_user_name}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="创建时间">{detail?.create_time}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="要求平台入库时间">{detail?.required_warehousing_time}</Form.Item>
          </Col>

          {detail?.warehousing_type == 2 && (
            <>
              <Col span={8}>
                <Form.Item label="出货周期">
                  <PubWeekRender
                    option={{
                      cycle_time: detail.cycle_time,
                      begin: detail.shipment_begin_cycle_time,
                      end: detail.shipment_end_cycle_time,
                    }}
                  />
                </Form.Item>
              </Col>
            </>
          )}
          {detail?.warehousing_type == 1 ||
            (detail?.warehousing_type == 2 && (
              <>
                <Col span={8}>
                  <Form.Item label="关联原入库单号">{detail?.source_order_no}</Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="原平台入库单号">
                    {detail.source_platform_warehousing_order_no}
                  </Form.Item>
                </Col>
              </>
            ))}
        </Row>
        {detail?.platform_name != '汇业仓' && (
          <>
            <PubDivider title="货件信息" />
            <Row gutter={15}>
              {!isParts && (
                <Col span={8}>
                  <Form.Item
                    label={
                      detail?.warehousing_type == 1 || detail?.warehousing_type == 2
                        ? '原发货计划编号'
                        : '发货计划编号'
                    }
                  >
                    {detail?.delivery_plan_nos || detail?.delivery_plan_no}
                  </Form.Item>
                </Col>
              )}

              <Col span={8}>
                <Form.Item label="平台">{detail?.platform_name}</Form.Item>
              </Col>
              {detail?.platform_name != '云仓' && (
                <Col span={8}>
                  <Form.Item label="店铺">{detail?.shop_name}</Form.Item>
                </Col>
              )}
            </Row>
          </>
        )}
        <PubDivider title="装箱设置" />
        <StockOrderItem
          recordS={recordS}
          dataList={detail?.orderSkuList}
          business="CN"
          tableKeySet={tableKeySet}
          refreshKeySet={refreshKeySet}
          reload={reload}
          dicList={dicList}
          warehousing_type={detail?.warehousing_type}
          common={common}
        />
        <Row gutter={15}>
          <Col span={8}>
            <Form.Item label="箱唛和出货清单下载" labelCol={{ flex: '146px' }}>
              <Access key="box" accessible={access.canSee('stockManager_exportBoxLabel_in')}>
                <Button size={'small'} type={'link'} onClick={() => exportPdf('exportBoxLabel')}>
                  下载箱唛
                </Button>
              </Access>
              <Access
                key="ship"
                accessible={access.canSee('stockManager_exportPDFShippingList_in')}
              >
                <Button
                  size={'small'}
                  type={'link'}
                  onClick={() => exportPdf('exportPDFShippingList')}
                >
                  下载出货清单
                </Button>
              </Access>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="总体积(m³)">{divide(detail?.total_volume, 1000000)}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="总重(kg)">{divide(detail?.total_weight, 1000)}</Form.Item>
          </Col>
        </Row>

        <PubDivider title="物流信息" />
        <Row gutter={15}>
          {detail?.platform_name == '云仓' && (
            <Col span={24}>
              <Form.Item label="云仓类型">
                {pubFilter(
                  dicList?.SYS_PLATFORM_WAREHOUSING_PLATFORM,
                  detail?.platform_warehousing_type,
                ) || '-'}
              </Form.Item>
            </Col>
          )}

          {detail?.platform_name != '汇业仓' && (
            <Col span={detail?.platform_name == '云仓'? 8 : 24}>
              <Form.Item label="收货区域">{detail?.warehouse_area || '-'}</Form.Item>
            </Col>
          )}
          {detail?.platform_name == '云仓' ? (
              <Col span={16}>
                <Form.Item label="平台入库单号">{detail?.platform_warehousing_order_no || '-'}</Form.Item>
              </Col>
            ) : ""}
          <Col span={8}>
            <Form.Item label="收货仓库">{detail?.warehouse_name}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="仓库联系人">{detail?.warehouse_contacts}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="联系人电话">{detail?.warehouse_contacts_phone}</Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="仓库详细地址">{detail?.warehouse_address}</Form.Item>
          </Col>
          {!['天猫', '云仓', '汇业仓'].includes(detail?.platform_name) && (
            <>
              <Col span={24}>
                <Form.Item label="是否需要中转">
                  {detail?.need_transfer == 1 ? '是' : '否'}
                </Form.Item>
              </Col>
              {detail?.need_transfer == 1 && (
                <>
                  <Col span={8}>
                    <Form.Item label="中转仓">{detail?.tc_name}</Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="仓库联系人">{detail?.tc_contacts}</Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="联系人电话">{detail?.tc_warehouse_phone}</Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="中转仓地址">{detail?.tc_warehouse_address}</Form.Item>
                  </Col>
                </>
              )}
            </>
          )}
        </Row>
        <Row>
          {!['云仓', '汇业仓'].includes(detail?.platform_name) && (
            <>
              <Col span={8}>
                <Form.Item label="平台预约单号">{detail?.platform_appointment_order_no}</Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="平台入库单号">{detail?.platform_warehousing_order_no}</Form.Item>
              </Col>
            </>
          )}
          <Col span={8}>
            <Form.Item label="预计平台入库时间">{detail?.platform_appointment_time}</Form.Item>
          </Col>
        </Row>
        {!['天猫', '云仓', '汇业仓'].includes(detail?.platform_name) && detail?.need_transfer == 1 && (
          <Row>
            <Col span={24}>
              <Form.Item label="中转仓预约入库时间" labelCol={{ flex: '140px' }}>
                {detail?.transfer_appointment_begin} -{' '}
                {detail?.transfer_appointment_end && detail?.transfer_appointment_end.split(' ')[1]}
              </Form.Item>
            </Col>
          </Row>
        )}
        <Row>
          <Col span={8}>
            <Form.Item label="物流服务商">{detail?.logistics_company}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="运单号">{detail?.logistics_order_no}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="运费">{!IsGrey && detail?.logistics_freight}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="平台入库时间">{detail?.warehousing_time}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="系统入库时间">{detail?.warehousing_sys_time}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="平台入库操作人">{detail?.warehousing_user_name}</Form.Item>
          </Col>
        </Row>
        <PubDivider title="关联采购单信息" />
        <StockOrderDetail_table id={props?.id} business_scope="CN" />
      </Spin>
    </DrawerForm>
  );
};

export default Dialog;

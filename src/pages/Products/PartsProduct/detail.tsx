import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Image, Row, Spin } from 'antd';
import type { ProColumnType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import ProForm from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Access, connect, history } from 'umi';
import { pubConfig, pubFilter, pubMsg, pubMyFilter, pubProductSpecs } from '@/utils/pubConfig';
import { goodsSkuFindById } from '@/services/pages/cooperateProduct';
import { ArrowLeftOutlined } from '@ant-design/icons';
import OnlineInfo from './Dialog/OnlineInfo';
import ProductSkuTable from '@/components/PubSKU/ProductSkuTable';

const Page: FC<Record<string, any>> = (props) => {
  const { common } = props;
  const { dicList } = common;
  const sku_id = history?.location?.query?.id;
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const vendor_id = history?.location?.query?.vendor_id;
  const tab = history?.location?.query?.tab;
  const type = history?.location?.query?.type;
  // 获取商品详情
  const getGoodSkuDetail = async () => {
    setLoading(true);
    const res = await goodsSkuFindById({ id: sku_id });
    setLoading(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    const data = {
      ...res.data,
      estimated_launch_time: res?.data?.projects?.estimated_launch_time,
      listing_site: res?.data?.projects?.listing_site,
      developer_name: res?.data?.projectsGoods?.developer_name,
    };
    setDetail(data);
  };
  useEffect(() => {
    getGoodSkuDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 采购信息表格
  const columns: ProColumnType<any>[] = [
    {
      title: '供应商',
      dataIndex: 'vendor_name',
    },
    {
      title: '采购价',
      dataIndex: 'price',
      align: 'right',
    },
    {
      title: '结算币种',
      dataIndex: 'currency',
      align: 'center',
      valueEnum: common?.dicList.SC_CURRENCY,
    },
    {
      title: '采购状态',
      dataIndex: 'purchase_status',
      align: 'center',
      valueEnum: common?.dicList.GOODS_SKU_PURCHASE_STATUS,
    },
    {
      title: '包邮区域',
      dataIndex: 'free_shipping',
      align: 'center',
      ellipsis: true,
      valueEnum: common?.dicList.PROJECTS_PRICE_FREE_SHIPPING,
      render: (_: any, record: any) => {
        return !record.free_shipping
          ? '-'
          : record.free_shipping != 2
          ? pubFilter(common.dicList.PROJECTS_PRICE_FREE_SHIPPING, record.free_shipping) || '-'
          : record?.free_shipping_region || '-';
      },
    },
    {
      title: '交期',
      dataIndex: 'delivery_day',
      align: 'center',
      renderText: (text: any) => (text ? text + '天' : '未知'),
    },
    {
      title: '是否主供应商',
      dataIndex: 'is_main_vendor',
      align: 'center',
    },
  ];
  return (
    <PageContainer
      style={{ minWidth: '888px' }}
      header={{
        title: false,
        breadcrumb: {},
      }}
      footer={[
        <Button
          icon={<ArrowLeftOutlined />}
          key={'backBtn'}
          onClick={() => {
            if (vendor_id) {
              const path =
                type == '1'
                  ? `/supplier-manage/edit-basic?id=${vendor_id}&tab=${tab}`
                  : `/supplier-manage/detail-basic?id=${vendor_id}&tab=${tab}`;
              history.push(path);
            } else {
              history.goBack();
            }
          }}
        >
          返回
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <ProForm
          layout="horizontal"
          submitter={false}
          className="pub-detail-form"
          labelCol={{ flex: '90px' }}
          labelWrap={true}
        >
            <Card bordered={false} title={'商品信息'}>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item label="产品名">{detail?.goods?.name_cn}</Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="产品线">
                    {pubFilter(dicList.SYS_BUSINESS_SCOPE, detail?.goods?.business_scope)}-
                    {detail?.goods?.category_name}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="产品编码">{detail?.goods?.goods_code}</Form.Item>
                </Col>
                <Access accessible={detail?.goods?.business_scope == 'IN'}>
                  <Col span={8}>
                    <Form.Item label="ERP编码">{detail?.erp_sku}</Form.Item>
                  </Col>
                </Access>
                <Col span={8}>
                  <Form.Item
                    label={detail?.goods?.business_scope == 'IN' ? '上架店铺' : '上架站点'}
                  >
                    {pubFilter(
                      detail?.goods?.business_scope == 'CN'
                        ? dicList.PROJECTS_LISTING_SITE_1
                        : dicList.PROJECTS_LISTING_SITE_2,
                      detail?.goods?.listing_site,
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="上架时间">{detail?.estimated_launch_time || '-'}</Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="单位">{detail?.uom}</Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="产品开发">{detail?.goods?.developer_name || '-'}</Form.Item>
                </Col>
                <Access accessible={detail?.goods?.business_scope == 'CN'}>
                  <Col span={8}>
                    <Form.Item label="生命周期">
                      {pubFilter(dicList?.GOODS_LIFE_CYCLE, detail?.life_cycle)}
                    </Form.Item>
                  </Col>
                </Access>
                <Col xs={24}>
                  <Form.Item label="商品详情" style={{ overflow: 'auto' }}>
                    {detail?.goods?.business_scope == 'CN' ? (
                      <table className="pub-my-table-templet" style={{ minWidth: '1100px' }}>
                        <thead>
                          <tr>
                            <th>图片</th>
                            <th>款式编码</th>
                            <th>款式名称</th>
                            <th>库存编号</th>
                            <th style={{ width: '180px' }}>平台库存编号</th>
                            <th style={{ width: '200px' }}>平台/店铺</th>
                            <th>规格类型</th>
                            <th>长(cm)</th>
                            <th>宽(cm)</th>
                            <th>高(cm)</th>
                            <th>重量(g)</th>
                            <th>每箱数量</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail?.skuSpecifications?.map((item: any, index: number) => {
                            return (
                              <tr key={item.id}>
                                {!index ? (
                                  <td
                                    width={120}
                                    rowSpan={detail?.skuSpecifications.length}
                                    align="center"
                                  >
                                    <Image width={100} src={detail?.image_url} />
                                  </td>
                                ) : (
                                  <></>
                                )}
                                {!index ? (
                                  <td rowSpan={detail?.skuSpecifications.length} align="center">
                                    {detail.sku_code}
                                  </td>
                                ) : (
                                  <></>
                                )}
                                {!index ? (
                                  <td rowSpan={detail?.skuSpecifications.length} align="center">
                                    {detail.sku_name}
                                  </td>
                                ) : (
                                  <></>
                                )}
                                {!index ? (
                                  <td rowSpan={detail?.skuSpecifications.length} align="center">
                                    {detail?.stock_no || '-'}
                                  </td>
                                ) : (
                                  <></>
                                )}
                                {/*平台库存编号*/}
                                {!index ? (
                                  <td
                                    rowSpan={detail?.skuSpecifications.length}
                                    colSpan={2}
                                    align="center"
                                    style={{ padding: 0 }}
                                    className={'p-table-inTable noBorder'}
                                  >
                                    <ProductSkuTable
                                      skus={detail?.linkManagementSkuList || []}
                                      dicList={dicList}
                                      columnsKey={['platform_stock_no', 'name_or_shop_name']}
                                    />
                                  </td>
                                ) : (
                                  <></>
                                )}
                                <td align="center" width={100}>
                                  {pubMyFilter(pubProductSpecs, item.type)}
                                </td>
                                <td align="center" width={80}>
                                  {item.length}
                                </td>
                                <td align="center" width={80}>
                                  {item.width}
                                </td>
                                <td align="center" width={80}>
                                  {item.high}
                                </td>
                                <td align="center" width={100}>
                                  {item.weight}
                                </td>
                                <td align="center" width={100}>
                                  {index == 2 ? item.pics : ''}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <table className="pub-my-table-templet" style={{ minWidth: '1100px' }}>
                        <thead>
                          <tr>
                            <th>图片</th>
                            <th>款式编码</th>
                            <th>款式名称</th>
                            <th>ERP编码</th>
                            <th>上架信息(店铺SKU)</th>
                            <th>商品条码</th>
                            <th>规格类型</th>
                            <th>长(cm)</th>
                            <th>宽(cm)</th>
                            <th>高(cm)</th>
                            <th>重量(g)</th>
                            <th>每箱数量</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail?.skuSpecifications?.map((item: any, index: number) => {
                            return (
                              <tr key={item.id}>
                                {!index ? (
                                  <td
                                    width={120}
                                    rowSpan={detail?.skuSpecifications.length}
                                    align="center"
                                  >
                                    <Image width={100} src={detail?.image_url} />
                                  </td>
                                ) : (
                                  <></>
                                )}
                                {!index ? (
                                  <td rowSpan={detail?.skuSpecifications.length} align="center">
                                    {detail.sku_code}
                                  </td>
                                ) : (
                                  <></>
                                )}
                                {!index ? (
                                  <td rowSpan={detail?.skuSpecifications.length} align="center">
                                    {detail.sku_name}
                                  </td>
                                ) : (
                                  <></>
                                )}
                                {!index ? (
                                  <td rowSpan={detail?.skuSpecifications.length} align="center">
                                    {detail.erp_sku}
                                  </td>
                                ) : (
                                  <></>
                                )}
                                {!index ? (
                                  <td rowSpan={detail?.skuSpecifications.length} align="center">
                                    <OnlineInfo
                                      dicList={dicList}
                                      id={detail.id}
                                      business_scope={detail.goods.business_scope}
                                    />
                                  </td>
                                ) : (
                                  <></>
                                )}
                                {!index ? (
                                  <td rowSpan={detail?.skuSpecifications.length} align="center">
                                    {detail.bar_code}
                                  </td>
                                ) : (
                                  <></>
                                )}
                                <td align="center" width={100}>
                                  {pubMyFilter(pubProductSpecs, item.type)}
                                </td>
                                <td align="center" width={80}>
                                  {item.length}
                                </td>
                                <td align="center" width={80}>
                                  {item.width}
                                </td>
                                <td align="center" width={80}>
                                  {item.high}
                                </td>
                                <td align="center" width={100}>
                                  {item.weight}
                                </td>
                                <td align="center" width={100}>
                                  {index == 2 ? item.pics : ''}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Card>
            <Card bordered={false} title={'采购信息'} style={{marginTop:10}}>
              <ProTable
                size="small"
                columns={columns}
                dataSource={detail?.skuVendorsList || []}
                search={false}
                pagination={false}
                toolBarRender={false}
                rowKey={'id'}
              />
            </Card>
        </ProForm>
      </Spin>
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

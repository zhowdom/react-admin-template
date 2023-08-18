import type { FC } from 'react';
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import { Button, Card, Spin, Space, Statistic } from 'antd';
import { Col, Form, Row } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { connect, history } from 'umi';
import ProTable from '@ant-design/pro-table';
import { findById } from '@/services/pages/link';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { IsGrey } from '@/utils/pubConfirm';
import './Dialogs/index.less';
const Page: FC<Record<string, any>> = (props) => {
  const { common } = props;
  const { dicList } = common;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [dynamic, setDynamic] = useState<any>([]);
  const [detail, setDetail] = useState<any>({});
  const id = history.location?.query?.id || '';
  // 下载文件
  const downloadByUrl = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = name.slice(0, name.lastIndexOf('.'));
    a.click();
  };
  // 详情
  const getDetail = async (): Promise<any> => {
    setLoading(true);
    const res = await findById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setDetail({});
    } else {
      if (res.data?.platform_code?.indexOf('JD') > -1) {
        setDynamic([
          {
            title: '商品条码 / 条码文件',
            dataIndex: 'bar_code',
            align: 'center',
            width: 120,
            render: (_: any, record: any) => {
              return record.bar_code || record?.sys_files?.length ? (
                <>
                  <div>{record.bar_code || '-'}</div>
                  <a
                    onClick={() => {
                      if (!record?.sys_files?.[0]?.access_url) return;
                      downloadByUrl(
                        record?.sys_files?.[0]?.access_url,
                        record?.sys_files?.[0]?.name,
                      );
                    }}
                  >
                    {record?.sys_files?.[0]?.name || '-'}
                  </a>
                </>
              ) : (
                <>-</>
              );
            },
          },
          {
            title: '平台商品编码',
            dataIndex: 'shop_sku_id',
            align: 'center',
          },
        ]);
      } else if (res.data?.platform_code == 'TM') {
        setDynamic([
          {
            title: '店铺skuID',
            dataIndex: 'shop_sku_id',
            align: 'center',
          },
          {
            title: '商品条码 / 条码文件',
            dataIndex: 'bar_code',
            align: 'center',
            width: 120,
            render: (_: any, record: any) => {
              return record.bar_code || record?.sys_files?.length ? (
                <>
                  <div>{record.bar_code || '-'}</div>
                  {record?.sys_files?.[0]?.access_url ? (
                    <a
                      onClick={() => {
                        downloadByUrl(
                          record?.sys_files?.[0]?.access_url,
                          record?.sys_files?.[0]?.name,
                        );
                      }}
                    >
                      {record?.sys_files?.[0]?.name || '-'}
                    </a>
                  ) : (
                    '-'
                  )}
                </>
              ) : (
                <>-</>
              );
            },
          },
        ]);
      } else if (res.data?.platform_code == 'WALMART' || res.data?.platform_code == 'AMAZON_VC') {
        setDynamic([
          {
            title: 'WPID',
            dataIndex: 'walmart_wpid',
            align: 'center',
            hideInTable: res.data?.platform_code == 'AMAZON_VC',
          },
          {
            title: 'Gtin',
            dataIndex: 'gtin',
            align: 'center',
            hideInTable: res.data?.platform_code == 'AMAZON_VC',
          },
          {
            title: 'Asin',
            dataIndex: 'amazon_asin',
            align: 'center',
            hideInTable: res.data?.platform_code == 'WALMART',
          },
          {
            title: 'UPC / 条码文件',
            dataIndex: 'bar_code',
            align: 'center',
            width: 120,
            render: (_: any, record: any) => {
              return record.bar_code || record?.sys_files?.length ? (
                <>
                  <div>{record.bar_code || '-'}</div>
                  {record?.sys_files?.[0]?.access_url ? (
                    <a
                      onClick={() => {
                        downloadByUrl(
                          record?.sys_files?.[0]?.access_url,
                          record?.sys_files?.[0]?.name,
                        );
                      }}
                    >
                      {record?.sys_files?.[0]?.name || '-'}
                    </a>
                  ) : (
                    '-'
                  )}
                </>
              ) : (
                <>-</>
              );
            },
          },
        ]);
      } else if (res.data?.platform_code == 'AMAZON_SC') {
        setDynamic([
          {
            title: 'Asin',
            dataIndex: 'amazon_asin',
            align: 'center',
            width: 80,
          },
          {
            title: 'FNSKU / 条码文件',
            dataIndex: 'amazon_fnsku',
            align: 'center',
            width: 120,
            render: (_: any, record: any) => {
              return record.amazon_fnsku || record?.sys_files?.length ? (
                <>
                  <div>{record.amazon_fnsku || '-'}</div>
                  {record?.sys_files?.[0]?.access_url ? (
                    <a
                      onClick={() => {
                        downloadByUrl(
                          record?.sys_files?.[0]?.access_url,
                          record?.sys_files?.[0]?.name,
                        );
                      }}
                    >
                      {record?.sys_files?.[0]?.name || '-'}
                    </a>
                  ) : (
                    '-'
                  )}
                </>
              ) : (
                <>-</>
              );
            },
          },
          {
            title: 'UPC/EAN',
            dataIndex: 'bar_code',
            align: 'center',
          },
        ]);
      }
      res.data.linkManagementSkuList = res.data.linkManagementSkuList?.filter(
        (v: any) => !(v.sales_status == 4 && !v.sku_name) && v.combination == 0,
      );
      setDetail(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getDetail();
  }, []);

  const columns: ProColumns<any>[] = [
    {
      title: '图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      width: 100,
    },
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
      width: 150,
    },
    {
      title: '对应款式/款式编码',
      dataIndex: 'sku_code',
      render: (_: any, record: any) => (
        <span>
          {record?.sku_name} - {record?.sku_code}
        </span>
      ),
    },
    {
      title: '销售价',
      dataIndex: 'sale_price',
      align: 'center',
      width: 150,
      render: (_, record: any) => {
        return IsGrey ? '' : [
          <span key="status">
            <Statistic
              value={record?.sale_price || '-'}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
              precision={2}
            />
          </span>,
        ];
      },
    },
    ...dynamic,
    {
      title: '销售状态',
      dataIndex: 'sales_status',
      width: '120px',
      align: 'center',
      valueEnum: dicList?.LINK_MANAGEMENT_SALES_STATUS,
      render: (_: any, record: any) => {
        return pubFilter(dicList.LINK_MANAGEMENT_SALES_STATUS, record?.sales_status) || '-';
      },
    },
    {
      title: '是否可售',
      dataIndex: 'is_sale',
      align: 'center',
      width: 100,
      render: (_: any, record: any) => {
        return pubFilter(dicList.SC_YES_NO, record?.is_sale) || '-';
      },
    },
    {
      title: '上架时间/最近更新时间',
      dataIndex: 'approval_status',
      align: 'center',
      width: 170,
      render: (_: any, record: any) => {
        return record?.sales_time || record?.last_update_time ? (
          <>
            <div>
              {record?.sales_time || '-'}
              <br />
              {record?.last_update_time || '-'}
            </div>
          </>
        ) : (
          <>-</>
        );
      },
    },
  ];

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <ProForm
        layout={'horizontal'}
        formRef={formRef}
        submitter={false}
        labelAlign="right"
        labelWrap={true}
        className="pub-detail-form label-width-68"
      >
        <Spin spinning={loading}>
          <Card
            title={
              <>
                <Space>
                  <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                    返回列表
                  </Button>
                </Space>
                <a
                  style={{
                    float: 'right',
                    fontSize: '14px',
                    paddingTop: '10px',
                    cursor: 'default',
                    color: '#282828',
                  }}
                >
                  <span>链接ID：</span>
                  {detail?.link_id}
                </a>
              </>
            }
            bordered={false}
          >
            <Row>
              <Col span={6}>
                <Form.Item label="链接名">{detail?.link_name || '-'}</Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="产品线">
                  {pubFilter(dicList?.SYS_BUSINESS_SCOPE, detail?.business_scope) || '-'} -
                  {detail?.category_name || '-'}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="平台">
                  {pubFilter(dicList?.SYS_PLATFORM_NAME, detail?.platform_code) || '-'}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="店铺">{detail?.shop_name || '-'}</Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={6}>
                <Form.Item label="推广">{detail?.spread_user_name || '-'}</Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="售价币种">
                  {pubFilter(dicList?.SC_CURRENCY, detail?.currency) || '-'}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="生命周期">
                  {pubFilter(dicList?.LINK_MANAGEMENT_LIFE_CYCLE, detail?.life_cycle) || '-'}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="上架时间">{detail?.sales_time || '-'}</Form.Item>
              </Col>
              <Col span={24} style={{ marginTop: '10px' }}>
                <Form.Item label="SKU">
                  <ProTable
                    scroll={{ x: 1200 }}
                    columns={columns}
                    search={false}
                    options={false}
                    bordered
                    params={{ id }}
                    pagination={false}
                    tableAlertRender={false}
                    dateFormatter="string"
                    dataSource={
                      detail?.linkManagementSkuList?.filter(
                        (v: any) => !(v.sales_status == 4 && !v.sku_name) && v.combination == 0,
                      ) || []
                    }
                    rowKey="id"
                    size="small"
                    className="p-table-0"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Spin>
      </ProForm>
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

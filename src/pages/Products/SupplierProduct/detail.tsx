import type { FC } from 'react';
import React, { useRef, useState, useEffect } from 'react';
import { Form, Card, Col, Input, Row, Spin } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import type { ProColumnType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { connect, history } from 'umi';
import { vendorFind } from '@/services/pages/products';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import {
  pubFilter,
  pubMyFilter,
  pubScCurrency,
  pubIncludedTax,
  pubProductSpecs,
} from '@/utils/pubConfig';
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示

type goodSpecType = {
  id: React.Key;
  goods_id?: number | string;
  type?: number | string;
  high?: number;
  length?: number;
  width?: number;
  weight?: number;
};
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const Page: FC<Record<string, any>> = (props) => {
  // model下发数据
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});

  // 可编辑表格
  const columns: ProColumnType<goodSpecType>[] = [
    {
      title: '规格类型',
      dataIndex: 'type',
      align: 'center',
      valueType: 'select',
      fieldProps: {
        options: pubProductSpecs,
      },
    },
    {
      title: '长(cm)',
      dataIndex: 'length',
      align: 'center',
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      align: 'center',
    },
    {
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
    },
    {
      title: '重量(g)',
      dataIndex: 'weight',
      align: 'center',
    },
  ];

  // 获取商品详情
  const getGoodDetail = async () => {
    const id = history.location?.query?.id || '';
    setLoading(true);
    const res = await vendorFind({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    setDetail(res.data);
    setLoading(false);
  };
  useEffect(() => {
    getGoodDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          layout="horizontal"
          {...formItemLayout}
          className="pub-detail-form"
          hideRequiredMark
          submitter={false}
          labelWrap={true}
        >
          <Card bordered={false}>
            <Row gutter={6}>
              <Col span={8}>
                <Form.Item label="商品名称">{detail?.name_cn}</Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="商品英文名称">{detail?.name_en}</Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="是否含税">
                  {pubMyFilter(pubIncludedTax, detail?.tax_included_purchase_situation)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={`${detail.tax_included_purchase_situation ? '含税' : '不含税'}进货价`}
                >
                  {pubMyFilter(pubScCurrency, detail?.currency)}
                  {detail?.tax_included_price}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="税率(%)">
                  {pubFilter(common?.dicList.VENDOR_TAX_RATE, detail?.tax_included_ratio) || '--'}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="商品单位">{detail?.uom}</Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="商品详情备注" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
                  <Input.TextArea
                    className="pub-detail-form-textArea"
                    value={detail.detailed_remarks}
                    readOnly
                    autoSize={true}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="商品图片" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
                  <ShowFileList data={detail.sys_files} isMain={true} listType="picture-card" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="商品规格" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
              <ProTable
                rowKey="id"
                search={false}
                options={false}
                bordered={true}
                pagination={false}
                dataSource={detail.goods_specifications}
                columns={columns}
                className="p-table-0"
                size="small"
              />
            </Form.Item>
          </Card>
        </ProForm>
      </Spin>
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

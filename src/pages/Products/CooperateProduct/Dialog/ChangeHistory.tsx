import React, { useState } from 'react';
import { Modal, Form, Row, Col, Spin } from 'antd';
import type { TableListItem, TableListPagination } from './data';
import { connect } from 'umi';
import ProTable from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-table';
import {
  findGoodsSkuToVendor,
  goodsChangePriceHistoryPage,
  goodsSkuFindById,
} from '@/services/pages/cooperateProduct';
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示
import { pubFilter } from '@/utils/pubConfig';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { priceValue } from '@/utils/filter';
import './style.less';
import { ProFormSelect } from '@ant-design/pro-form';

const Dialog: React.FC<any> = (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示
  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<any>([]);
  const [skuDetail, setSkuDetail] = useState<any>({});
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
      width: 180,
    },
    {
      title: '变更前币种',
      dataIndex: 'before_currency',
      align: 'center',
      width: 90,
      render: (_, row: any) => {
        return pubFilter(props?.common?.dicList.SC_CURRENCY, row.before_currency);
      },
    },
    {
      title: '变更前价格',
      dataIndex: 'before_price',
      align: 'center',
      width: 90,
      render: (_, row: any) => {
        return priceValue(row.before_price);
      },
    },
    {
      title: '变更后币种',
      dataIndex: 'after_currency',
      align: 'center',
      width: 90,
      render: (_, row: any) => {
        return pubFilter(props?.common?.dicList.SC_CURRENCY, row.after_currency);
      },
    },
    {
      title: '变更后价格',
      dataIndex: 'after_price',
      align: 'center',
      width: 90,
      render: (_, row: any) => {
        return priceValue(row.after_price);
      },
    },
    {
      title: '报价表',
      dataIndex: 'sysFile',
      width: 160,
      render: (_, row: any) => {
        return <ShowFileList data={row.sysFile} />;
      },
    },
    {
      title: '变更原因',
      dataIndex: 'remarks',
      width: 160,
      ellipsis: true,
    },
    {
      title: '发起时间',
      dataIndex: 'create_time',
      align: 'center',
      width: 144,
    },
    {
      title: '生效时间',
      dataIndex: 'take_effect_date',
      align: 'center',
      width: 110,
    },
    {
      title: '发起人',
      dataIndex: 'create_user_name',
      align: 'center',
      width: 80,
    },
  ];
  // 获取价格变更历史
  const getChangeHistory = async (id?: string, vendor_id?: any) => {
    setLoading(true);
    const res = await goodsChangePriceHistoryPage({ goods_sku_id: id }, vendor_id);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    setHistoryList(res.data ? res.data : []);
    setLoading(false);
  };

  // 添加价格变更时 - 获取商品详情
  const getGoodSkuDetail = async (id: string) => {
    setLoading(true);
    const res = await goodsSkuFindById({ id: id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    setSkuDetail(res.data);
    setLoading(false);
    getChangeHistory(id, []);
  };
  if (props?.changeHistoryModel) {
    props.changeHistoryModel.current = {
      open: (id: any) => {
        setIsModalVisible(true);
        getGoodSkuDetail(id);
        setHistoryList([]);
      },
    };
  }
  // 关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };
  return (
    <Modal
      width={1100}
      title="价格变更日志"
      visible={isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
      maskClosable={false}
      className="changePrice-detailModal"
    >
      <Spin spinning={loading}>
        <Row>
          <Col span={16}>
            <Form.Item label="款式名称">{skuDetail.sku_name}</Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="款式编码">{skuDetail.sku_code}</Form.Item>
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="vendor_id"
              label="供应商"
              params={{ goods_sku_id: skuDetail.id }}
              mode="multiple"
              fieldProps={{
                showSearch: true,
                onChange: (ids: any) => {
                  getChangeHistory(skuDetail.id, ids);
                },
              }}
              request={async (params) => {
                const res = await findGoodsSkuToVendor(params);
                if (res?.code != pubConfig.sCode) {
                  pubMsg(res?.message);
                  return [];
                }
                return res.data.map((item: any) => ({
                  ...item,
                  label: item.vendor_name,
                  value: item.id,
                }));
              }}
            />
          </Col>
        </Row>
        <Row style={{ marginTop: '15px' }}>
          <Col span={24}>
            <ProTable<TableListItem, TableListPagination>
              style={{ marginTop: '12px' }}
              className="p-table-0"
              rowKey="create_time"
              search={false}
              scroll={{ x: 1500 }}
              options={false}
              bordered={true}
              pagination={false}
              dataSource={historyList}
              columns={columns}
            />
          </Col>
        </Row>
      </Spin>
    </Modal>
  );
};
export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

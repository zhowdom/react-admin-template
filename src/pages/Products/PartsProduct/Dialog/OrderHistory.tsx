import React, { useState } from 'react';
import { Modal, Spin } from 'antd';
import { connect } from 'umi';
import ProTable from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-table';
import { historyByPurchaseOrderSkuId } from '@/services/pages/purchaseOrder';
import { pubFilter } from '@/utils/pubConfig';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { priceValue } from '@/utils/filter';

const Dialog: React.FC<any> = (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示
  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<any>([]);
  const columns: ProColumns<any>[] = [
    {
      title: '配件名称',
      dataIndex: 'sku_name',
      align: 'center',
      width: 180,
    },
    {
      title: '采购单号',
      dataIndex: 'order_no',
      align: 'center',
      width: 120,
    },
    {
      title: '供应商',
      dataIndex: 'main_name',
      align: 'center',
    },
    {
      title: '采购单价',
      dataIndex: 'sku_price',
      align: 'center',
      width: 90,
      render: (_, row: any) => {
        return priceValue(row.sku_price);
      },
    },
    {
      title: '币种',
      dataIndex: 'currency',
      align: 'center',
      width: 90,
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList?.SC_CURRENCY, record?.currency) || '-';
      },
    },
    {
      title: '下单时间',
      dataIndex: 'create_time',
      align: 'center',
      width: 144,
    },
    {
      title: '采购单状态',
      dataIndex: 'approval_status',
      align: 'center',
      hideInSearch: true,
      width: 100,
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList?.PURCHASE_APPROVAL_STATUS, record.approval_status) || '-';
      },
    },
    {
      title: '采购员',
      dataIndex: 'purchaser_name',
      align: 'center',
      width: 80,
    },
  ];
  // 获取
  const getHistory = async (id: any): Promise<any> => {
    setLoading(true);
    const postData = {
      current: 1,
      pageSize: 999,
      goods_id: id,
      sku_type: 2,
    };
    const res = await historyByPurchaseOrderSkuId(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    console.log(res.data);
    setHistoryList(res.data ? res.data?.records : []);
    setLoading(false);
  };

  if (props?.orderHistoryModel) {
    props.orderHistoryModel.current = {
      open: (id: any) => {
        setIsModalVisible(true);
        getHistory(id);
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
      title="采购记录"
      visible={isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
      maskClosable={false}
    >
      <Spin spinning={loading}>
        <ProTable
          style={{ marginTop: '12px' }}
          className="p-table-0"
          rowKey="id"
          search={false}
          options={false}
          bordered={true}
          pagination={{
            defaultPageSize: 10,
            defaultCurrent: 1,
            showSizeChanger: true,
          }}
          dataSource={historyList}
          columns={columns}
        />
      </Spin>
    </Modal>
  );
};
export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);

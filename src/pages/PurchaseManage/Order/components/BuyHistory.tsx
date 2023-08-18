import ProTable from '@ant-design/pro-table';
import { useState } from 'react';
import { Modal } from 'antd';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { historyByPurchaseOrderSkuId } from '@/services/pages/purchaseOrder';
import { getUuid } from '@/utils/pubConfirm';
import InnerTable from './InnerTable';

const BuyHistory = (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示

  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      purchase_order_sku_id: props?.data?.id,
    };
    const res = await historyByPurchaseOrderSkuId(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    // 数据处理
    const tempArr = res?.data?.records;
    const data: any = [];
    tempArr.forEach((item: any, index: number) => {
      item.tempId = getUuid();
      if (item.order_no != tempArr?.[index + 1]?.order_no || !tempArr?.[index + 1]) {
        item.children1 = JSON.parse(JSON.stringify([item]));
        data.push(item);
      } else {
        item.children1 = JSON.parse(JSON.stringify([item, tempArr?.[index + 1]]));
        data.push(item);
        tempArr?.splice(index + 1, 1);
      }
    });
    return {
      data,
      success: true,
      total: data?.length || 0,
    };
  };

  const columns: any[] = [
    {
      title: '采购单号',
      dataIndex: 'order_no',
      width: 120,
      align: 'center',
    },
    {
      title: '采购状态',
      dataIndex: 'approval_status',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList?.PURCHASE_APPROVAL_STATUS, record.approval_status) || '-';
      },
    },
    {
      title: '入库状态',
      dataIndex: 'delivery_status',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList?.PURCHASE_DELIVERY_STATUS, record.delivery_status) || '-';
      },
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '审核通过时间',
      dataIndex: 'approval_agree_time',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '签约时间',
      dataIndex: 'signing_time',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '采购单价',
      dataIndex: 'sku_price',
      align: 'center',
      hideInSearch: true,
      onCell: () => ({ colSpan: 4, style: { padding: 0 } }),
      className: 'p-table-inTable noBorder',
      width: 100,
      render: (_, record: any) => {
        return <InnerTable data={record.children1} dicList={props?.dicList} />;
      },
    },
    {
      title: '结算币种',
      dataIndex: 'currency',
      align: 'center',
      hideInSearch: true,
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      render: (_: any, record: any) => {
        return  pubFilter(props?.dicList?.SC_CURRENCY, record.currency) || '-';
      },
    },
    {
      title: ' 采购数量',
      dataIndex: 'sku_num',
      align: 'center',
      hideInSearch: true,
      width: 100,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '未交货数量',
      dataIndex: 'undelivered_num',
      align: 'center',
      hideInSearch: true,
      width: 100,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
  ];

  // 获取表格数据
  const modalOpen = async (): Promise<any> => {
    setIsModalVisible(true);
  };
  // 取消+关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <a
        onClick={() => {
          modalOpen();
        }}
      >
        采购历史
      </a>
      <Modal
        title={props?.title || '采购历史'}
        visible={isModalVisible}
        destroyOnClose
        onCancel={modalClose}
        maskClosable={false}
        footer={false}
        width={'80%'}
        className="pub-my-modal"
      >
        <ProTable<any>
          columns={columns}
          options={{ fullScreen: true, setting: false }}
          bordered
          pagination={{
            showSizeChanger: true,
          }}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          headerTitle={
            <div style={{ fontWeight: 'normal' }}>
              商品名称：
              <span style={{ marginRight: '25px', color: '#2e62e2' }}>{props?.data?.sku_name}</span>
              SKU：
              <span style={{ color: '#2e62e2' }}>
                {props?.business_scope == 'CN' ? props?.data?.stock_no : props?.data?.shop_sku_code}
              </span>
            </div>
          }
          request={getListAction}
          rowKey="tempId"
          search={{ className: 'light-search-form', defaultCollapsed: false, span: 12 }}
          dateFormatter="string"
          size="small"
          className="p-table-0"
        />
      </Modal>
    </>
  );
};
export default BuyHistory;

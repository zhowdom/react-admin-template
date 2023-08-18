import ProTable from '@ant-design/pro-table';
import { useState } from 'react';
import { Modal } from 'antd';
import { pubMsg, pubFilter,pubConfig } from '@/utils/pubConfig';
import { historyByPurchaseOrderSkuId } from '@/services/pages/SCM_Manage/order';

const ProcessLog = (props: any) => {
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
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
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
    },
    {
      title: '结算币种',
      dataIndex: 'currency',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList?.SC_CURRENCY, record.currency) || '-';
      },
    },
    {
      title: '采购数量',
      dataIndex: 'sku_num',
      align: 'center',
      hideInSearch: true,
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
        width={1200}
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
          rowKey="id"
          search={{ className: 'light-search-form', defaultCollapsed: false, span: 12 }}
          dateFormatter="string"
          size="small"
          className="p-table-0"
        />
      </Modal>
    </>
  );
};
export default ProcessLog;

import { useState } from 'react';
import { Spin, Drawer, Form, Popconfirm } from 'antd';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import ProTable from '@ant-design/pro-table';
import { purchaseOrderCheckTheBill } from '@/services/pages/reconciliationAskAction';
import { priceValue } from '@/utils/filter';
import { arraySum } from '@/utils/pubConfirm';
import PubDivider from '@/components/PubForm/PubDivider';
import { removeWarehousingPurchaseOrderSkus } from '@/services/pages/reconciliationPurchase';
import { useAccess } from 'umi';

const Dialog = (props: any) => {
  const { businessScope, getDetail, id } = props;
  const [loading, setLoading] = useState(false);
  const [columnsDetail, setColumnsDetail] = useState<any>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [params, setParams] = useState<any>({});
  const [curCode, setCurCode] = useState<any>();
  const access = useAccess();
  // 过滤
  const filterHandle = (data: any, sku_code: string) => {
    return (
      data?.filter(
        (v: any) =>
          (businessScope == 'CN' && v.stock_no === sku_code) ||
          (businessScope == 'IN' && v.shop_sku_code === sku_code),
      ) || []
    );
  };
  // 详情
  const getOrderDetail = async (
    account_statement_order_id: string,
    purchase_order_sku_id: string,
    sku_code: string,
  ): Promise<any> => {
    setLoading(true);
    const res = await purchaseOrderCheckTheBill({ account_statement_order_id, purchase_order_sku_id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const newData = res.data;
      const newAccount = Object.values(res?.data?.accountStatementOrderDetail || {})?.flat(1);
      newData.accountStatementOrderDetail = filterHandle(newAccount, sku_code);
      newData.warehousingPurchaseOrderSkus = filterHandle(
        newData?.warehousingPurchaseOrderSkus,
        sku_code,
      );
      setDetail(newData);
      setColumnsDetail({
        freight_amount: arraySum(
          newData.accountStatementOrderDetail?.map((v: any) => v.freight_amount),
        ),
        prepayment_amount: arraySum(
          newData.accountStatementOrderDetail?.map((v: any) => v.prepayment_amount),
        ),
      });
    }
    setLoading(false);
  };
  props.purchaseOrderDetailOtherModel.current = {
    open: (idT: string, purchase_order_sku_id: string, sku_code?: any) => {
      setIsModalVisible(true);
      getOrderDetail(idT, purchase_order_sku_id, sku_code);
      setCurCode(sku_code);
      setParams({
        idT,
        purchase_order_sku_id,
      });
    },
  };
  // 取消+关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };

  // 移除入库明细
  const deleteAction = async (idT: string) => {
    const res = await removeWarehousingPurchaseOrderSkus({
      id,
      warehousing_purchase_order_sku_id: idT,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res.message);
      return;
    } else {
      pubMsg('移除成功', 'success');
      if(detail?.warehousingPurchaseOrderSkus.length > 1){
        getOrderDetail(params.idT, params.purchase_order_sku_id, curCode);
      }else{
        modalClose();
      }
      getDetail();
    }
  };
  const columns1: any[] = [
    {
      title: '采购单号',
      dataIndex: 'purchase_order_no',
      align: 'center',
      onCell: (record: any, index: number) => {
        return { rowSpan: index === 0 ? detail?.accountStatementOrderDetail?.length : 0 };
      },
    },
    {
      title: 'SKU',
      dataIndex: businessScope == 'CN' ? 'stock_no' : 'shop_sku_code',
      align: 'center',
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
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
      title: `${businessScope == 'CN' ? '入库数量' : '到港数量'}`,
      dataIndex: businessScope == 'CN' ? 'warehousing_num' : 'arrival_num',
      align: 'center',
    },
    {
      title: `${businessScope == 'CN' ? '入库金额' : '到港金额'}`,
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
      hideInTable: columnsDetail.freight_amount == 0 ? true : false,
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
      hideInTable: columnsDetail.prepayment_amount == 0 ? true : false,
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
  const columns2: any[] = [
    {
      title: '入库单号',
      dataIndex: 'order_no',
      align: 'center',
    },
    {
      title: '平台入库单号',
      dataIndex: 'platform_warehousing_order_no',
      align: 'center',
      hideInTable: businessScope == 'IN',
    },
    {
      title: '货件号',
      dataIndex: 'shipment_id',
      align: 'center',
      hideInTable: businessScope == 'CN',
    },
    {
      title: 'SKU',
      dataIndex: businessScope == 'CN' ? 'stock_no' : 'shop_sku_code',
      align: 'center',
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
    },
    {
      title: businessScope == 'CN' ? '仓库' : '店铺',
      dataIndex: businessScope == 'CN' ? 'warehouse_name' : 'shop_name',
      align: 'center',
    },
    {
      title: '入库时间',
      dataIndex: businessScope == 'CN' ? 'warehousing_time' : 'arrival_time',
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
      title: `${businessScope == 'CN' ? '入库数量' : '到港数量'}`,
      dataIndex: businessScope == 'CN' ? 'warehousing_num' : 'arrival_num',
      align: 'center',
    },
    {
      title: '入库总额',
      dataIndex: 'total_amount',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.total_amount);
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 120,
      align: 'center',
      valueType: 'option',
      hideInTable: !(
        access.canSee('accountStatementOrder_cn_remove_receiptDetails') ||
        access.canSee('accountStatementOrder_in_remove_receiptDetails')
      ),
      render: (_: any, row: any) => [
        <Popconfirm
          key="delete"
          title="确定移除吗?"
          onConfirm={async () => deleteAction(row.id)}
          okText="确定"
          cancelText="取消"
        >
          <a key='delAction'>移除</a>
        </Popconfirm>,
      ],
    },
  ];
  const columns3: any[] = [
    {
      title: '请款单号',
      dataIndex: 'funds_no',
      align: 'center',
    },
    {
      title: '请款时间',
      dataIndex: 'create_time',
      align: 'center',
    },
    {
      title: '请款人',
      dataIndex: 'create_user_name',
      align: 'center',
    },
    {
      title: '付款时间',
      dataIndex: 'payment_time',
      align: 'center',
    },
    {
      title: '请款金额',
      dataIndex: 'amount',
      align: 'center',
      render: (_: any, record: any) => {
        return priceValue(record.amount);
      },
    },
  ];

  return (
    <Drawer
      title="账单核对"
      visible={isModalVisible}
      width={'90%'}
      destroyOnClose={true}
      onClose={() => {
        modalClose();
      }}
    >
      <Spin spinning={loading}>
        <PubDivider title="采购单明细" />
        <ProTable
          columns={columns1}
          pagination={false}
          options={false}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          scroll={{x: 1100}}
          dataSource={detail?.accountStatementOrderDetail}
          search={false}
          rowKey="purchase_order_sku_id"
          dateFormatter="string"
          bordered
          toolBarRender={false}
        />
        <PubDivider title="入库明细" />
        <ProTable
          columns={columns2}
          pagination={false}
          options={false}
          scroll={{x: 1100}}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          dataSource={detail?.warehousingPurchaseOrderSkus}
          search={false}
          rowKey="purchase_order_sku_id"
          dateFormatter="string"
          bordered
          toolBarRender={false}
        />
        {detail?.purchaseOrderRequestFundsList?.length ? (
          <>
            <PubDivider title="正常请款(预付请款)" />
            <ProTable
              columns={columns3}
              pagination={false}
              options={false}
              tableAlertRender={false}
              tableAlertOptionRender={false}
              dataSource={detail?.purchaseOrderRequestFundsList}
              search={false}
              rowKey="purchase_order_sku_id"
              dateFormatter="string"
              bordered
              toolBarRender={false}
            />
            <Form.Item label="采购单总金额">{detail?.purchase_order_amount}</Form.Item>
            <Form.Item label="预付比例">{detail?.prepayment_percentage}%</Form.Item>
          </>
        ) : (
          ''
        )}
      </Spin>
    </Drawer>
  );
};

export default Dialog;

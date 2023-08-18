import { ModalForm, ProFormField, ProTable } from '@ant-design/pro-components';
import {
  allReceiptPurchaseOrderCnList,
  approvedPurchaseOrderCnList,
  partialReceiptPurchaseOrderCnList,
} from '@/services/pages/SCM_Manage/purchaseAmountCN';
import {
  allReceiptPurchaseOrderInList,
  approvedPurchaseOrderInList,
  partialReceiptPurchaseOrderInList,
} from '@/services/pages/SCM_Manage/purchaseAmountIN';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { Statistic } from 'antd';
import OrderDetail from './OrderDetail';


const ModalOrder: React.FC<{
  trigger?: JSX.Element;
  title?: string;
  type: 'noPayAmount' | 'partialAmount' | 'allAmount' | 'amount';
  dicList: any;
  businessScope?: 'CN' | 'IN';
  dataSource: {
    vendorId: string;
    currency: string;
    vendorName: string;
    noPayAmount: string | number;
    partialAmount: string | number;
    allAmount: string | number;
  };
  queryForm: Record<string, any>;
}> = ({
  businessScope = 'CN',
  title,
  trigger,
  dicList,
  dataSource,
  type = 'noPayAmount',
  queryForm = { paramList: {} },
}) => {
  // 获取表格数据
  const getListAction = async (): Promise<any> => {
    let api = approvedPurchaseOrderCnList;
    if (type == 'partialAmount') api = partialReceiptPurchaseOrderCnList;
    if (type == 'allAmount') api = allReceiptPurchaseOrderCnList;
    if (businessScope == 'IN') {
      api = approvedPurchaseOrderInList;
      if (type == 'partialAmount') api = partialReceiptPurchaseOrderInList;
      if (type == 'allAmount') api = allReceiptPurchaseOrderInList;
    }
    const res = await api({
      page: {
        size: 999,
        current: 1,
      },
      paramList: {
        ...queryForm.paramList,
        vendorId: dataSource.vendorId,
        currency: dataSource.currency,
      },
    });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      return;
    }
    // 处理表格数据
    const data =
      res?.data?.reduce((pre: any[], current: any) => {
        if (current?.skuList?.length) {
          pre.push({
            amountAll: current.amount, // 同名修改
            ...current,
            ...current.skuList[0],
            rowSpan: current.skuList.length,
            orderId: current.id,
          });
          if (current.skuList[1]) {
            current.skuList.forEach((sku: any, index: number) => {
              if (index) {
                pre.push({ ...sku, rowSpan: 0, orderId: current.id });
              }
            });
          }
        }
        return pre;
      }, []) || [];
    // console.log(data, 'data');
    return {
      data,
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 表格配置
  const columns: any[] = [
    {
      title: '采购单号',
      dataIndex: 'orderNo',
      align: 'center',
      render: (_: any, record: any) => (
        <OrderDetail id={record.orderId} title={record.orderNo} dicList={dicList} />
      ),
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      width: 140,
    },
    {
      title: '结算方式',
      dataIndex: 'paymentMethod',
      align: 'center',
      valueEnum: dicList?.VENDOR_PAYMENT_METHOD,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '采购单状态',
      dataIndex: 'approvalStatus',
      align: 'center',
      valueEnum: dicList?.PURCHASE_APPROVAL_STATUS,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: businessScope == 'IN' ? '采购单入库状态(到港入库)' : '采购单入库状态(平台入库)',
      dataIndex: 'deliveryStatus',
      align: 'center',
      valueEnum: dicList.PURCHASE_DELIVERY_STATUS,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '采购金额(总)',
      dataIndex: 'amountAll',
      hideInSearch: true,
      align: 'right',
      render: (_: any, record: any) => (
        <Statistic
          value={record?.amountAll}
          valueStyle={{ fontWeight: 400, fontSize: '12px' }}
          precision={2}
        />
      ),
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '采购运费',
      dataIndex: 'freightAmount',
      align: 'right',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInTable: type === 'noPayAmount', // 已批准（货值）不展示
      render: (_: any, record: any) => (
        <Statistic
          value={record?.freightAmount}
          valueStyle={{ fontWeight: 400, fontSize: '12px' }}
        />
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'skuCode',
      align: 'center',
    },
    {
      title: '采购数量',
      dataIndex: 'num',
      align: 'right',
      render: (_: any, record: any) => (
        <Statistic value={record?.num} valueStyle={{ fontWeight: 400, fontSize: '12px' }} />
      ),
    },
    {
      title: '采购单价',
      dataIndex: 'price',
      align: 'right',
      render: (_: any, record: any) => (
        <Statistic
          value={record?.price}
          valueStyle={{ fontWeight: 400, fontSize: '12px' }}
          precision={2}
        />
      ),
    },
    {
      title: '采购金额',
      dataIndex: 'amount',
      hideInSearch: true,
      align: 'right',
      render: (_: any, record: any) => (
        <Statistic
          value={record?.amount}
          valueStyle={{ fontWeight: 400, fontSize: '12px' }}
          precision={2}
        />
      ),
    },
    {
      title: '币种',
      dataIndex: 'currency',
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(dicList.SC_CURRENCY, record?.currency) || '-';
      },
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '审核通过时间',
      dataIndex: 'approvalAgreeTime',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      width: 88,
    },
    {
      title: '签约时间',
      dataIndex: 'signingTime',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      width: 88,
    },
  ];
  return (
    <ModalForm
      title={title || '明细'}
      trigger={trigger || <a>详情</a>}
      modalProps={{
        destroyOnClose: true,
      }}
      width={1200}
      submitter={false}
    >
      <ProTable
        options={false}
        pagination={false}
        search={false}
        bordered
        cardProps={{ bodyStyle: { padding: 0 } }}
        columns={columns}
        request={getListAction}
        rowKey="id"
        dateFormatter="string"
        headerTitle={
          <ProFormField
            text={dataSource[type]}
            noStyle
            mode={'read'}
            plain
            valueType="digit"
            fieldProps={{ precision: 2 }}
          />
        }
      />
    </ModalForm>
  );
};

export default ModalOrder;

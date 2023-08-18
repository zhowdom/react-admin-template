import { ModalForm, ProFormField, ProTable } from '@ant-design/pro-components';
import { receivingNumberCnList } from '@/services/pages/SCM_Manage/purchaseAmountCN';
import { receivingNumberInList } from '@/services/pages/SCM_Manage/purchaseAmountIN';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { Statistic } from 'antd';
import OrderDetail from './OrderDetail';

const ModalStock: React.FC<{
  trigger?: JSX.Element;
  title?: string;
  type: 'warehousingNum' | 'warehousingAmount';
  dicList: any;
  businessScope?: 'CN' | 'IN';
  dataSource: {
    vendorId: string;
    currency: string;
    vendorName: string;
    warehousingNum: string | number;
    warehousingAmount: string | number;
  };
  queryForm: Record<string, any>;
}> = ({
  businessScope = 'CN',
  title,
  trigger,
  dicList,
  dataSource,
  type = 'warehousingNum',
  queryForm = { paramList: {} },
}) => {
  // 获取表格数据
  const getListAction = async (): Promise<any> => {
    let api = receivingNumberCnList;
    if (businessScope == 'IN') api = receivingNumberInList;
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

    const data =
      res?.data.reduce((pre: any[], current: any) => {
        if (current?.warehousingOrderList?.length) {
          pre.push({
            ...current,
            orderNoStorage: current.warehousingOrderList[0].orderNo,
            purchaseOrderSkuList: current.warehousingOrderList[0].purchaseOrderSkuList,
            rowSpan: current.warehousingOrderList.length,
          });
          if (current.warehousingOrderList[1]) {
            current.warehousingOrderList.forEach((item: any, index: number) => {
              if (index) {
                pre.push({ ...item, orderNoStorage: item.orderNo, rowSpan: 0 });
              }
            });
          }
        }
        return pre;
      }, []) || [];
    console.log(data, 'data');
    return {
      data,
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const columnsInner: any[] = [
    {
      title: 'SKU',
      dataIndex: businessScope == 'IN' ? 'shopSkuCode' : 'goodsSkuCode',
      align: 'center',
      width: 120,
    },
    {
      title: businessScope == 'IN' ? '到港入库数量' : '平台入库数量',
      dataIndex: businessScope == 'IN' ? 'arrivalNum' : 'warehousingNum',
      align: 'right',
      render: (_: any, record: any) => (
        <Statistic
          value={businessScope == 'IN' ? record?.arrivalNum : record?.warehousingNum}
          valueStyle={{ fontWeight: 400, fontSize: '12px' }}
        />
      ),
      width: 120,
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
      width: 120,
      hideInTable: type == 'warehousingNum',
    },
    {
      title: '采购金额',
      dataIndex: businessScope == 'IN' ? 'arrivalAmount' : 'warehousingAmount',
      hideInSearch: true,
      align: 'right',
      render: (_: any, record: any) => (
        <Statistic
          value={businessScope == 'IN' ? record?.arrivalAmount : record?.warehousingAmount}
          valueStyle={{ fontWeight: 400, fontSize: '12px' }}
          precision={2}
        />
      ),
      width: 120,
      hideInTable: type == 'warehousingNum',
    },
  ];
  // 表格配置
  const columns: any[] = [
    {
      title: '采购单号',
      dataIndex: 'orderNo',
      align: 'center',
      render: (_: any, record: any) => (
        <OrderDetail id={record.id} title={record.orderNo} dicList={dicList} />
      ),
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '入库单号',
      dataIndex: 'orderNoStorage',
      align: 'center',
    },
    {
      title: 'SKU',
      dataIndex: businessScope == 'IN' ? 'shopSkuCode' : 'goodsSkuCode',
      align: 'center',
      onCell: () => ({
        colSpan: type == 'warehousingNum' ? 2 : 4,
      }),
      className: 'p-table-inTable noBorder',
      width: 120,
      render: (_: any, record: any) => (
        <ProTable
          options={false}
          pagination={false}
          search={false}
          bordered
          className={'transparentTable'}
          cardProps={{ bodyStyle: { padding: 0 } }}
          showHeader={false}
          columns={columnsInner}
          dataSource={record.purchaseOrderSkuList}
          rowKey="id"
        />
      ),
    },
    {
      title: businessScope == 'IN' ? '到港入库数量' : '平台入库数量',
      dataIndex: businessScope == 'IN' ? 'arrivalNum' : 'warehousingNum',
      align: 'right',
      render: (_: any, record: any) => (
        <Statistic
          value={record?.warehousingNum}
          valueStyle={{ fontWeight: 400, fontSize: '12px' }}
        />
      ),
      onCell: () => ({
        colSpan: 0,
      }),
      width: 120,
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
      onCell: () => ({
        colSpan: 0,
      }),
      width: 120,
      hideInTable: type == 'warehousingNum',
    },
    {
      title: '采购金额',
      dataIndex: 'warehousingAmount',
      hideInSearch: true,
      align: 'right',
      render: (_: any, record: any) => (
        <Statistic
          value={record?.warehousingAmount}
          valueStyle={{ fontWeight: 400, fontSize: '12px' }}
          precision={2}
        />
      ),
      onCell: () => ({
        colSpan: 0,
      }),
      width: 120,
      hideInTable: type == 'warehousingNum',
    },
    {
      title: '币种',
      dataIndex: 'currency',
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(dicList.SC_CURRENCY, record?.currency) || '-';
      },
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInTable: type == 'warehousingNum',
    },
    {
      title: '审核通过时间',
      dataIndex: 'approvalAgreeTime',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '签约时间',
      dataIndex: 'signingTime',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
  ];
  return (
    <ModalForm
      title={title || '明细'}
      trigger={trigger || <a>详情</a>}
      modalProps={{
        destroyOnClose: true,
      }}
      width={type == 'warehousingNum' ? 900 : 1200}
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
            fieldProps={{ precision: type == 'warehousingNum' ? 0 : 2 }}
          />
        }
      />
    </ModalForm>
  );
};

export default ModalStock;

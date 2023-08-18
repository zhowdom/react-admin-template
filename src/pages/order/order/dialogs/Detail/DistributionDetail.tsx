import { ProTable } from '@ant-design/pro-components';
import './index.less';

const Component: React.FC<{
  disDetail: any;
  dicList: any;
}> = ({ disDetail }) => {
  const columns: any = [
    {
      title: '配送单号',
      dataIndex: 'deliveryCode',
      onCell: (record: any) => ({rowSpan: record.rowSpan1}),
    },
    {
      title: '仓库订单号',
      dataIndex: 'deliveryOrderId',
      onCell: (record: any) => ({rowSpan: record.rowSpan1}),
    },
    {
      title: '发货状态',
      dataIndex: 'deliveryStatusName',
      width: 80,
      onCell: (record: any) => ({rowSpan: record.rowSpan1}),
    },
    {
      title: '快递单号',
      dataIndex: ['deliveryPackageList', 'expressCode'],
      onCell: (record: any) => ({rowSpan: record.rowSpan2}),
    },
    {
      title: '快递公司',
      dataIndex: ['deliveryPackageList', 'logisticsName'],
      width: 80,
      onCell: (record: any) => ({rowSpan: record.rowSpan2}),
    },
    {
      title: '款式编码',
      dataIndex: ['deliveryPackageItems', 'goodsSku', 'sku_code'],
    },
    {
      title: '款式名称',
      dataIndex: ['deliveryPackageItems', 'goodsSku', 'sku_name'],
    },
    {
      title: '数量',
      dataIndex: ['deliveryPackageItems', 'planQty'],
      width: 70,
    },
    {
      title: '销退单号',
      dataIndex: ['deliveryPackageList', 'returnOrderCode'],
      onCell: (record: any) => ({rowSpan: record.rowSpan2}),
    },
    {
      title: '拦截原因',
      dataIndex: ['deliveryPackageList', 'interceptRemark'],
      onCell: (record: any) => ({rowSpan: record.rowSpan2}),
    },
    {
      title: '拦截状态',
      dataIndex: ['deliveryPackageList', 'interceptStatusName'],
      onCell: (record: any) => ({rowSpan: record.rowSpan2}),
    },
    {
      title: '处理状态',
      dataIndex: ['deliveryPackageList', 'nonDeliveryReason'],
      onCell: (record: any) => ({rowSpan: record.rowSpan2}),
    },
    {
      title: '失败原因',
      dataIndex: ['deliveryPackageList', 'interceptFailureRemark'],
      onCell: (record: any) => ({rowSpan: record.rowSpan2}),
      ellipsis: true,
    },
  ];
  return (
    <ProTable
      size={'small'}
      bordered
      className="details"
      loading={!disDetail}
      dataSource={disDetail}
      scroll={{x: 1000, y: 300}}
      cardProps={{ bodyStyle: { padding: 0 } }}
      rowKey={(record) => record.id + record?.deliveryPackageList.id}
      search={false}
      options={false}
      pagination={false}
      columns={columns}
    />
  );
};
export default Component;

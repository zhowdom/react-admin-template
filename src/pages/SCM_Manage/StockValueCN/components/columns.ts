// 在库数量
export const columns1 = [
  {
    title: '平台',
    dataIndex: 'name',
    hideInSearch: true,
    onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
  },
  {
    title: '区域(仓库)',
    dataIndex: 'region',
    hideInSearch: true,
  },
  {
    title: '在库数量',
    dataIndex: 'available',
    hideInSearch: true,
  },
];
// 在途数量
export const columns2 = [
  {
    title: '商品名称',
    dataIndex: 'skuName',
    hideInSearch: true,
  },
  {
    title: 'SKU',
    dataIndex: 'stockNo',
    hideInSearch: true,
  },
  {
    title: '入库单号',
    dataIndex: 'orderNo',
  },
  {
    title: '平台入库单号',
    dataIndex: 'platformWarehousingOrderNo',
    hideInSearch: true,
  },
  {
    title: '平台',
    dataIndex: 'platformName',
    hideInSearch: true,
  },
  {
    title: '在途数量',
    dataIndex: 'cnTransitNum',
    hideInSearch: true,
  },
];
// 未交货数量
export const columns3 = [
  {
    title: '商品名称',
    dataIndex: 'skuName',
    hideInSearch: true,
  },
  {
    title: 'SKU',
    dataIndex: 'stockNo',
    hideInSearch: true,
  },
  {
    title: '采购单号',
    dataIndex: 'orderNo',
  },
  {
    title: '采购单状态',
    dataIndex: 'approvalStatus',
    hideInSearch: true,
  },
  {
    title: '入库状态',
    dataIndex: 'deliveryStatus',
    hideInSearch: true,
  },
  {
    title: '下单数量',
    dataIndex: 'num',
    hideInSearch: true,
  },
  {
    title: '未交货数量（含备品）',
    dataIndex: 'undeliveredNum',
    hideInSearch: true,
  },
];
// 计划数量
export const columns4 = [
  {
    title: '商品名称',
    dataIndex: 'skuName',
    hideInSearch: true,
  },
  {
    title: 'SKU',
    dataIndex: 'stockNo',
    hideInSearch: true,
  },
  {
    title: '采购计划编号',
    dataIndex: 'planNo',
  },
  {
    title: '状态',
    dataIndex: 'status',
    hideInSearch: true,
  },

  {
    title: '计划下单数量',
    dataIndex: 'planNum',
    hideInSearch: true,
  },
  {
    title: '未下单数量',
    dataIndex: 'noOrderQty',
    hideInSearch: true,
  },
  {
    title: '下单中数量',
    dataIndex: 'underQty',
    hideInSearch: true,
  },
  {
    title: '已下单数量',
    dataIndex: 'orderedQty',
    hideInSearch: true,
  },
];

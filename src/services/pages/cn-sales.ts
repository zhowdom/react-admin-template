import { request } from 'umi';

const baseUrl = '/report-service';

// --------- 京东自营日销量 ------------
export async function jdOperateOrderPage(data: {
  categoryId?: any;
  skuName?: any;
  stockNo?: any;
  shopSku?: any;
  shopId?: any;
  regionId?: any;
  startSalesDate?: any;
  endSalesDate?: any;
}) {
  return request(`${baseUrl}/jdOperateOrder/listpage`, {
    method: 'POST',
    data,
  });
}

export async function jdOperateOrderImport(data: any) {
  return request(`${baseUrl}/jdOperateOrder/batchImport`, {
    method: 'POST',
    data,
  });
}
// 京东销售区域
export async function salesRegionConfigList(params: any) {
  return request(`${baseUrl}/salesRegionConfig/list`, {
    method: 'GET',
    params
  });
}
// 已计划发货数量详情
export async function plannedShipments(params: any) {
  return request(`${baseUrl}/inventorySalesReport/plannedShipments`, {
    method: 'GET',
    params,
  });
}
// 在制数量详情 旧的，好像已经不在了 2023-05-12
export async function inprocessNumList(params: any) {
  return request(`${baseUrl}/inventorySalesReport/inprocessNumList`, {
    method: 'GET',
    params,
  });
}
// 查询在途数量
export async function queryTransitNumList(data: any) {
  return request(`${baseUrl}/inventorySalesReport/queryTransitNumList`, {
    method: 'POST',
    data,
  });
}
// 库存销量报表 - 竖版 - 列表
export async function inventorySalesCnListV(data: any) {
  return request(`${baseUrl}/inventorySalesReport/inventorySalesCnListV`, {
    method: 'POST',
    data,
  });
}
// 库存销量曲线图
export async function inventorySalesChart(data: any) {
  return request(`${baseUrl}/inventorySalesReport/inventorySalesChart`, {
    method: 'POST',
    data,
  });
}
// 国内销售曲线图
export async function saleChartCn(data: any) {
  return request(`${baseUrl}/cnOrderDayReport/saleChart`, {
    method: 'POST',
    data,
  });
}
// 国内销售统计列表
export async function listPage(data: any) {
  return request(`${baseUrl}/cnOrderDayReport/listPage`, {
    method: 'POST',
    data,
  });
}
// 国内销售统计导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/cnOrderDayReport/export`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

// 查询某个款式下批入仓的入库单
export async function findWarehousingOrderNextBatch(data: any) {
  return request(`${baseUrl}/warehousingOrder/findWarehousingOrderNextBatch`, {
    method: 'POST',
    data,
  });
}

// CN备货报表(在制数量)，查询已审核采购计划总数量 2023-05-12
export async function findGoodSkuPurchasePlan(data: any) {
  return request(`${baseUrl}/purchasePlan/findGoodSkuPurchasePlan`, {
    method: 'POST',
    data,
  });
}
// CN备货报表(在制数量)，查询已审核发货计划总数量 2023-05-12
export async function findGoodSkuDeliveryPlan(data: any) {
  return request(`${baseUrl}/deliveryPlan/findGoodSkuDeliveryPlan`, {
    method: 'POST',
    data,
  });
}
// CN备货报表(在制数量)，查询计划外入库单数量 2023-05-12
export async function findGoodSkuWarehousingOrder(data: any) {
  return request(`${baseUrl}/warehousingOrder/findGoodSkuWarehousingOrder`, {
    method: 'POST',
    data,
  });
}
// CN备货报表(在途数量)，查询已计划未建入库单数量 2023-05-15
export async function findDeliveryPlanByInTransit(data: any) {
  return request(`${baseUrl}/deliveryPlan/findDeliveryPlanByInTransit`, {
    method: 'POST',
    data,
  });
}
// CN备货报表(在途数量)，查询已建入库单未入库数量 2023-05-15
export async function findCnTransitWarehousingOrder(data: any) {
  return request(`${baseUrl}/warehousingOrder/findCnTransitWarehousingOrder`, {
    method: 'POST',
    data,
  });
}
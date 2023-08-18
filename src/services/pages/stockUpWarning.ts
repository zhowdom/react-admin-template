import { request } from 'umi';
const baseUrl = '/report-service';
// 查询商品
export async function getList(data: any) {
  return request(`${baseUrl}/inventorySalesReport/inventorySalesCnList`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/inventorySalesReport/export`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
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
  export async function salesRegionConfigList() {
    return request(`${baseUrl}/salesRegionConfig/list`, {
      method: 'GET',
    });
  }
  // 已计划发货数量详情
  export async function plannedShipments(params: any) {
    return request(`${baseUrl}/inventorySalesReport/plannedShipments`, {
      method: 'GET',
      params,
    });
  }
  // 在制数量详情
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
  

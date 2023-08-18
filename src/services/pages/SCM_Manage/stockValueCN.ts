import { request } from 'umi';
const baseUrl = '/report-service';
// 查询商品
export async function getList(data: any) {
  return request(`${baseUrl}/inventoryValue/inventoryValueCnList`, {
    method: 'POST',
    data,
  });
}
// 查询在库明细
export async function listInventoryDetail(params: any) {
  return request(`${baseUrl}/inventoryValue/listInventoryDetail`, {
    method: 'GET',
    params,
  });
}
// 查询在途明细
export async function listWarehousingSku(params: any) {
  return request(`${baseUrl}/inventoryValue/listWarehousingSku`, {
    method: 'GET',
    params,
  });
}
// 查询未交货明细
export async function listPurchaseSku(params: any) {
  return request(`${baseUrl}/inventoryValue/listPurchaseSku`, {
    method: 'GET',
    params,
  });
}
// 查询未计划数量明细
export async function listPurchasePlan(params: any) {
  return request(`${baseUrl}/inventoryValue/listPurchasePlan`, {
    method: 'GET',
    params,
  });
}
// 导出在途
export async function exportWarehousingSku(params: any) {
  return request(`${baseUrl}/inventoryValue/exportWarehousingSku`, {
    method: 'GET',
    responseType: 'blob',
    getResponse: true,
    params,
  });
}
// 导出导出未交货
export async function exportPurchaseSku(params: any) {
  return request(`${baseUrl}/inventoryValue/exportPurchaseSku`, {
    method: 'GET',
    responseType: 'blob',
    getResponse: true,
    params,
  });
}
// 导出计划数量明细
export async function exportPurchasePlan(params: any) {
  return request(`${baseUrl}/inventoryValue/exportPurchasePlan`, {
    method: 'GET',
    responseType: 'blob',
    getResponse: true,
    params,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/inventoryValue/exportCn`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

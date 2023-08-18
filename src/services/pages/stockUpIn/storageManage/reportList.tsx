import { request } from 'umi';
const baseUrl = '/sc-scm';
// 汇总列表
export async function getAllList(data: any) {
  return request(`${baseUrl}/inventory/summaryPage`, {
    method: 'POST',
    data,
  });
}
//汇总导出
export async function downAll(data: any) {
  return request(`${baseUrl}/inventory/summaryExport`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 亚马逊列表
export async function getAmazonList(data: any) {
  return request(`${baseUrl}/inventory/amazonPage`, {
    method: 'POST',
    data,
  });
}
//亚马逊导出
export async function downAmazon(data: any) {
  return request(`${baseUrl}/inventory/exportAmazonInventory`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 亚马逊同步
export async function syncAmazon(data: any) {
  return request(`${baseUrl}/inventory/manualSyncAmazonInventory`, {
    method: 'POST',
    data,
  });
}
// walmart列表
export async function getWalmartList(data: any) {
  return request(`${baseUrl}/inventory/walmartPage`, {
    method: 'POST',
    data,
  });
}
// walmart导出
export async function downWalmart(data: any) {
  return request(`${baseUrl}/inventory/exportWalmartInventory`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// walmart同步
export async function syncWalmart(data: any) {
  return request(`${baseUrl}/inventory/manualSyncWalmartInventory`, {
    method: 'POST',
    data,
  });
}
export async function inventoryListByShopSkuCode(params: any) {
  return request(`${baseUrl}/inventory/inventoryListByShopSkuCode`, {
    method: 'GET',
    params,
  });
}

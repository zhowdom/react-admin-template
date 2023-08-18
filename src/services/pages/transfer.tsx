import { request } from 'umi';
const baseUrl = '/sc-scm';
// 查询调拨单列表
export async function getList(data: any) {
  return request(`${baseUrl}/cloudWarehouseChangeBill/page`, {
    method: 'POST',
    data,
  });
}
// 调拨单同步
export async function syn(params: any) {
  return request(`${baseUrl}/cloudWarehouseChangeBill/syn`, {
    method: 'GET',
    params,
  });
}
// 取消/关闭
export async function cancel(params: any) {
  return request(`${baseUrl}/cloudWarehouseChangeBill/close`, {
    method: 'GET',
    params,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/cloudWarehouseChangeBill/export`, {
    method: 'POST',
    responseType: 'blob',
    data,
    getResponse: true,
  });
}
// 云仓款式查询
export async function listCloudWarehouseGoodsSku(params: any) {
  return request(`${baseUrl}/cloudWarehouseChangeBill/listInventoryGoodsByWarehousingId`, {
    method: 'GET',
    params,
  });
}
// 新增
export async function insert(data: any) {
  return request(`${baseUrl}/cloudWarehouseChangeBill/insert`, {
    method: 'POST',
    data,
  });
}

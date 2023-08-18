import { request } from 'umi';
const baseUrl = '/report-service';
// 查询商品
export async function getList(data: any) {
  return request(`${baseUrl}/inventoryValue/inventoryValuePageList`, {
    method: 'POST',
    data,
  });
}
// 查询商品
export async function inventoryValueSum(data: any) {
  return request(`${baseUrl}/inventoryValue/inventoryValueSum`, {
    method: 'POST',
    data,
  });
}
// 库存价值报表计算明细
export async function listInventoryInDetail(params: any) {
  return request(`${baseUrl}/inventoryValue/listInventoryInDetail`, {
    method: 'GET',
    params,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/inventoryValue/export`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

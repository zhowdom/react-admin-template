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

import { request } from 'umi';
const baseUrl = '/report-service';
// 查询供应商列表
export async function getList(data: any) {
  return request(`${baseUrl}/purchaseVendor/listPage`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/purchaseOrder/exportPurchase`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

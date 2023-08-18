import { request } from 'umi';
const baseUrl = '/report-service';
export async function getList(data: any) {
  return request(`${baseUrl}/purchaseVendor/pageList`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/purchaseVendor/exportList`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

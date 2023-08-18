import { request } from 'umi';
const baseUrl = '/report-service';
export async function getList(data: any) {
  return request(`${baseUrl}/walmart/orderLine/listPage`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/walmart/orderLine/exportExcel`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

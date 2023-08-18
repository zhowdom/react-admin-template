import { request } from 'umi';
const baseUrl = '/report-service';
export async function getList(data: any) {
  return request(`${baseUrl}/amazon/settlement/listPage`, {
    method: 'POST',
    data,
  });
}
export async function getDetail(params: any) {
  return request(`${baseUrl}/amazon/settlement/findById`, {
    method: 'GET',
    params,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/amazon/settlement/exportExcel`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

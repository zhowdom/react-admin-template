import { request } from 'umi';
const baseUrl = '/report-service';
// 查询商品
export async function getList(data: any) {
  return request(`${baseUrl}/scmGoods/listPage`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/scmGoods/export`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

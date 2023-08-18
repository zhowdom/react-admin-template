import { request } from 'umi';
const baseUrl = '/sc-scm';
// 分页列表
export async function getList(data: any) {
  return request(`${baseUrl}/warehousingOrder/findWarehouseingLogisticsLossPage`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportData(data: any) {
  return request(`${baseUrl}/warehousingOrder/exportWarehouseingLogisticsLoss`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}

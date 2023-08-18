import { request } from 'umi';
const baseUrl = '/report-service';
// 查询汇总列表
export async function getList(data: any) {
  return request(`${baseUrl}/purchaseOrderSkuStatistics/page`, {
    method: 'POST',
    data,
  });
}
// 查询明细列表
export async function getDetailList(data: any) {
  return request(`${baseUrl}/purchaseOrderSkuStatistics/detail`, {
    method: 'POST',
    data,
  });
}
// 导出汇总
export async function exportExcel(data: any) {
  return request(`${baseUrl}/purchaseOrderSkuStatistics/export`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 导出明细
export async function exportDExcel(data: any) {
  return request(`${baseUrl}/purchaseOrderSkuStatistics/detailExport`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

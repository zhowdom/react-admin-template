import { request } from 'umi';
const baseUrl = '/sc-scm';
// 列表
export async function prescriptionSummary(data: any) {
  return request(`${baseUrl}/logisticsOrder/prescriptionSummary`, {
    method: 'POST',
    data,
  });
}
// 货件数（入库单维度）统计
export async function prescriptionDetail(data: any) {
  return request(`${baseUrl}/logisticsOrder/prescriptionDetail`, {
    method: 'POST',
    data,
  });
}
// 订舱号时效统计导出
export async function prescriptionSummaryExport(data: any) {
  return request(`${baseUrl}/logisticsOrder/prescriptionSummaryExport`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}
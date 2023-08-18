import { request } from 'umi';
const baseUrl = '/sc-scm';
// 列表
export async function getList(data: any) {
  return request(`${baseUrl}/stockInventoryWarnIn/page`, {
    method: 'POST',
    data,
  });
}
// 周销量
export async function getWeekNumDetails(params: any) {
  return request(`${baseUrl}/stockInventoryWarnIn/getStockUpAdviceDetail`, {
    method: 'POST',
    data: params,
  });
}
// 在途数量PMC/未交货数量(PMC)-已计划发货数量
export async function getPlanedSendNumDetail(params: any) {
  return request(`${baseUrl}/stockInventoryWarnIn/getPlanedSendNumDetail`, {
    method: 'POST',
    data: params,
  });
}
// 在途数量PMC-在途数量（采购）详情
export async function getOnwayNumDetail(data: any) {
  return request(`${baseUrl}/stockInventoryWarnIn/getOnwayNumDetail`, {
    method: 'POST',
    data,
  });
}
// 未交货数量(PMC）已计划未签约数量
export async function getPlanedNoCheckNumDetail(data: any) {
  return request(`${baseUrl}/stockInventoryWarnIn/getPlanedNoCheckNumDetail`, {
    method: 'POST',
    data,
  });
}
// 未交货数量(PMC）在制数量详情
export async function getProductNumDetail(data: any) {
  return request(`${baseUrl}/stockInventoryWarnIn/getProductNumDetail`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/stockInventoryWarnIn/export`, {
    method: 'POST',
    responseType: 'blob',
    data,
    getResponse: true,
  });
}
//查询预警报表备注明细
export async function getCrossInventoryWarnDetailInRemark(data: any) {
  return request(`${baseUrl}/stockInventoryWarnIn/getCrossInventoryWarnDetailInRemark`, {
    method: 'POST',
    data,
  });
}
//保存预警报表备注明细
export async function saveCrossInventoryWarnDetailInRemark(data: any) {
  return request(`${baseUrl}/stockInventoryWarnIn/saveCrossInventoryWarnDetailInRemark`, {
    method: 'POST',
    data,
  });
}
import { request } from 'umi';
const baseUrl = '/sc-scm';
// 发货计划分页列表
export async function getListD(data: any) {
  return request(`${baseUrl}/logisticsOrderDeliveryPlan/page`, {
    method: 'POST',
    data,
  });
}
// 发货计划导出
export async function exportD(data: any) {
  return request(`${baseUrl}/logisticsOrderDeliveryPlan/export`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// PMC负责人查询
export async function principalList(params: any) {
  return request(`${baseUrl}/deliveryPlan/principalList`, {
    method: 'GET',
    params,
  });
}
// 入库单分页列表
export async function logisticsPlanPage(data: any) {
  return request(`${baseUrl}/logisticsOrderWarehousingOrder/page`, {
    method: 'POST',
    data,
  });
}
// 入库单状态数量
export async function logisticsPlanStatusCount(data: any) {
  return request(`${baseUrl}/logisticsOrderWarehousingOrder/statusCount`, {
    method: 'POST',
    data,
  });
}
// 物流负责人认领
export async function changePrincipal(data: any) {
  return request(`${baseUrl}/logisticsOrderWarehousingOrder/changePrincipal`, {
    method: 'POST',
    data,
  });
}
// 信息修改已确认
export async function updateConfirm(params: any) {
  return request(`${baseUrl}/logisticsOrderWarehousingOrder/updateConfirm`, {
    method: 'GET',
    params,
  });
}
// 入库单导出
export async function exportS(data: any) {
  return request(`${baseUrl}/logisticsOrderWarehousingOrder/export`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 国内港口入库导出
export async function exportPortWarehousingIn(data: any) {
  return request(`${baseUrl}/logisticsOrderWarehousingOrder/exportPortWarehousingIn`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 物流信息导出
export async function exportLogisticsInfoIn(data: any) {
  return request(`${baseUrl}/logisticsOrderWarehousingOrder/exportLogisticsInfoIn`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 装箱单导出
export async function exportPackingDetails(data: any) {
  return request(`${baseUrl}/logisticsOrderWarehousingOrder/exportPackingDetails`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}

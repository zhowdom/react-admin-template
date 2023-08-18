import { request } from 'umi';
const baseUrl = '/report-service';
// 采购下单维度-分页
export async function getList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsCN/orderCnListPage`, {
    method: 'POST',
    data,
  });
}
// 收货入库-分页
export async function getListReceipt(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsCN/receivingCnListPage `, {
    method: 'POST',
    data,
  });
}
// 已收货数量
export async function receivingNumberCnList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsCN/receivingNumberCnList`, {
    method: 'POST',
    data,
  });
}
// 已批准（货值）
export async function approvedPurchaseOrderCnList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsCN/approvedPurchaseOrderCnList`, {
    method: 'POST',
    data,
  });
}
// 已部分收货（货值）
export async function partialReceiptPurchaseOrderCnList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsCN/partialReceiptPurchaseOrderCnList`, {
    method: 'POST',
    data,
  });
}
// 已全部收货（货值）
export async function allReceiptPurchaseOrderCnList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsCN/allReceiptPurchaseOrderCnList`, {
    method: 'POST',
    data,
  });
}
// 导出-采购下单维度
export async function exportOrderCnList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsCN/exportOrderCnList`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 导出-收货入库维度
export async function exportReceivingCnList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsCN/exportReceivingCnList`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

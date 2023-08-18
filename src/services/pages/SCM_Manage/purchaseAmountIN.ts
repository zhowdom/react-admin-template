import { request } from 'umi';
const baseUrl = '/report-service';
// 采购下单维度-分页
export async function getList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsIN/orderInListPage`, {
    method: 'POST',
    data,
  });
}
// 收货入库-分页
export async function getListReceipt(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsIN/receivingInListPage `, {
    method: 'POST',
    data,
  });
}
// 已收货数量
export async function receivingNumberInList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsIN/receivingNumberInList`, {
    method: 'POST',
    data,
  });
}
// 已批准（货值）
export async function approvedPurchaseOrderInList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsIN/approvedPurchaseOrderInList`, {
    method: 'POST',
    data,
  });
}
// 已部分收货（货值）
export async function partialReceiptPurchaseOrderInList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsIN/partialReceiptPurchaseOrderInList`, {
    method: 'POST',
    data,
  });
}
// 已全部收货（货值）
export async function allReceiptPurchaseOrderInList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsIN/allReceiptPurchaseOrderInList`, {
    method: 'POST',
    data,
  });
}
// 导出-采购下单维度
export async function exportOrderInList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsIN/exportOrderInList`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 导出-收货入库维度
export async function exportReceivingInList(data: any) {
  return request(`${baseUrl}/purchaseAmountStatisticsIN/exportReceivingInList`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

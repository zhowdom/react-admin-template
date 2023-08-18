import { request } from 'umi';
// 采购单页签分页
export async function purchaseOrderPage(data: any) {
  return request('/sc-scm/paymentStatistics/purchaseOrderPage', {
    method: 'POST',
    data,
  });
}
// 供应商分页查询
export async function vendorPage(data: any) {
  return request('/sc-scm/paymentStatistics/vendorPage', {
    method: 'POST',
    data,
  });
}

// 付款统计
export async function getAmountStatistics(data: any) {
  return request('/sc-scm/paymentStatistics/getAmountStatistics', {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportData(data: any) {
  return request('/sc-scm/paymentStatistics/export', {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}

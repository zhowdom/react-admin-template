import { request } from 'umi';
const baseUrl = '/sc-scm';
// ------商品管理页面--------
// 签样分页列表
export async function projectsSamplePage(data: any) {
  return request(`${baseUrl}/projectsSample/page`, {
    method: 'POST',
    data,
  });
}
// 添加签样
export async function projectsSampleAdd(data: any) {
  return request(`${baseUrl}/projectsSample/sample`, {
    method: 'POST',
    data,
  });
}
// 签样详情
export async function projectsSampleById(params: any) {
  return request(`${baseUrl}/projectsSample/getDetailById`, {
    method: 'GET',
    params,
  });
}
// ------价格审批--------
// 价格审批列表
export async function priceApprovalPage(data: any) {
  return request(`${baseUrl}/priceApproval/page`, {
    method: 'POST',
    data,
  });
}
export async function terminate(params: any) {
  return request(`${baseUrl}/priceApproval/terminate`, {
    method: 'GET',
    params,
  });
}
// 价格审批审批
export async function priceApproval(data: any, dId?: any) {
  return request(`${baseUrl}/priceApproval/approval`, {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 价格审批重新审批
export async function priceReApproval(data: any) {
  return request(`${baseUrl}/priceApproval/reApproval`, {
    method: 'POST',
    data,
  });
}
// 价格审批详情
export async function priceApprovalById(params: any) {
  return request(`${baseUrl}/priceApproval/findById`, {
    method: 'GET',
    params,
  });
}
// 价格审批详情 - 供应商备份 - 废弃
export async function priceApprovalByVendorId(params: any) {
  return request(`${baseUrl}/priceApproval/findByGoodsSkuVendorId`, {
    method: 'GET',
    params,
  });
}
// 价格审批审批 - 供应商备份 - 废弃
export async function priceApprovalBackup(data: any, dId?: any) {
  return request(`${baseUrl}/priceApproval/vendorBackup`, {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 价格审批历史
export async function approvalHistory(params: any) {
  return request(`${baseUrl}/priceApproval/sysApprovalHistory`, {
    method: 'GET',
    params,
  });
}

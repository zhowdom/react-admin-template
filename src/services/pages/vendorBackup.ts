import { request } from 'umi';
const baseUrl = '/sc-scm';
// ------供应商备份--------
// 列表分页
export async function page(data: any) {
  return request(`${baseUrl}/projectsBak/page`, {
    method: 'POST',
    data,
  });
}
// 撤回
export async function terminate(params: any) {
  return request(`${baseUrl}/projectsBak/terminate`, {
    method: 'GET',
    params,
  });
}
// 详情
export async function findById(params: any) {
  return request(`${baseUrl}/projectsBak/findById`, {
    method: 'GET',
    params,
  });
}
// 价格审批 - 新建
export async function vendorBackup(data: any, dId: any) {
  return request(`${baseUrl}/projectsBak/vendorBackup`, {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 价格审批 - 修改编辑
export async function approval(data: any, dId: any) {
  return request(`${baseUrl}/projectsBak/approval`, {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 签样
export async function sample(data: any) {
  return request(`${baseUrl}/projectsBak/sample`, {
    method: 'POST',
    data,
  });
}
// 根据采购商品查询详情 - 供应商备份价格审批
export async function findByGoodsSkuVendorId(params: any) {
  return request(`${baseUrl}/projectsBak/findByGoodsSkuVendorId`, {
    method: 'GET',
    params,
  });
}
// 是否需要提交审批
export async function isSendDingding(data: any) {
  return request(`${baseUrl}/projectsBak/isSendDingding`, {
    method: 'POST',
    data,
  });
}

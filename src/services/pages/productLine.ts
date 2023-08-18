import { request } from 'umi';
// 查询产品线列表
export async function getList(data: any) {
  return request('/sc-scm/vendorGroup/list', {
    method: 'POST',
    data,
  });
}
// 新增产品线
export async function insert(data: any, dId: any) {
  return request('/sc-scm/vendorGroup/insert', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 修改产品线
export async function updateById(data: any, dId: any) {
  return request('/sc-scm/vendorGroup/updateById', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 删除产品线
export async function deleteById(params: any) {
  return request('/sc-scm/vendorGroup/deleteById', {
    method: 'GET',
    params,
  });
}
// 获取详情
export async function getDetail(params: any) {
  return request('/sc-scm/vendorGroup/findById', {
    method: 'GET',
    params,
  });
}
// 撤回
export async function terminate(params: any) {
  return request('/sc-scm/vendorGroup/terminate', {
    method: 'GET',
    params,
  });
}
// 撤回
export async function approvalDetailHistory(params: any) {
  return request('/sc-scm/vendorGroup/approvalDetailHistory', {
    method: 'GET',
    params,
  });
}

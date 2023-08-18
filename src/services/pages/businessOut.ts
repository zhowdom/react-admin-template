import { request } from 'umi';
// 出差记录- 查询列表
export async function getPage(data: any) {
  return request('/sc-scm/vendorTravel/page', {
    method: 'POST',
    data,
  });
}
// 出差记录- 详情 上半部分信息
export async function getDetailById(params: any) {
  return request('/sc-scm/vendorTravel/getDetailById', {
    method: 'GET',
    params,
  });
}
// 出差记录-审核详情 下半部分信息
export async function findApprovalDetail(params: any) {
  return request('/sc-scm/vendorTravel/findApprovalDetail', {
    method: 'GET',
    params,
  });
}
// 出差记录- 新增
export async function insert(data: any, dId?: any) {
  return request('/sc-scm/vendorTravel/insert', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 出差记录- 新增 - 查询供应商默认联系人
export async function getDefaultContacts(params: any) {
  return request('/sc-scm/vendorContacts/getDefaultContacts', {
    method: 'GET',
    params,
  });
}
// 查询供应商列表
export async function getVendorList(data: any) {
  return request('/sc-scm/vendor/page', {
    method: 'POST',
    data,
  });
}

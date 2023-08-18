import { request } from 'umi';
// 查询账号列表
export async function getList(data: any) {
  return request('/sc-scm/vendorUser/page', {
    method: 'POST',
    data,
  });
}
// 启用账号
export async function enable(params: any) {
  return request('/sc-scm/vendorUser/enable', {
    method: 'GET',
    params,
  });
}
// 禁用账号
export async function disable(params: any) {
  return request('/sc-scm/vendorUser/disable', {
    method: 'GET',
    params,
  });
}
// 重置密码
export async function resetPassword(params: any) {
  return request('/sc-scm/vendorUser/resetPassword', {
    method: 'GET',
    params,
  });
}

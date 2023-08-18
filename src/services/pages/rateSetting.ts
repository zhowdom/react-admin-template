import { request } from 'umi';
const baseUrl = '/sc-scm';
// 分页列表
export async function getList(data: any) {
  return request(`${baseUrl}/exchangeRate/page`, {
    method: 'POST',
    data,
  });
}
// 添加
export async function add(data: any) {
  return request(`${baseUrl}/exchangeRate/insert`, {
    method: 'POST',
    data,
  });
}
// 编辑
export async function edit(data: any) {
  return request(`${baseUrl}/exchangeRate/updateById`, {
    method: 'POST',
    data,
  });
}
// 日志
export async function sysChangeFieldHistory(params: any) {
  return request(`${baseUrl}/exchangeRate/sysChangeFieldHistory`, {
    method: 'GET',
    params,
  });
}

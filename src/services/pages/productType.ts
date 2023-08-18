import { request } from 'umi';
const baseUrl = '/sc-scm';
// 分页列表
export async function getList(data: any) {
  return request(`${baseUrl}/productType/page`, {
    method: 'POST',
    data,
  });
}
// 添加
export async function add(data: any) {
  return request(`${baseUrl}/productType/insert`, {
    method: 'POST',
    data,
  });
}
// 编辑
export async function edit(data: any) {
  return request(`${baseUrl}/productType/updateById`, {
    method: 'POST',
    data,
  });
}
// 查询详情
export async function getDetail(params: any) {
  return request(`${baseUrl}/productType/findById`, {
    method: 'GET',
    params,
  });
}
// 日志
export async function sysChangeFieldHistory(params: any) {
  return request(`${baseUrl}/productType/sysChangeFieldHistory`, {
    method: 'GET',
    params,
  });
}

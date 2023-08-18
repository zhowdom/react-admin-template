import { request } from 'umi';
const baseUrl = '/sc-scm';
// 变量管理 分页查询
export async function sysVariablePage(data: any) {
  return request(`${baseUrl}/sysVariable/page`, {
    method: 'POST',
    data,
  });
}
// 变量管理 删除
export async function deleteById(params: any) {
  return request(`${baseUrl}/sysVariable/deleteById`, {
    method: 'GET',
    params,
  });
}
// 变量管理 添加
export async function sysVariableInsert(data: any) {
  return request(`${baseUrl}/sysVariable/insert`, {
    method: 'POST',
    data,
  });
}
// 变量管理 编辑
export async function sysVariableUpdateById(data: any) {
  return request(`${baseUrl}/sysVariable/updateById`, {
    method: 'POST',
    data,
  });
}
// 变量管理 主键查询
export async function sysVariableFindById(params: any) {
  return request(`${baseUrl}/sysVariable/findById`, {
    method: 'POST',
    params,
  });
}

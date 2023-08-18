import { request } from 'umi';
const baseUrl = '/sc-scm';
// 模板分页
export async function requestFundsTemplate(data: any) {
  return request(`${baseUrl}/requestFundsTemplate/page`, {
    method: 'POST',
    data,
  });
}
// 根据名称获取模板Code
export async function findCodeByName(params: any) {
  return request(`${baseUrl}/requestFundsTemplate/findByName`, {
    method: 'GET',
    params,
  });
}
// 添加模板信息
export async function addTemplate(data: any) {
  return request(`${baseUrl}/requestFundsTemplate/save`, {
    method: 'POST',
    data,
  });
}
// 编辑模板信息
export async function editTemplate(data: any) {
  return request(`${baseUrl}/requestFundsTemplate/edit`, {
    method: 'POST',
    data,
  });
}
// 查询操作日志
export async function changeFieldHistory(params: any) {
  return request(`${baseUrl}/requestFundsTemplate/changeFieldHistory`, {
    method: 'GET',
    params,
  });
}

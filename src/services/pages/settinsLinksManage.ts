import { request } from 'umi';
const baseUrl = '/sc-scm';
// 系统设置 - 链接设置管理 测试用
// 分页查询
export async function linkManagementTestPage(data: any) {
  return request(`${baseUrl}/linkManagementTest/page`, {
    method: 'POST',
    data,
  });
}
// 系统设置 - 链接设置管理 测试用
// 添加
export async function addLinkManagementTest(data: any) {
  return request(`${baseUrl}/linkManagementTest/insert`, {
    method: 'POST',
    data,
  });
}
// 系统设置 - 链接设置管理 测试用
// 修改
export async function updateByIdLinkManagementTest(data: any) {
  return request(`${baseUrl}/linkManagementTest/updateById`, {
    method: 'POST',
    data,
  });
}
// 系统设置 - 链接设置管理 测试用
// 主键查询
export async function findByIdLinkManagementTest(params: any) {
  return request(`${baseUrl}/linkManagementTest/findById`, {
    method: 'GET',
    params,
  });
}
// 系统设置 - 链接设置管理 测试用
// 删除
export async function deleteByIdLinkManagementTest(params: any) {
  return request(`${baseUrl}/linkManagementTest/deleteById`, {
    method: 'GET',
    params,
  });
}

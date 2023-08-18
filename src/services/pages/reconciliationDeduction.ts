import { request } from 'umi';
const baseUrl = '/sc-scm';
// 查询页签
export async function getBookmarks(params: any) {
  return request(`${baseUrl}/sysBusinessDeduction/getBookmarks`, {
    method: 'POST',
    params,
  });
}
// 分页列表
export async function getSysBusinessDeductionPage(data: any) {
  return request(`${baseUrl}/sysBusinessDeduction/page`, {
    method: 'POST',
    data,
  });
}
// 添加
export async function addSysBusinessDeduction(data: any) {
  return request(`${baseUrl}/sysBusinessDeduction/insert`, {
    method: 'POST',
    data,
  });
}
// 删除
export async function deleteSysBusinessDeduction(params: any) {
  return request(`${baseUrl}/sysBusinessDeduction/delete`, {
    method: 'GET',
    params,
  });
}
// 查询详情
export async function sysBusinessDeductionById(params: any) {
  return request(`${baseUrl}/sysBusinessDeduction/getDetailById`, {
    method: 'GET',
    params,
  });
}
// 发起审批
export async function sysBusinessInitiateAnApplication(params: any) {
  return request(`${baseUrl}/sysBusinessDeduction/initiateAnApplication`, {
    method: 'GET',
    params,
  });
}

// 审批
export async function sysBusinessDeductionApproval(params: any) {
  return request(`${baseUrl}/sysBusinessDeduction/approval`, {
    method: 'GET',
    params,
  });
}
// 冻结
export async function sysBusinessDeductionFreeze(params: any) {
  return request(`${baseUrl}/sysBusinessDeduction/freeze`, {
    method: 'GET',
    params,
  });
}
// 撤销冻结
export async function sysBusinessDeductionRevokeFreeze(params: any) {
  return request(`${baseUrl}/sysBusinessDeduction/revokeFreeze`, {
    method: 'GET',
    params,
  });
}
// 修改
export async function updateSysBusinessDeduction(data: any) {
  return request(`${baseUrl}/sysBusinessDeduction/update`, {
    method: 'POST',
    data,
  });
}
// 查询多个详情 打印用
export async function sysBusinessDeductionGetDetailByIds(params: any) {
  return request(`${baseUrl}/sysBusinessDeduction/getDetailByIds`, {
    method: 'GET',
    params,
  });
}
// 确认打印 计数
export async function sysBusinessDeductionPrint(params: any) {
  return request(`${baseUrl}/sysBusinessDeduction/print`, {
    method: 'GET',
    params,
  });
}

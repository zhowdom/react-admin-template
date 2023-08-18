import { request } from 'umi';
const baseUrl = '/sc-scm';
// 模板分页
export async function requestFundsProcessList(data: any) {
  return request(`${baseUrl}/requestFundsProcessList/page`, {
    method: 'POST',
    data,
  });
}
// 状态数量统计
export async function statusCount(params: any) {
  return request(`${baseUrl}/requestFundsProcessList/statusCount`, {
    method: 'GET',
    params,
  });
}
// 打印数量统计
export async function printConfirm(params: any) {
  return request(`${baseUrl}/requestFundsProcessList/printConfirm`, {
    method: 'POST',
    params,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/requestFundsProcessList/export`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 获取请款单流程相关数据
export async function getProcessInstances(params: any) {
  return request(`${baseUrl}/requestFundsProcessList/getProcessInstances`, {
    method: 'POST',
    params,
  });
}
// 审批确认接口
export async function agree(data: any) {
  return request(`${baseUrl}/requestFundsProcessList/agree`, {
    method: 'POST',
    data,
  });
}
// 审批拒绝接口
export async function refuse(data: any) {
  return request(`${baseUrl}/requestFundsProcessList/refuse`, {
    method: 'POST',
    data,
  });
}
// 确认制单接口
export async function confirmDocument(data: any) {
  return request(`${baseUrl}/requestFundsProcessList/confirmDocument`, {
    method: 'POST',
    data,
  });
}
// 确认付款接口
export async function confirmPayment(data: any) {
  return request(`${baseUrl}/requestFundsProcessList/confirmPayment`, {
    method: 'POST',
    data,
  });
}
// 下载钉盘附件
export async function authProcessAttachments(data: any) {
  return request(`${baseUrl}/requestFundsProcessList/authProcessAttachments`, {
    method: 'POST',
    data,
  });
}
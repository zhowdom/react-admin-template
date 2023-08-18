import { request } from 'umi';
const baseUrl = '/sc-scm';
// 押金分页
export async function requestFundsDeposit(data: any) {
  return request(`${baseUrl}/requestFundsDeposit/page`, {
    method: 'POST',
    data,
  });
}
// 状态数量统计
export async function statusCount(params: any) {
  return request(`${baseUrl}/requestFundsDeposit/statusCount`, {
    method: 'GET',
    params,
  });
}
// 收款
export async function confirmReceipt(data: any) {
  return request(`${baseUrl}/requestFundsDeposit/confirmReceipt`, {
    method: 'POST',
    data,
  });
}
// 收款记录
export async function pageRecord(data: any) {
  return request(`${baseUrl}/requestFundsDeposit/pageRecord`, {
    method: 'POST',
    data,
  });
}
// 删除收款记录
export async function deleteRecord(params: any) {
  return request(`${baseUrl}/requestFundsDeposit/deleteRecord`, {
    method: 'GET',
    params,
  });
}

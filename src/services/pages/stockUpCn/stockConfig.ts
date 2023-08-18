import { request } from 'umi';
const baseUrl = '/sc-scm';
// 列表
export async function stockUpCnSafeDaysList(data: any) {
  return request(`${baseUrl}/stockUpCnSafeDays/list`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function stockUpCnSafeDaysUpdateById(data: any) {
  return request(`${baseUrl}/stockUpCnSafeDays/updateById`, {
    method: 'POST',
    data,
  });
}
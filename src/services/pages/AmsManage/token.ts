import { request } from 'umi';
// 列表
export async function getTokenList(data: any) {
  return request(`/permissions/tokens/getTokens`, {
    method: 'POST',
    data,
  });
}
export async function tokenDelete(data: any) {
  return request(`/permissions/tokens/remove`, {
    method: 'POST',
    data,
  });
}

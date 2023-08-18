import { request } from 'umi';
const baseUrl = '/sc-scm';
// 列表
export async function getList(data: any) {
  return request(`${baseUrl}/sysPlatformWarehousingIn/page`, {
    method: 'POST',
    data,
  });
}
// 新增
export async function insert(data: any) {
  return request(`${baseUrl}/sysPlatformWarehousingIn/insert`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function update(data: any) {
  return request(`${baseUrl}/sysPlatformWarehousingIn/updateById`, {
    method: 'POST',
    data,
  });
}
// 历史日志
export async function changeFieldHistory(data: any) {
  return request(`${baseUrl}/sysPlatformWarehousingIn/changeFieldHistory`, {
    method: 'POST',
    data,
  });
}

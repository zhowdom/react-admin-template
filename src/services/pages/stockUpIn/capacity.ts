import { request } from 'umi';
const baseUrl = '/sc-scm';
// 列表
export async function getList(data: any) {
  return request(`${baseUrl}/warehouseCapacityIn/page`, {
    method: 'POST',
    data,
  });
}
// 新增
export async function insert(data: any) {
  return request(`${baseUrl}/warehouseCapacityIn/insert`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function update(data: any) {
  return request(`${baseUrl}/warehouseCapacityIn/update`, {
    method: 'POST',
    data,
  });
}
// 历史日志
export async function changeFieldHistory(data: any) {
  return request(`${baseUrl}/warehouseCapacityIn/changeFieldHistory`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/warehouseCapacityIn/export`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}

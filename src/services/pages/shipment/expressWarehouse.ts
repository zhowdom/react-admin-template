import { request } from 'umi';
const baseUrl = '/sc-scm';
// 查询列表
export async function getList(data: any) {
  return request(`${baseUrl}/orderDeliveryWarehouseExpress/page`, {
    method: 'POST',
    data,
  });
}

// 添加
export async function insert(data: any) {
  return request(`${baseUrl}/orderDeliveryWarehouseExpress/insert`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function update(data: any) {
  return request(`${baseUrl}/orderDeliveryWarehouseExpress/update`, {
    method: 'POST',
    data,
  });
}
// 删除
export async function deleteById(params: any) {
  return request(`${baseUrl}/orderDeliveryWarehouseExpress/deleteById`, {
    method: 'GET',
    params,
  });
}

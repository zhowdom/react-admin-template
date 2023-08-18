import { request } from 'umi';
const baseUrl = '/sc-scm';
// 查询列表
export async function getList(data: any) {
  return request(`${baseUrl}/orderDeliveryWarehouse/page`, {
    method: 'POST',
    data,
  });
}
// 同步
export async function syn(data: any) {
  return request(`${baseUrl}/sysCloudWarehousing/syn`, {
    method: 'POST',
    data,
  });
}
// 添加
export async function insert(data: any) {
  return request(`${baseUrl}/orderDeliveryWarehouse/insert`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function update(data: any) {
  return request(`${baseUrl}/orderDeliveryWarehouse/update`, {
    method: 'POST',
    data,
  });
}
// 绑定
export async function binding(data: any) {
  return request(`${baseUrl}/orderDeliveryWarehouse/binding`, {
    method: 'POST',
    data,
  });
}
// 解绑
export async function unbinding(params: any) {
  return request(`${baseUrl}/orderDeliveryWarehouse/unbinding`, {
    method: 'GET',
    params,
  });
}
// 单个、批量设置发货仓
export async function singleOrBatchSetStore(data: any) {
  return request('/sc-scm/goodsSku/updateWarehouse', {
    method: 'POST',
    data,
  });
}
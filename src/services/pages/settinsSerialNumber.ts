import { request } from 'umi';
const baseUrl = '/sc-scm';
// 变量管理 分页查询
export async function getList(data: any) {
  return request(`${baseUrl}/sysSerial/page`, {
    method: 'POST',
    data,
  });
}
// 变量管理 删除
export async function deleteById(params: any) {
  return request(`${baseUrl}/sysSerial/deleteById`, {
    method: 'GET',
    params,
  });
}
// 变量管理 添加
export async function sysSerialInsert(data: any) {
  return request(`${baseUrl}/sysSerial/insert`, {
    method: 'POST',
    data,
  });
}
// 变量管理 编辑
export async function sysSerialUpdateById(data: any) {
  return request(`${baseUrl}/sysSerial/updateById`, {
    method: 'POST',
    data,
  });
}
// 变量管理 主键查询
export async function sysSerialFindById(params: any) {
  return request(`${baseUrl}/sysSerial/findById`, {
    method: 'GET',
    params,
  });
}

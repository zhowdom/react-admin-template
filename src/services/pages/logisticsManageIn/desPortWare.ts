import { request } from 'umi';
const baseUrl = '/sc-scm';
//  列表
export async function getDesWareList(data: any) {
  return request(`${baseUrl}/sysPort/page`, {
    method: 'POST',
    data,
  });
}
// 添加
export async function addDesWare(data: any) {
  return request(`${baseUrl}/sysPort/insert`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function updateDesWare(data: any) {
  return request(`${baseUrl}/sysPort/update`, {
    method: 'POST',
    data,
  });
}

// 导入 目的港
export async function importFile(data: any) {
  return request(`${baseUrl}/sysPort/importTarget`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}

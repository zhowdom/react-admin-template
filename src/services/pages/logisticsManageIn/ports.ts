import { request } from 'umi';
const baseUrl = '/sc-scm';
// 港口管理 - 列表 有翻页
export async function getLogisticsPort(data: any) {
  return request(`${baseUrl}/logisticsPort/page`, {
    method: 'POST',
    data,
  });
}
// 港口管理 - 列表 添加
export async function insertLogisticsPort(data: any) {
  return request(`${baseUrl}/logisticsPort/insert`, {
    method: 'POST',
    data,
  });
}
// 港口管理 - 列表 修改
export async function updateLogisticsPort(data: any) {
  return request(`${baseUrl}/logisticsPort/updateById`, {
    method: 'POST',
    data,
  });
}

// 导入港口
export async function importFile(data: any) {
  return request(`${baseUrl}/logisticsPort/importFile`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}

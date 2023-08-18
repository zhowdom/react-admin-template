import { request } from 'umi';
const baseUrl = '/sc-scm';
// 列表
export async function getList(data: any) {
  return request(`${baseUrl}/ipiIn/page`, {
    method: 'POST',
    data,
  });
}
// 列表-v2
export async function getListv2(data: any) {
  return request(`${baseUrl}/ipiInV2/page`, {
    method: 'POST',
    data,
  });
}
// 新增
export async function insert(data: any) {
  return request(`${baseUrl}/ipiIn/insert`, {
    method: 'POST',
    data,
  });
}
// 新增v2
export async function insertv2(data: any) {
  return request(`${baseUrl}/ipiInV2/insert`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function update(data: any) {
  return request(`${baseUrl}/ipiIn/update`, {
    method: 'POST',
    data,
  });
}
// 修改v2
export async function updatev2(data: any) {
  return request(`${baseUrl}/ipiInV2/update`, {
    method: 'POST',
    data,
  });
}
// 历史日志
export async function changeFieldHistory(data: any) {
  return request(`${baseUrl}/ipiIn/changeFieldHistory`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/ipiIn/export`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 导出v2v
export async function exportExcelv2(data: any) {
  return request(`${baseUrl}/ipiInV2/export`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 获取默认的容量单位信息
export async function getIpi(data: any) {
  return request(`${baseUrl}/ipiIn/getIpi`, {
    method: 'POST',
    data,
  });
}
// 获取默认的容量单位信息-new
export async function queryCurrentUnit(params: any) {
  return request(`${baseUrl}/ipiInV2/findRecentUnits`, {
    method: 'GET',
    params,
  });
}
// 保存并且添加下一条时，添加下一个没有店铺的信息；查询逻辑接口
export async function getNextIpi(data: any) {
  return request(`${baseUrl}/ipiInV2/next`, {
    method: 'POST',
    data,
  });
}


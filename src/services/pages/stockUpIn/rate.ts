import { request } from 'umi';
const baseUrl = '/sc-scm';
// 列表
export async function getList(data: any) {
  return request(`${baseUrl}/exchangeRateManage/page`, {
    method: 'POST',
    data,
  });
}
// 历史时效列表分页
export async function getList_history(data: any) {
  return request(`${baseUrl}/logisticsTimeManage/historyPage`, {
    method: 'POST',
    data,
  });
}
// 新增
export async function insert(data: any) {
  return request(`${baseUrl}/exchangeRateManage/insert`, {
    method: 'POST',
    data,
  });
}
// 新增 or 修改
export async function saveOrUpdate(data: any) {
  return request(`${baseUrl}/logisticsTimeManage/saveOrUpdate`, {
    method: 'POST',
    data,
  });
}
// 批量修改上架周期
export async function batchShelvesCycle(data: any) {
  return request(`${baseUrl}/logisticsTimeManage/batchUpdateShelvesCycle`, {
    method: 'POST',
    data,
  });
}
// 批量启用禁用
export async function batchUpdateStatus(data: any) {
  return request(`${baseUrl}/logisticsTimeManage/batchUpdateStatus`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function update(data: any) {
  return request(`${baseUrl}/exchangeRateManage/update`, {
    method: 'POST',
    data,
  });
}
// 日志
export async function changeFieldHistory(data: any) {
  return request(`${baseUrl}/exchangeRateManage/changeFieldHistory`, {
    method: 'POST',
    data,
  });
}

// 删除
export async function deleteItem(params: any) {
  return request(`${baseUrl}/exchangeRateManage/batchDelete`, {
    method: 'GET',
    params,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/exchangeRateManage/export`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 导出-当前时效
export async function exportExcev2(data: any) {
  return request(`${baseUrl}/logisticsTimeManage/export`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 导出-历史时效
export async function exportExceHistory(data: any) {
  return request(`${baseUrl}/logisticsTimeManage/historyExport`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}

import { request } from 'umi';
const baseUrl = '/sc-scm';
// 列表
export async function getLspList(data: any) {
  return request(`${baseUrl}/logisticsVendor/page`, {
    method: 'POST',
    data,
  });
}
// 添加
export async function addLsp(data: any) {
  return request(`${baseUrl}/logisticsVendor/insert`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function updateLsp(data: any) {
  return request(`${baseUrl}/logisticsVendor/updateById`, {
    method: 'POST',
    data,
  });
}
// 查询详情
export async function getLspDetail(params: any) {
  return request(`${baseUrl}/logisticsVendor/findById`, {
    method: 'GET',
    params,
  });
}
// 日志
export async function getLogisticsVendorLogs(data: any) {
  return request(`${baseUrl}/logisticsVendor/changeFieldHistory`, {
    method: 'POST',
    data,
  });
}
// 物流负责人查询
export async function principalList(params: any) {
  return request(`${baseUrl}/logisticsOrder/principalList`, {
    method: 'GET',
    params,
  });
}
// 导入物流商
export async function importFile(data: any) {
  return request(`${baseUrl}/logisticsVendor/importFile`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}
// 导出明细
export async function detailExport(data: any) {
  return request(`${baseUrl}/logisticsOrder/detailExport`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}

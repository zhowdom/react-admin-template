import { request } from 'umi';
const baseUrl = '/sc-scm';
// 列表
export async function getCompanyList(data: any) {
  return request(`${baseUrl}/logisticsExpress/page`, {
    method: 'POST',
    data,
  });
}
// 添加
export async function addCompany(data: any) {
  return request(`${baseUrl}/logisticsExpress/insert`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function updateCompany(data: any) {
  return request(`${baseUrl}/logisticsExpress/updateById`, {
    method: 'POST',
    data,
  });
}
// 导入 船公司/快递公司
export async function importFile(data: any) {
  return request(`${baseUrl}/logisticsExpress/importFile`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}

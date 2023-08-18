import { request } from 'umi';
const baseUrl = '/sc-scm';
// 导入模板管理 分页查询
export async function sysImportTemplatePage(data: any) {
  return request(`${baseUrl}/sysImportTemplate/page`, {
    method: 'POST',
    data,
  });
}
// 导入模板管理 分页查询
export async function addSysImportTemplate(data: any) {
  return request(`${baseUrl}/sysImportTemplate/insert`, {
    method: 'POST',
    data,
  });
}
// 导入模板管理 分页查询
export async function updateSysImportTemplate(data: any) {
  return request(`${baseUrl}/sysImportTemplate/updateById`, {
    method: 'POST',
    data,
  });
}
// 导入模板管理 主键查询
export async function getSysImportTemplateById(params: any) {
  return request(`${baseUrl}/sysImportTemplate/findById`, {
    method: 'POST',
    params,
  });
}

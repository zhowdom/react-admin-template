import {request} from 'umi';

export async function ownStockPage(data: any) {
  return request('/sc-scm/ownStockManagement/ownStockPage', {
    method: 'POST',
    data,
  });
}
export async function ownStockTurnoverPage(data: any) {
  return request('/sc-scm/ownStockManagement/ownStockTurnoverPage', {
    method: 'POST',
    data,
  });
}
export async function page(data: any) {
  return request('/sc-scm/ownStockManagement/page', {
    method: 'POST',
    data,
  });
}
export async function addOrUpdate(data: any) {
  return request('/sc-scm/ownStockManagement/addOrUpdate', {
    method: 'POST',
    data,
  });
}
export async function addRemark(data: any) {
  return request('/sc-scm/ownStockManagement/addRemark', {
    method: 'POST',
    data,
  });
}
export async function detail(params: any) {
  return request('/sc-scm/ownStockManagement/detail', {
    method: 'GET',
    params,
  });
}
// 下载文件
export async function detailDownload(params: any) {
  return request('/sc-scm/ownStockManagement/detailDownload', {
    method: 'GET',
    params,
    responseType: 'blob',
    getResponse: true,
  });
}
export async function applyApproval(params: any) {
  return request('/sc-scm/ownStockManagement/applyApproval', {
    method: 'GET',
    params,
  });
}
export async function approve(data: any) {
  return request('/sc-scm/ownStockManagement/approve', {
    method: 'POST',
    data,
  });
}
export async function withdraw(params: any) {
  return request('/sc-scm/ownStockManagement/withdraw', {
    method: 'GET',
    params,
  });
}
export async function voided(params: any) {
  return request('/sc-scm/ownStockManagement/voided', {
    method: 'GET',
    params,
  });
}
export async function outbound(params: any) {
  return request('/sc-scm/ownStockManagement/outbound', {
    method: 'GET',
    params,
  });
}
export async function returned(data: any) {
  return request('/sc-scm/ownStockManagement/returned', {
    method: 'POST',
    data,
  });
}

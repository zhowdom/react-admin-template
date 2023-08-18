import { request } from 'umi';
export async function listPage(data: any) {
  return request('/permissions/applyPermissions/listPage', {
    method: 'POST',
    data,
  });
}
export async function findById(params: any) {
  return request('/permissions/applyPermissions/findById', {
    method: 'GET',
    params,
  });
}
export async function approve(data: any) {
  return request('/permissions/applyPermissions/approve', {
    method: 'POST',
    data,
  });
}

export async function withdraw(params: any) {
  return request('/permissions/applyPermissions/withdraw', {
    method: 'GET',
    params,
  });
}

export async function deleteItem(params: any) {
  return request('/permissions/applyPermissions/delete', {
    method: 'GET',
    params,
  });
}

export async function getApplysCount(data: any) {
  return request('/permissions/applyPermissions/getApplysCount', {
    method: 'POST',
    data,
  });
}

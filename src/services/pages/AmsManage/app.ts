import { request } from 'umi';
// 列表
export async function getAppList(data: any) {
  return request('/permissions/app/listPage', {
    method: 'POST',
    data,
  });
}

// 添加或修改app信息
export async function appAddOrUpdate(data: any) {
  return request('/permissions/app/addOrUpdate', {
    method: 'POST',
    data,
  });
}

// 修改app状态
export async function updateStatus(params: any) {
  return request('/permissions/app/updateStatus', {
    method: 'GET',
    params,
  });
}

// app详情
export async function getAppInfo(params: any) {
  return request('/permissions/app/getAppInfo', {
    method: 'GET',
    params,
  });
}

// 用户删除APP
export async function deleteAction(params: any) {
  return request('/permissions/app/delete', {
    method: 'GET',
    params,
  });
}

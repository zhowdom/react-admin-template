import { request } from 'umi';
export async function getAppSelectAll(data: any) {
  return request('/permissions/app/listPage', {
    method: 'POST',
    data: {
      pageSize: 999,
      pageIndex: 1,
      status: data.status,
    },
  });
}
// 列表
export async function getMethodsList(data: any) {
  return request('/permissions/methods/listPage', {
    method: 'POST',
    data,
  });
}
// 通过方法ID，查已有的按钮
export async function getMenuMethodsByMethodIdAndMenuId(params: any) {
  return request('/permissions/menu/getMenuMethodsByMethodIdAndMenuId', {
    method: 'GET',
    params,
  });
}

// 删除方法
export async function methodsDelete(data: any) {
  return request('/permissions/methods/delete', {
    method: 'POST',
    data,
  });
}

// 通过前端code和接口url手动批量添加按钮和接口方法关联关系
export async function methodsBindMM(data: any) {
  return request('/permissions/methods/bindMM', {
    method: 'POST',
    data,
  });
}

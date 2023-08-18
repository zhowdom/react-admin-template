import { request } from 'umi';
export async function getRoleList(data: any) {
  return request('/permissions/role/listPage', {
    method: 'POST',
    data,
  });
}

// 添加修改角色
export async function roleAddOrUpdate(data: any) {
  return request('/permissions/role/addOrUpdate', {
    method: 'POST',
    data,
  });
}
// 删除角色
export async function roleDelete(params: any) {
  return request('/permissions/role/delete', {
    method: 'GET',
    params,
  });
}
// 修改角色的状态
export async function roleUpdateStatus(params: any) {
  return request('/permissions/role/updateStatus', {
    method: 'GET',
    params,
  });
}
// 角色已有的菜单
export async function getRoleMenu(params: any) {
  return request('/permissions/role/getRoleMenu', {
    method: 'GET',
    params,
  });
}
// 角色已有的人
export async function getUserRoleByUserIdAndRoleId(params: any) {
  return request('/permissions/user/getUserRoleByUserIdAndRoleId', {
    method: 'GET',
    params,
  });
}
// 给角色分配用户
export async function setUserToRole(data: any) {
  return request('/permissions/role/setUserToRole', {
    method: 'POST',
    data,
  });
}
// 所有用户列表
export async function getUserList(data: any) {
  return request('/permissions/user/listPage', {
    method: 'POST',
    data,
  });
}

// 获取应用下的菜单
export async function getMenuList(data: any) {
  return request('/permissions/menu/listPage', {
    method: 'POST',
    data,
  });
}
// 给角色分配菜单按钮
export async function setMenuToRole(data: any) {
  return request('/permissions/role/setMenuToRole', {
    method: 'POST',
    data,
  });
}
// 申请角色菜单权限
export async function applyMenuToRole(data: any) {
  return request('/permissions/applyPermissions/apply', {
    method: 'POST',
    data,
  });
}
// 导出角色和菜单
export async function exportRoleAndMenu(data: any) {
  return request('/permissions/role/exportRoleAndMenu', {
    method: 'POST',
    responseType: 'blob',
    data,
    getResponse: true,
  });
}


// 批量查询角色下的菜单按钮的合集
export async function findMenuByRoles(params: any) {
  return request('/permissions/role/findMenuByRoles', {
    method: 'GET',
    params,
  });
}
// 编辑权限
export async function applyBatch(data: any) {
  return request('/permissions/applyPermissions/applyBatch', {
    method: 'POST',
    data,
  });
}

// 批量查询角色下的菜单按钮的合集
export async function getRoleCodesMenus(params: any) {
  return request('/permissions/menu/current', {
    method: 'GET',
    params,
  });
}

export async function applyFindById(params: any) {
  return request('/permissions/applyPermissions/findById', {
    method: 'GET',
    params,
  });
}
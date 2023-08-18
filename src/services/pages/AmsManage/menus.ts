import { request } from 'umi';
export async function listPage(data: any) {
  return request('/permissions/menu/listPage', {
    method: 'POST',
    data,
  });
}

// 添加 编辑菜单
export async function addOrUpdateMenu(data: any) {
  return request('/permissions/menu/addOrUpdateMenu', {
    method: 'POST',
    data,
  });
}
// 删除 菜单按钮
export async function deleteMenu(params: any) {
  return request('/permissions/menu/deleteMenu', {
    method: 'GET',
    params,
  });
}
// 通过菜单id 获取角色
export async function getRoleMenuByMenuIdAndRoleId(params: any) {
  return request('/permissions/role/getRoleMenuByMenuIdAndRoleId', {
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
// 通过角色id和用户ids解绑用户和角色关联关系
export async function removeUserRoleByRoleIdAndUserIds(data: any) {
  return request('/permissions/user/removeUserRoleByRoleIdAndUserIds', {
    method: 'POST',
    data,
  });
}
// 通过按钮ID，查已有的方法
export async function getMenuMethodsByMethodIdAndMenuId(params: any) {
  return request('/permissions/menu/getMenuMethodsByMethodIdAndMenuId', {
    method: 'GET',
    params,
  });
}
// 绑定方法到按钮
export async function bindMenuAndMethods(data: any) {
  return request('/permissions/menu/bindMenuAndMethods', {
    method: 'POST',
    data,
  });
}
// 查询方法
export async function getMethodsList(data: any) {
  return request('/permissions/methods/listPage', {
    method: 'POST',
    data,
  });
}

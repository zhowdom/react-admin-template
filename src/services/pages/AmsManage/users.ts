import { request } from 'umi';
// 列表
export async function getUserList(data: any) {
  return request('/permissions/user/listPage', {
    method: 'POST',
    data,
  });
}
// 删除
export async function deleteCusUser(params: any) {
  return request('/permissions/user/deleteCusUser', {
    method: 'GET',
    params,
  });
}
// 停用/启用账户
export async function disableCusUser(params: any) {
  return request('/permissions/user/disableCusUser', {
    method: 'GET',
    params,
  });
}

// 同步erp用户信息
export async function syncErps(data: any) {
  return request('/permissions/erp/syncErps', {
    method: 'POST',
    data,
  });
}

// 同步钉钉部门账号
export async function syncDingUser(data: any) {
  return request('/permissions/sync/syncDingUser', {
    method: 'POST',
    data,
  });
}
// 更新用户信息
export async function updateUser(data: any) {
  return request('/permissions/user/updateUser', {
    method: 'POST',
    data,
  });
}

// 通过账号获取用户
export async function getUserById(params: any) {
  return request('/permissions/user/getUserById', {
    method: 'GET',
    params,
  });
}

// 查询账户已有的角色
export async function getUserRoleByUserIdAndRoleId(params: any) {
  return request('/permissions/user/getUserRoleByUserIdAndRoleId', {
    method: 'GET',
    params,
  });
}
// 获取用户数据权限
export async function getAuthoritys(params: any) {
  return request('/sc-scm/sysDataAuthorityConfig/getAuthoritys', {
    method: 'GET',
    params,
  });
}

// 给用户分配角色
export async function setRolesToUser(data: any) {
  return request('/permissions/user/setRolesToUser', {
    method: 'POST',
    data,
  });
}

// 用户自己修改密码
export async function changePassWord(params: any) {
  return request('/permissions/user/password', {
    method: 'GET',
    params,
  });
}
// 用户自己修改信息
export async function updateOneself(data: any) {
  return request('/permissions/user/updateOneself', {
    method: 'POST',
    data,
  });
}
// 已选用户列表
export async function getRoleList(data: any) {
  return request('/permissions/role/listPage', {
    method: 'POST',
    data,
  });
}

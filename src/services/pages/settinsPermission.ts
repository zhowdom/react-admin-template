import { request } from 'umi';
const baseUrl = '/sc-scm';
// 部门列表查询
export async function listDept(data: any) {
  return request(`${baseUrl}/user/listDept`, {
    method: 'POST',
    data,
  });
}
// 数据权限 列表
export async function configPage(data: any) {
  return request(`${baseUrl}/sysDataAuthorityConfig/page`, {
    method: 'POST',
    data,
  });
}
// 数据权限 主键查询
export async function configFindById(params: any) {
  return request(`${baseUrl}/sysDataAuthorityConfig/findById`, {
    method: 'POST',
    params,
  });
}
// 查询产品线列表
export async function getProductLine(data: any) {
  return request('/sc-scm/vendorGroup/list', {
    method: 'POST',
    data,
  });
}
// 数据权限 添加
export async function configInsert(data: any) {
  return request(`${baseUrl}/sysDataAuthorityConfig/insert`, {
    method: 'POST',
    data,
  });
}
// 数据权限 修改
export async function configUpdateById(data: any) {
  return request(`${baseUrl}/sysDataAuthorityConfig/updateById`, {
    method: 'POST',
    data,
  });
}

// 批量操作数据权限 - 授权
export async function saveOrUpdateBatch(data: any) {
  return request(`${baseUrl}/sysDataAuthorityConfig/saveOrUpdateBatch`, {
    method: 'POST',
    data,
  });
}
// 标记产品线范围 - 批量
export async function updateRangeType(data: any) {
  return request(`${baseUrl}/sysDataAuthorityConfig/updateRangeType `, {
    method: 'POST',
    data,
  });
}
// 标记产品线范围 - 批量
export async function syncRangeType(data: { rangeType: string }) {
  return request(`${baseUrl}/sysDataAuthorityConfig/syncRangeType `, {
    method: 'POST',
    data,
  });
}
//  获取全部平台+店铺
export async function platformShops() {
  return request(`${baseUrl}/sysDataAuthorityConfig/shops`, {
    method: 'GET',
  });
}
//  授权店铺
export async function updateShopConfig(data: { user_id: string; shop_id: string[] }[]) {
  return request(`${baseUrl}/sysDataAuthorityConfig/updateShopConfig`, {
    method: 'POST',
    data,
  });
}

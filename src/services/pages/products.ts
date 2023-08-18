import { request } from 'umi';
const baseUrl = '/sc-scm';
// ------商品管理页面--------
// 商品分页
export async function vendorList(data: any) {
  return request(`${baseUrl}/vendorGoods/page`, {
    method: 'POST',
    data,
  });
}
// 商品添加
export async function vendorAdd(data: any) {
  return request(`${baseUrl}/vendorGoods/insert`, {
    method: 'POST',
    data,
  });
}
// 商品修改
export async function vendorUpdate(data: any) {
  return request(`${baseUrl}/vendorGoods/updateById`, {
    method: 'POST',
    data,
  });
}
// 商品查询
export async function vendorFind(params: any) {
  return request(`${baseUrl}/vendorGoods/findById`, {
    method: 'POST',
    params,
  });
}
// 上架信息
export async function listLinkManagementSku(params: any) {
  return request(`${baseUrl}/goodsSku/listLinkManagementSku`, {
    method: 'GET',
    params,
  });
}
// 库存成本 日志
export async function unitCostLogPage(data: any) {
  return request(`${baseUrl}/goodsSku/unitCostLogPage`, {
    method: 'POST',
    data,
  });
}

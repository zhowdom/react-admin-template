import { request } from 'umi';
const baseUrl = '/sc-scm';
// ------配件商品--------
// 分页查询
export async function partsPage(data: any) {
  return request(`${baseUrl}/goodsSku/partsPage`, {
    method: 'POST',
    data,
  });
}
// 添加配件
export async function addParts(data: any) {
  return request(`${baseUrl}/goodsSku/addParts`, {
    method: 'POST',
    data: data,
  });
}

// 编辑配件
export async function updateParts(data: any) {
  return request(`${baseUrl}/goodsSku/updateParts`, {
    method: 'POST',
    data: data,
  });
}

// 编辑时详情
export async function findPartsByGoodId(params: any) {
  return request(`${baseUrl}/goodsSku/findPartsByGoodId`, {
    method: 'POST',
    params: params,
  });
}
// -- 供应商设置相关
export async function findPartsVendorAllByGoodsId(params: any) {
  return request(`${baseUrl}/goodsSkuVendor/findPartsVendorAllByGoodsId`, {
    method: 'POST',
    params,
  });
}
export async function updatePartsGoodsSkuVendor(data: any) {
  return request(`${baseUrl}/goodsSkuVendor/updatePartsGoodsSkuVendor`, {
    method: 'POST',
    data,
  });
}
export async function insertPartsGoodsSkuVendor(data: any) {
  return request(`${baseUrl}/goodsSkuVendor/insertPartsGoodsSkuVendor`, {
    method: 'POST',
    data,
  });
}

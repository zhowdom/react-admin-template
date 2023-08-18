import { request } from 'umi';
const baseUrl = '/sc-scm';
// ------平台合作商品--------
// 查询供应商下面所有的商品信息
export async function findByVendorId(params: any) {
  return request(`${baseUrl}/goodsSkuVendor/findByVendorId`, {
    method: 'POST',
    params,
  });
}
// 分页查询（无数据权限) -- 批量价格审批用到
export async function goodsSkuVendorPage(data: any) {
  return request(`${baseUrl}/goodsSkuVendor/freePage`, {
    method: 'POST',
    data,
  });
}
// 商品SKU分页
export async function getGoodsSkuVendorPage(data: any) {
  return request(`${baseUrl}/goodsSku/page`, {
    method: 'POST',
    data,
  });
}
// 根据商品id查询
export async function goodsSkuFindById(params: any) {
  return request(`${baseUrl}/goodsSku/findById`, {
    method: 'POST',
    params,
  });
}
// 同步平台库存编码
export async function syncPlatformStockNo(params: any) {
  return request(`${baseUrl}/goodsSku/syncPlatformStockNo`, {
    method: 'GET',
    params,
  });
}
// 更新供应商交期时间
export async function updateDeliveryDay(data: any) {
  return request(`${baseUrl}/goodsSku/updateDeliveryDay`, {
    method: 'POST',
    data,
  });
}
// 价格变更审批
export async function goodsSkuChangePrice(data: any, dId?: any) {
  return request(`${baseUrl}/goodsSkuVendor/changePrice`, {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 分页查询历史价格
export async function goodsChangePriceHistoryPage(params: any, data?: any) {
  return request(`${baseUrl}/goodsChangePrice/changeHistory`, {
    method: 'POST',
    params,
    data,
  });
}

// 获取供应商详情信息
export async function getSupplierDetail(params: any) {
  return request(`${baseUrl}/vendor/findById`, {
    method: 'GET',
    params,
  });
}
// 设置商品SKU为主供应商
export async function updateMainVendor(params: any) {
  return request(`${baseUrl}/goodsSku/updateMainVendor`, {
    method: 'POST',
    params,
  });
}
// 查询商品sku对应的供应商
export async function findGoodsSkuToVendor(params: any) {
  return request(`${baseUrl}/goodsSkuVendor/findGoodsSkuToVendor`, {
    method: 'POST',
    params,
  });
}
// 查询某产品线下面对于的供应商(如果此商品已使用此供应商)
export async function findCategoryToValidVendor(params: any) {
  return request(`${baseUrl}/goodsSku/findCategoryToValidVendor`, {
    method: 'POST',
    params,
  });
}
// 商品sku 价格变更 查询
export async function findSelectChangePrice(params: any) {
  return request(`${baseUrl}/goodsSku/findSelectChangePrice`, {
    method: 'POST',
    params,
  });
}
// 添加箱规
export async function addVendorSpecification(data: any) {
  return request(`${baseUrl}/goodsSku/addVendorSpecification`, {
    method: 'POST',
    data,
  });
}

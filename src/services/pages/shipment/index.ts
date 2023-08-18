import { request } from 'umi';
const baseUrl = '/sc-scm';
// -- 快递公司
export async function orderDeliveryExpressCompanyPage(data: any) {
  return request(`${baseUrl}/orderDeliveryExpressCompany/page`, {
    method: 'POST',
    data,
  });
}
export async function orderDeliveryExpressCompanyInsert(data: any) {
  return request(`${baseUrl}/orderDeliveryExpressCompany/insert`, {
    method: 'POST',
    data,
  });
}
export async function orderDeliveryExpressCompanyUpdate(data: any) {
  return request(`${baseUrl}/orderDeliveryExpressCompany/update`, {
    method: 'POST',
    data,
  });
}
// -- 发货仓配置
export async function orderDeliveryGoodSkuWarehousePage(data: any) {
  return request(`${baseUrl}/orderDeliveryGoodSkuWarehouse/page`, {
    method: 'POST',
    data,
  });
}
export async function getDeliveryWarehouseConfig(data: any) {
  return request(`${baseUrl}/orderDeliveryGoodSkuWarehouse/getDeliveryWarehouseConfig`, {
    method: 'POST',
    data,
  });
}
export async function orderDeliveryGoodSkuWarehouseExport(data: any) {
  return request(`${baseUrl}/orderDeliveryGoodSkuWarehouse/export`, {
    method: 'POST',
    data,
  });
}
export async function batchUpdateGoodSkuWarehouseArea(data: any) {
  return request(`${baseUrl}/orderDeliveryGoodSkuWarehouse/batchUpdateGoodSkuWarehouseArea`, {
    method: 'POST',
    data,
  });
}
// 批量添加/更新仓库
export async function batchUpdateGoodSkuWarehouse(data: any) {
  return request(`${baseUrl}/orderDeliveryGoodSkuWarehouse/batchUpdateGoodSkuWarehouse`, {
    method: 'POST',
    data,
  });
}
// 单个添加仓库
export async function orderDeliveryGoodSkuWarehouseInset(data: any) {
  return request(`${baseUrl}/orderDeliveryGoodSkuWarehouse/insert`, {
    method: 'POST',
    data,
  });
}
// 单个添加仓库
export async function orderDeliveryGoodSkuWarehouseUpdate(data: any) {
  return request(`${baseUrl}/orderDeliveryGoodSkuWarehouse/update`, {
    method: 'POST',
    data,
  });
}
// 国内发货仓列表
export async function orderDeliveryWarehousePage(data: {
  platform_code: any;
  current_page: number;
  page_size: number;
}) {
  return request(`${baseUrl}/orderDeliveryWarehouse/page`, {
    method: 'POST',
    data,
  });
}
// 区域
export async function regionArea() {
  return request(`${baseUrl}/orderDeliveryWarehouseExpress/regionArea`, {
    method: 'POST',
  });
}
// 发货仓配置
export async function deliveryWarehouseConfig(data: any) {
  return request(`${baseUrl}/orderDeliveryGoodSkuWarehouse/deliveryWarehouseConfig`, {
    method: 'POST',
    data,
  });
}
// 验证编号是否为同一个供应商下面的编码
export async function isVerificationSameVendor(data: any) {
  return request(`${baseUrl}/orderDeliveryGoodSkuWarehouse/isVerificationSameVendor`, {
    method: 'POST',
    data,
  });
}

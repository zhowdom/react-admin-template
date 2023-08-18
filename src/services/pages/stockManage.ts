import { request } from 'umi';
const baseUrl = '/sc-scm';
// 查询采购订单列表
export async function getList(data: any) {
  return request(`${baseUrl}/cloudWarehouseInventory/cnInventoryPage`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportInventory(data: any) {
  return request(`${baseUrl}/cloudWarehouseInventory/exportInventory`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}
// 同步
export async function syn(data: any) {
  return request(`${baseUrl}/cloudWarehouseInventory/syn`, {
    method: 'POST',
    data,
  });
}
// 查看链接上架信息
export async function listingDetails(params: any) {
  return request(`${baseUrl}/cloudWarehouseInventory/listingDetails`, {
    method: 'GET',
    params,
  });
}

// 导入自营库存
export async function stockImportSelf(data: any) {
  return request(`${baseUrl}/cloudWarehouseInventory/jdOperateStockImport`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}
// 导入FCS
export async function jdFcsStockImport(data: any) {
  return request(`${baseUrl}/cloudWarehouseInventory/jdFcsStockImport`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}

// 导入产品线淡旺季系数(goods)
export async function importgoodsFlex(data: any) {
  return request(`${baseUrl}/stockUpCnSeasonCoefficient/importVendorGroup`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}
// 导入款式淡旺季系数(sku)
export async function importskuFlex(data: any) {
  return request(`${baseUrl}/stockUpCnSeasonCoefficient/importSku`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}

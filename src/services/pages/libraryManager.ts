// 云仓 库存管理
import { request } from 'umi';

// 入库单列表
export async function cloudWarehouseInventoryPage(data: any) {
  return request('/sc-scm/cloudWarehouseInventory/page', {
    method: 'POST',
    data,
  });
}

// 同步库存数据
export async function cloudWarehouseInventorySyn(data: any) {
  return request('/sc-scm/cloudWarehouseInventory/syn', {
    method: 'POST',
    data,
  });
}
// 导出 库存
export async function synInventoryStreamExportInventory(data: any) {
  return request('/sc-scm/cloudWarehouseInventory/exportInventory', {
    method: 'POST',
    responseType: 'blob',
    data,
    getResponse: true,
  });
}

// 库存流水
export async function cloudWarehouseInventoryStreamPage(data: any) {
  return request('/sc-scm/cloudWarehouseInventory/cloudWarehouseInventoryStreamPage', {
    method: 'POST',
    data,
  });
}
// 同步 库存流水
export async function synInventoryStream(params: any) {
  return request('/sc-scm/cloudWarehouseInventory/synInventoryStream', {
    method: 'GET',
    params,
  });
}
// 导出 库存流水
export async function synInventoryStreamExport(data: any) {
  return request('/sc-scm/cloudWarehouseInventory/export', {
    method: 'POST',
    responseType: 'blob',
    data,
    getResponse: true,
  });
}

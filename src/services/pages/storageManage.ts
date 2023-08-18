import { request } from 'umi';
const baseUrl = '/sc-scm';
// ------平台管理--------
// 平台管理 - 列表 无翻页
export async function getSysPlatformList(data: any) {
  return request(`${baseUrl}/sysPlatform/list`, {
    method: 'POST',
    data,
  });
}
// 平台管理 - 列表 有翻页
export async function getSysPlatformPage(data: any) {
  return request(`${baseUrl}/sysPlatform/page`, {
    method: 'POST',
    data,
  });
}
// 平台管理 - ID 查询
export async function getSysPlatformById(params: any) {
  return request(`${baseUrl}/sysPlatform/findById`, {
    method: 'POST',
    params,
  });
}
// 平台管理 - 列表 添加
export async function addSysPlatform(data: any) {
  return request(`${baseUrl}/sysPlatform/insert`, {
    method: 'POST',
    data,
  });
}
// 平台管理 - 列表 修改
export async function updateSysPlatform(data: any) {
  return request(`${baseUrl}/sysPlatform/updateById`, {
    method: 'POST',
    data,
  });
}

// 京东POP仓库手动同步
export async function syncPopWarehouse(params: any) {
  return request(`${baseUrl}/sysPlatformWarehousing/syncPopWarehouse`, {
    method: 'GET',
    params,
  });
}
// ------店铺管理--------
// 店铺管理 - 列表 有翻页
export async function getSysPlatformShopPage(data: any) {
  return request(`${baseUrl}/sysPlatformShop/page`, {
    method: 'POST',
    data,
  });
}
// 店free列表 有翻页
export async function getSysFreePlatformShopPage(data: any) {
  return request(`${baseUrl}/sysPlatformShop/freePageList`, {
    method: 'POST',
    data,
  });
}
// 店铺管理 - ID 查询
export async function getSysPlatformShopById(params: any) {
  return request(`${baseUrl}/sysPlatformShop/findById`, {
    method: 'POST',
    params,
  });
}
// 店铺管理 - 列表 添加
export async function addSysPlatformShop(data: any) {
  return request(`${baseUrl}/sysPlatformShop/insert`, {
    method: 'POST',
    data,
  });
}
// 店铺管理 - 列表 修改
export async function updateSysPlatformShop(data: any) {
  return request(`${baseUrl}/sysPlatformShop/updateById`, {
    method: 'POST',
    data,
  });
}

// ------国内平台仓库管理--------
// 仓库管理 - 列表 有翻页
export async function getSysPlatformWarehousingPage(data: any) {
  return request(`${baseUrl}/sysPlatformWarehousing/page`, {
    method: 'POST',
    data,
  });
}
// 仓库管理 - ID 查询
export async function getSysPlatformWarehousingById(params: any) {
  return request(`${baseUrl}/sysPlatformWarehousing/findById`, {
    method: 'POST',
    params,
  });
}
// 仓库管理 - 列表 添加
export async function addSysPlatformWarehousing(data: any) {
  return request(`${baseUrl}/sysPlatformWarehousing/insert`, {
    method: 'POST',
    data,
  });
}
// 仓库管理 - 列表 修改
export async function updateSysPlatformWarehousing(data: any) {
  return request(`${baseUrl}/sysPlatformWarehousing/updateById`, {
    method: 'POST',
    data,
  });
}
// 仓库管理 - 批量导入
export async function importPlatformWarehousing(data: any) {
  return request(`${baseUrl}/sysPlatformWarehousing/importPlatformWarehousing`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}
// 仓库管理 - 新增时，获取仓库区域
export async function findByPlatformId(params: any) {
  return request(`${baseUrl}/sysPlatformRegion/findByPlatformId`, {
    method: 'GET',
    params,
  });
}

// ------云仓仓库管理--------
// 列表 有翻页
export async function sysCloudWarehousingCloudPage(data: any) {
  return request(`${baseUrl}/sysCloudWarehousing/cloudPage`, {
    method: 'POST',
    data,
  });
}
// 手动同步
export async function sysCloudWarehousingSyn(params: any) {
  return request(`${baseUrl}/sysCloudWarehousing/syn`, {
    method: 'POST',
    params,
  });
}
// 设置默认快递公司
export async function sysCloudWarehousingUpdateExpress(data: any) {
  return request(`${baseUrl}/sysCloudWarehousing/updateExpress`, {
    method: 'POST',
    data,
  });
}

// ------港口管理--------
// 港口管理 - 列表 有翻页
export async function getSysPortPage(data: any) {
  return request(`${baseUrl}/sysPort/page`, {
    method: 'POST',
    data,
  });
}
// 港口管理 - ID 查询
export async function getSysPortById(params: any) {
  return request(`${baseUrl}/sysPort/findById`, {
    method: 'POST',
    params,
  });
}
// 港口管理 - 列表 添加
export async function addSysPort(data: any) {
  return request(`${baseUrl}/sysPort/insert`, {
    method: 'POST',
    data,
  });
}
// 港口管理 - 列表 修改
export async function updateSysPort(data: any) {
  return request(`${baseUrl}/sysPort/update`, {
    method: 'POST',
    data,
  });
}
// ------中转仓--------
export async function tcPage(data: any) {
  return request(`${baseUrl}/sysPlatformTc/page`, {
    method: 'POST',
    data,
  });
}
export async function tcInsert(data: any) {
  return request(`${baseUrl}/sysPlatformTc/insert`, {
    method: 'POST',
    data,
  });
}
export async function tcUpdate(data: any) {
  return request(`${baseUrl}/sysPlatformTc/updateById`, {
    method: 'POST',
    data,
  });
}
export async function tcImport(data: any) {
  return request(`${baseUrl}/sysPlatformTc/batchImport`, {
    method: 'POST',
    data,
  });
}
// 导入 起运港
export async function importFile(data: any) {
  return request(`${baseUrl}/sysPort/importDeparture`, {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}

export async function batchClearSelectVendor(params: any) {
  return request(`${baseUrl}/warehousingOrder/batchClearSelectVendor`, {
    method: 'POST',
    params,
  });
}


// 批量操作已发货
export async function batchUpdateLogisticsOrderNo(data: any) {
  return request(`${baseUrl}/warehousingOrder/batchUpdateLogisticsOrderNo`, {
    method: 'POST',
    data,
  });
}
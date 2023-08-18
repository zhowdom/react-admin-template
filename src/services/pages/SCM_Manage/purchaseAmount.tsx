import { request } from 'umi';
const baseUrl = '/sc-scm';
// 查询供采购单列表
export async function getList(data: any) {
  return request(`${baseUrl}/purchaseOrder/page`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/purchaseOrder/exportPurchase`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 查看详情
export async function getDetail(params: any) {
  return request(`${baseUrl}/purchaseOrder/findById`, {
    method: 'GET',
    params,
  });
}
// 添加备注
export async function insertRemarks(params: any) {
  return request(`${baseUrl}/purchaseOrder/insertRemarks`, {
    method: 'GET',
    params,
  });
}
// 编辑
export async function edit(data: any) {
  return request(`${baseUrl}/purchaseOrder/updateById`, {
    method: 'POST',
    data,
  });
}
// 修改并审核
export async function updateAndSubmit(data: any) {
  return request(`${baseUrl}/purchaseOrder/updateAndSubmit`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function update(data: any) {
  return request(`/${baseUrl}/purchaseOrder/specialUpdateById`, {
    method: 'POST',
    data,
  });
}
// 生成采购单 根据SKUids和供应商ID 得到SKU的价格
export async function findBySku(data: any) {
  return request(`${baseUrl}/goodsSkuVendor/findBySku`, {
    method: 'POST',
    data,
  });
}
// 生成采购单 根据商品skuid查询对于的供应商信息  goodsSkuId
export async function findGoodsSkuIdToSameVender(params: any) {
  return request(`${baseUrl}/goodsSkuVendor/findGoodsSkuIdToSameVender`, {
    method: 'POST',
    params,
  });
}
// 生成采购单 (单个供应商)查询某个供应商下面所有在有效期内的签约主体
export async function findValidVendorToSubject(params: any) {
  return request(`${baseUrl}/vendorContract/findValidVendorToSubject`, {
    method: 'POST',
    params,
  });
}
// 转让记录
export async function turnList(params: any) {
  return request(`${baseUrl}/purchaseOrderTransferHistory/listByOrderId`, {
    method: 'GET',
    params,
  });
}
//订单数量明细
export async function testOrderList(params: any) {
  return request(`${baseUrl}/purchaseOrder/warehousingDetail`, {
    method: 'GET',
    params,
  });
}
//入库数量明细
export async function testStockList(data: any) {
  return request(`${baseUrl}/warehousingOrder/page`, {
    method: 'POST',
    data,
  });
}

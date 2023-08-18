import { request } from 'umi';
const baseUrl = '/sc-scm';
// 查询国内采购计划列表
export async function getPlanList(data: any) {
  return request(`${baseUrl}/purchasePlan/page`, {
    method: 'POST',
    data,
  });
}
// 采购计划 根据id查询
export async function getPlanfindById(params: any) {
  return request(`${baseUrl}/purchasePlan/findById`, {
    method: 'POST',
    params,
  });
}
// 采购计划 添加
export async function planInsert(data: any) {
  return request(`${baseUrl}/purchasePlan/insert`, {
    method: 'POST',
    data,
  });
}
// 采购计划 编辑
export async function planUpdateById(data: any) {
  return request(`${baseUrl}/purchasePlan/updateById`, {
    method: 'POST',
    data,
  });
}

// 采购计划 提交审核
export async function planSubmit(params: any) {
  return request(`${baseUrl}/purchasePlan/submit`, {
    method: 'POST',
    params,
  });
}
// 采购计划 审核通过
export async function planAgree(params: any) {
  return request(`${baseUrl}/purchasePlan/agree`, {
    method: 'POST',
    params,
  });
}
// 采购计划 审批不通过
export async function planRefuse(params: any) {
  return request(`${baseUrl}/purchasePlan/refuse`, {
    method: 'POST',
    params,
  });
}
// 采购计划 作废 新建和不通过时 作废
export async function planNullify(params: any) {
  return request(`${baseUrl}/purchasePlan/nullify`, {
    method: 'POST',
    params,
  });
}
// 采购计划 作废 审批通过后作废
export async function afterReviewNullify(params: any) {
  return request(`${baseUrl}/purchasePlan/afterReviewNullify`, {
    method: 'POST',
    params,
  });
}
// 采购计划 批量导入
export async function planBatchImport(data: any) {
  return request(`${baseUrl}/purchasePlan/batchImport`, {
    method: 'POST',
    responseType: 'blob',
    data,
    getResponse: true,
  });
}
// 审核明细
export async function approvalDetailHistory(params: any) {
  return request(`${baseUrl}/purchasePlan/approvalDetailHistory`, {
    method: 'GET',
    params,
  });
}

// 生成采购单 生成采购单准备数据(单个供应商) 用计划ID查 planIds
export async function findSinglePurchaseOrderData(params: any) {
  return request(`${baseUrl}/purchasePlan/findSinglePurchaseOrderData`, {
    method: 'POST',
    params,
  });
}
// 生成采购单 根据商品skuid查询对于的供应商信息  goodsSkuId
export async function findGoodsSkuIdToSameVender(params: any) {
  return request(`${baseUrl}/goodsSkuVendor/findGoodsSkuIdToSameVender`, {
    method: 'POST',
    params,
  });
}
// 生成采购单 根据SKUids和供应商ID 得到SKU的价格
export async function findBySku(data: any) {
  return request(`${baseUrl}/goodsSkuVendor/findBySku`, {
    method: 'POST',
    data,
  });
}

// 生成采购单 提交
export async function saveOrderByPlan(data: any) {
  return request(`${baseUrl}/purchaseOrder/insert`, {
    method: 'POST',
    data,
  });
}
// 生成采购单 提交并审核
export async function saveOrderAuditByPlan(data: any) {
  return request(`${baseUrl}/purchaseOrder/insertAndSubmit`, {
    method: 'POST',
    data,
  });
}

// 生成采购单 (单个供应商)查询某个供应商下面所有在有效期内的签约主体
export async function findValidVendorToSubject(params: any) {
  return request(`${baseUrl}/vendorContract/findValidVendorToSubject`, {
    method: 'POST',
    params,
  });
}

// 生成采购单 (多个供应商)生成采购单准备数据(单个供应商) 用计划ID 供应商ID查
export async function findMorePurchaseOrderData(params: any) {
  return request(`${baseUrl}/purchasePlan/findMorePurchaseOrderData`, {
    method: 'POST',
    params,
  });
}

// 导出采购计划
export async function exportPurchasePlan(data: any) {
  return request(`/sc-scm/purchasePlan/exportPurchasePlan`, {
    method: 'POST',
    responseType: 'blob',
    data,
    getResponse: true,
  });
}
// 查询跨境采购计划列表
export async function getInPlanList(data: any) {
  return request(`${baseUrl}/purchasePlan/inPage`, {
    method: 'POST',
    data,
  });
}
// 采购计划数据统计
export async function statusCount(data: any) {
  return request('/sc-scm/purchasePlan/statusCount', {
    method: 'POST',
    data,
  });
}
// 采购计划撤回
export async function terminate(params: any) {
  return request('/sc-scm/purchasePlan/terminate', {
    method: 'GET',
    params,
  });
}
// 采购计划 修改
export async function planEditById(data: any) {
  return request(`${baseUrl}/purchasePlan/editById`, {
    method: 'POST',
    data,
  });
}
// 采购单
export async function listByPurchasePlanId(params: any) {
  return request('/sc-scm/purchaseOrder/listByPurchasePlanId', {
    method: 'GET',
    params,
  });
}

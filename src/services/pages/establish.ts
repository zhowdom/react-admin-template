import { request } from 'umi';
// 查询立项商品列表
export async function getList(data: any) {
  return request('/sc-scm/projects/page', {
    method: 'POST',
    data,
  });
}
// 添加立项
export async function addEstablish(data: any, dId?: any) {
  return request('/sc-scm/goods/insert', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 修改立项
export async function updateEstablish(data: any, dId?: any) {
  return request('/sc-scm/projects/updateSubmit', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}

// 添加定稿
export async function addFinal(data: any, dId?: any) {
  return request('/sc-scm/projects/finalized', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 获取详情
export async function getDetail(params: any) {
  return request('/sc-scm/projects/findById', {
    method: 'GET',
    params,
  });
}
// 删除立项
export async function deleteById(params: any) {
  return request('/sc-scm/projects/deleteById', {
    method: 'GET',
    params,
  });
}

// 历史审批
export async function approvalHistory(params: any) {
  return request('/sc-scm/projects/sysApprovalHistory', {
    method: 'GET',
    params,
  });
}
// 开模申请
export async function mouldApply(data: any, dId?: any) {
  return request('/sc-scm/purchaseSampleOrder/mouldApply', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 撤回立项
export async function cancelEs(params: any) {
  return request('/sc-scm/projects/terminate', {
    method: 'GET',
    params,
  });
}
// 撤回定稿
export async function cancelFin(params: any) {
  return request('/sc-scm/projects/finalizedTerminate', {
    method: 'GET',
    params,
  });
}
// 撤回价格审批
export async function cancelPriceApproval(params: any) {
  return request('/sc-scm/priceApproval/terminate', {
    method: 'GET',
    params,
  });
}
// 获取款式详情
export async function getSkuDetail(params: any) {
  return request('/sc-scm/goods/addStyleDetail', {
    method: 'GET',
    params,
  });
}
// 获取迭代详情
export async function getIterateDetail(params: any) {
  return request('/sc-scm/goods/iterateDetail', {
    method: 'GET',
    params,
  });
}
// 查询箱规信息
export async function getSpecification(params: any) {
  return request('/sc-scm/projectsSample/getSpecification', {
    method: 'GET',
    params,
  });
}
// 修改箱规
export async function updateSpecification(data: any) {
  return request('/sc-scm/projectsSample/updateSpecification', {
    method: 'POST',
    data,
  });
}
//产品信息导出
export async function productInfoExport(data: any) {
  return request('/sc-scm/projects/export', {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
//获取页签
export async function statusCount(data: any) {
  return request('/sc-scm/projects/getBookmarks', {
    method: 'POST',
    data,
  });
}
// 校验产品英文简称
export async function checkEnShortName(data: any) {
  return request('/sc-scm/projects/checkEnShortName', {
    method: 'POST',
    data,
  });
}
// 校验产品Code
export async function checkGoodsCode(data: any) {
  return request('/sc-scm/projects/checkGoodsCode', {
    method: 'POST',
    data,
  });
}
// 获取品牌下拉
export async function allGoodsSkuBrand(data: any) {
  return request('/sc-scm/goodsSkuBrand/allGoodsSkuBrand', {
    method: 'POST',
    data,
  });
}
// 立项草稿
export async function saveProjectDraft(data: any) {
  return request('/sc-scm/projects/saveProjectDraft', {
    method: 'POST',
    data,
  });
}
// 草稿定稿
export async function saveFinalizedDraft(data: any) {
  return request('/sc-scm/projects/saveFinalizedDraft', {
    method: 'POST',
    data,
  });
}
// 检查产品尺寸
export async function calculateProductValuationTypeAndFba(data: any) {
  return request('/sc-scm/productCalculated/calculateProductValuationTypeAndFba', {
    method: 'POST',
    data,
  });
}

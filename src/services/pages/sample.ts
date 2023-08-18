import { request } from 'umi';
// 查询样品单列表
export async function getList(data: any) {
  return request('/sc-scm/purchaseSampleOrder/page', {
    method: 'POST',
    data,
  });
}
// 新增样品单
export async function insert(data: any) {
  return request('/sc-scm/purchaseSampleOrder/insert', {
    method: 'POST',
    data,
  });
}
// 获取详情
export async function getDetail(params: any) {
  return request('/sc-scm/purchaseSampleOrder/findById', {
    method: 'GET',
    params,
  });
}
// 请款获取详情
export async function requestFundsDetail(params: any) {
  return request('/sc-scm/purchaseSampleOrder/requestFunds', {
    method: 'GET',
    params,
  });
}
// 请款记录历史
export async function requestFundsHistory(params: any) {
  return request('/sc-scm/purchaseSampleOrder/requestFundsHistory', {
    method: 'GET',
    params,
  });
}
// 请款提交
export async function requestFundsSubmit(data: any, dId?: any) {
  return request('/sc-scm/purchaseSampleOrder/requestFundsSubmit', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 查询sku
export async function getSkusList(data: any) {
  return request('/sc-scm/purchaseSampleOrder/projectsGoodsSkuPage', {
    method: 'POST',
    data,
  });
}
// 编辑样品单
export async function update(data: any) {
  return request('/sc-scm/purchaseSampleOrder/update', {
    method: 'POST',
    data,
  });
}
// 历史审批
export async function approvalHistory(params: any) {
  return request('/sc-scm/purchaseSampleOrder/sysApprovalHistory', {
    method: 'GET',
    params,
  });
}
// 删除
export async function deleteById(params: any) {
  return request('/sc-scm/purchaseSampleOrder/deleteById', {
    method: 'GET',
    params,
  });
}
// 提交审批
export async function submitApproval(data: any) {
  return request('/sc-scm/purchaseSampleOrder/submitApproval', {
    method: 'GET',
    data,
  });
}
// 撤回审批
export async function terminate(params: any) {
  return request('/sc-scm/purchaseSampleOrder/terminate', {
    method: 'GET',
    params,
  });
}
// 添加并审核
export async function insertSubmit(data: any, dId?: any) {
  return request('/sc-scm/purchaseSampleOrder/insertSubmit', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 修改并审核
export async function updateSubmit(data: any, dId?: any) {
  return request('/sc-scm/purchaseSampleOrder/updateSubmit', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 获取产品下拉
export async function getGoods(data: any) {
  return request('/sc-scm/goods/page', {
    method: 'POST',
    data,
  });
}
// 获取sku
export async function getSkus(data: any) {
  return request('/sc-scm/goodsSkuVendor/page', {
    method: 'POST',
    data,
  });
}
// 开模获取sku
export async function getSkusM(data: any) {
  return request('/sc-scm/goodsSku/page', {
    method: 'POST',
    data,
  });
}
// 请款记录详情
export async function requestDetail(params: any) {
  return request('/sc-scm/purchaseSampleOrder/requestFundsDetail', {
    method: 'GET',
    params,
  });
}
// 立项sku
export async function getEsSkus(params: any) {
  return request('/sc-scm/projects/findProjectsGoodsSku', {
    method: 'GET',
    params,
  });
}

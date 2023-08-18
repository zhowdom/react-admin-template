import { request } from 'umi';
// 查询立项商品列表
export async function getList(data: any) {
  return request('/sc-scm/goods/page', {
    method: 'POST',
    data,
  });
}
// 获取详情
export async function getDetail(params: any) {
  return request('/sc-scm/goods/findById', {
    method: 'GET',
    params,
  });
}
// 入库记录
export async function getWarehousingRecord(params: { goods_sku_id: string }) {
  return request('/sc-scm/goods/listWarehousingRecord', {
    method: 'GET',
    params,
  });
}
// 修改商品条码
export async function updateBarCode(data: any) {
  return request('/sc-scm/goods/updateBarCode', {
    method: 'POST',
    data,
  });
}
// 测试期评审标准
export async function updateGoodsReviewStandard(params: any) {
  return request('/sc-scm/goods/updateGoodsReviewStandard', {
    method: 'GET',
    params,
  });
}
export async function getReviewStandard(params?: any) {
  return request('/sc-scm/goods/getReviewStandard', {
    method: 'GET',
    params,
  });
}
// 产品管理 - 发起评审
export async function initiateReview(params: any) {
  return request('/sc-scm/goods/initiateReview', {
    method: 'GET',
    params,
  });
}
// 修改箱规
export async function updateGoodsSkuSpecification(data: any) {
  return request('/sc-scm/goods/updateGoodsSkuSpecification', {
    method: 'POST',
    data,
  });
}
// 修改款式信息
export async function updateGoods(data: any) {
  return request('/sc-scm/goods/updateGoods', {
    method: 'POST',
    data,
  });
}
// 定价计算
export async function pricingCalculation(data: any) {
  return request('/sc-scm/productCalculated/pricingCalculation', {
    method: 'POST',
    data,
  });
}
// 产品列表数据统计
export async function statusCount(data: any) {
  return request('/sc-scm/goods/getBookmarks', {
    method: 'POST',
    data,
  });
}
// 获取日志
export async function getLogist(params: any) {
  return request('/sc-scm/goods/changeFieldHistory', {
    method: 'GET',
    params,
  });
}
// 国内采购商品-操作日志
export async function getLogistCNGoods(params: any) {
  return request('/sc-scm/goodsSku/changeFieldHistory', {
    method: 'GET',
    params,
  });
}
// 获取确认评审结果详情
export async function getReviewDetail(params: any) {
  return request('/sc-scm/goods/getReviewDetail', {
    method: 'GET',
    params,
  });
}
// 确认评审结果
export async function confirmReviewResult(data: any) {
  return request('/sc-scm/goods/confirmReviewResult', {
    method: 'POST',
    data,
  });
}

// 配送类型同步到ERP
export async function synSendKingToErp(data: any) {
  return request('/sc-scm/goods/synSendKingToErp', {
    method: 'POST',
    data,
  });
}
// 当前产品有未完结的版本迭代流程
export async function checkConductProject(params: any) {
  return request('/sc-scm/projects/checkConductProject', {
    method: 'GET',
    params,
  });
}
// 评审日志
export async function getReviewHistory(data: any) {
  return request('/sc-scm/goods/getReviewHistory', {
    method: 'POST',
    data,
  });
}
// 产品尺寸类型（详情页）
export async function calculateProductValuationTypes(params: any) {
  return request('/sc-scm/productCalculated/calculateProductValuationTypes', {
    method: 'get',
    params,
  });
}

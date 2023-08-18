import { request } from 'umi';
const baseUrl = '/sc-scm/';
// 查询链接列表
export async function getList(data: any) {
  return request(`${baseUrl}linkManagement/page`, {
    method: 'POST',
    data,
  });
}
// 获取待审批列表数据
export async function shippingMethodApprovalPage(data: any) {
  return request(`${baseUrl}linkManagement/shippingMethodApprovalPage`, {
    method: 'POST',
    data,
  });
}
//添加链接
export async function insertLink(data: any) {
  return request(`${baseUrl}linkManagement/insert`, {
    method: 'POST',
    data,
  });
}
// 通过sku code查询name
export async function findBySku(sku_code: any) {
  return request(`${baseUrl}goodsSku/findBySku?sku=${sku_code}`, {
    method: 'GET',
  });
}
// 批量变更推广
export async function batchChangeSpread(params: any) {
  return request(`${baseUrl}linkManagement/batchUpdateSpreadUser`, {
    method: 'GET',
    params,
  });
}
// 根据推广人查询链接管理
export async function findLinkBySpreadUserId(params: any) {
  return request(`${baseUrl}linkManagement/findLinkBySpreadUserId`, {
    method: 'GET',
    params,
  });
}
// 变更单个推广
export async function updateSpreadUser(params: any) {
  return request(`${baseUrl}linkManagement/updateSpreadUser`, {
    method: 'GET',
    params,
  });
}
//添加sku
export async function insertLinkSku(data: any) {
  return request(`${baseUrl}linkManagement/insertLinkSku`, {
    method: 'POST',
    data,
  });
}
// 链接同步
export async function linkSync(params: any) {
  return request(`${baseUrl}linkManagement/linkSync`, {
    method: 'GET',
    params,
  });
}
// 周期日志
export async function findReviewHistory(params: any) {
  return request(`${baseUrl}linkManagement/findReviewHistory`, {
    method: 'GET',
    params,
  });
}
// 查询周期评审标准
export async function getReviewStandard(params: any) {
  return request(`${baseUrl}linkManagement/getReviewStandard`, {
    method: 'GET',
    params,
  });
}
// 更新周期评审标准
export async function updateReviewStandard(params: any) {
  return request(`${baseUrl}linkManagement/updateReviewStandard`, {
    method: 'GET',
    params,
  });
}
// 转入待评审
export async function transferInReview(data: any) {
  return request(`${baseUrl}linkManagement/transferInReview`, {
    method: 'POST',
    data,
  });
}
// 待评审分页
export async function reviewPage(data: any) {
  return request(`${baseUrl}linkManagement/reviewPage`, {
    method: 'POST',
    data,
  });
}
// 亚马逊上传条码
export async function uploadSkuFiles(data: any) {
  return request(`${baseUrl}linkManagement/uploadSkuFiles`, {
    method: 'POST',
    data,
  });
}
// 获取统计数量
export async function findLinkManagementStatistics(params: any) {
  return request(`${baseUrl}linkManagement/findLinkManagementStatistics`, {
    method: 'GET',
    params,
  });
}
// 主键查询
export async function findById(params: any) {
  return request(`${baseUrl}linkManagement/findById`, {
    method: 'GET',
    params,
  });
}
// 同步
export async function syncSku(data: any) {
  return request(`${baseUrl}linkManagement/syncSku`, {
    method: 'POST',
    data,
  });
}
// 更新对应关系
export async function uploadCorrespondRelation(data: any) {
  return request(`${baseUrl}linkManagement/uploadCorrespondRelation`, {
    method: 'POST',
    data,
  });
}
// 更新评审结果
export async function updateReviewResult(data: any) {
  return request(`${baseUrl}linkManagement/updateReviewResult`, {
    method: 'POST',
    data,
  });
}
// 下架
export async function skuSoldOut(data: any) {
  return request(`${baseUrl}linkManagement/skuSoldOut`, {
    method: 'POST',
    data,
  });
}
// 修改价格
export async function updatePrice(data: any) {
  return request(`${baseUrl}linkManagement/updatePrice`, {
    method: 'POST',
    data,
  });
}
// 链接合并
export async function linkMerge(data: any) {
  return request(`${baseUrl}linkManagement/linkMerge`, {
    method: 'POST',
    data,
  });
}
// 链接拆分
export async function linkSplit(data: any) {
  return request(`${baseUrl}linkManagement/linkSplit`, {
    method: 'POST',
    data,
  });
}
// 评审结果页面查询
export async function findReviewHistoryById(params: any) {
  return request(`${baseUrl}linkManagement/findReviewHistoryById`, {
    method: 'GET',
    params,
  });
}

// 导出sku
export async function exportSku(data: any) {
  return request(`${baseUrl}linkManagement/exportSku`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 修改产品线
export async function updateCategoryId(params: any) {
  return request(`${baseUrl}linkManagement/updateCategoryId`, {
    method: 'GET',
    params,
  });
}
// 修改sku跨境安全库存天数
export async function updateSafeDays(data: any) {
  return request(`${baseUrl}linkManagement/updateSafeDays`, {
    method: 'POST',
    data,
  });
}
// 运输方式审批
export async function shippingMethodApproval(data: any) {
  return request(`${baseUrl}linkManagement/shippingMethodApproval`, {
    method: 'POST',
    data,
  });
}
// 撤销 - 运输方式申请
export async function shippingMethodApprovalTerminate(data: any) {
  return request(`${baseUrl}linkManagement/shippingMethodApprovalTerminate`, {
    method: 'POST',
    data,
  });
}
// 查看运输方式变更历史
export async function shippingMethodApprovalHistory(params: any) {
  return request(`${baseUrl}linkManagement/shippingMethodApprovalHistory`, {
    method: 'GET',
    params,
  });
}

// 安全库存-全部-列表
export async function shippingMethodAllPage(data: any) {
  return request(`${baseUrl}linkManagement/shippingMethodAllPage`, {
    method: 'POST',
    data,
  });
}
// 批量修改运输方式校验接口
export async function validShippingMethod(data: any) {
  return request(`${baseUrl}linkManagement/validShippingMethod`, {
    method: 'POST',
    data,
  });
}
// 批量修改运输方式提交接口
export async function updateShippingMethod(data: any) {
  return request(`${baseUrl}linkManagement/updateShippingMethod`, {
    method: 'POST',
    data,
  });
}

// 全部导出
export async function shippingMethodAllExport(data: any) {
  return request(`${baseUrl}linkManagement/shippingMethodAllExport`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 待审批导出
export async function shippingMethodApprovalExport(data: any) {
  return request(`${baseUrl}linkManagement/shippingMethodApprovalExport`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}

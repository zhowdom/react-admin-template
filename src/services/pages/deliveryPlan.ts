import { request } from 'umi';
// 查询发货计划列表
export async function getList(data: any) {
  return request('/sc-scm/deliveryPlan/page', {
    method: 'POST',
    data,
  });
}
// 查询发货计划待审核数量
export async function waitApprovalStatusCount() {
  return request('/sc-scm/deliveryPlan/waitApprovalStatusCount', {
    method: 'POST',
  });
}
// 提交审核
export async function planSubmit(params: any) {
  return request('/sc-scm/deliveryPlan/submit', {
    method: 'GET',
    params,
  });
}
// 审核通过
export async function agree(params: any) {
  return request('/sc-scm/deliveryPlan/agree', {
    method: 'GET',
    params,
  });
}
// 审核不通过
export async function refuse(params: any) {
  return request('/sc-scm/deliveryPlan/refuse', {
    method: 'GET',
    params,
  });
}
// 作废
export async function nullify(params: any) {
  return request('/sc-scm/deliveryPlan/nullify', {
    method: 'GET',
    params,
  });
}
// 作废 - 审核通过的发货计划
export async function nullifyApproved(params: any) {
  return request('/sc-scm/deliveryPlan/nullifyApproved', {
    method: 'GET',
    params,
  });
}
// 添加发货计划
export async function addPlan(data: any) {
  return request('/sc-scm/deliveryPlan/insert', {
    method: 'POST',
    data,
  });
}
// 发货计划 批量导入
export async function planBatchImport(data: any) {
  return request(`/sc-scm/deliveryPlan/import`, {
    method: 'POST',
    data,
  });
}
// 编辑发货计划
export async function editPlan(data: any) {
  return request('/sc-scm/deliveryPlan/updateById', {
    method: 'POST',
    data,
  });
}
// 编辑 添加发货计划时 检查SKU是否是继承的，和数量有没有问题
export async function beforeInheritanceNum(params: any) {
  return request('/sc-scm/deliveryPlan/beforeInheritanceNum', {
    method: 'GET',
    params,
  });
}

// 生成入库单
export async function createWarehousingByPlan(params: any) {
  return request('/sc-scm/deliveryPlan/createWarehousingByPlan', {
    method: 'GET',
    params,
  });
}

/*合并创建入库单-国内-云仓-相同SKU*/
export async function mergeCreateWarehousingByPlanYunCang(params: any) {
  return request('/sc-scm/deliveryPlan/mergeCreateWarehousingByPlanYunCang', {
    method: 'GET',
    params,
  });
}
/*合并创建入库单-跨境-相同SKU*/
export async function mergeCreateWarehousingByPlanIn(params: any) {
  return request('/sc-scm/deliveryPlan/mergeCreateWarehousingByPlanIn', {
    method: 'GET',
    params,
  });
}
// 查询明细
export async function listByPlanId(params: any) {
  return request('/sc-scm/deliveryPlanDetail/listByPlanId', {
    method: 'GET',
    params,
  });
}
// 审批信息
export async function approvalDetailHistory(params: any) {
  return request('/sc-scm/deliveryPlan/approvalDetailHistory', {
    method: 'GET',
    params,
  });
}
// 明细修改
export async function updateById(data: any) {
  return request('/sc-scm/deliveryPlanDetail/updateById', {
    method: 'POST',
    data,
  });
}
// 根据店铺id查询SKU下拉
export async function freeListLinkManagementSkuByShopId(params: any) {
  return request('/sc-scm/linkManagement/freeListLinkManagementSkuByShopId', {
    method: 'GET',
    params,
  });
}
// 根据店铺id查询SKU下拉 采购计划新增 跨境使用
export async function freeListLinkManagementSku(params: any) {
  return request('/sc-scm/linkManagement/freeListLinkManagementSku', {
    method: 'GET',
    params,
  });
}
// 国内发货计划导出
export async function exportDeliveryPlanCn(data: any) {
  return request(`/sc-scm/deliveryPlan/exportDeliveryPlanCn`, {
    method: 'POST',
    responseType: 'blob',
    data,
    getResponse: true,
  });
}
// 跨境发货计划导出
export async function exportDeliveryPlanIn(data: any) {
  return request(`/sc-scm/deliveryPlan/exportDeliveryPlanIn`, {
    method: 'POST',
    responseType: 'blob',
    data,
    getResponse: true,
  });
}
// 发货计划数据统计
export async function statusCount(data: any) {
  return request('/sc-scm/deliveryPlan/statusCount', {
    method: 'POST',
    data,
  });
}
// 发货计划撤回
export async function terminate(params: any) {
  return request('/sc-scm/deliveryPlan/terminate', {
    method: 'GET',
    params,
  });
}
// 采购计划 修改
export async function planEditById(data: any) {
  return request(`/sc-scm/deliveryPlan/editById`, {
    method: 'POST',
    data,
  });
}
// 查询入库单
export async function getStockList(params: any) {
  return request(`/sc-scm/warehousingOrder/findWarehousingOrderByDeliveryPlanQty`, {
    method: 'GET',
    params,
  });
}
// 添加云仓
export async function insertYunCang(data: any) {
  return request('/sc-scm/deliveryPlan/insertYunCang', {
    method: 'POST',
    data,
  });
}

// 生成入库单云仓
export async function createWarehousingByPlanYunCang(params: any) {
  return request('/sc-scm/deliveryPlan/createWarehousingByPlanYunCang', {
    method: 'GET',
    params,
  });
}

// 云仓发货计划导出
export async function exportDeliveryPlanYunCang(data: any) {
  return request(`/sc-scm/deliveryPlan/exportDeliveryPlanYunCang`, {
    method: 'POST',
    responseType: 'blob',
    data,
    getResponse: true,
  });
}
// 批量创建入库单
export async function createWarehousing(data: any) {
  return request('/sc-scm/deliveryPlan/createWarehousing', {
    method: 'POST',
    data,
  });
}
// 获取天使
export async function getDays(data: any) {
  return request('/sc-scm/logisticsTimeManage/getLogisticsTimeManageInDay', {
    method: 'POST',
    data,
  });
}
// 批量修改入库单物流信息
export async function updateLogisticsByWarehousingOrder(data: any) {
  return request('/sc-scm/deliveryPlan/updateLogisticsByWarehousingOrder', {
    method: 'POST',
    data,
  });
}
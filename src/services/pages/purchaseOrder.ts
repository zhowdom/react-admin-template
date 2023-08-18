import { request } from 'umi';
// 查询采购订单列表
export async function getList(data: any) {
  return request('/sc-scm/purchaseOrder/page', {
    method: 'POST',
    data,
  });
}
// 提交审核
export async function orderSubmit(params: any) {
  return request('/sc-scm/purchaseOrder/submit', {
    method: 'GET',
    params,
  });
}
// 审核通过
export async function agree(params: any) {
  return request('/sc-scm/purchaseOrder/agree', {
    method: 'GET',
    params,
  });
}
// 审核不通过
export async function refuse(params: any) {
  return request('/sc-scm/purchaseOrder/refuse', {
    method: 'GET',
    params,
  });
}
// 作废
export async function nullify(params: any) {
  return request('/sc-scm/purchaseOrder/nullify', {
    method: 'GET',
    params,
  });
}

// 转出
export async function transfer(params: any) {
  return request('/sc-scm/purchaseOrder/transfer', {
    method: 'GET',
    params,
  });
}
// 导出采购明细
export async function exportExcel(data: any) {
  const url = {
    sku: 'purchaseOrder/exportSku', // 采购明细
    delivery: 'purchaseOrder/exportWarehousing', // 发货明细
    order: 'purchaseOrder/exportPurchase',
    poZip: 'purchaseOrder/exportPurchaseOrderZip' // 批量po单
  };
  const path = url?.[data.key];
  return request(`/sc-scm/${path}`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
    timeout: 86400000,
  });
}
// 导出pdf
export async function exportPdf(params: any) {
  return request(`/sc-scm/purchaseOrder/exportPdf`, {
    method: 'GET',
    responseType: 'blob',
    params,
    getResponse: true,
  });
}

// 同步到供应商
export async function syncVendor(params: any) {
  return request('/sc-scm/purchaseOrder/syncVendor', {
    method: 'GET',
    params,
  });
}
// 从供应商撤回
export async function withdraw(params: any) {
  return request('/sc-scm/purchaseOrder/withdraw', {
    method: 'GET',
    params,
  });
}
// 取消从供应商撤回
export async function cancelWithdraw(params: any) {
  return request('/sc-scm/purchaseOrder/cancelWithdraw', {
    method: 'GET',
    params,
  });
}
// 状态流转记录
export async function approvalDetailHistory(params: any) {
  return request('/sc-scm/purchaseOrder/approvalDetailHistory', {
    method: 'GET',
    params,
  });
}
// 修改记录查询
export async function sysChangeFieldHistory(params: any) {
  return request('/sc-scm/purchaseOrder/sysChangeFieldHistory', {
    method: 'GET',
    params,
  });
}

// 采购请款列表查询
export async function getAskList(params: any) {
  return request('/sc-scm/purchaseOrderRequestFunds/listByOrderId', {
    method: 'GET',
    params,
  });
}
// 添加扣款
export async function addDeduction(data: any) {
  return request('/sc-scm/sysBusinessDeduction/insert', {
    method: 'POST',
    data,
  });
}

// 扣款列表查询
export async function getDeductionList(params: any) {
  return request('/sc-scm/sysBusinessDeduction/listByOrderId', {
    method: 'GET',
    params,
  });
}

// 添加请款
export async function addAsk(data: any) {
  return request('/sc-scm/purchaseOrderRequestFunds/insert', {
    method: 'POST',
    data,
  });
}
// 查看详情
export async function getDetail(params: any) {
  return request('/sc-scm/purchaseOrder/findById', {
    method: 'GET',
    params,
  });
}
// 添加备注
export async function insertRemarks(params: any) {
  return request('/sc-scm/purchaseOrder/insertRemarks', {
    method: 'GET',
    params,
  });
}
// 编辑
export async function edit(data: any) {
  return request('/sc-scm/purchaseOrder/updateById', {
    method: 'POST',
    data,
  });
}
// 修改并审核
export async function updateAndSubmit(data: any) {
  return request('/sc-scm/purchaseOrder/updateAndSubmit', {
    method: 'POST',
    data,
  });
}
// 修改
export async function update(data: any) {
  return request('/sc-scm/purchaseOrder/specialUpdateById', {
    method: 'POST',
    data,
  });
}
// 转让记录
export async function turnList(params: any) {
  return request('/sc-scm/purchaseOrderTransferHistory/listByOrderId', {
    method: 'GET',
    params,
  });
}
// 请款详情
export async function requestDetail(params: any) {
  return request('/sc-scm/purchaseOrderRequestFunds/beforePurchaseOrderRequestFunds', {
    method: 'GET',
    params,
  });
}
// 暂停对账
export async function disableReconciliation(params: any) {
  return request('/sc-scm/purchaseOrder/disableReconciliation', {
    method: 'GET',
    params,
  });
}
// 恢复对账
export async function enableReconciliation(params: any) {
  return request('/sc-scm/purchaseOrder/enableReconciliation', {
    method: 'GET',
    params,
  });
}
// 查询入库明细
export async function getDeliveryList(params: any) {
  return request('/sc-scm/purchaseOrder/warehousingDetail', {
    method: 'GET',
    params,
  });
}
// 异常处理
export async function exceptionHandling(params: any) {
  return request('/sc-scm/purchaseOrder/exceptionHandling', {
    method: 'GET',
    params,
  });
}

// 待签约时，代供应商上传签约文件
export async function uploadSignFile(data: any) {
  return request('/sc-scm/purchaseOrder/uploadSignFile', {
    method: 'POST',
    data,
  });
}
// 采购单数据统计
export async function statusCount(data: any) {
  return request('/sc-scm/purchaseOrder/statusCount', {
    method: 'POST',
    data,
  });
}

// 采购详情 采购历史查看
export async function historyByPurchaseOrderSkuId(data: any) {
  return request('/sc-scm/purchaseOrder/historyByPurchaseOrderSkuId', {
    method: 'POST',
    data,
  });
}
// 变更采购单
export async function specialUpdateById(data: any) {
  return request('/sc-scm/purchaseOrderChangeHistory/insert', {
    method: 'POST',
    data,
  });
}
// 删除
export async function deleteById(params: any) {
  return request('/sc-scm/purchaseOrder/deleteById', {
    method: 'GET',
    params,
  });
}
// 撤回提交审核
export async function cancelSubmit(params: any) {
  return request('/sc-scm/purchaseOrder/revokeSubmit', {
    method: 'GET',
    params,
  });
}
// 退回到新建状态
export async function revokeToNew(params: any) {
  return request('/sc-scm/purchaseOrder/revokeToNew', {
    method: 'GET',
    params,
  });
}
// 待签约时，代供应商上传签约文件-R
export async function uploadSignFileR(data: any) {
  return request('/sc-scm/specialApproval/uploadSignFile', {
    method: 'POST',
    data,
  });
}

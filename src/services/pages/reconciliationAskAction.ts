import { request } from 'umi';
const baseUrl = '/sc-scm';
// 查询页签
export async function getBookmarks(params: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/getBookmarks`, {
    method: 'POST',
    params,
  });
}
// 分页列表
export async function getPurchaseOrderRequestFundsPage(data: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/page`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function purchaseOrderRequestFundsExport(data: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/export`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 查询详情
export async function purchaseOrderGetDetailById(params: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/getDetailById`, {
    method: 'GET',
    params,
  });
}
// 发起审批
export async function purchaseOrderInitiateAnApplication(params: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/initiateAnApplication`, {
    method: 'GET',
    params,
  });
}
// 审批
export async function purchaseOrderApproval(params: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/approval`, {
    method: 'GET',
    params,
  });
}
// 确认付款
export async function purchaseOrderPayment(params: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/payment`, {
    method: 'GET',
    params,
  });
}
// 修改请款
export async function updatePurchaseOrder(data: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/update`, {
    method: 'POST',
    data,
  });
}
// 查询多个详情 打印用
export async function purchaseOrderGetDetailByIds(params: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/getDetailByIds`, {
    method: 'GET',
    params,
  });
}

// 确认打印 计数
export async function purchaseOrderPrint(params: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/print`, {
    method: 'GET',
    params: params,
  });
}

// 账单核对查询
export async function purchaseOrderCheckTheBill(params: any) {
  return request(`${baseUrl}/accountStatementOrder/checkTheBill`, {
    method: 'GET',
    params: params,
  });
}
// 批量付款
export async function batchPayment(data: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/batchPayment`, {
    method: 'POST',
    data,
  });
}
// 添加备注
export async function addOrderRemarks(params: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/addRemark`, {
    method: 'GET',
    params,
  });
}
// 删除
export async function deleteById(params: any) {
  return request(`${baseUrl}/purchaseOrderRequestFunds/deleteById`, {
    method: 'GET',
    params,
  });
}

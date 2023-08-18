import { request } from 'umi';
const baseUrl = '/sc-scm';
// 查询页签
export async function getBookmarks(params: any) {
  return request(`${baseUrl}/accountStatementOrder/getBookmarks`, {
    method: 'POST',
    params,
  });
}
// 分页列表 国内
export async function getAccountStatementOrderCnPage(data: any) {
  return request(`${baseUrl}/accountStatementOrder/cnPage`, {
    method: 'POST',
    data,
  });
}
// 分页列表 跨境
export async function getAccountStatementOrderInPage(data: any) {
  return request(`${baseUrl}/accountStatementOrder/inPage`, {
    method: 'POST',
    data,
  });
}
// 更新账单
export async function updateAccountStatementOrder(params: any) {
  return request(`${baseUrl}/accountStatementOrder/update`, {
    method: 'GET',
    params,
  });
}
// 导出
export async function exportAccountStatementOrder(data: any) {
  return request(`${baseUrl}/accountStatementOrder/export`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 创建对账单
export async function addAccountStatementOrder(data: any) {
  return request(`${baseUrl}/accountStatementOrder/insert`, {
    method: 'POST',
    data,
  });
}
// 查询多个详情 打印用
export async function accountStatementOrderGetDetailByIds(params: any) {
  return request(`${baseUrl}/accountStatementOrder/getDetailByIds`, {
    method: 'GET',
    params,
  });
}
// 确认打印 计数
export async function accountStatementOrderPrint(params: any) {
  return request(`${baseUrl}/accountStatementOrder/print`, {
    method: 'GET',
    params,
  });
}
// 查询详情
export async function accountStatementOrderById(params: any) {
  return request(`${baseUrl}/accountStatementOrder/getDetailById`, {
    method: 'GET',
    params,
  });
}
// 添加备注
export async function addRemarksAccountOrder(params: any) {
  return request(`${baseUrl}/accountStatementOrder/addRemarks`, {
    method: 'GET',
    params,
  });
}
// 发起审批
export async function accountStatementOrderAnApplication(data: any) {
  return request(`${baseUrl}/accountStatementOrder/initiateAnApplication`, {
    method: 'POST',
    data,
  });
}
// 审批
export async function accountStatementOrderApproval(params: any) {
  return request(`${baseUrl}/accountStatementOrder/approval`, {
    method: 'GET',
    params,
  });
}
// 确认付款
export async function accountStatementOrderPayment(data: any) {
  return request(`${baseUrl}/accountStatementOrder/payment`, {
    method: 'POST',
    data,
  });
}
// 付款驳回
export async function accountStatementOrderRejectPayment(data: any) {
  return request(`${baseUrl}/accountStatementOrder/rejectPayment`, {
    method: 'POST',
    data,
  });
}

// 入库单详情
export async function warehousingOrderFindById(params: any) {
  return request(`${baseUrl}/warehousingOrder/findById`, {
    method: 'GET',
    params,
  });
}

// 批量确认付款
export async function accountStatementOrderBatchPayment(data: any) {
  return request(`${baseUrl}/accountStatementOrder/batchPayment`, {
    method: 'POST',
    data,
  });
}
// 添加其他费用
export async function addOtherFunds(data: any) {
  return request(`${baseUrl}/accountStatementOrder/addOtherFunds`, {
    method: 'POST',
    data,
  });
}
// 更新其他费用
export async function updateOtherFunds(data: any) {
  return request(`${baseUrl}/accountStatementOrder/updateOtherFunds`, {
    method: 'POST',
    data,
  });
}
// 删除其他费用
export async function deleteOtherFunds(params: any) {
  return request(`${baseUrl}/accountStatementOrder/deleteOtherFunds`, {
    method: 'GET',
    params,
  });
}
// 删除 扣款单明细 v1.1.1
export async function removeDeduction(id: string) {
  return request(`${baseUrl}/accountStatementOrder/removeDeduction?order_deduction_id=${id}`, {
    method: 'GET',
  });
}
// 删除 对账单 v1.1.1
export async function deleteById(id: string) {
  return request(`${baseUrl}/accountStatementOrder/deleteById?order_id=${id}`, {
    method: 'GET',
  });
}
// 移除入库单
export async function removeWarehousingPurchaseOrderSkus(params: any) {
  return request(`${baseUrl}/accountStatementOrder/deleteWarehousingPurchaseOrderSkus`, {
    method: 'GET',
    params,
  });
}
// 导出入库明细
export async function exportWarehousingPurchaseOrderSku(params: any) {
  return request(`${baseUrl}/accountStatementOrder/exportWarehousingPurchaseOrderSku`, {
    method: 'GET',
    params,
    getResponse: true,
    responseType: 'blob',
  });
}
// 移除丢失明细
export async function removeWarehousingOrderException(params: any) {
  return request(`${baseUrl}/accountStatementOrder/removeWarehousingOrderException`, {
    method: 'GET',
    params,
  });
}
// 账单时间更新
export async function warehousingOrderUpdateByDate(data: any) {
  return request(`${baseUrl}/accountStatementOrder/updateByDate`, {
    method: 'POST',
    data,
  });
}

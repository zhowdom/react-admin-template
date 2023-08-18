import { request } from 'umi';
// 查询供应商列表
export async function getList(data: any) {
  return request('/sc-scm/vendor/page', {
    method: 'POST',
    data,
  });
}
// 新增供应商
export async function insert(data: any) {
  return request('/sc-scm/vendor/insert', {
    method: 'POST',
    data,
  });
}
// 查看供应商帐户信息
export async function findByVendorId(data: any) {
  return request('/sc-scm/vendorUser/findByVendorId', {
    method: 'POST',
    data,
  });
}

// 图片识别
export async function businessLicense(params: any) {
  return request('/sc-scm/ocr/businessLicense', {
    method: 'GET',
    params,
  });
}
// 资料补充接口
export async function supplementary(data: any, dId?: any) {
  return request('/sc-scm/vendor/supplementary', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 获取供应商详情信息
export async function getSupplierDetail(params: any) {
  return request('/sc-scm/vendor/findById', {
    method: 'GET',
    params,
  });
}
// 查询供应商结算账户
export async function getBankCountList(data: any) {
  return request('/sc-scm/vendorBankAccount/list', {
    method: 'POST',
    data,
  });
}
// 新增银行账户
export async function addBankAccount(data: any) {
  return request('/sc-scm/vendorBankAccount/insert', {
    method: 'POST',
    data,
  });
}
// 编辑银行账户
export async function editBankAccount(data: any, dId?: any) {
  return request('/sc-scm/vendorBankAccount/updateById', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 获取银行账户详情
export async function getBankDetail(params: any) {
  return request(`/sc-scm/vendorBankAccount/findById`, {
    method: 'GET',
    params,
  });
}
// 银行账户变更记录
export async function getBankLog(data: any) {
  return request(`/sc-scm/sysChangeFieldHistory/historyRecord`, {
    method: 'POST',
    data,
  });
}

// 日志查询
export async function getLogList(data: any) {
  return request('/sc-scm/vendor/changeFieldHistory', {
    method: 'POST',
    data,
  });
}
// 供应商商品查询
export async function getGoodsList(data: any) {
  return request('/sc-scm/goodsSkuVendor/freePage', {
    method: 'POST',
    data,
  });
}
// 审批信息
export async function getApprovalList(data: any) {
  return request('/sc-scm/vendor/approvalHistory', {
    method: 'POST',
    data,
  });
}
// 获取审批详情
export async function getApprovalDetail(data: any) {
  return request('/sc-scm/vendor/changeFieldHistoryByApprovalHistory', {
    method: 'POST',
    data,
  });
}
// 查询审批流程
export async function getApprovalProcess(params: any) {
  return request('/sc-scm/vendor/approvalDetailHistory', {
    method: 'GET',
    params,
  });
}
// 转让记录查询
export async function getTransferHistory(params: any) {
  return request('/sc-scm/vendor/transferHistory', {
    method: 'GET',
    params,
  });
}
// 转让供应商
export async function transferAction(params: any) {
  return request('/sc-scm/vendor/transfer', {
    method: 'GET',
    params,
  });
}
// 生成邀请链接
export async function createSpreadLink(params: any) {
  return request('/sc-scm/vendor/createSpreadLink', {
    method: 'GET',
    params,
  });
}

// 供应商合同信息查询
export async function vendorContractFindByVendorId(params: any) {
  return request('/sc-scm/vendorContract/findByVendorId', {
    method: 'GET',
    params,
  });
}
// 禁止合作
export async function initiateForbidCooperation(data: any, dId?: any) {
  return request('/sc-scm/vendor/initiateForbidCooperation', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 暂停合作
export async function initiateSuspendCooperation(data: any, dId?: any) {
  return request('/sc-scm/vendor/initiateSuspendCooperation', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 撤回
export async function terminate(params: any) {
  return request('/sc-scm/vendor/terminate', {
    method: 'GET',
    params,
  });
}
// 删除
export async function deleteByIds(params: any) {
  return request('/sc-scm/vendor/deleteByIds', {
    method: 'GET',
    params,
  });
}
// 临时合作
export async function initiateTemporaryCooperation(data: any, dId?: any) {
  return request('/sc-scm/vendor/initiateTemporaryCooperation', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 正式合作
export async function initiateOfficialCooperation(data: any, dId?: any) {
  return request('/sc-scm/vendor/initiateOfficialCooperation', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}

// 供应商反馈
// 反馈列表
export async function vendorFeedbackPage(data: any) {
  return request('/sc-scm/vendorFeedback/page', {
    method: 'POST',
    data,
  });
}
// 标记处理
export async function vendorFeedbackUpdateStatus(params: any) {
  return request('/sc-scm/vendorFeedback/updateStatus', {
    method: 'GET',
    params,
  });
}
// 反馈详情
export async function vendorFeedbackFindById(params: any) {
  return request('/sc-scm/vendorFeedback/findById', {
    method: 'GET',
    params,
  });
}
// 公告模板详情
export async function vendorFeedbackNotice(params: any) {
  return request('/sc-scm/vendorFeedback/notice', {
    method: 'GET',
    params,
  });
}
// 公告模板详情
export async function saveNotice(data: any) {
  return request('/sc-scm/vendorFeedback/saveNotice', {
    method: 'POST',
    data,
  });
}

// 更新供应商等级
export async function updateVendorGrade(params: any) {
  return request('/sc-scm/vendor/updateVendorGrade', {
    method: 'GET',
    params,
  });
}
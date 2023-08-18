import { request } from 'umi';
const baseUrl = '/sc-scm';
// 查询变更单列表
export async function getList(data: any) {
  return request(`${baseUrl}/purchaseOrderChangeHistory/page`, {
    method: 'POST',
    data,
  });
}
// 审核通过
export async function agree(params: any) {
  return request(`${baseUrl}/purchaseOrderChangeHistory/agree`, {
    method: 'GET',
    params,
  });
}
// 审核不通过
export async function refuse(params: any) {
  return request(`${baseUrl}/purchaseOrderChangeHistory/refuse`, {
    method: 'GET',
    params,
  });
}
// 同步至供应商
export async function syncVendor(params: any) {
  return request(`${baseUrl}/purchaseOrderChangeHistory/syncVendor`, {
    method: 'GET',
    params,
  });
}
// 从供应商撤回
export async function withdraw(params: any) {
  return request(`${baseUrl}/purchaseOrderChangeHistory/withdraw`, {
    method: 'GET',
    params,
  });
}
// 作废
export async function nullify(params: any) {
  return request(`${baseUrl}/purchaseOrderChangeHistory/nullify`, {
    method: 'GET',
    params,
  });
}
// 查看详情
export async function findById(params: any) {
  return request('/sc-scm/purchaseOrderChangeHistory/findById', {
    method: 'GET',
    params,
  });
}
//上传签约附件
export async function uploadContract(data: any) {
  return request('/sc-scm/purchaseOrderChangeHistory/uploadContract', {
    method: 'POST',
    data,
  });
}
//上传签约附件-R
export async function uploadContractR(data: any) {
  return request('/sc-scm/specialApproval/orderChangeUploadContract', {
    method: 'POST',
    data,
  });
}
// 导出pdf
export async function exportPdf(params: any) {
  return request(`/sc-scm/purchaseOrderChangeHistory/exportPdf`, {
    method: 'GET',
    responseType: 'blob',
    params,
    getResponse: true,
  });
}

// 强制变更
export async function purchaseOrderManualFinish(params: any) {
  return request('/sc-scm/purchaseOrderChangeHistory/manualFinish', {
    method: 'GET',
    params,
  });
}
import { request } from 'umi';
const baseUrl = '/sc-scm';
// 钉钉审批记录 分页查询
export async function sysApprovalHistoryPage(data: any) {
  return request(`${baseUrl}/sysApprovalHistory/page`, {
    method: 'POST',
    data,
  });
}
// 钉钉审批记录 同步钉钉状态
export async function syncSysApprovalHistory(params: any) {
  return request(`${baseUrl}/sysApprovalHistory/sync`, {
    method: 'POST',
    params,
  });
}
// 钉钉审批记录 主键查询
export async function getSysApprovalHistoryById(params: any) {
  return request(`${baseUrl}/sysApprovalHistory/findById`, {
    method: 'GET',
    params,
  });
}

// ERP数据同步 分页查询
export async function syncMessagePage(data: any) {
  return request(`${baseUrl}/syncMessage/page`, {
    method: 'POST',
    data,
  });
}
// ERP数据同步 同步
export async function syncMessageSync(params: any) {
  return request(`${baseUrl}/syncMessage/sync`, {
    method: 'POST',
    params,
  });
}
// ERP数据同步 删除
export async function deleteByIdSyncMessage(params: any) {
  return request(`${baseUrl}/syncMessage/deleteById`, {
    method: 'GET',
    params,
  });
}

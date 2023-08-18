import { request } from 'umi';
// 列表
export async function getAuditLogList(data: any) {
  return request('/permissions/log/auditLogPage', {
    method: 'POST',
    data,
  });
}

export async function auditLogFieldPage(data: any) {
  return request('/permissions/log/auditLogFieldPage', {
    method: 'POST',
    data,
  });
}

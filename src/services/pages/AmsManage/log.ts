import { request } from 'umi';
// 列表
export async function getLogList(data: any) {
  return request('/permissions/log/list', {
    method: 'POST',
    data,
  });
}

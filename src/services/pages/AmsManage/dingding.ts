import { request } from 'umi';
// 列表
export async function listPage(data: any) {
  return request('/permissions/dingTalkMsg/listPage', {
    method: 'POST',
    data,
  });
}

export async function publishDingTalkMsg(data: any) {
  return request('/permissions/dingTalkMsg/publishDingTalkMsg', {
    method: 'POST',
    data,
  });
}

import { request } from 'umi';
const baseUrl = '/report-service';

// 配送单主表
export async function listPage(data: any) {
  return request(`${baseUrl}/report/listPage`, {
    method: 'POST',
    data,
  });
}
// 下载
export async function download(data: any) {
  return request(`${baseUrl}/report/download`, {
    method: 'post',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

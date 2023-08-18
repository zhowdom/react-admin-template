import { request } from 'umi';
const baseUrl = '/sc-scm/';
// 查询列表
export async function getList(data: any) {
  return request(`${baseUrl}vendorPayMethod/page`, {
    method: 'POST',
    data,
  });
}
// 同步结算方式
export async function sync(data: any) {
  return request(`${baseUrl}vendorPayMethod/sync`, {
    method: 'POST',
    data,
  });
}
// 变更日志
export async function changeLog(data: any) {
  return request(`${baseUrl}vendorPayMethodHistory/page`, {
    method: 'POST',
    data,
  });
}

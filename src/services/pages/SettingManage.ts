import { request } from 'umi';
const baseUrl = '/report-service';
// ------自定义客诉标签--------
export async function tagPage(data: any) {
  return request(`${baseUrl}/customerComplaintLabel/pageList`, {
    method: 'POST',
    data,
  });
}
export async function tagAdd(data: any) {
  return request(`${baseUrl}/customerComplaintLabel/save`, {
    method: 'POST',
    data,
  });
}
export async function tagDisable(params: any) {
  return request(`${baseUrl}/customerComplaintLabel/disable`, {
    method: 'GET',
    params,
  });
}
export async function tagDelete(params: any) {
  return request(`${baseUrl}/customerComplaintLabel/delete`, {
    method: 'GET',
    params,
  });
}
// 修改标签
export async function update(data: any) {
  return request(`${baseUrl}/customerComplaintLabel/update`, {
    method: 'POST',
    data,
  });
}

import { request } from 'umi';
// 沟通记录- 查询列表
export async function getPage(data: any) {
  return request('/sc-scm/vendorCommunicationRecord/page', {
    method: 'POST',
    data,
  });
}
// 沟通记录- 新增
export async function insert(data: any) {
  return request('/sc-scm/vendorCommunicationRecord/insert', {
    method: 'POST',
    data,
  });
}
// 沟通记录- 新增
export async function update(data: any) {
  return request('/sc-scm/vendorCommunicationRecord/update', {
    method: 'POST',
    data,
  });
}
// 沟通记录- 详情
export async function getDetailById(params: any) {
  return request('/sc-scm/vendorCommunicationRecord/getDetailById', {
    method: 'GET',
    params,
  });
}

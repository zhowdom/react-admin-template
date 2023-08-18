import { request } from 'umi';
const baseUrl = '/sc-scm';
// 列表
export async function getList(data: any) {
  return request(`${baseUrl}/logisticsTimeManage/page`, {
    method: 'POST',
    data,
  });
}
// 编辑详情
export async function getDetail(data: any) {
  return request(`${baseUrl}/logisticsTimeManage/detail`, {
    method: 'POST',
    data,
  });
}
// 新增
export async function insert(data: any) {
  return request(`${baseUrl}/logisticsTimeManage/insert`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function update(data: any) {
  return request(`${baseUrl}/logisticsTimeManage/update`, {
    method: 'POST',
    data,
  });
}
// 删除
export async function remove(id: string) {
  return request(`${baseUrl}/logisticsTimeManage/delete?id=${id}`, {
    method: 'POST',
  });
}
// 历史日志
export async function changeFieldHistory(data: any) {
  return request(`${baseUrl}/logisticsTimeManage/changeFieldHistory`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/logisticsTimeManage/export`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}

import { request } from 'umi';

export const baseUrl = '/report-service/rule';

// 获取规则列表
export async function rule(params: any) {
  return request(`${baseUrl}`, {
    method: 'GET',
    params,
  });
}

// 保存
export async function ruleSave(data: any) {
  return request(`${baseUrl}`, {
    method: 'POST',
    data,
  });
}
// 获取规则详情
export async function ruleDetail(id: any) {
  return request(`${baseUrl}/${id}`, {
    method: 'GET',
  });
}
// 删除列表
export async function removeRule(params: any) {
  return request(`${baseUrl}`, {
    method: 'DELETE',
    params,
  });
}
// 清空缓存
export async function clearKieSession(params: any) {
  return request(`${baseUrl}/clearKieSession`, {
    method: 'GET',
    params,
  });
}
// 获取规则类型
export async function getType() {
  return request(`/permissions/dict/data/list`, {
    method: 'POST',
    data: {
      dictLabel: '',
      dictType: 'ams_app_name',
      pageIndex: 1,
      pageSize: 999,
      status: '0',
    },
  });
}

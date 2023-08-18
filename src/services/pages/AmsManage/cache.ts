import { request } from 'umi';
// 列表
export async function getCacheList(data: any) {
  return request(`/permissions/cache/redisKeys?key=${data.key}`, {
    method: 'POST',
    data,
  });
}
export async function cacheDelete(params: any) {
  return request(`/permissions/cache/delKey`, {
    method: 'GET',
    params,
  });
}

// 查询详情
export async function getKey(params: any) {
  return request(`/permissions/cache/getKey`, {
    method: 'GET',
    params,
  });
}
// 刷新ams缓存
export async function refreshBasicCache(data: any) {
  return request(`/permissions/cache/refreshBasicCache`, {
    method: 'POST',
    data,
  });
}
// 刷新scm缓存
export async function refreshBasicCacheScm(data: any) {
  return request(`/sc-scm/cache/refreshBasicCache`, {
    method: 'POST',
    data,
  });
}

// 获取系统下拉
export async function sysList(data: any) {
  return request(`/permissions/dict/data/list`, {
    method: 'POST',
    data,
  });
}

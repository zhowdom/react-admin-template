import { request } from 'umi';
export async function amazonAdsPage(data: any) {
  return request('/sc-scm/amazonAds/page', {
    method: 'POST',
    data,
  });
}
export async function amazonAdsPageSummary(data: any) {
  return request('/sc-scm/amazonAds/pageSummary', {
    method: 'POST',
    data,
  });
}
export async function amazonAdsChart(data: any) {
  return request('/sc-scm/amazonAds/chart', {
    method: 'POST',
    data,
  });
}
// 广告组合下拉
export async function portfoliosNameList(data: any) {
  return request('/sc-scm/amazonAds/portfoliosNameList', {
    method: 'POST',
    data,
  });
}
// 广告活动下拉
export async function campaignsNameList(data: any) {
  return request('/sc-scm/amazonAds/campaignsNameList', {
    method: 'POST',
    data,
  });
}
// 广告组下拉
export async function adGroupsPageList(data: any) {
  return request('/sc-scm/amazonAds/adGroupsPageList', {
    method: 'POST',
    data,
  });
}
// 快捷查询相关
export async function saveSearch(data: { name: string; country_code: string; config: any }) {
  return request('/sc-scm/amazonAds/saveSearch', {
    method: 'POST',
    data,
  });
}
export async function mySearch(data: any = {}) {
  return request('/sc-scm/amazonAds/mySearch', {
    method: 'POST',
    data,
  });
}
export async function removeSearch(params: { id: string }) {
  return request('/sc-scm/amazonAds/removeSearch', {
    method: 'GET',
    params,
  });
}

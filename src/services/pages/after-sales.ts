import { request } from 'umi';
const baseUrl = '/report-service';
// ------客诉明细 -打标签 --------
export async function tagPage(data: any) {
  return request(`${baseUrl}/customerComplaint/pageList`, {
    method: 'POST',
    data,
  });
}
export async function tagClassify(data: any) {
  return request(`${baseUrl}/customerComplaint/classify`, {
    method: 'POST',
    data,
  });
}
export async function tagExport(data: any) {
  return request(`${baseUrl}/customerComplaint/export`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
export async function statusCount(data: any) {
  return request(`${baseUrl}/customerComplaint/statusCount`, {
    method: 'POST',
    data,
  });
}

// --------- 退换货报表 ------------
export async function returnsPage(data: any) {
  return request(`${baseUrl}/orderStatistical/returnsPage`, {
    method: 'POST',
    data,
  });
}
export async function returnsGoodsSkuMonth(data: any) {
  return request(`${baseUrl}/orderStatistical/returnsGoodsSkuMonth`, {
    method: 'POST',
    data,
  });
}
export async function returnsGoodsSkuDay(data: any) {
  return request(`${baseUrl}/orderStatistical/returnsGoodsSkuDay`, {
    method: 'POST',
    data,
  });
}

// --------- 客诉统计 ------------
export async function statisticsPage(data: any) {
  return request(`${baseUrl}/customerComplaintStatistics/pageList`, {
    method: 'POST',
    data,
  });
}
export async function statisticsExport(data: any) {
  return request(`${baseUrl}/customerComplaintStatistics/export`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
export async function statisticsChart(data: any) {
  return request(`${baseUrl}/customerComplaintStatistics/chartList`, {
    method: 'POST',
    data,
  });
}


// --------- 跨境客诉分类统计(平台) ------------
export async function platformPageList(data: any) {
  return request(`${baseUrl}/customerComplaintStatistics/platformPageList`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function platformPageListExport(data: any) {
  return request(`${baseUrl}/customerComplaintStatistics/platformPageListExport`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
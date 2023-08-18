import { request } from 'umi';
const baseUrl = '/report-service';
export async function getList(data: any) {
  return request(`${baseUrl}/orderStatistical/getReportOrderStatistical`, {
    method: 'POST',
    data,
  });
}
// 获取统计
export async function reportOrderStatisticalSum(data: any) {
  return request(`${baseUrl}/orderStatistical/reportOrderStatisticalSum`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/orderStatistical/exportExcel`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 计算明细下载
export async function calculationExportExcel(data: any) {
  return request(`${baseUrl}/orderStatistical/calculationExportExcel`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 添加计算明细导出任务
export async function calculationTaskAdd(data: any) {
  return request(`${baseUrl}/orderStatistical/calculationTaskAdd`, {
    method: 'POST',
    data,
  });
}
// 下载明细 - 列表
export async function calculationTaskList(data: any) {
  return request(`${baseUrl}/orderStatistical/calculationTaskList`, {
    method: 'POST',
    data,
  });
}
// 下载明细 - 取消
export async function calculationTaskCancel(data: any) {
  return request(`${baseUrl}/orderStatistical/calculationTaskCancel`, {
    method: 'POST',
    data,
  });
}

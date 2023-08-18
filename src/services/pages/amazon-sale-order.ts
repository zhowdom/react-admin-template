import { request } from 'umi';
const baseUrl = '/report-service';
export async function getList(data: any) {
  return request(`${baseUrl}/amazonOrderStatistical/getReportOrderStatistical`, {
    method: 'POST',
    data,
  });
}
// 获取统计
export async function reportOrderStatisticalSum(data: any) {
  return request(`${baseUrl}/amazonOrderStatistical/reportOrderStatisticalSum`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/amazonOrderStatistical/exportExcel`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 计算明细下载
export async function calculationExportExcel(data: any) {
  return request(`${baseUrl}/amazonOrderStatistical/calculationExportExcel`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 添加计算明细导出任务
export async function calculationTaskAdd(data: any) {
  return request(`${baseUrl}/amazonOrderStatistical/calculationTaskAdd`, {
    method: 'POST',
    data,
  });
}
// 下载明细 - 列表
export async function calculationTaskList(data: any) {
  return request(`${baseUrl}/amazonOrderStatistical/calculationTaskList`, {
    method: 'POST',
    data,
  });
}
// 下载明细 - 取消
export async function calculationTaskCancel(data: any) {
  return request(`${baseUrl}/amazonOrderStatistical/calculationTaskCancel`, {
    method: 'POST',
    data,
  });
}

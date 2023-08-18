import { request } from 'umi';

const baseUrl = '/order-service';

// 销退单列表
export async function listPage(data: any) {
  return request(`${baseUrl}/deliveryPackage/listPage`, {
    method: 'POST',
    data,
  });
}

// 国内发货仓列表
export async function orderDeliveryWarehousePage(data: {
  platform_code: any;
  current_page: number;
  page_size: number;
}) {
  return request(`/sc-scm/orderDeliveryWarehouse/page`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/deliveryPackage/export`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 同步万里牛
export async function sycnExchange(data: any) {
  return request(`${baseUrl}/deliveryPackage/sycnExchange`, {
    method: 'POST',
    data,
  });
}
// 取消销退单
export async function cancelExchange(data: any) {
  return request(`${baseUrl}/deliveryPackage/cancelExchange`, {
    method: 'POST',
    data,
  });
}
// 入库
export async function warehousing(data: any) {
  return request(`${baseUrl}/deliveryPackage/warehousing`, {
    method: 'POST',
    data,
  });
}
// 库房质检
export async function quality(data: any) {
  return request(`${baseUrl}/deliveryPackage/quality`, {
    method: 'POST',
    data,
  });
}
// 物流详情
export async function getLogisticsDetails(params: any) {
  return request(`${baseUrl}/delivery/getLogisticsDetails`, {
    method: 'GET',
    params,
  });
}

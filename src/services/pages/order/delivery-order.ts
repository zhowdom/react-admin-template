import { request } from 'umi';

const baseUrl = '/order-service';

// 配送单主表
export async function listPage(data: any) {
  return request(`${baseUrl}/delivery/listPage`, {
    method: 'POST',
    data,
  });
}
// 详情
export async function findDeliveryDetailById(params: {deliveryId?: string; orderId?: string}) {
  return request(`${baseUrl}/delivery/findDeliveryDetailById`, {
    method: 'POST',
    params,
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
// 查询供应商列表
export async function getVendorList(data: any) {
  return request('/sc-scm/vendor/page', {
    method: 'POST',
    data,
  });
}
// -- 快递公司
export async function expressList(data: any) {
  return request(`/sc-scm/orderDeliveryExpressCompany/page`, {
    method: 'POST',
    data,
  });
}
// 拦截
export async function batchInterceptCheck(data: any) {
  return request(`${baseUrl}/delivery/batchInterceptCheck`, {
    method: 'POST',
    data,
  });
}

export async function batchIntercept(data: any) {
  return request(`${baseUrl}/delivery/batchIntercept`, {
    method: 'POST',
    data,
  });
}
// 销退
export async function addExchangeView(data: any) {
  return request(`${baseUrl}/delivery/addExchangeView `, {
    method: 'POST',
    data,
  });
}

export async function addExchange(data: any) {
  return request(`${baseUrl}/delivery/addExchange`, {
    method: 'POST',
    data,
  });
}
// 转仓
export async function transferDelivery(data: any) {
  return request(`${baseUrl}/delivery/transferDelivery `, {
    method: 'POST',
    data,
  });
}
// 退回到新建
export async function batchReturnBack(data: any) {
  return request(`${baseUrl}/delivery/batchReturnBack`, {
    method: 'POST',
    data,
  });
}

// 同步
export async function pushDeliveryToPlatform(params: any) {
  return request(`${baseUrl}/delivery/syncDelivery`, {
    method: 'GET',
    params,
  });
}
// 日志
export async function log(params: any) {
  return request(`${baseUrl}/deliveryTrackRecord/findById`, {
    method: 'GET',
    params,
  });
}

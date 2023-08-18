import { request } from 'umi';

const baseUrl = '/order-service';

// 订单主表
export async function listPageOrder(data: any) {
  return request(`${baseUrl}/order/listPage`, {
    method: 'POST',
    data,
  });
}

export async function findByIdOrder(params: any) {
  return request(`${baseUrl}/order/findById`, {
    method: 'GET',
    params,
  });
}

export async function updateExceptionTypeOrder(data: any) {
  return request(`${baseUrl}/order/updateExceptionType`, {
    method: 'POST',
    data,
  });
}

export async function updateTagOrder(data: any) {
  return request(`${baseUrl}/order/updateTag`, {
    method: 'POST',
    data,
  });
}

export async function updateRemarkOrder(data: any) {
  return request(`${baseUrl}/order/updateRemark`, {
    method: 'POST',
    data,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/order/export`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

export async function updateRequestDeliveryTimeOrder(data: any) {
  return request(`${baseUrl}/order/updateRequestDeliveryTime`, {
    method: 'POST',
    data,
  });
}

// 订单列表  - 异常订单历史记录表
export async function listPageOrderExceptionRecord(data: any) {
  return request(`${baseUrl}/orderExceptionRecord/listPage`, {
    method: 'POST',
    data,
  });
}

export async function findByOrderIdOrderExceptionRecord(params: any) {
  return request(`${baseUrl}/orderExceptionRecord/findByOrderId`, {
    method: 'GET',
    params,
  });
}

// 订单明细
export async function listPageOrderItem(data: any) {
  return request(`${baseUrl}/orderItem/listPage`, {
    method: 'POST',
    data,
  });
}

export async function findByOrderIdOrderItem(data: any) {
  return request(`${baseUrl}/orderItem/findByOrderId`, {
    method: 'POST',
    data,
  });
}

// 订单收货人信息

export async function listPageOrderReceiverInfo(data: any) {
  return request(`${baseUrl}/orderReceiverInfo/listPage`, {
    method: 'POST',
    data,
  });
}

export async function findByOrderIdOrderReceiverInfo(data: any) {
  return request(`${baseUrl}/orderReceiverInfo/findByOrderId`, {
    method: 'POST',
    data,
  });
}

// 订单标记记录
export async function findByOrderIdOrderTagRecord(data: any) {
  return request(`${baseUrl}/orderTagRecord/findByOrderId`, {
    method: 'POST',
    data,
  });
}

// 详情中的 - 操作记录
export async function listPageOrderTrackRecord(data: any) {
  return request(`${baseUrl}/orderTrackRecord/listPage`, {
    method: 'POST',
    data,
  });
}

// 通过标记类型查询是否绑定订单大于0则有
export async function findByTagTypeOrderTagRecord(params: { tagType: any }) {
  return request(`${baseUrl}/orderTagRecord/findByTagType`, {
    method: 'POST',
    params,
  });
}
// 通过异常类型查询是否绑定订单大于0则有
export async function findByExceptionTypeOrderExceptionRecord(params: { exceptionType: any }) {
  return request(`${baseUrl}/orderExceptionRecord/findByExceptionType`, {
    method: 'POST',
    params,
  });
}
// 订单同步
export async function syncOrder(data: any) {
  return request(`${baseUrl}/order/batchSync`, {
    method: 'POST',
    data,
  });
}
// 订单同步结果查看
export async function batchSyncResult(params: any) {
  return request(`${baseUrl}/order/batchSyncResult`, {
    method: 'GET',
    params,
  });
}
// 订单源信息
export async function getPlatformOrder(params: any) {
  return request(`${baseUrl}/order/getPlatformOrder`, {
    method: 'GET',
    params,
  });
}

// 刷新订单明细
export async function refreshOrderItem(params: any) {
  return request(`${baseUrl}/order/refreshOrderItem`, {
    method: 'GET',
    params,
  });
}

// 修改订单地址
export async function updateAddress(data: any) {
  return request(`${baseUrl}/order/updateAddress`, {
    method: 'POST',
    data,
  });
}

// 地址一键识别
export async function aiAddress(params: any) {
  return request(`${baseUrl}/order/aiAddress`, {
    method: 'GET',
    params,
  });
}

// 编辑明细
export async function saveOrUpdateOrderItem(data: any) {
  return request(`${baseUrl}/order/saveOrUpdateOrderItem`, {
    method: 'POST',
    data,
  });
}
// 人工打折
export async function handDiscountAmt(data: any) {
  return request(`${baseUrl}/order/handDiscountAmt`, {
    method: 'POST',
    data,
  });
}
// 导出明细
export async function exportDetail(data: any) {
  return request(`${baseUrl}/order/exportItem`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
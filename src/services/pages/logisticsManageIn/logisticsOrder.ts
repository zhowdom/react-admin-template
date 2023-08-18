import { request } from 'umi';
const baseUrl = '/sc-scm';
// 列表
export async function getLogisticsOrderList(data: any) {
  return request(`${baseUrl}/logisticsOrder/page`, {
    method: 'POST',
    data,
  });
}
// 获取状态及数量
export async function statusCount(data: any) {
  return request(`${baseUrl}/logisticsOrder/statusCount`, {
    method: 'POST',
    data,
  });
}

// 修改
export async function updateLogisticsOrder(data: any) {
  return request(`${baseUrl}/logisticsOrder/updateById`, {
    method: 'POST',
    data,
  });
}
// 查询详情
export async function getLogisticsOrderDetail(params: any) {
  return request(`${baseUrl}/logisticsOrder/findById`, {
    method: 'GET',
    params,
  });
}
// 选择平台入库单
export async function chooseWarehouseOrder(data: any) {
  return request(`${baseUrl}/logisticsOrder/chooseWarehouseOrder`, {
    method: 'POST',
    data,
  });
}
// 添加备注
export async function addRemark(data: any) {
  return request(`${baseUrl}/logisticsOrder/addRemark`, {
    method: 'POST',
    data,
  });
}

// 已装柜
export async function delivery(data: any) {
  return request(`${baseUrl}/logisticsOrder/delivery`, {
    method: 'POST',
    data,
  });
}
// 已开船
export async function atd(data: any) {
  return request(`${baseUrl}/logisticsOrder/atd`, {
    method: 'POST',
    data,
  });
}
// 已到港
export async function ata(data: any) {
  return request(`${baseUrl}/logisticsOrder/ata`, {
    method: 'POST',
    data,
  });
}
// 修改订舱号
export async function updateBookingNumber(data: any) {
  return request(`${baseUrl}/logisticsOrder/updateBookingNumber`, {
    method: 'POST',
    data,
  });
}
// 已到仓
export async function actualWarehouse(data: any) {
  return request(`${baseUrl}/logisticsOrder/actualWarehouse`, {
    method: 'POST',
    data,
  });
}
// 已签收
export async function signed(data: any) {
  return request(`${baseUrl}/logisticsOrder/signed`, {
    method: 'POST',
    data,
  });
}
// 删除
export async function deleteById(params: any) {
  return request(`${baseUrl}/logisticsOrder/deleteById`, {
    method: 'GET',
    params,
  });
}

// 修改预计时间
export async function updateEstimateTime(data: any) {
  return request(`${baseUrl}/logisticsOrder/updateEstimateTime`, {
    method: 'POST',
    data,
  });
}
// 修改实际时间
export async function updateLogisticsOrderTime(data: any) {
  return request(`${baseUrl}/logisticsOrder/updateLogisticsOrderTime`, {
    method: 'POST',
    data,
  });
}
// 撤回到新建
export async function deliveryUndo(params: any) {
  return request(`${baseUrl}/logisticsOrder/deliveryUndo`, {
    method: 'GET',
    params,
  });
}
// 确定入仓时间
export async function confirmActualWarehouse(data: any) {
  return request(`${baseUrl}/logisticsOrder/confirmActualWarehouse`, {
    method: 'POST',
    data,
  });
}
// 上传签收证明
export async function confirmSigned(data: any) {
  return request(`${baseUrl}/logisticsOrder/confirmSigned`, {
    method: 'POST',
    data,
  });
}
// 退回已到港
export async function actualWarehouseWithdraw(data: any) {
  return request(`${baseUrl}/logisticsOrder/actualWarehouseWithdraw`, {
    method: 'POST',
    data,
  });
}
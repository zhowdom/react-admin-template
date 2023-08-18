// 入库管理
import { request } from 'umi';

// 入库单列表
export async function getList(data: any) {
  return request('/sc-scm/warehousingOrder/page', {
    method: 'POST',
    data,
  });
}

// 生产箱唛 下载箱唛
export async function exportBoxLabel(params: { id: any }) {
  return request('/sc-scm/warehousingOrder/exportBoxLabel', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    params,
  });
}
// 生成出货清单
export async function exportPDFShippingList(params: { id: any }) {
  return request('/sc-scm/warehousingOrder/exportPDFShippingList', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    params,
  });
}

// 合并订单
export async function mergeOrder(params: { ids: string }) {
  return request('/sc-scm/warehousingOrder/mergeOrder', {
    method: 'POST',
    params,
  });
}

// 拆分合并订单
export async function cancelMergeOrder(params: { ids: string }) {
  return request('/sc-scm/warehousingOrder/cancelMergeOrder', {
    method: 'POST',
    params,
  });
}

// 修改预约信息
export async function updatePlatformWarehousing(data: any) {
  return request('/sc-scm/warehousingOrder/updatePlatformWarehousing', {
    method: 'POST',
    data,
  });
}

// 批量导入入库单信息
export async function batchImportPlatformWarehousing(data: any) {
  return request('/sc-scm/warehousingOrder/batchImportPlatformWarehousing', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

// 同步至供应商和平台
export async function synchVendor(params: { ids: string | number }) {
  return request('/sc-scm/warehousingOrder/synchVendor', {
    method: 'POST',
    params,
  });
}

// 同步平台库存
export async function updatePlatformsNum(data: any) {
  return request('/sc-scm/warehousingOrder/updatePlatformsNum', {
    method: 'POST',
    data,
  });
}

// 入库单选择供应商
export async function findSelectPurchaseOrder(data: any) {
  return request('/sc-scm/warehousingOrder/findSelectPurchaseOrder', {
    method: 'POST',
    data,
  });
}

// 入库单更新选择供应商
export async function updateOrderVendor(data: any) {
  return request('/sc-scm/warehousingOrder/updateOrderVendor', {
    method: 'POST',
    data,
  });
}
// 入库单编辑修改
export async function updateWarehousingOrder(data: any) {
  return request('/sc-scm/warehousingOrder/updateWarehousingOrder', {
    method: 'POST',
    data,
  });
}
// 入库单 编辑保存并同步至供应商
export async function saveToSyncVendor(data: any) {
  return request('/sc-scm/warehousingOrder/saveToSyncVendor', {
    method: 'POST',
    data,
  });
}
// 撤回
export async function withdraw(data: any) {
  return request('/sc-scm/warehousingOrder/withdraw', {
    method: 'POST',
    data,
  });
}
// 取消撤回
export async function cancelWithdraw(params: any) {
  return request('/sc-scm/warehousingOrder/cancelWithdraw', {
    method: 'POST',
    params,
  });
}
// 修改添加运费
export async function addShippingFee(params: any) {
  return request('/sc-scm/warehousingOrder/addShippingFee', {
    method: 'POST',
    params,
  });
}
// 入库单导出
export async function exportWarehousingOrder(data: any) {
  return request('/sc-scm/warehousingOrder/exportWarehousingOrder', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 国内-入库信息模板导出
export async function exportWarehousingOrderCn(data: any) {
  return request('/sc-scm/warehousingOrder/exportWarehousingOrderCn', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 国内-运单信息模板导出
export async function exportWarehousingImportWaybill(data: any) {
  return request('/sc-scm/warehousingOrder/exportWarehousingImportWaybill', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 国内-批量更新预计平台入库时间
export async function updatePlatformAppointmentTime(data: any) {
  return request('/sc-scm/warehousingOrder/updatePlatformAppointmentTime', {
    method: 'POST',
    data,
  });
}
// ------------ 跨境接口-------------
// 跨境分页列表
export async function inPage(data: any) {
  return request('/sc-scm/warehousingOrder/inPage', {
    method: 'POST',
    data,
  });
}
// 通知供应商发货到港口(跨境)
export async function notifyVendor(params: any) {
  return request('/sc-scm/warehousingOrder/notifyVendor', {
    method: 'POST',
    params,
  });
}
// 批量导入国内港口入库(跨境)
export async function batchImportPortStorage(data: any) {
  return request('/sc-scm/warehousingOrder/batchImportPortStorage', {
    method: 'POST',
    data,
  });
}
// 批量导入发往跨境平台(跨境)
export async function batchImportSendTopPlatform(data: any) {
  return request('/sc-scm/warehousingOrder/batchImportSendTopPlatform', {
    method: 'POST',
    data,
  });
}
// 批量导入货件信息(跨境)
export async function batchImportShelfInfo(data: any) {
  return request('/sc-scm/warehousingOrder/batchImportShelfInfo', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 更新货件信息(跨境)
export async function updateShelfInfo(data: any) {
  return request('/sc-scm/warehousingOrder/updateShelfInfo', {
    method: 'POST',
    data,
  });
}
// 更新跨境平台入库单物流信息(跨境)
export async function updateInboundLogistics(data: any) {
  return request('/sc-scm/warehousingOrder/updateInboundLogistics', {
    method: 'POST',
    data,
  });
}
// 通知供应商发货(跨境)
export async function notifyShipping(params: any) {
  return request('/sc-scm/warehousingOrder/notifyShipping', {
    method: 'POST',
    params,
  });
}
// 通知采购发货(跨境)
export async function notifyPurchaseDelivery(params: any) {
  return request('/sc-scm/warehousingOrder/notifyPurchaseDelivery', {
    method: 'POST',
    params,
  });
}
// 港口入库(跨境)
export async function portStorage(data: any) {
  return request('/sc-scm/warehousingOrder/portStorage', {
    method: 'POST',
    data,
  });
}

// 发往跨境平台(跨境)
export async function sendTopPlatform(params: any) {
  return request('/sc-scm/warehousingOrder/sendTopPlatform', {
    method: 'POST',
    params,
  });
}

// 同步平台库存(跨境)
export async function synchPlatformStorage(params: any) {
  return request('/sc-scm/warehousingOrder/synchPlatformStorage', {
    method: 'POST',
    params,
  });
}
// 批量导入运单号
export async function batchImportWaybill(data: any) {
  return request('/sc-scm/warehousingOrder/batchImportLogisticsOrderNo', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 导出订舱号信息
export async function exportBookingBumber(data: any) {
  return request('/sc-scm/warehousingOrder/exportBookingBumber', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 入库单导出 跨境
export async function exportWarehousingOrderIn(data: any) {
  return request('/sc-scm/warehousingOrder/exportWarehousingOrderIn', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

// 获取关联采购单信息
export async function findActualDeductionQty(params: any) {
  return request('/sc-scm/warehousingOrder/findActualDeductionQty', {
    method: 'GET',
    params,
  });
}

// 当已同步或者已通知时 运营端操作已发货
export async function confirmShip(data: any) {
  return request('/sc-scm/warehousingOrder/confirmShip', {
    method: 'POST',
    data,
  });
}
// 查询链接管理里面的条码文件
export async function getFnSkuFile(params: any) {
  return request('/sc-scm/linkManagement/getFnSkuFile', {
    method: 'GET',
    params,
  });
}
// 跨境-发往跨境平台模板导出
export async function exportSentPlatformIn(data: any) {
  return request('/sc-scm/warehousingOrder/exportSentPlatformIn', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 跨境-国内港口入库模板导出
export async function exportPortWarehousingIn(data: any) {
  return request('/sc-scm/warehousingOrder/exportPortWarehousingIn', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 跨境-货件信息模板导出
export async function exportShipmentInfoIn(data: any) {
  return request('/sc-scm/warehousingOrder/exportShipmentInfoIn', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 批量导入物流(跨境)
export async function batchImportlogistics(data: any) {
  return request('/sc-scm/warehousingOrder/importWarehousingLogisticsInfoIn', {
    method: 'POST',
    data,
  });
}
// 跨境-物流模板导出
export async function exportLogisticsIn(data: any) {
  return request('/sc-scm/warehousingOrder/exportWarehousingLogisticsInfoIn', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

// 自动入库
export async function syncPlatformStockInBill(params: any) {
  return request('/sc-scm/warehousingOrder/syncPlatformStockInBill', {
    method: 'GET',
    params,
  });
}
// 入库数据统计
export async function statusCount(data: any) {
  return request('/sc-scm/warehousingOrder/statusCount', {
    method: 'POST',
    data,
  });
}
// 删除入库单
export async function deleteByOrderNo(params: any) {
  return request('/sc-scm/warehousingOrder/deleteByOrderNo', {
    method: 'POST',
    params,
  });
}
// 修改截仓时间(跨境)
export async function updateClosingTime(data: any) {
  return request('/sc-scm/warehousingOrder/updateClosingTime', {
    method: 'POST',
    data,
  });
}
// 关闭平台入库单(跨境)
export async function closeExceptionIn(data: any) {
  return request('/sc-scm/warehousingOrder/closeExceptionIn', {
    method: 'POST',
    data,
  });
}
// 货件关闭申请(跨境)
export async function shipmentClosedApply(data: any) {
  return request('/sc-scm/warehousingOrder/shipmentClosedApply', {
    method: 'POST',
    data,
  });
}
export async function shipmentProcessReject(data: any) {
  return request('/sc-scm/warehousingOrder/shipmentProcessReject', {
    method: 'POST',
    data,
  });
}
export async function shipmentProcessAdopt(data: any) {
  return request('/sc-scm/warehousingOrder/shipmentProcessAdopt', {
    method: 'POST',
    data,
  });
}
export async function getShipmentProcess(params: any) {
  return request('/sc-scm/warehousingOrder/getShipmentProcess', {
    method: 'POST',
    params,
  });
}
// 手动入库-云仓-获取实际入库数量和时间
export async function queryPlatformWarehousingYunCang(params: any) {
  return request('/sc-scm/warehousingOrder/queryPlatformWarehousingYunCang', {
    method: 'GET',
    params,
  });
}

// 平台入库异常 - 多收 - 入库单详情
export async function getOutsideOrderInfo(params: any) {
  return request('/sc-scm/warehousingOrder/getOutsideOrderInfo', {
    method: 'POST',
    params,
  });
}

// 平台入库异常 - 多收 - 创建计划外入库单
export async function createOutsideThePlan(data: any) {
  return request('/sc-scm/warehousingOrder/createOutsideThePlan', {
    method: 'POST',
    data,
  });
}
// 入库 - 少收-异常处理
export async function warehouseExceptionHandling(params: any) {
  return request('/sc-scm/warehousingOrder/warehouseExceptionHandling', {
    method: 'GET',
    params,
  });
}
// 入库 - 确认补发
export async function warehouseingLackException(data: any) {
  return request('/sc-scm/warehousingOrder/warehouseingLackException', {
    method: 'POST',
    data,
  });
}
// 减去多收
export async function warehouseingManyException(data: any) {
  return request('/sc-scm/warehousingOrder/warehouseingManyException', {
    method: 'POST',
    data,
  });
}
// 新增配件入库单
export async function insertParts(data: any) {
  return request('/sc-scm/warehousingOrder/insertParts', {
    method: 'POST',
    data,
  });
}
// 配件入库单编辑
export async function updatePartsById(data: any) {
  return request('/sc-scm/warehousingOrder/updatePartsById', {
    method: 'POST',
    data,
  });
}
// 修改货件号
export async function updateShipmentId(params: any) {
  return request('/sc-scm/warehousingOrder/updateShipmentId', {
    method: 'POST',
    params,
  });
}
// 添加物流单
export async function insertLogisticsVendor(data: any) {
  return request('/sc-scm/logisticsOrder/insert', {
    method: 'POST',
    data,
  });
}
// 入库 - 未少收
export async function warehouseingNoLack(data: any) {
  return request('/sc-scm/warehousingOrder/warehouseingNoLack', {
    method: 'POST',
    data,
  });
}
// 验证货件号是否正确
export async function verificationShipmentId(data: any) {
  return request('/sc-scm/warehousingOrder/verificationShipmentId', {
    method: 'POST',
    data,
  });
}
// 退回至国内在途
export async function returnToCnTransit(params: any) {
  return request('/sc-scm/warehousingOrder/returnToCnTransit', {
    method: 'POST',
    params,
  });
}
// 操作日志列表
export async function getOperationHistory(data: any) {
  return request('/sc-scm/sysBusinessOperationHistory/page', {
    method: 'POST',
    data,
  });
}
// 操作日志详情
export async function treeByOperationId(params: any) {
  return request('/sc-scm/sysChangeFieldHistory/treeByOperationId', {
    method: 'GET',
    params,
  });
}
// 批量删除
export async function deleteByOrderNos(data: any) {
  return request('/sc-scm/warehousingOrder/deleteByOrderNos', {
    method: 'POST',
    data,
  });
}
// 国内入库少收
export async function warehouseingLackExceptionByCn(data: any) {
  return request('/sc-scm/warehousingOrder/warehouseingLackExceptionByCn', {
    method: 'POST',
    data,
  });
}
// 创建补发入库单
export async function createReissueWarehousingOrder(data: any) {
  return request('/sc-scm/warehousingOrder/createReissueWarehousingOrder', {
    method: 'POST',
    data,
  });
}
// 直接关闭货件
export async function shipmentProcessDirectClose(data: any) {
  return request('/sc-scm/warehousingOrder/shipmentProcessDirectClose', {
    method: 'POST',
    data,
  });
}



// 批量修改要求入库时间-根据条件导出
export async function exportRequiredWarehousingTime(data: any) {
  return request('/sc-scm/warehousingOrder/exportRequiredWarehousingTime', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
// 批量修改要求入库时间-上传
export async function batchImportRequiredWarehousingTime(data: any) {
  return request('/sc-scm/warehousingOrder/batchImportRequiredWarehousingTime', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

// 装箱明细导出
export async function exportPackingDetails(data: any) {
  return request('/sc-scm/warehousingOrder/exportPackingDetails', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

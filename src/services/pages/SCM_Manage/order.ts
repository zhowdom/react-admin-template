import { request } from 'umi';
const baseUrl = '/sc-scm';

// 查看详情
export async function getDetail(params: any) {
  return request(`${baseUrl}/purchaseOrder/findById`, {
    method: 'GET',
    params,
  });
}
// 转让记录
export async function turnList(params: any) {
  return request(`${baseUrl}/purchaseOrderTransferHistory/listByOrderId`, {
    method: 'GET',
    params,
  });
}
// 采购详情 采购历史查看
export async function historyByPurchaseOrderSkuId(data: any) {
  return request(`${baseUrl}/purchaseOrder/historyByPurchaseOrderSkuId`, {
    method: 'POST',
    data,
  });
}

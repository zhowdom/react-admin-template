import { request } from 'umi';
const baseUrl = '/sc-scm';
// ------价格变更管理--------
// 分页查询
export async function getGoodsChangePricePage(data: any) {
  return request(`${baseUrl}/goodsChangePrice/page`, {
    method: 'POST',
    data,
  });
}
// 价格变更 详情
export async function goodsChangePriceFindById(params: any) {
  return request(`${baseUrl}/goodsChangePrice/findById`, {
    method: 'GET',
    params,
  });
}
// 价格变更审批
export async function goodsSkuChangePriceUpdate(data: any, dId?: any) {
  return request(`${baseUrl}/goodsChangePrice/updateById`, {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}

import { request } from 'umi';
const baseUrl = '/sc-scm';

// 列表-CN淡旺季系数
export async function getList_cnflex(data: any) {
  return request(`${baseUrl}/stockUpCnSeasonCoefficient/page`, {
    method: 'POST',
    data,
  });
}
// 列表-点击+号子列表
export async function getList_cnflex_byid(params: any) {
  return request(`${baseUrl}/stockUpCnSeasonCoefficient/listById`, {
    method: 'GET',
    params,
  });
}
// 新增(产品线)-CN淡旺季系数
export async function insert_goods_cnflex(data: any) {
  return request(`${baseUrl}/stockUpCnSeasonCoefficient/insertVendorGroup`, {
    method: 'POST',
    data,
  });
}
// 新增(SKU商品)-CN淡旺季系数
export async function insert_sku_cnflex(data: any) {
  return request(`${baseUrl}/stockUpCnSeasonCoefficient/insertSku`, {
    method: 'POST',
    data,
  });
}
// 修改-CN淡旺季系数
export async function update_cnflex(data: any) {
  return request(`${baseUrl}/stockUpCnSeasonCoefficient/updateById`, {
    method: 'POST',
    data,
  });
}


// 列表
export async function getList(data: any) {
  return request(`${baseUrl}/seasonSaleRatio/page`, {
    method: 'POST',
    data,
  });
}
// 新增
export async function insert(data: any) {
  return request(`${baseUrl}/seasonSaleRatio/insertSkuRatio`, {
    method: 'POST',
    data,
  });
}
// 修改
export async function update(data: any) {
  return request(`${baseUrl}/seasonSaleRatio/updateSkuRatio`, {
    method: 'POST',
    data,
  });
}
// 历史日志
export async function changeFieldHistory(data: any) {
  return request(`${baseUrl}/seasonSaleRatio/ratioLog`, {
    method: 'POST',
    data,
  });
}

// CN淡旺季系数-导出商品
export async function downloadskuFlex(data: any) {
  return request('/sc-scm/stockUpCnSeasonCoefficient/exportSku', {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}

// CN淡旺季系数-导出产品线
export async function downloadgoodsFlex(data: any) {
  return request('/sc-scm/stockUpCnSeasonCoefficient/exportVendorGroup', {
    method: 'POST',
    data,
    getResponse: true,
    responseType: 'blob',
  });
}
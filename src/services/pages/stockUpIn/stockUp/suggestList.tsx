import { request } from 'umi';
const baseUrl = '/sc-scm';
// 分页查询
export async function getPages(data: any) {
  return request(`${baseUrl}/stockUpAdvice/page`, {
    method: 'POST',
    data,
  });
}
// 详情
export async function stockUpAdviceFindById(params: any) {
  return request(`${baseUrl}/stockUpAdvice/findById`, {
    method: 'GET',
    params,
  });
}
// 数据计算明细
export async function findCalcDetail(params: any) {
  return request(`${baseUrl}/stockUpAdvice/findCalcDetail`, {
    method: 'GET',
    params,
  });
}
// 更新(作废、恢复)
export async function stockUpAdviceUpdateById(params: any, data: any) {
  return request(`${baseUrl}/stockUpAdvice/updateById`, {
    method: 'POST',
    params,
    data,
  });
}
// 重算
export async function reCalc(params: any) {
  return request(`${baseUrl}/stockUpAdvice/reCalc`, {
    method: 'GET',
    params,
  });
}
// 计算并保存
export async function stockUpAdviceCalcAndSave(data: any, params: any = {}) {
  return request(`${baseUrl}/stockUpAdvice/calcAndSave`, {
    method: 'POST',
    data,
    params,
  });
}
// 获取采购和发货计划
export async function stockUpAdviceGetPurchaseShipmentPlan(params: any) {
  return request(`${baseUrl}/stockUpAdvice/getPurchaseShipmentPlan`, {
    method: 'GET',
    params,
  });
}
// 创建采购和发货计划
export async function stockUpAdviceCreatePurchaseShipmentPlan(params: any) {
  return request(`${baseUrl}/stockUpAdvice/createPurchaseShipmentPlan`, {
    method: 'GET',
    params,
  });
}
// SKU 当前SKU
export async function stockUpAdviceSaleChart(data: any) {
  return request(`${baseUrl}/stockUpAdvice/saleChart`, {
    method: 'POST',
    data,
  });
}
// 历史销量
export async function stockUpAdviceGetHistorysales(params: any) {
  return request(`${baseUrl}/stockUpAdvice/getHistorysales`, {
    method: 'GET',
    params,
  });
}
// 导出
export async function exportExcel(data: any) {
  return request(`${baseUrl}/stockUpAdvice/export`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 导出 详情
export async function exportDetailExcel(data: any) {
  return request(`${baseUrl}/stockUpAdvice/exportDetail`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}
// 导出 备货建议明细
export async function exportStockupDetail(data: any) {
  return request(`${baseUrl}/stockUpAdvice/exportStockupDetail`, {
    method: 'POST',
    data,
    responseType: 'blob',
    getResponse: true,
  });
}

// 新建备货建议 第一步查询
export async function getBaseData(data: any) {
  return request(`${baseUrl}/stockUpAdvice/getBaseData`, {
    method: 'POST',
    data,
  });
}
// 新建备货建议 第一步提交
export async function stockUpAdviceCreate(data: any) {
  return request(`${baseUrl}/stockUpAdvice/create`, {
    method: 'POST',
    data,
  });
}


// 备货建议 作废建议
export async function stockUpAdviceVoided(data: any) {
  return request(`${baseUrl}/stockUpAdvice/voided`, {
    method: 'POST',
    data,
  });
}

// 备货建议 撤回
export async function stockUpAdviceWithdraw(data: any) {
  return request(`${baseUrl}/stockUpAdvice/withdraw`, {
    method: 'POST',
    data,
  });
}

// 备货建议 退回
export async function stockUpAdviceReject(data: any) {
  return request(`${baseUrl}/stockUpAdvice/reject`, {
    method: 'POST',
    data,
  });
}
// 备货建议 审批通过
export async function stockUpAdviceApprovePass(data: any) {
  return request(`${baseUrl}/stockUpAdvice/approvePass`, {
    method: 'POST',
    data,
  });
}
// 备货建议详情 提交
export async function stockUpAdviceSubmit(data: any) {
  return request(`${baseUrl}/stockUpAdvice/submit`, {
    method: 'POST',
    data,
  });
}
// 备货建议详情 下一个 的数据
export async function stockUpAdviceNext(params: any) {
  return request(`${baseUrl}/stockUpAdvice/next`, {
    method: 'get',
    params,
  });
}

// 环比月增长率曲线图
export async function monthGrowthRateChart(params: any) {
  return request(`${baseUrl}/stockUpAdvice/monthGrowthRateChart`, {
    method: 'GET',
    params,
  });
}

// PMC申请发货明细
export async function getApplyShipment(params: any) {
  return request(`${baseUrl}/stockUpAdvice/getApplyShipment`, {
    method: 'GET',
    params,
  });
}



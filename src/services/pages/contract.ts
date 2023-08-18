import { request } from 'umi';
// 合同模板 - 分页列表
export async function getPage(data: any) {
  return request('/sc-scm/sysContractTemplate/page', {
    method: 'POST',
    data,
  });
}
// 合同模板 - 不分页列表
export async function getDepotList(data: any) {
  return request('/sc-scm/sysContractTemplate/list', {
    method: 'POST',
    data,
  });
}
// 合同模板 - 新增
export async function insert(data: any) {
  return request('/sc-scm/sysContractTemplate/insert', {
    method: 'POST',
    data,
  });
}
// 合同模板 - 修改
export async function updateById(data: any) {
  return request('/sc-scm/sysContractTemplate/updateById', {
    method: 'POST',
    data,
  });
}

// 合同模板 - 详情
export async function getTemplateDetailById(params: any) {
  return request('/sc-scm/sysContractTemplate/findById', {
    method: 'GET',
    params,
  });
}

// 合同管理 - 分页列表
export async function getVendorContractPage(data: any) {
  return request('/sc-scm/vendorContract/page', {
    method: 'POST',
    data,
  });
}
// 合同管理 - 新增
export async function vendorContractInsert(data: any, dId?: any) {
  return request('/sc-scm/vendorContract/insert', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 合同管理 - 修改
export async function vendorContractUpdateById(data: any, dId?: any) {
  return request('/sc-scm/vendorContract/updateById', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}
// 合同管理 - 详情
export async function vendorContractFindById(params: any) {
  return request('/sc-scm/vendorContract/findById', {
    method: 'GET',
    params,
  });
}
// 合同管理 - 合同终止
export async function terminationContract(data: any) {
  return request('/sc-scm/vendorContract/terminationContract', {
    method: 'POST',
    data,
  });
}
// 合同管理 - 合同删除
export async function deleteStatus(params: any) {
  return request('/sc-scm/vendorContract/delete', {
    method: 'GET',
    params,
  });
}
// 合同管理 - 签约失败时 重新提交签约
export async function extsignAuto(params: any) {
  return request('/sc-scm/faDaDaDocking/extsignAuto', {
    method: 'POST',
    params,
  });
}
// 合同管理 - 签约失败时 重新提交签约 新
export async function againExtsignAuto(params: any) {
  return request('/sc-scm/vendorContract/againExtsignAuto', {
    method: 'POST',
    params,
  });
}
// 合同管理 - 修改自定义合同附件 重新发起审批流程
export async function updateCustomizeContractFile(data: any) {
  return request('/sc-scm/vendorContract/updateCustomizeContractFile', {
    method: 'POST',
    data,
  });
}
// 合同管理 - 审批记录--分页查询
export async function approvalDetailHistory(params: any) {
  return request('/sc-scm/vendorContract/approvalDetailHistory', {
    method: 'GET',
    params,
  });
}

// 合同管理 - 检测合同里是否有某个关键词
export async function contractDetectKeyWords(params: any) {
  return request('/sc-scm/vendorContract/contractDetectKeyWords', {
    method: 'POST',
    params,
  });
}

// 合同管理 - 合同续签
export async function renewContract(data: any, dId?: any) {
  return request('/sc-scm/vendorContract/renewContract', {
    method: 'POST',
    data,
    headers: { 'dingding-dept-id': dId },
  });
}

// 合同管理 - 批量下载合同
export async function batchDownloadContract(params: any) {
  return request('/sc-scm/vendorContract/batchDownloadContract', {
    method: 'GET',
    responseType: 'blob',
    getResponse: true,
    params,
  });
}
// 合同撤回
export async function withdrawn(params: any) {
  return request('/sc-scm/vendorContract/withdrawn', {
    method: 'GET',
    params,
  });
}

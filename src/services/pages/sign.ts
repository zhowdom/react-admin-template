import { request } from 'umi';
// 查询签约主体列表
export async function getList(data: any) {
  return request('/sc-scm/vendorSigning/page', {
    method: 'POST',
    data,
  });
}
// 新增签约主体
export async function insert(data: any) {
  return request('/sc-scm/vendorSigning/insert', {
    method: 'POST',
    data,
  });
}
// 编辑签约主体
export async function updateById(data: any) {
  return request('/sc-scm/vendorSigning/update', {
    method: 'POST',
    data,
  });
}
// 获取企业实名认证地址
export async function getCompanyVerifyUrl(params: any) {
  return request('/sc-scm/faDaDaDocking/getCompanyVerifyUrl', {
    method: 'POST',
    params,
  });
}
// 获取授权自动签页面
export async function beforeAuthsign(params: any) {
  return request('/sc-scm/faDaDaDocking/beforeAuthsign', {
    method: 'POST',
    params,
  });
}
// 获取取消合同自动签署页面
export async function cancelExtsignAutoPage(params: any) {
  return request('/sc-scm/faDaDaDocking/cancelExtsignAutoPage', {
    method: 'POST',
    params,
  });
}

// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { pubMsg,pubConfig } from '@/utils/pubConfig';
/*get请求示例*/
export async function rule(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 文件上传 统一接口 旧的，直接上传到服务器 现在不用了 */
export async function baseFileUpload(params: any) {
  const formData = new FormData();
  Object.keys(params).forEach((ele) => {
    const item = (params as any)[ele];
    if (item !== undefined && item !== null) {
      formData.append(ele, item);
    }
  });
  return request('/sc-scm/sysFile/upload', {
    method: 'POST',
    data: formData,
    timeout: 3600000,
  });
}

/** 文件上传 统一接口 上传到阿里云oss */
export async function baseFileUpload1(url: string, params: any) {
  const formData = new FormData();
  Object.keys(params).forEach((ele) => {
    const item = (params as any)[ele];
    if (item !== undefined && item !== null) {
      formData.append(ele, item);
    }
  });
  return request(url, {
    method: 'POST',
    data: formData,
    timeout: 3600000,
  });
}
/** 登录前获取请求状态 */
export async function getAuthorization() {
  return request('/permissions/oauth/getAuthorization', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  });
}
/** 登录 */
export async function login(params: any, Authorization: any) {
  return request('/permissions/oauth/token', {
    method: 'POST',
    data: null,
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Authorization,
    },
  });
}
/** 登录后 用token 获取用户信息 */
export async function getCurrentUser() {
  return request('/permissions/oauth/getCurrentUser', {
    method: 'GET',
  });
}
/** 登录后 获取菜单信息 */
export async function getMenus() {
  return request('/permissions/menu/current', {
    method: 'GET',
  });
}
/** 用户列表 */
export async function getUsers(data: {
  pageIndex: number;
  pageSize: number;
  account?: string;
  name?: string;
}) {
  return request('/permissions/user/listPage', {
    method: 'POST',
    data,
  });
}

/** 退出登录 */
export async function logout() {
  return request('/permissions/oauth/remove', {
    method: 'POST',
  });
}
/** 文件上传 上传前获取签名 */
export async function createWebUploadSignature(params: any) {
  return request('/sc-scm/sysFile/createWebUploadSignature', {
    method: 'GET',
    params,
  });
}

// 删除文件
export async function baseFileDelete(params: any) {
  return request('/sc-scm/sysFile/deleteById', {
    method: 'GET',
    params,
  });
}

/** 文件读取 统一接口 */
export async function baseGetFile(params: any) {
  return request('/sc-scm/sysFile/downloadById', {
    method: 'GET',
    params,
  });
}
/** 文件下载 统一接口 */
export async function baseDownLoadFile(params: any) {
  return request('/sc-scm/sysFile/downloadById', {
    method: 'GET',
    params,
  });
}

/** 获取统一权限平台的菜单等权限 */
export async function getUserPermission(
  data: API.PermissionParams,
  options?: { [key: string]: any },
) {
  return request<API.PermissionParams>('/permissions/menu/current', {
    method: 'GET',
    data,
    ...(options || {}),
  });
}
/** 获取统一权限平台的授权应用 */
export async function getAppList(params: any, options?: { [key: string]: any }) {
  return request<API.PermissionParams>('/permissions/app/getAppList', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}
// -------数据字典------
// 获取全部字典
export async function getDic(data: any) {
  return request('/sc-scm/sysDictionaryGroupDetail/list', {
    method: 'POST',
    data,
  });
}
// 获取权限系统数据字典
export async function getDicAuth(data: any) {
  return request('/permissions/dict/data/getDictData', {
    method: 'POST',
    data,
  });
}
// 数据字典分页
export async function dictPage(data: any) {
  return request('/permissions/dict/list', {
    method: 'POST',
    data,
  });
}
// 数据字典删除
export async function dictDelete(data: any) {
  return request('/permissions/dict/remove', {
    method: 'POST',
    data,
  });
}
// 数据字典添加
export async function dictAdd(data: any) {
  console.log(data);
  return request('/permissions/dict/add', {
    method: 'POST',
    data,
  });
}
// 数据字典修改更新
export async function dictUpdate(data: any) {
  return request('/permissions/dict/edit', {
    method: 'POST',
    data,
  });
}
// 缓存刷新
export async function refreshCache(params: any) {
  return request('/permissions/dict/refreshCache', {
    method: 'GET',
    params,
  });
}
// 数据字典详情列表
export async function dictDetail(data: any) {
  return request('/permissions/dict/data/list', {
    method: 'POST',
    data,
  });
}
// 数据字典详情删除
export async function dictDetailDelete(data: any) {
  return request('/permissions/dict/data/remove', {
    method: 'POST',
    data,
  });
}
// 数据字典详情添加
export async function dictDetailAdd(data: any) {
  return request('/permissions/dict/data/add', {
    method: 'POST',
    data,
  });
}
// 数据字典详情更新
export async function dictDetailUpdate(data: any) {
  return request('/permissions/dict/data/edit', {
    method: 'POST',
    data,
  });
}
// 权限系统 - 数据字典详情
export async function dictDetailAuth(data: any) {
  return request('/permissions/dict/data/list', {
    method: 'POST',
    data,
  });
}
// 权限系统 - 数据字典详情
export async function dictDetailAuthAdd(data: any) {
  return request('/permissions/dict/data/add', {
    method: 'POST',
    data,
  });
}
// 权限系统 - 数据字典详情
export async function dictDetailAuthEdit(data: any) {
  return request('/permissions/dict/data/edit', {
    method: 'POST',
    data,
  });
}
// 权限系统 - 数据字典详情
export async function dictDetailAuthRemove(data: any) {
  return request('/permissions/dict/data/remove', {
    method: 'POST',
    data,
  });
}
// 获取城市数据
export async function getRegion(data: any) {
  return request('/sc-scm/region/listByLevel', {
    method: 'POST',
    data,
  });
}
// 获取人员列表
export async function getUserList(data: any) {
  return request('/sc-scm/user/list', {
    method: 'POST',
    data,
  });
}
// 查询供应商列表
export async function getVendorList(data: any) {
  return request('/sc-scm/vendor/freePage', {
    method: 'POST',
    data,
  });
}
// 查询无权限供应商列表
export async function freePage(data: any) {
  return request('/sc-scm/vendor/freePage', {
    method: 'POST',
    data,
  });
}

// 查询供应商的用户列表
export async function getVendorUserList(data: any) {
  return request('/sc-scm/vendorUser/page', {
    method: 'POST',
    data,
  });
}
// 查询产品线列表
export async function getVendorGroupList(data: any) {
  return request('/sc-scm/vendorGroup/list', {
    method: 'POST',
    data,
  });
}
// 商品sku查询(下拉框用) 采购计划 发货计划用，独特的接口
export async function findSelectGoodsSku(data: any) {
  return request('/sc-scm/goodsSku/freePage', {
    method: 'POST',
    data,
  });
}

// 导入模板下载  参照 模板管理里的code  接口URL： {{url}}/sysImportTemplate/downloadByCode?code=DELIVERY_PLAN_CN
export async function downloadSysImportTemplateByCode(params: any) {
  return request('/sc-scm/sysImportTemplate/downloadByCode', {
    method: 'GET',
    params,
    getResponse: true,
    responseType: 'blob',
  });
}

// 审批记录 第一层
export async function sysApprovalHistory(data: any) {
  return request('/sc-scm/sysApprovalHistory/page', {
    method: 'POST',
    data,
  });
}
// 审批记录 第二层 没有二层的直接访问这个
export async function sysApprovalDetailHistory(data: any) {
  return request('/sc-scm/sysApprovalDetailHistory/page', {
    method: 'POST',
    data,
  });
}
// 操作记录
export async function sysBusinessOperationHistory(data: any) {
  return request('/sc-scm/sysBusinessOperationHistory/page', {
    method: 'POST',
    data,
  });
}

// 钉钉部门查询（当前登录用户）
export async function dingDingDeptByUserId(params: any) {
  return request('/sc-scm/user/dingDingDeptByUserId', {
    method: 'GET',
    params,
  });
}

// 获取云仓仓库下拉-- 搜索下拉框 目前只有 万里牛*/
export async function sysCloudWarehousingCloudPage(data: any) {
  return request('/sc-scm/sysCloudWarehousing/cloudPage', {
    method: 'POST',
    data,
  });
}

// 用户的列设置
export async function customColumnList(data: any) {
  return request('/permissions/customColumn/getCustomColumnDetail', {
    method: 'POST',
    data,
  });
}
export async function customColumnSet(data: any) {
  return request('/permissions/customColumn/addOrUpdate', {
    method: 'POST',
    data,
  });
}
export async function customColumnDelete(params: any) {
  return request('/permissions/customColumn/delete', {
    method: 'POST',
    params,
  });
}
// 投诉建议 供应商下拉  特殊的条件只能在投诉建议里用
export async function vendorFeedback(params: any) {
  return request('/sc-scm/vendorFeedback/vendorList', {
    method: 'GET',
    params,
  });
}
// 跨境 - sku/spu搜索
export async function freeListLinkManagementSku(params: any) {
  return request(`/sc-scm/linkManagement/freeListLinkManagementSku`, {
    method: 'GET',
    params,
  });
}
// 商品sku查询(下拉框用) 无权限
export async function partsFreePage(data: any) {
  return request('/sc-scm/goodsSku/partsFreePage', {
    method: 'POST',
    data,
  });
}

// 用户自己修改信息
export async function updateOneself(data: any) {
  return request(`/permissions/user/updateOneself`, {
    method: 'POST',
    data,
  });
}
// 修改密码
export async function updatePassword(params: any) {
  return request(`/permissions/user/password`, {
    method: 'GET',
    params,
  });
}

// 获取最新版本号
export async function scmVersion() {
  const t = new Date().getTime();
  return request('/version.js?t=' + t, {
    method: 'GET',
  });
}
// 权限平台日志
export async function auditLogPage(params: any) {
  return request('/permissions/log/getAuditLogByCondition', {
    method: 'GET',
    params,
  });
}
// 权限平台详情
export async function auditLogDetailPage(params: any) {
  return request('/permissions/log/getAuditFieldLogByCondition', {
    method: 'GET',
    params,
  });
}
// 港口管理 - 列表 有翻页
export async function getLogisticsPort(data: any) {
  return request(`/sc-scm/logisticsPort/page`, {
    method: 'POST',
    data,
  });
}
export async function getWarehouseIn(data: any) {
  return request(`/sc-scm/sysPlatformWarehousingIn/page`, {
    method: 'POST',
    data,
  });
}



const baseUrl = '/sc-scm';
// 获取sku
export const getShopSkuCode = async (params: any): Promise<any> => {
  return new Promise(async (resolve) => {
    const res = await request(`${baseUrl}/linkManagement/getShopSkuCode`, {
      method: 'GET',
      params,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    resolve(res.data);
  });
};

// 获取spu/链接名
export const getLinkName = async (params: any): Promise<any> => {
  return new Promise(async (resolve) => {
    const res = await request(`${baseUrl}/linkManagement/getLinkName`, {
      method: 'GET',
      params,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    resolve(res.data);
  });
};

import { request } from 'umi';

// -----消息管理------
export async function getList(data: any) {
  return request('/sc-scm/sysNotice/page', {
    method: 'POST',
    data,
  });
}

export async function addListItem(data: any) {
  return request('/sc-scm/sysNotice/insert', {
    method: 'POST',
    data,
  });
}

export async function deleteListItems(params: any) {
  return request('/sc-scm/sysNotice/delete', {
    method: 'GET',
    params,
  });
}

export async function getDetail(params: any) {
  return request('/sc-scm/sysNotice/findById', {
    method: 'GET',
    params,
  });
}

export async function countTotal() {
  return request('/sc-scm/sysNotice/countTotal', {
    method: 'GET',
  });
}

// -----我的消息(用户消息)-----
export async function getListUser(data: any) {
  return request('/sc-scm/userNotice/page', {
    method: 'POST',
    data,
  });
}

export async function getDetailUser(params: any) {
  return request('/sc-scm/userNotice/findById', {
    method: 'GET',
    params,
  });
}

export async function setRead(params: any) {
  return request('/sc-scm/userNotice/read', {
    method: 'GET',
    params,
  });
}

export async function setReadAll() {
  return request('/sc-scm/userNotice/readAll');
}

export async function countUnread(currentUser: any) {
  if (currentUser) {
    return request('/sc-scm/userNotice/countUnread');
  }
  return Promise.resolve(0);
}

export async function countTotalUser() {
  return request('/sc-scm/userNotice/countTotal');
}

export async function deleteListItemsUser(params: any) {
  return request('/sc-scm/userNotice/delete', {
    method: 'GET',
    params,
  });
}

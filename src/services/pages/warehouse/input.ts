import {request} from 'umi';

// ---退货入库
export async function getExchangeInfo(params: { express_code: string }) {
  return request('/sc-scm/ownStockManagement/getExchangeInfo', {
    method: 'GET',
    params,
  });
}
export async function addReturnOrder(data: { express_code: string, detailList: any[], manualDetailList: any[] }) {
  return request('/sc-scm/ownStockManagement/addReturnOrder', {
    method: 'POST',
    data,
  });
}

export async function returnOrderPage(data: any) {
  return request('/sc-scm/ownStockManagement/returnOrderPage', {
    method: 'POST',
    data,
  });
}

export async function returnOrderAddRemark(data: any) {
  return request('/sc-scm/ownStockManagement/returnOrderAddRemark', {
    method: 'POST',
    data,
  });
}
export async function partsOrderAddRemark(data: any) {
  return request('/sc-scm/ownStockManagement/partsOrderAddRemark', {
    method: 'POST',
    data,
  });
}

export async function returnOrder(params: {id: string}) {
  return request('/sc-scm/ownStockManagement/returnOrder', {
    method: 'GET',
    params,
  });
}


// ---采购入库
export async function addPartsOrder(data: { order_no: string, orderSkuList: any[] }) {
  return request('/sc-scm/ownStockManagement/addPartsOrder', {
    method: 'POST',
    data,
  });
}

export async function partsOrder(data: { keyWords: string }) {
  return request('/sc-scm/ownStockManagement/partsOrder', {
    method: 'POST',
    data,
  });
}
export async function partsOrderPage(data: any) {
  return request('/sc-scm/ownStockManagement/partsOrderPage', {
    method: 'POST',
    data,
  });
}

// 入库操作员
export async function returnWarehousingUserList(params: {user_name: string}) {
  return request('/sc-scm/ownStockManagement/returnWarehousingUserList', {
    method: 'GET',
    params,
  });
}
// 盘点和良品转不良品创建人
export async function createUserList(params: {user_name: string, order_type: 'TAKE_STOCK' | 'GOOD_TRANS_BAD' | 'USE_PARTS_STOCK_OUT' | 'BAD_STOCK_OUT'}) {
  return request('/sc-scm/ownStockManagement/createUserList', {
    method: 'GET',
    params,
  });
}
// 采购员
export async function partsPurchaserList(params: {user_name: string}) {
  return request('/sc-scm/ownStockManagement/partsPurchaserList', {
    method: 'GET',
    params,
  });
}

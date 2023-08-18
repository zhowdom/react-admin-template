import {
  getUserList,
  getVendorList,
  getVendorUserList,
  getVendorGroupList,
  findSelectGoodsSku,
  downloadSysImportTemplateByCode,
  sysCloudWarehousingCloudPage,
  customColumnList,
  vendorFeedback,
} from '@/services/base';
import { getList as getSignList } from '@/services/pages/sign';
import { getDepotList } from '@/services/pages/contract';
import {
  getSysPlatformList,
  findByPlatformId,
  getSysFreePlatformShopPage,
} from '@/services/pages/storageManage';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { dateFormat } from '@/utils/filter';
import { getSysPlatformShopPage, getSysPortPage } from '@/services/pages/storageManage';
import { getLogisticsPort } from '@/services/pages/logisticsManageIn/ports';
import { getList as getWarehouseIn } from '@/services/pages/stockUpIn/warehouse';
import * as math from 'mathjs';
import { allGoodsSkuBrand } from '@/services/pages/establish';
import { getList as getLinkList } from '@/services/pages/link';

/*浮点运算精度问题*/

// 计算 精度问题
export const printFn = function (value: any) {
  const precision = 14;
  return Number(math.format(value, precision));
};

//加法
export const add = function (a: number, b: number): number {
  return printFn(a + b);
};

//减法
export const sub = function (a: number, b: number) {
  return add(a, -b);
};

//乘法
export const mul = function (a: number, b: number): number {
  return printFn(a * b);
};

//除法
export const divide = function (a: number, b: number): number {
  return printFn(a / b);
};

// 数组求和 一维
export const arraySum = function (arr: any = []): number {
  let s = 0;
  arr.forEach((val: any) => {
    if (val) {
      s = add(s, val);
    }
  }, 0);
  return s;
};
export const rnd = function (n:number, m:number):number {
  return Math.floor(Math.random() * (m - n) + n)
}
// 数组求和 多维
export const arraySum1 = function (arr: any = []): number {
  const len = arr.length;
  if (len == 0) {
    return 0;
  } else if (len == 1) {
    return arr[0];
  } else {
    return arr[0] + arraySum1(arr.slice(1));
  }
};
// 防抖
export const debounce = (fn: any, wait: number | undefined) => {
  let timer: any = null;
  return function () {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, wait);
  };
};
// 获取uuid
export const getUuid = () => {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  // @ts-ignore
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-';

  const uuid = s.join('');
  return uuid;
};

/* 上传后 得到上传文件的后辍名 */
export const pubGetUploadFileSuffix = function (fileName: any) {
  if (!fileName) return '';
  const suffix = fileName.split('.');
  return suffix[suffix.length - 1].toLowerCase();
};

/* 上传前 校验格式 校验数量 校验上传大小  */
export const pubBeforeUpload = function (data: any) {
  const { file, acceptType, maxSize, maxCount, overFileList, acceptMessage, fileData } = data;
  // console.log('当前上传的文件类型为', pubGetUploadFileSuffix(file.name));
  // console.log(file, 'file');
  const all = overFileList ? JSON.parse(JSON.stringify(overFileList)) : [];
  // console.log(all);
  const fileTure = all.filter((item: any) => !item.delete);
  // console.log(fileTure);
  // 数量校验
  if (maxCount && maxCount != 1) {
    const isNum = maxCount && maxCount > fileTure.length;
    if (!isNum) {
      pubMsg('上传文件数量不能大于' + maxCount + '!');
      return false;
    }
  }
  // console.log('file');
  // 格式校验
  const isJpgOrPngOrPdf =
    acceptType && acceptType.indexOf(pubGetUploadFileSuffix(file.name)) === -1 ? false : true;
  if (!isJpgOrPngOrPdf) {
    pubMsg(acceptMessage || '上传格式不正确!');
    return false;
  }

  // console.log('file');
  // 组合文件的单独处理
  if (fileData) {
    const mp4 = fileTure.filter((item: any) => {
      return pubGetUploadFileSuffix(item.url) == 'mp4';
    });
    const pic = fileTure.filter((item: any) => {
      return pubGetUploadFileSuffix(item.url) != 'mp4';
    });
    if (pic.length >= fileData.pic.count && pubGetUploadFileSuffix(file.name) != 'mp4') {
      pubMsg(`最多可以传${fileData.pic.count}张图片`);
      return false;
    }
    if (mp4.length >= fileData.video.count && pubGetUploadFileSuffix(file.name) == 'mp4') {
      pubMsg(`最多可以传${fileData.video.count}个视频`);
      return false;
    }
    if (pubGetUploadFileSuffix(file.name) == 'mp4') {
      if (file.size > fileData.video.size * 1024 * 1024) {
        pubMsg('视频不能大于10M');
        return false;
      }
    } else {
      if (file.size > fileData.pic.size * 1024 * 1024) {
        pubMsg('图片不能大于2M');
        return false;
      }
    }
  } else {
    if (maxSize) {
      // 大小校验
      const isBigOut = maxSize && file.size <= maxSize * 1024 * 1024;
      if (!isBigOut) {
        pubMsg('文件不能超过' + maxSize + 'MB!');
        return false;
      }
    }
  }
  // console.log('file');
  return true;
};





/* 判断浏览器是否为 IE 内核，edge */
export const getExplorer = (function () {
  const explorer = window.navigator.userAgent;
  const compare = function (s: any) { return (explorer.indexOf(s) >= 0); };
  const ie11 = (function () { return ("ActiveXObject" in window) })();
  if (compare("MSIE") || ie11) { return 'ie'; }
  else if (compare("Firefox") && !ie11) { return 'Firefox'; }
  else if (compare("Chrome") && !ie11) {
    if (explorer.indexOf("Edg") > -1) {// 这里必须是Edg，不是Edge
      return 'Edge';
    } else {
      return 'Chrome';
    }
  }
  else if (compare("Opera") && !ie11) { return 'Opera'; }
  else if (compare("Safari") && !ie11) { return 'Safari'; }
  return ''
})();





/* 下载文件  */
export const pubDownLoad = function (url?: string, name?: string, isView?: boolean) {
  if (!url) return pubMsg('文件内容为空，下载失败出错！');
  // const res = await baseDownLoadFile({
  //   id: data.id,
  // });
  // if (!res) return pubMsg('下载失败，请重试!');
  // const blob = new Blob([res]);
  // const objectURL = URL.createObjectURL(blob);
  // const btn = document.createElement('a');
  // btn.download = data.name ? data.name : '文件下载';
  // btn.href = objectURL;
  // btn.click();
  // URL.revokeObjectURL(objectURL);

  const btn = document.createElement('a');
  if (!isView) {
    btn.download = name ? name : '文件下载';
  }
  btn.href = url;
  console.log(getExplorer)
  if (getExplorer != 'Edge') {
    btn.target = '_blank';
  }
  btn.click();
};
/* 下载文件 - 二进制流/json返回*/
export const pubBlobDownLoad = async function (
  res: { response: any; data: any; message?: any },
  customFileName?: string,
  callBack?: any,
  ifaltersuffixName?: any,
) {
  const type = res?.response?.headers.get('content-type');
  if (type?.indexOf('application/json') > -1) {
    if (res?.message) {
      pubMsg(res?.message);
    } else if (res?.response?.json) {
      res?.response.json().then((r: any) => {
        if (r.code == pubConfig.sCode || r.code == pubConfig.sCodeOrder) {
          pubMsg(r?.message, 'success');
          if (callBack) callBack(true);
        } else {
          pubMsg(r?.message);
          if (callBack) callBack(false);
        }
      });
    }
  } else {
    const blob = new Blob([res.data || res], { type: 'application/vnd.ms-excel;charset=UTF-8' });
    const objectURL = URL.createObjectURL(blob);
    const btn = document.createElement('a');
    let fileName:any = ifaltersuffixName ? customFileName : (customFileName ? `${customFileName}.xls` : `${document.title}-文件下载.xls`);
    const fileData = res?.response?.headers.get('content-disposition');
    if (fileData) {
      fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
    }
    btn.download = fileName;
    btn.href = objectURL;
    btn.click();
    URL.revokeObjectURL(objectURL);
    // 因存在部分成功,所以回调
    if (callBack) callBack(false);
  }
};
/* pdf下载文件 - 二进制流/json返回*/
export const pubPdfBlobDownLoad = async function (res: any, customFileName: string) {
  if (!res) {
    pubMsg('下载失败!');
  } else {
    const blob = new Blob([res], { type: 'application/pdf;charset=UTF-8' });
    const objectURL = URL.createObjectURL(blob);
    const btn = document.createElement('a');
    btn.download = customFileName ? `${customFileName}.pdf` : `${document.title}-文件下载.pdf`;
    btn.href = objectURL;
    btn.target = '_blank';
    btn.click();
    URL.revokeObjectURL(objectURL);
  }
};

/* 新窗口打开链接  */
export const pubGoUrl = function (url?: string) {
  console.log(url);
  if (!url) return pubMsg('链接为空！');
  const btn = document.createElement('a');
  btn.href = url;
  btn.target = '_blank';
  btn.click();
};

/* 需要导入的地方的 模板下载  参照 模板管理里的code */
export const pubDownloadSysImportTemplate = function (
  code: string,
  title?: string,
  platform_code?: any,
) {
  return new Promise(async (resolve) => {
    const res: any = await downloadSysImportTemplateByCode({ code, platform_code });
    const type = res.response.headers.get('content-type');
    if (type === 'application/json') {
      pubMsg(res?.message || '下载失败');
      resolve('over');
      return;
    }
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
    const objectURL = URL.createObjectURL(blob);
    const btn = document.createElement('a');
    const fileData = res.response.headers.get('content-disposition');
    let fileName = title || '下载文件.xls';
    const newTime = dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss');
    if (fileData) {
      fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
    }
    btn.download = `${newTime + fileName}`;
    btn.href = objectURL;
    btn.click();
    URL.revokeObjectURL(objectURL);
    resolve('over');
    return;
  });
};

/* 获取人员数据 -- 搜索下拉框 */
export const pubGetUserList = function (key?: any): Promise<any> {
  return new Promise(async (resolve) => {
    const res = await getUserList({
      key_word: key?.keyWords?.replace(/(^\s*)/g, '') || '',
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data.map((v: any) => {
      return {
        ...v,
        value: v.id,
        label: v.name + '(' + v.account + ')',
        name: v.name,
      };
    });
    resolve(newArray);
  });
};
/* 获取供应商数据 -- 搜索下拉框 */
export const pubGetVendorList = function (search?: any): Promise<any> {
  return new Promise(async (resolve) => {
    const res = await getVendorList({
      ...search,
      current_page: 1,
      page_size: 999,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data?.records.map((v: any) => {
      return {
        value: v.id,
        label: v.name + '(' + v.code + ')',
        name: v.name,
        data: v,
      };
    });
    resolve(newArray);
  });
};

/* 获取供应商数据 -- 搜索下拉框 创建合同时，只能选择状态为合作中并且，没有未完结的供应商信息变更审批流程的供应商数据*/
export const pubGetSigningListContract = function (key?: any) {
  return new Promise(async (resolve) => {
    const res = await getVendorList({
      key_word: key.keyWords,
      approval_status_array: key.approval_status_array,
      vendor_status: key.vendor_status, //状态 合作中
      current_page: 1,
      page_size: 999,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data?.records.map((v: any) => {
      return {
        value: v.id,
        label: v.name + '(' + v.code + ')',
        name: v.name,
        data: v,
      };
    });
    resolve(newArray);
  });
};

/* 获取供应商用户数据 -- 搜索下拉框 消息通知用 */
export const pubGetVendorUserList = function (key?: any) {
  return new Promise(async (resolve) => {
    const res = await getVendorUserList({
      vendor_name: key.keyWords,
      current_page: 1,
      page_size: 30,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data?.records.map((v: any) => {
      return {
        value: v.id,
        label: v.vendor_name + '(' + v.vendor_code + ')',
        name: v.vendor_name,
      };
    });
    resolve(newArray);
  });
};
/* 获取签约主体数据 -- 搜索下拉框 */
export const pubGetSigningList = function (data?: any): any {
  return new Promise(async (resolve) => {
    const res = await getSignList({
      ...data,
      current_page: 1,
      page_size: 999,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data?.records.map((v: any) => {
      return {
        value: v.id,
        label: v.client_corp_name,
      };
    });
    resolve(newArray);
  });
};
/* 获取签约主体数据 -- 创建合同时，只能选认证过的主体 */
export const pubGetSigningListAuth = function (data?: any) {
  return new Promise(async (resolve) => {
    const res = await getSignList({
      current_page: 1,
      page_size: 999,
      ...data,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data?.records.map((v: any) => {
      return {
        value: v.id,
        label: v.client_corp_name,
      };
    });
    resolve(newArray);
  });
};
/* 获取合同模板数据 -- 搜索下拉框 */
export const pubGetDepotList = function (key?: any) {
  return new Promise(async (resolve) => {
    const res = await getDepotList({ name: key.keyWords });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data.map((v: any) => {
      return {
        value: v.id,
        label: v.name,
      };
    });
    resolve(newArray);
  });
};
/* 获取产品线数据 -- 搜索下拉框 联级下拉*/
export const pubGetVendorGroupList = function () {
  return new Promise(async (resolve) => {
    const res = await getVendorGroupList({});
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    function changeItem(datas: any) {
      //遍历树  获取id数组
      datas.forEach((item: any) => {
        if (item.children) {
          changeItem(item.children);
        }
        item.value = item.id;
        item.label = item.name;
      });
      return datas;
    }
    const newArray = changeItem(res.data);
    resolve(newArray);
  });
};
/* 获取产品线数据 -- 搜索下拉框 树形下拉 兼容按父节点搜索*/
export const pubProLineList = function (params?: any): any {
  const postData = {
    ...params,
    current_page: 1,
    page_size: 10000,
  };
  return new Promise(async (resolve) => {
    const res = await getVendorGroupList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const temp =
      res?.data?.records.map((item: any) => {
        return {
          value: item.id,
          label: item.name,
        };
      }) || [];
    // const changeId = (arr: any[]) => {
    //   arr.forEach((item) => {
    //     if (item.children && item.children.length) {
    //       changeId(item.children);
    //       item.id = [item.id, ...item.children.map((val: any) => val.id)].toString();
    //     }
    //     item.value = item.id;
    //     item.label = item.name;
    //   });
    // };
    // changeId(temp);
    resolve(temp);
  });
};
/* 获取产品线数据 -- 树形搜索下拉框 先要循环业务范畴 再请求接口组成树 目前在数据权限地方用  需要在页面传数据字典进来*/
export const pubGetVendorGroupTree = function (dicList: any,status?: any) {
  return new Promise(async (resolve) => {
    const newArray = [];
    for (const i in dicList) {
      const item = {
        value: dicList[i].detail_code,
        label: dicList[i].detail_name,
        selectable: false,
        children: [],
      };
      const params: any = {
        business_scope: i,
        current_page: 1,
        page_size: 10000,
      }
      if(status){
        params.status = status
      }
      const res = await getVendorGroupList(params);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        function changeItem(datas: any) {
          //遍历树  获取id数组
          datas.forEach((k: any) => {
            if (k.children) {
              changeItem(k.children);
            }
            k.value = k.id;
            k.label = k.name;
          });
          return datas;
        }
        const newData = changeItem(res?.data?.records || []);
        item.children = newData;
      }
      newArray.push(item);
    }
    resolve(newArray);
  });
};

/* 商品sku查询 -- 搜索下拉框 可以公共用 key_code //sku或者名称(模糊匹配) 采购计划，发货计划用，独特的接口*/
export const pubSelectGoodsSku = function (key?: any) {
  console.log(key, 998);
  return new Promise(async (resolve) => {
    const res = await findSelectGoodsSku({
      ...key,
      key_code: key.key_code,
      key_code_in: key.key_code_in,
      shop_sku_code: key.shop_sku_code,
      shop_id: key.shop_id,
      platform_id: key.platform_id,
      business_scope: key.business_scope,
      current_page: 1,
      page_size: 999,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data?.records.map((v: any) => {
      return {
        value: v.id,
        label: v.sku_name + '(' + v.sku_code + ')',
        name: v.sku_name,
        code: v.sku_code,
        data: v,
      };
    });
    resolve(newArray);
  });
};

/* 获取平台数据 -- 搜索下拉框*/
export const pubGetPlatformList = function (data?: any): any {
  return new Promise(async (resolve) => {
    const res = await getSysPlatformList({ ...data });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data.map((v: any) => {
      return {
        ...v,
        value: v.id,
        label: v.name,
        platform_code: v.code,
        business_scope: v.business_scope,
      };
    });
    resolve(newArray);
  });
};
// 获取店铺
export const pubGetStoreList = function (data?: any, noStatus = false): any {
  return new Promise(async (resolve) => {
    const res = await getSysPlatformShopPage({
      page_size: 1000,
      platform_code: data && data.platform_code ? data.platform_code : '',
      platform_id: data && data.platform_id ? data.platform_id : '',
      business_scope: data && data.business_scope ? data.business_scope : '',
      current_page: 1,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data.records.map((v: any) => {
      return {
        ...v,
        status: noStatus ? true : v.status,
        value: v.id,
        label: v.shop_name,
      };
    });
    resolve(newArray);
  });
};
// 获取free店铺
export const pubFreeGetStoreList = function (data?: any) {
  console.log(data);
  return new Promise(async (resolve) => {
    const res = await getSysFreePlatformShopPage({
      page_size: 1000,
      platform_id: data && data.platform_id ? data.platform_id : '',
      business_scope: data.business_scope,
      current_page: 1,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data.records.map((v: any) => {
      return {
        value: v.id,
        label: v.shop_name,
        platform_name: v.platform_name,
      };
    });
    resolve(newArray);
  });
};
/* 获取港口 -- 搜索下拉框 */
export const pubGetSysPortList = function (search?: any) {
  return new Promise(async (resolve) => {
    const res = await getSysPortPage({
      ...search,
      current_page: 1,
      page_size: 999,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data?.records.map((v: any) => {
      return {
        value: v.id,
        label: v.name,
        data: v,
        status: v.status,
      };
    });
    resolve(newArray);
  });
};
/* 获取物流港口 -- 搜索下拉框 */
export const pubGetLogisticsPortList = function (search?: any) {
  return new Promise(async (resolve) => {
    const res = await getLogisticsPort({
      ...search,
      current_page: 1,
      page_size: 999,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data?.records.map((v: any) => {
      return {
        value: v.id,
        label: v.name,
        data: v,
        status: v.status,
      };
    });
    resolve(newArray);
  });
};
/*获取平台仓库枚举 - 跨境*/
export const pubPlatformWarehousingIn = function (data?: { site?: ''; platform_id?: '' }): any {
  return new Promise(async (resolve) => {
    const res = await getWarehouseIn({ ...data, page_size: '999', current_page: 1 });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data?.records.map((v: any) => {
      return {
        value: v.id,
        label: v.warehousing_name,
        status: v.status,
      };
    });
    resolve(newArray);
  });
};

/* 新增仓库时 获取仓库区域数据 新的 章发中 -- 搜索下拉框*/
export const pubGetPlatformRegion = function (data?: any) {
  return new Promise(async (resolve) => {
    const res = await findByPlatformId({ ...data });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data.map((v: any) => {
      return {
        value: v.id,
        label: v.region,
        data: v,
      };
    });
    resolve(newArray);
  });
};

/* 获取云仓仓库下拉 -- 搜索下拉框 目前只有 万里牛*/
export const pubGetCloudPage = function (search?: any) {
  return new Promise(async (resolve) => {
    const res = await sysCloudWarehousingCloudPage({
      current_page: 1,
      page_size: 999,
      ...search,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data?.records.map((v: any) => {
      return {
        value: v.id,
        label: v.warehousing_name + '(' + v.warehousing_code + ')',
        name: v.warehousing_name,
        disabled: v.status != 1,
        data: v,
      };
    });
    resolve(newArray);
  });
};

/* 获取用户列配置 */
export const pubGetColumnsState = (
  columnsSetting: any[] = [],
  columnState?: any,
  defaultHideColumn: string[] = [],
) => {
  const temp = {};
  columnsSetting.forEach((item: any) => {
    if (!item.hideInTable && !item.hideInSetting) {
      temp[item.dataIndex || item.key] = {
        show: !defaultHideColumn.includes(item.dataIndex),
        fixed: item.fixed,
      };
      if (item?.children?.length) {
        item.children.forEach((child: any) => {
          if (!child.hideInTable && !child.hideInSetting) {
            temp[child.dataIndex || child.key] = {
              show: !defaultHideColumn.includes(child.dataIndex),
              fixed: child.fixed,
            };
          }
        })
      }
    }
  });
  if (columnState) {
    let columnStateSetting = {};
    if (typeof columnState == 'object') {
      columnStateSetting = JSON.parse(columnState?.json);
    } else if (typeof columnState == 'string') {
      const localColumnSetting = localStorage.getItem(columnState);
      if (localColumnSetting) {
        columnStateSetting = JSON.parse(localColumnSetting);
      }
    }
    Object.keys(temp).forEach((key: any) => {
      temp[key] = columnStateSetting[key] || temp[key];
    });
  }
  // console.log(temp, columnState, 'pubGetColumnsState')
  return temp;
};
// 刷新用户列配置
export const pubRefreshColumnList = (initialState: any, setInitialState: any) => {
  customColumnList({}).then((res) => {
    if (res?.code == '0') {
      setInitialState({
        ...initialState,
        currentUser: {
          ...initialState?.currentUser,
          customColumnSetting: res?.data || [],
        },
      });
    }
  });
};
/* 投诉建议 供应商下拉  特殊的条件只能在投诉建议里用 -- 搜索下拉框 */
export const pubGetFeedbackVendorList = function () {
  return new Promise(async (resolve) => {
    const res = await vendorFeedback({});
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data?.map((v: any) => {
      return {
        value: v.id,
        label: v.name,
        data: v,
      };
    });
    resolve(newArray);
  });
};
/* 获取用户搜索条件配置 */
export const pubGetColumnsSearch = (columns: any[] = [], searchConfig: any) => {
  let temp = columns;
  if (searchConfig) {
    temp = columns.map((column: any) => {
      let order = 0;
      const matchedColumn: any = searchConfig.find((item: any, i: any) => {
        order = i;
        return item.dataIndex == column.dataIndex;
      });
      if (matchedColumn) {
        return {
          ...column,
          hideInSearch: !matchedColumn.show,
          order: order * -1,
        };
      }
      return column;
    });
  }
  return temp;
};



// 获取品牌
export const pubAllGoodsSkuBrand = function () {
  return new Promise(async (resolve) => {
    const res: any = await allGoodsSkuBrand({});
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data.map((v: any) => {
      return {
        value: v.id,
        label: v.brand_name,
      };
    });
    resolve(newArray);
  });
};

// 灰度环境隐藏
export const hiddenInGrey = function (data: any) {
  const isGrey = window.location.host == '172.16.99.72'; // 是不是灰度环境
  return isGrey ? '' : data;
};

// 灰度环境隐藏
export const IsGrey: any = window.location.host == '172.16.99.72'



/* 获取全部跨境链接 -- 搜索下拉框 查全量，前端搜索*/
export const pubAllLinks = function (search?: any) {
  return new Promise(async (resolve) => {
    const res = await getLinkList({
      ...search,
      business_scope: "IN",
      current_page: 1,
      label: "ALL",
      page_size: 999,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      resolve([]);
      return;
    }
    const newArray = res?.data?.records.map((v: any) => {
      return {
        value: v.id,
        label: v.link_name + '(' + v.link_id + ')',
        name: v.link_name,
        data: v,
      };
    });
    resolve(newArray);
  });
};

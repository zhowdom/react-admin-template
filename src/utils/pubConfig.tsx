import { Modal, message, notification } from 'antd';
import { pubProLineList, pubSelectGoodsSku } from '@/utils/pubConfirm';
import { getLinkName, getShopSkuCode } from '@/services/base';
import type { ProColumns } from '@ant-design/pro-components';
import { uniqBy } from 'lodash';
import { getGoods } from '@/services/pages/sample';

export const selectProps = {
  showSearch: true,
  filterOption: (input: any, option: any) => {
    const trimInput = input.replace(/^\s+|\s+$/g, '');
    if (trimInput) {
      return option.label.indexOf(trimInput) >= 0;
    } else {
      return true;
    }
  },
};
/*公共变量*/
export const pubConfig = {
  sCode: '0', // 接口成功时常量
  sCodeOrder: '0', // 订单系统
  message: '系统繁忙，请稍后再试！', // 接口失败时，message为空时提示信息
};

/* 数据字典里的数据过滤显示 */
export const pubFilter = function (data: any, key: string | number) {
  if (!data) return;
  if (!data[key]) return;
  return data[key].text;
};
/* 本地维护的数据过滤显示 */
export const pubMyFilter = function (data: any, key: string | number) {
  if (!data) return;
  const filter = data.find((val: any) => val.value == key);
  return filter ? filter.label : '';
};

/* 公共弹窗 */
/* message弹窗 */
/*
  type：success error warning; 不传为默认值，默认为error
  eg: pubMsg('提示内容','success')
  eg: pubMsg('提示内容')
*/
export const pubMsg = function (text: any, type?: string, option?: any) {
  const newType = type || 'error';
  message.destroy();
  if (!text) {
    return message[newType](text || pubConfig.message, option);
  } else {
    const newText = text.replace(/<br\s*\/>/g, '\n').replace(/\r/g, '\n').split('\n');
    const backText = newText.length > 1 ? (
      newText.map((v: any) => {
        return (<>{v}<br /></>);
      })
    ) : newText[0];
    return message.open({
      ...option,
      className: 'pubMsg-style',
      type: newType,
      content: backText,
      // duration: 0
    });

  }
};
/* notification弹窗 */
/*
  type：success error warning; 不传为默认值，默认为error
  eg: pubMessage('提示内容','success')
  eg: pubMessage('提示内容')
*/
export const pubMessage = function (text: string, type?: string) {
  const newType = type || 'error';
  return notification[newType]({
    message: '提示',
    description: text || pubConfig.message,
  });
};

/* alert弹窗 只有确定按钮 */
/*
  type：info success error warning; 不传为默认值，默认为info
  eg: pubAlert('信息错误','警告','success')
  eg: pubAlert('信息错误','','success')
  eg: pubAlert('信息错误','警告')
  eg: 点击确定后需要触发某操作
  pubAlert('信息错误','警告','success').then(()=>{
    console.log('点击了确定')
  })
*/
export const pubAlert = function (text: any, title?: string, type?: string) {
  const newType = type || 'info';
  const newTitle = title || '提示';
  return new Promise((resolve) => {
    Modal[newType]({
      title: newTitle,
      content: text,
      onOk() {
        resolve('ok');
      },
    });
  });
};
/* 提示弹窗 有确定+取消 按钮 */
/*
  eg: 点击确定后需要触发某操作
  pubModal('信息错误','警告').then(()=>{
    console.log('点击了确定')
  }).catch(()=>{
    console.log('点击了取消')
  })
*/
export const pubModal = function (text?: any, title?: string, options?: any) {
  const newTitle = title || '提示';
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: newTitle,
      content: text,
      okText: '确定',
      cancelText: '考虑一下',
      // getContainer: () =>
      //   document.querySelector('.ant-pro-table') || (document.querySelector('body') as HTMLElement),
      onOk() {
        resolve('ok');
      },
      onCancel() {
        reject();
      },
      ...options,
    });
  });
};

/* 复制文本 */
/*
  document.execCommand('Copy'); // 未来将被弃用
*/
export const pubCopyText = function (text: any) {
  // https下才可以用navigator 所以要判断一下，如果不是https，则用旧的
  if (navigator.clipboard && window.isSecureContext) {
    if (!text) return pubMsg('请选择复制内容')
    navigator.clipboard.writeText(text).then(() => {
      pubMsg('复制成功', 'success')
    })
  } else {
    const oInput: any = document.createElement('input');
    oInput.style.border = '0 none';
    oInput.style.color = 'transparent';
    oInput.value = text;
    document.body.appendChild(oInput);
    oInput.select(); // 选择对象
    document.execCommand('Copy'); // 执行浏览器复制命令
    pubMsg('复制成功', 'success');
    oInput.parentNode.removeChild(oInput);
  }
};

// 表单校验提示, 参数是form.validateFields方法返回的校验, 参考 src/pages/Signature/detail.tsx onFinish配置的写法
export const onFinishFailed = (error: { errorFields: any }) => {
  // 第二次点击滚动到错误位置
  const errorEl = document.querySelector('.ant-form-item-has-error');
  if (errorEl) errorEl.scrollIntoView(true);
  if (error.errorFields && error.errorFields[0]) {
    pubMsg(`未通过表单校验 ${error.errorFields[0]?.errors[0]}`);
  } else {
    pubMsg(`未通过表单校验, 请检查`);
  }
};
/* 固定的数据枚举 */
// 合同管理 - 合同类别
export const pubContractType = [
  { value: 0, label: '固定合同模板' },
  { value: 1, label: '自定义合同' },
];
// 商品 - 规格类型
export const pubProductSpecs = [
  { value: 1, label: '单品尺寸' },
  { value: 2, label: '包装尺寸' },
  { value: 3, label: '箱规' },
];
// 商品SKU - 是否含税
export const pubIncludedTax = [
  { value: 0, label: '否' },
  { value: 1, label: '是' },
];

// 商品SKU - 币别
export const pubScCurrency = [
  { value: 'CNY', label: '￥' },
  { value: 'USD', label: '$' },
];
// 签样状态
export const pubSignature = {
  10: {
    status: 'default',
    text: '待签样',
  },
  11: {
    status: 'success',
    text: '已签样',
  },
};
// 价格审批状态
export const pubPriceApproval = {
  7: {
    status: 'default',
    text: '价格审批中',
  },
  8: {
    status: 'error',
    text: '价格审批不通过',
  },
};
// 必填校验
export const pubRequiredRule = { required: true, message: '必填项' };
// 长度校验
export const pubRequiredLengthRule = (value: any, length: number, msg?: string) => {
  if (value?.length > length) {
    return Promise.reject(new Error(msg || `输入内容不能超过 ${length} 位`));
  }
  return Promise.resolve();
};
// 数字大小校验不能超过
export const pubRequiredMaxRule = (value: any, max: number, required?: boolean, msg?: string) => {
  if (required && typeof value != 'number') {
    return Promise.reject(new Error(msg || `内容必填`));
  }
  if (value > max) {
    return Promise.reject(new Error(msg || `输入内容不能超过 ${max} `));
  }
  return Promise.resolve();
};
// 数字大小校验不能小于
export const pubRequiredMinRule = (value: any, min: number, required?: boolean, msg?: string) => {
  if (required && typeof value != 'number') {
    return Promise.reject(new Error(msg || `内容必填`));
  }
  if (value < min) {
    return Promise.reject(new Error(msg || `输入内容不能小于 ${min} `));
  }
  return Promise.resolve();
};
// 文件上传类型accept配置
export const acceptTypes = {
  doc: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  excel:
    '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  img: '.jpg,.jpeg,.png,.gif,svg,image/*',
  zip: '.zip,.rar,.7z,application/zip,application/x-zip,application/x-zip-compressed',
  pdf: '.pdf,application/pdf',
  ppt: '.ppt,.pptx,application/vnd.ms-powerpoint',
};
// 小数点末尾0裁切
export const handleCutZero = (num: any) => {
  //拷贝一份 返回去掉零的新串
  let newstr = num;
  //循环变量 小数部分长度
  const leng = num.length - num.indexOf('.') - 1;
  //判断是否有效数
  if (num.indexOf('.') > -1) {
    //循环小数部分
    for (let i = leng; i > 0; i--) {
      //如果newstr末尾有0
      if (newstr.lastIndexOf('0') > -1 && newstr.substr(newstr.length - 1, 1) == 0) {
        const k = newstr.lastIndexOf('0');
        //如果小数点后只有一个0 去掉小数点
        if (newstr.charAt(k - 1) == '.') {
          return newstr.substring(0, k - 1);
        } else {
          //否则 去掉一个0
          newstr = newstr.substring(0, k);
        }
      } else {
        //如果末尾没有0
        return newstr;
      }
    }
  }
  return num;
};
// 公共输入过滤 空格换行等
export const pubNormalize = (val: string) => val?.replace(/[\r\n\t\s]/g, '');

// sku搜索table columns配置 跨境
export const pubColumnSku = (
  title: string,
  dimensionValue: any,
  platform_code: any,
  user_id: any,
  order?: any,
  initialValue?: any,　// 默认值
): ProColumns => ({
  title,
  order: order || 4,
  dataIndex: 'dimensionNames' + platform_code,
  hideInTable: true,
  valueType: 'select',
  params: { dimension: dimensionValue },
  fieldProps: {
    mode: 'multiple',
    autoClearSearchValue: true,
    showSearch: true,
  },
  formItemProps: {
    rules: [pubRequiredRule],
  },
  initialValue:initialValue,
  request: async (paramsRequest: any) => {
    let res: any = [];
    if (dimensionValue == 'CATEGORY') {
      res = await pubProLineList({
        business_scope: 'IN',
        status: '4',
        user_id,
        platform_code,
      });
    } else if (dimensionValue == 'SPU') {
      res = await getLinkName({ business_scope: 'IN', user_id, platform_code });
    } else if (dimensionValue == 'SKU') {
      res = await getShopSkuCode({
        sku_type: '1',
        shop_sku_code: paramsRequest.keyWords,
        user_id,
        platform_code,
        business_scope: 'IN',
      });
      const temp = res?.map((val: any) => ({
        label: `${val?.shop_sku_code}(SPU:${val?.link_name || '未知'})`,
        value: `${val?.shop_sku_code}`,
      }));
      return uniqBy(temp, 'value');
    }
    return res.map((item: any) => ({ label: item.label, value: item.label }));
  },
  search: {
    transform: (val: any) => ({ dimensionNames: val }),
  },
});

// sku搜索table columns配置
export const pubColumnSkuCN = (
  title: string,
  dimensionValue: any,
  user_id: any,
  order?: any,
): ProColumns => ({
  title,
  order: order || 4,
  dataIndex: 'dimensionNames' + dimensionValue,
  hideInTable: true,
  valueType: 'select',
  params: { dimension: dimensionValue },
  fieldProps: {
    mode: 'multiple',
    autoClearSearchValue: true,
    showSearch: true,
  },
  formItemProps: {
    rules: [pubRequiredRule],
  },
  request: async () => {
    let res: any = [];
    if (dimensionValue == 'CATEGORY') {
      res = await pubProLineList({
        business_scope: 'CN',
        status: '4',
        user_id,
      });
    } else if (dimensionValue == 'SPU') {
      const data = await getGoods({
        current_page: 1,
        page_size: 100000,
        business_scope: 'CN',
      });
      if (data?.code != pubConfig.sCode) {
        pubMsg(data?.message);
        res = [];
      } else {
        const newObj = data?.data?.records.map((item: any) => {
          return {
            value: item.id,
            label: item.name_cn,
          };
        });
        res = newObj;
      }
    } else if (dimensionValue == 'SKU') {
      res = await pubSelectGoodsSku({
        business_scope: 'CN',
        sku_type: 1,
      });
      const temp = res?.map((val: any) => ({
        label: `${val.code}(${val.name})`,
        value: JSON.stringify({ label: val.name, value: `${val?.value}` }),
      }));
      return uniqBy(temp, 'value');
    }
    return res.map((item: any) => ({
      label: item.label,
      value: JSON.stringify({ label: item.label, value: `${item.value}` }),
    }));
  },
  search: {
    transform: (val: any) => ({ dimensionNames: val }),
  },
});

// 常用请求接口返回处理
export const pubResponse = (res: any = {}, callback?: any) => {
  if (res?.code == pubConfig.sCode) {
    pubMsg(res?.message, 'success')
    if (callback) callback()
    return true
  } else {
    pubMsg(res?.message)
    return false
  }
}

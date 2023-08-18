import moment from 'moment';
import { sortBy } from 'lodash';
/* 日期转换 */
const padLeftZero = function (str: string) {
  return ('00' + str).substr(str.length);
};
const formatDate = function (date: any, fmt: any) {
  if (date) {
    const value = typeof date == 'string' ? date.replace(/-/g, '/') : date;
    const newDate = new Date(value);
    let newFmt = fmt;
    if (/(y+)/.test(fmt)) {
      newFmt = newFmt.replace(RegExp.$1, (newDate.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    const o = {
      'M+': newDate.getMonth() + 1,
      'd+': newDate.getDate(),
      'h+': newDate.getHours(),
      'm+': newDate.getMinutes(),
      's+': newDate.getSeconds(),
    };
    for (const k in o) {
      if (new RegExp(`(${k})`).test(newFmt)) {
        const str = o[k] + '';
        newFmt = newFmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str));
      }
    }
    return newFmt;
  } else {
    return '--';
  }
};
/* 时间过滤*/
export const dateFormat = function (vTime: any, fmt?: string) {
  // fmt "yyyy-MM-dd hh:mm:ss"
  const vF = fmt ? fmt : 'yyyy-MM-dd';
  return formatDate(vTime, vF);
};

/* 价格显示过滤*/
export const changeNum = function (value: any) {
  const newValue = parseFloat(value);
  //判断是否有小数点
  const s = newValue.toString().indexOf('.');
  if (s == -1) {
    // 是整数
    return (newValue || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + '.00';
  } else {
    // 是小数
    const arr = newValue.toString().split('.');
    if (arr.length > 1 && arr[1].length < 2) {
      // 一位小数
      return (arr[0] || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + '.' + arr[1] + '0';
    } else {
      // 两位小数以上
      return (arr[0] || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + '.' + arr[1];
    }
  }
};
// 单位元 保留两位小数并带千分位符
export const priceValue = function (value: any, currency?: string) {
  if (!value) {
    return '0';
  }
  return currency ? currency + changeNum(value) : changeNum(value);
};
// 整数的千分位
export const NumberValue = function (value: number | string) {
  return (value || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
};

// 数字金额转换为大写人民币汉字
export const convertCurrency = function (money: any) {
  //汉字的数字
  const cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
  //基本单位
  const cnIntRadice = new Array('', '拾', '佰', '仟');
  //对应整数部分扩展单位
  const cnIntUnits = new Array('', '万', '亿', '兆');
  //对应小数部分单位
  const cnDecUnits = new Array('角', '分', '毫', '厘');
  //整数金额时后面跟的字符
  const cnInteger = '整';
  //整型完以后的单位
  const cnIntLast = '元';
  //最大处理的数字
  const maxNum = 999999999999999.9999;
  //金额整数部分
  let integerNum;
  //金额小数部分
  let decimalNum;
  //输出的中文金额字符串
  let chineseStr = '';
  //分离金额后用的数组，预定义
  let parts;
  if (money == '') {
    return '--';
  }
  const newMoney = parseFloat(money);
  if (newMoney >= maxNum) {
    //超出最大处理数字
    return '';
  }
  if (newMoney == 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger;
    return chineseStr;
  }
  //转换为字符串
  const stMoney = newMoney.toString();
  if (stMoney.indexOf('.') == -1) {
    integerNum = stMoney;
    decimalNum = '';
  } else {
    parts = stMoney.split('.');
    integerNum = parts[0];
    decimalNum = parts[1].substr(0, 4);
  }
  //获取整型部分转换
  if (parseInt(integerNum, 10) > 0) {
    let zeroCount = 0;
    const IntLen = integerNum.length;
    for (let i = 0; i < IntLen; i++) {
      const n = integerNum.substr(i, 1);
      const p = IntLen - i - 1;
      const q = p / 4;
      const m = p % 4;
      if (n == '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        }
        //归零
        zeroCount = 0;
        chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
      }
      if (m == 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q];
      }
    }
    chineseStr += cnIntLast;
  }
  //小数部分
  if (decimalNum != '') {
    const decLen = decimalNum.length;
    for (let i = 0; i < decLen; i++) {
      const n = decimalNum.substr(i, 1);
      if (n != '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr == '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum == '') {
    chineseStr += cnInteger;
  }
  return chineseStr;
};

// ProSelect组件搜索, 过滤label
export const filterOption = (input: any, option: any) => {
  const trimInput = input.replace(/^\s+|\s+$/g, '');
  if (trimInput) {
    return option.label.indexOf(trimInput) >= 0;
  } else {
    return true;
  }
};
export const GetDateStr = (date: any, AddDayCount: any) => {
  const dd = new Date(date);
  dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期
  const y = dd.getFullYear();
  const m = dd.getMonth() + 1 < 10 ? '0' + (dd.getMonth() + 1) : dd.getMonth() + 1; //获取当前月份的日期，不足10补0
  const d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate(); //获取当前几号，不足10补0
  return y + '-' + m + '-' + d;
};
export function checkDate(date1: any, date2: any) {
  const oDate1 = new Date(date1);
  const oDate2 = new Date(date2);
  if (oDate1.getTime() > oDate2.getTime()) {
    return true;
  } else {
    return false;
  }
}
// 通过缓存的column配置算出table的滚动配置, compensate: 用于内嵌表格的补偿
export const scrollByColumn = (storage: string | Record<string, any>, compensate: number = 0) => {
  let visibleColumnNum = compensate;
  let columnsStateObj = {};
  if (typeof storage == 'string') {
    const columnsState = window.localStorage.getItem(storage);
    if (columnsState) {
      columnsStateObj = JSON.parse(columnsState);
    }
  } else if (typeof storage == 'object') {
    columnsStateObj = storage;
  }
  Object.keys(columnsStateObj).forEach((key: string) => {
    if (columnsStateObj[key].show) visibleColumnNum++;
  });
  // console.log(visibleColumnNum, columnsStateObj, 'visibleColumnNum');
  if (visibleColumnNum == compensate) {
    return 0;
  }
  return 100 * visibleColumnNum;
};

// 自定义列配置title字段转成string格式
export const computedColumnTitle = (title: Record<string, any> | string, r: string) => {
  let titleTemp = typeof title == 'object' ? '' : title;
  const computedTitle = (data: any, result: string) => {
    titleTemp = result;
    if (typeof data == 'string') {
      titleTemp += data;
    } else if (typeof data == 'object') {
      if (typeof data?.props?.children == 'string') {
        titleTemp += data?.props?.children;
      } else if (data?.props?.children?.length) {
        data.props.children.forEach((item: any) => {
          computedTitle(item, titleTemp);
        });
      }
    }
    return titleTemp;
  };
  if (typeof title == 'object') computedTitle(title, r);
  return titleTemp;
};

// 自定义列导出 需要的额外数据
export const computedColumnConfig = (columns: any = [], columnsSetting: any = {}) => {
  const temp =
    columns
      .filter((item: any) => {
        if (item.hideInTable || item.hideInExport || item.valueType == 'option') return false;
        if (item.key && columnsSetting[item.key]) {
          return !!columnsSetting[item.key].show;
        } else if (columnsSetting[item.dataIndex]) {
          return !!columnsSetting[item.dataIndex].show;
        }
        return true;
      })
      .map((item: any) => {
        let title = item.title;
        if (typeof title == 'object') {
          title = computedColumnTitle(title, '');
        }
        return {
          title: item?.titleExport || title,
          dataIndex: item.dataIndex,
          order: columnsSetting[item.dataIndex]?.order || 0,
          fixed: columnsSetting[item.dataIndex]?.fixed || 0,
        };
      }) || [];
  return sortBy(temp, ['order', 'fixed']);
};
// 表格单元格合并数据处理 只支持最多合并三级, 二级列表字段名: innerListProp2 三级列表字段名: innerListProp3, isOverwrite: 是子覆盖父还是按子类型归类(按子归类, 表格需要用nameList的方式配置column),
export const flatData = (
  list: any[],
  innerListProp2: string = 'null',
  innerListProp3: string = 'null',
  isOverwrite: boolean = true, // 是否子覆盖父
) => {
  const dataFlat: any[] = [];
  if (list.length) {
    list.forEach((item1: any) => {
      if (item1[innerListProp2]?.length) {
        item1[innerListProp2].forEach((item2: any, index2: number) => {
          if (item2[innerListProp3]?.length) {
            item2[innerListProp3].forEach((item3: any, index3: number) => {
              let rowSpan1 = 0;
              if (index2 == 0 && index3 == 0) {
                if (item1[innerListProp2]?.length) {
                  item1[innerListProp2].forEach((a: any) => {
                    if (a[innerListProp3]?.length) {
                      rowSpan1 += a[innerListProp3].length;
                    }
                  });
                }
              }
              let rowSpan2 = 0;
              if (index3 == 0) {
                rowSpan2 = item2[innerListProp3].length || 1;
              }
              if (isOverwrite) {
                dataFlat.push({
                  ...item1,
                  ...item2,
                  ...item3,
                  [innerListProp2]: null,
                  [innerListProp3]: null,
                  rowSpan1,
                  rowSpan2,
                });
              } else {
                dataFlat.push({
                  ...item1,
                  [innerListProp2]: item2,
                  [innerListProp3]: item3,
                  rowSpan1,
                  rowSpan2,
                });
              }
            });
          } else {
            let rowSpan1 = 0;
            if (index2 == 0) {
              rowSpan1 = item1[innerListProp2].length || 1;
            }
            if (isOverwrite) {
              dataFlat.push({ ...item1, ...item2, [innerListProp2]: null, rowSpan1 });
            } else {
              dataFlat.push({ ...item1, [innerListProp2]: item2, rowSpan1 });
            }
          }
        });
      } else {
        dataFlat.push({ ...item1, rowSpan1: 1 });
      }
    });
  }
  return dataFlat;
};

// 获取周的开始和结束时间, prop格式 week: 2022-10周 or 2022-10
export const weekToDate = (week: any = '') => {
  if (typeof week == 'string') {
    const start = moment(week.split('周')[0], 'YYYY-WW').startOf('week').format('MM.DD');
    const end = moment(week.split('周')[0], 'YYYY-WW').endOf('week').format('MM.DD');
    return `${start}-${end}`;
  }
  return week;
};

export const getSum = (arr: any): number => {
  const len = arr.length;
  if (len == 0) {
    return 0;
  } else if (len == 1) {
    return arr[0];
  } else {
    return arr[0] + getSum(arr.slice(1));
  }
};

// 封装一个方法用来获取时间
const formatYear = (start: any, startVal: any, endVal: any, len: any) => {
  const arr = []
  const yearStart = new Date(start).getDay(); // 获取周几
let initYearStart = yearStart; // 将周几重新赋值
let initStart = ''; // 用来接收起始时间为周日的明天，也就是下周一个的日期
for (let i = 0; i < len; i++) {
    let next_monday = '', next_sunday = ''; const obj: any = {};
    if(yearStart != 0) { // 不等于0表示起始时间不是周日， 正常计算即可
        next_monday = i == 0 ? startVal : moment(start).add((7 - yearStart) + 7 * (i - 1) +  1, 'd').format('YYYY-MM-DD');
        next_sunday = i == len - 1 ? endVal : moment(start).add((7 - yearStart) + 7 * i, 'd').format('YYYY-MM-DD');
    } else { // else中表示起始时间是周日
        if(initYearStart == 0) { // 周日为0 表示起始时间和截止时间是同一天
            next_monday = next_sunday = startVal;
            initYearStart = 1; // 重新赋值为1 表示以后的从周一开始
            initStart = moment(start).add(1, 'd').format('YYYY-MM-DD');
            start = moment(initStart);
        } else {
            next_monday = i == 1 ? initStart : moment(start).add((7 - initYearStart) + 7 * (i - 2) +  1, 'd').format('YYYY-MM-DD');
            next_sunday = i == len - 1 ? endVal : moment(start).add((7 - initYearStart) + 7 * (i - 1), 'd').format('YYYY-MM-DD');
        }
    }
    obj.date = [next_monday,next_sunday]; 
    arr.push(obj);
}
return arr;
}

// 这个函数用来处理时间
export const initTime = (time: any)=>  {
const beginTime = new Date(time[0]);
const endTime = new Date(time[1]);

// 开始时间
const bY: any = beginTime.getFullYear();
let bM: any = beginTime.getMonth() + 1;
bM = bM >= 10 ? bM : "0" + bM;
let bD: any = beginTime.getDate();
bD = bD >= 10 ? bD : "0" + bD;

// 结束时间
const eY: any = endTime.getFullYear();
let eM: any = endTime.getMonth() + 1;
eM = eM >= 10 ? eM : "0" + eM;
let eD: any = endTime.getDate();
eD = eD >= 10 ? eD : "0" + eD;

let arr = []
let nowDiff = 0, futureWeek = 0
if(bY != eY) {
  const yearWeek = moment(`${bY}`).weeksInYear();
  const nowWeek = moment(`${bY}-${bM}-${bD}`).week();
    nowDiff = yearWeek - nowWeek;
    futureWeek = moment(`${eY}-${eM}-${eD}`).week();   
} else {
  const diff = moment(`${eY}/${eM}/${eD}`).week() - moment(`${bY}-${bM}-${bD}`).week();
    if(beginTime.getDay() == 0 && endTime.getDay() != 0) {
        nowDiff = diff + 2;
    } else if(beginTime.getDay() != 0 && endTime.getDay() == 0) {
        nowDiff = diff;
    } else {
        nowDiff = diff + 1;
    }
    futureWeek = 0;
}
arr = formatYear(`${bY}-${bM}-${bD}`, `${bY}-${bM}-${bD}`, `${eY}-${eM}-${eD}`, nowDiff + futureWeek);
 return arr
}
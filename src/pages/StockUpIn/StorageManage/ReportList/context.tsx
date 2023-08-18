import { dateFormat } from '@/utils/filter';
import { pubMsg } from '@/utils/pubConfig';
import { createContext } from 'react';

// 下拉框配置
const selectProps = {
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

// 下载
const downLoadTemp = (apiAction: any) => {
  return new Promise(async (resolve: any, reject: any) => {
    const res: any = await apiAction();
    try {
      const type = res?.response?.headers?.get('content-type');
      if (type === 'application/json') {
        pubMsg(res?.message || '下载失败');
        reject(res?.message || '下载失败');
      } else {
        const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
        const objectURL = URL.createObjectURL(blob);
        const btn = document.createElement('a');
        const fileData = res.response.headers.get('content-disposition');
        let fileName = '下载文件.xls';
        const newTime = dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss');
        if (fileData) {
          fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
        }
        btn.download = `${newTime + fileName}`;
        btn.href = objectURL;
        btn.click();
        URL.revokeObjectURL(objectURL);
        resolve('下载完成');
      }
    } catch (e) {
      console.log(e);
      reject(res?.message || '下载失败');
    }
  });
};

export const Context = createContext<any>({
  selectProps,
  downLoadTemp,
});

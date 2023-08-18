import { useEffect, useState } from 'react';
import { request } from 'umi';
import { ProFormSelect } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
// 两个select联动(店铺, 云仓), 不支持多选, 表单公共组件
const Comp: React.FC<{
  value?: any[];
  onChange?: any;
  options?: any[]; // 第一个select需要options或者enums
  valueEnum?: any; // 第一个select需要options或者enums
  requestUrl: string; // 第二个select请求url
  requestParam: string; // 第二个select请求请求参数
  requestMethod?: 'POST' | 'GET'; // 请求方法
  labelInValue?: boolean; // 返回 { value: string, label: ReactNode }
  placeholder?: string[];
  width?: number; // 第一个select宽度
  disabledStatus?: number | string; // 停用状态不可选, 默认status = 1 为启用, status = 0 为禁用
  readonly?: boolean[];
  multiple?: boolean;
  allowClear?: boolean;
}> = ({
  value = [],
  onChange,
  valueEnum = {},
  labelInValue = false,
  placeholder,
  requestUrl,
  requestMethod = 'POST',
  options = [],
  requestParam,
  width = 100,
  disabledStatus,
  readonly = [false, false],
  multiple = false,
  allowClear = true,
}) => {
  const [dataObj, dataObjSet] = useState<Record<string, any>[]>([]);
  const [optionsTwo, optionsTwoSet] = useState<any[]>([]);
  let optionsFormat = options;
  if (valueEnum && !optionsFormat.length) {
    optionsFormat = Object.keys(valueEnum).map((key) => ({
      label: valueEnum[key].text,
      value: key,
      data: valueEnum[key],
    }));
  }
  // 获取第二个select options
  const fetchOptions = async (v: string) => {
    // 请求参数特殊处理
    let requestValue = v;
    if (requestUrl.includes('orderDeliveryWarehouse')) {
      if (requestValue == 'QIMEN') {
        requestValue = 'QIMEN_YUNCANG';
      } else if (requestValue == 'WLN') {
        requestValue = 'YUNCANG';
      }
    }
    let res: any = {};
    if (requestMethod == 'POST') {
      res = await request(requestUrl, {
        method: 'POST',
        data: {
          [requestParam]: requestValue,
          current_page: 1,
          page_size: 999,
        },
      });
    } else {
      res = await request(requestUrl, {
        method: 'GET',
        params: {
          [requestParam]: requestValue,
          current_page: 1,
          page_size: 999,
        },
      });
    }
    if (res?.code == pubConfig.sCode) {
      const resData: any[] = res?.data?.records || res?.data;
      const tempOptions: any[] =
        resData?.map((item: any) => ({
          label: item.shop_name || item.warehouse_name,
          value: item.id,
          data: item,
          disabled: typeof disabledStatus == undefined ? false : item.status == disabledStatus,
        })) || [];
      optionsTwoSet(tempOptions);
      if (tempOptions.length && value && value[1]) {
        dataObjSet([dataObj[0], tempOptions?.find((item: any) => item.value == value[1])]);
      }
    } else {
      pubMsg(res?.message);
    }
  };
  useEffect(() => {
    if (value && value[0]) {
      if (typeof value[0] == 'object') {
        fetchOptions(value[0]?.value);
      } else {
        dataObjSet([optionsFormat.find((item) => item.value == value[0]), {}]);
        fetchOptions(value[0]);
      }
    }
  }, []);
  return (
    <div style={{ display: 'flex', maxWidth: '100%', alignItems: 'center' }}>
      <ProFormSelect
        readonly={readonly[0]}
        ignoreFormItem
        placeholder={placeholder ? placeholder[0] : '请选择'}
        allowClear={allowClear}
        showSearch
        fieldProps={{
          style: { width },
          options: optionsFormat,
          labelInValue,
          value: value && value[0],
          onChange: async (v: any, o: any) => {
            const tempData = [v, multiple ? [] : null];
            const tempDataObj = [o, multiple ? [] : {}];
            dataObjSet(() => tempDataObj);
            if (labelInValue) {
              onChange(tempDataObj);
            } else {
              onChange(tempData);
            }
            fetchOptions(labelInValue ? o?.value : v);
          },
        }}
      />
      {readonly[0] ? <span style={{ marginLeft: 2 }}>-</span> : null}
      <ProFormSelect
        readonly={readonly[1]}
        ignoreFormItem
        allowClear
        showSearch
        placeholder={placeholder ? placeholder[1] : '请选择'}
        fieldProps={{
          mode: multiple ? 'multiple' : undefined,
          labelInValue,
          style: { marginLeft: 2, flex: 1, width: `calc(100% - ${width}px)` },
          options: optionsTwo,
          value: value && value[1],
          onChange: (v: any, o) => {
            const tempData = [value && value[0], v];
            const tempDataObj = [dataObj[0], o];
            dataObjSet(() => tempDataObj);
            if (labelInValue) {
              onChange(tempDataObj);
            } else {
              onChange(tempData);
            }
          },
        }}
      />
    </div>
  );
};

export default Comp;

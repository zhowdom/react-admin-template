import { getDic, getRegion } from '@/services/base';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
const isDev = process.env.NODE_ENV === 'development';
import { orderBy } from 'lodash';
export default {
  namespace: 'common',
  state: {
    dicList: [],
    cityData2: [], // 只有省市的城市数据
    cityData3: [], // 只有省市区的城市数据
  },
  reducers: {
    setDicAction(state, { payload }) {
      return {
        ...state,
        dicList: payload,
      };
    },
    setCityData2(state, { payload }) {
      return {
        ...state,
        cityData2: payload,
      };
    },
    setCityData3(state, { payload }) {
      return {
        ...state,
        cityData3: payload,
      };
    },
  },
  effects: {
    // 获取字典数据
    *getDicAction(action, { call, put, select }) {
      const response = yield call(getDic, action.payload);
      if (response?.code != pubConfig.sCode) {
        pubMsg(response?.message);
      }
      const newDicList = response?.data || [];
      // 数据处理
      let newObj = orderBy(newDicList, ['detail_sort'], ['asc']).reduce((pre, cur) => {
        pre[cur.group_code] = pre[cur.group_code] || {};
        pre[cur.group_code][cur.detail_code] = { ...cur, text: cur.detail_name };
        return pre;
      }, {});
      if (isDev) {
        console.log('数据字典', newObj);
      }
      yield put({
        type: 'setDicAction',
        payload: newObj,
      });
    },
    // 获取城市数据
    *getCityData(action, { call, put, select }) {
      const response = yield call(getRegion, action.payload);
      if (response?.code != pubConfig.sCode) {
        pubMsg(response?.message);
      }
      const newList = response?.data || [];
      let level1 = [];
      let level2 = [];
      let level3 = [];
      newList.forEach((val) => {
        if (val.level === 1) {
          level1.push(val);
        }
        if (val.level === 2) {
          level2.push(val);
        }
        if (val.level === 3) {
          level3.push(val);
        }
      });
      let cityData2 = []; // 只有省市的城市数据
      let cityData3 = []; // 只有省市区的城市数据
      // let cityData4 = []; // 有省市区街道的城市数据
      level1.map((val) => {
        let children = level2
          .map((k) => {
            if (k.parent_code === val.code) {
              return {
                value: k.code,
                label: k.name,
              };
            }
          })
          .filter((i) => i);
        let children3 = level2
          .map((k) => {
            if (k.parent_code === val.code) {
              let sitem3 = level3
                .map((h) => {
                  if (h.parent_code === k.code) {
                    return {
                      value: h.code,
                      label: h.name,
                    };
                  }
                })
                .filter((u) => u);
              return {
                value: k.code,
                label: k.name,
                children: sitem3,
              };
            }
          })
          .filter((i) => i);
        cityData2.push({
          value: val.code,
          label: val.name,
          children: children,
        });
        cityData3.push(...children3);
      });
      // 数据处理
      // console.log('二级城市', cityData2);
      // console.log('三级城市', cityData3);
      yield put({
        type: 'setCityData2',
        payload: cityData2,
      });
      yield put({
        type: 'setCityData3',
        payload: cityData3,
      });
    },
  },
};

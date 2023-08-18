import { insert, updateById, deleteById, getDetail } from '@/services/pages/productLine';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
export default {
  namespace: 'productLine',
  state: {
    initDiaData: {
      name: null,
      business_scope: null,
      time: null,
      id: null,
    },
    prodLine: [], // 产品线下拉
  },
  reducers: {
    setProdLine(state, { payload }) {
      console.log('setProdLine', payload);
      return {
        ...state,
        prodLine: payload,
      };
    },
  },
  effects: {
    // 存储产品线
    *setProdLineAction(action, { put }) {
      yield put({
        type: 'setProdLine',
        payload: action.payload,
      });
    },
    // 编辑或新增产品线
    *updateFormAction(action, { call, select }) {
      let response;
      if (action.payload?.id) {
        response = yield call(updateById, action.payload);
      } else {
        response = yield call(insert, action.payload);
      }
      if (response?.code == pubConfig.sCode) {
        yield action.callback(true);
      } else if (response?.message) {
        yield action.callback(false);
        pubMsg(response?.message);
      }
    },
    // 删除产品线
    *deleteItemAction(action, { call, select }) {
      const response = yield call(deleteById, action.payload);
      if (response?.code == pubConfig.sCode) {
        yield action.callback(response?.message);
      } else {
        pubMsg(response?.message);
      }
    },
    // 获取详情
    *getDetailAction(action, { call, select }) {
      const response = yield call(getDetail, action.payload);
      if (response?.code == pubConfig.sCode) {
        yield action.callback(response?.data);
      } else {
        pubMsg(response?.message);
      }
    },
  },
};

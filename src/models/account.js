import { resetPassword, disable, enable } from '@/services/pages/account';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
export default {
  namespace: 'account',
  state: {
    statusList: {
      0: '正常',
      1: '禁用',
    },
  },
  effects: {
    // 重置操作
    *resetAction(action, { call, select }) {
      const response = yield call(resetPassword, action.payload);
      if (response?.code == pubConfig.sCode) {
        yield action.callback(true);
      } else {
        pubMsg(response?.message);
      }
    },
    // 禁用操作
    *disabledAction(action, { call, select }) {
      const response = yield call(disable, action.payload);
      if (response?.code == pubConfig.sCode) {
        yield action.callback(true);
      } else {
        pubMsg(response?.message);
      }
    },
    // 启用操作
    *enableAction(action, { call, select }) {
      const response = yield call(enable, action.payload);
      if (response?.code == pubConfig.sCode) {
        yield action.callback(true);
      } else {
        pubMsg(response?.message);
      }
    },
  },
};

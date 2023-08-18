import { insert, updateById } from '@/services/pages/sign';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
export default {
  namespace: 'sign',
  state: {
    initDiaData: {
      open_corp_id: null,
      client_corp_name: null,
    },
  },
  effects: {
    // 编辑或新增主体
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
  },
};

import { insert, businessLicense } from '@/services/pages/supplier';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
export default {
  namespace: 'supplier',
  state: {
    businessList: {
      // 业务范畴下拉列表
      CN: '国内',
      IN: '跨境',
      // 'CN/IN': '国内/跨境',
    },
  },

  effects: {
    // 新增供应商
    *addFormAction(action, { call, select }) {
      const response = yield call(insert, action.payload);
      if (response?.code == pubConfig.sCode) {
        yield action.callback(response?.data);
      } else if (response?.message) {
        yield action.callback(false);
        pubMsg(response?.message);
      }
    },
    *businessLicenseAction(action, { call, select }) {
      if (action.payload.imageId) {
        const response = yield call(businessLicense, action.payload);
        let updateData = {
          name: null,
          organization_code: null,
          legal_person: null,
          register_address: null,
          registered_capital: null,
          management_scope: null,
        };
        if (response?.code == pubConfig.sCode) {
          if (response?.data?.error_msg) {
            pubMsg(response?.data?.error_msg);
          } else {
            updateData = {
              name: response?.data?.words_result?.单位名称?.words || null,
              organization_code: response?.data?.words_result?.社会信用代码?.words || null,
              legal_person: response?.data?.words_result?.法人?.words || null,
              register_address: response?.data?.words_result?.地址?.words || null,
              registered_capital: response?.data?.words_result?.注册资本?.words || null,
              management_scope: response?.data?.words_result?.经营范围?.words || null,
            };
          }

          yield action.callback(updateData);
        } else if (response?.message) {
          yield action.callback(updateData);
          pubMsg(response?.message);
        }
      }
    },
  },
};

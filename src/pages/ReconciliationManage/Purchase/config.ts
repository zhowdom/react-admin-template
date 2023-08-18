import { pubMsg, pubConfig } from '@/utils/pubConfig';
import { pubGoUrl } from '@/utils/pubConfirm';
import { updateAccountStatementOrder } from '@/services/pages/reconciliationPurchase';

// 批量打印
export const print = async (selectRows: any) => {
  console.log('批量打印');
  if (!selectRows.length) return pubMsg('请选择要打印的数据！');
  console.log(selectRows);
  const url = `/purchase-print?ids=${selectRows.join(',')}`;
  pubGoUrl(url);
};

// 更新账单
export const uploadAccountSave = (id: string) => {
  return new Promise(async (resolve, reject) => {
    const res = await updateAccountStatementOrder({
      id: id,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      reject(false);
    } else {
      pubMsg('提交成功', 'success');
      resolve(true);
    }
  });
};

import { createWarehousingByPlan } from '@/services/pages/deliveryPlan';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { Button, message } from 'antd';
import { useState } from 'react';
import { Access, useAccess } from 'umi';

const ComText = (props: any) => {
  const { ids, showOrderList, detailId, numC } = props;
  const [loading, setLoading] = useState(false);
  const access = useAccess();
  // 创建入库单
  const entryAction = async () => {
    if (!numC || numC < 0) {
      message.warning('请填写本次发货数量');
      return;
    }
    const pid = ids.join(',');
    const res: any = await createWarehousingByPlan({ id: pid, detailId, num: numC });
    setLoading(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      showOrderList(res?.data || []);
    }
  };

  return (
    <>
      <Access accessible={access.canSee('deliveryPlan_order_add')}>
        <Button type="link" loading={loading} onClick={entryAction} style={{ padding: 0 }}>
          创建入库单
        </Button>
      </Access>
    </>
  );
};

export default ComText;

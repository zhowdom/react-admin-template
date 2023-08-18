import { agree, planSubmit } from '@/services/pages/deliveryPlan';
import { pubConfig, pubMsg, pubModal } from '@/utils/pubConfig';
import { connect } from 'umi';
export default (WrappedComponent: any) => {
  const NewComponent = (props: any) => {
    const orderSubmitAction = async (id: any[], reload?: any, platform_code?: string) => {
      pubModal('确定提交审核?')
        .then(async () => {
          const ids = id.join(',');
          const res: any = await planSubmit({ id: ids, platform_code });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          } else {
            pubMsg('提交成功', 'success');
            reload();
          }
        })
        .catch(() => {
          console.log('点击了取消');
        });
    };
    // 审批通过
    const agreeAction = async (id: any[], reload: any, platform_code?: string) => {
      pubModal('确定审批通过?')
        .then(async () => {
          const ids = id.join(',');
          const res: any = await agree({ id: ids, platform_code });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          } else {
            pubMsg('提交成功', 'success');
            reload();
          }
        })
        .catch(() => {
          console.log('点击了取消');
        });
    };

    return (
      <WrappedComponent
        orderSubmitAction={orderSubmitAction}
        agreeAction={agreeAction}
        confirm={confirm}
        {...props}
      />
    );
  };

  return connect(({ common }: { common: Record<string, unknown> }) => ({
    common,
  }))(NewComponent);
};

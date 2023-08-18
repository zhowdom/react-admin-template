import { planAgree } from '@/services/pages/purchasePlan';
import { pubConfig, pubModal, pubMsg } from '@/utils/pubConfig';
import { Button } from 'antd';

export default (props: any) => {
  const { id, selectRows, reload } = props;
  // 审核通过
  const auditOk = async (ids?: any) => {
    if (!ids.length) return pubMsg('请选择要操作的数据！');
    pubModal(`是否确定审核通过？`)
      .then(async () => {
        const res = await planAgree({ ids: ids.join(',') });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功！', 'success');
          setTimeout(() => {
            reload();
          }, 200);
        }
      })
      .catch(() => {
        console.log('点了取消');
      });
  };

  return (
    <>
      {id ? (
        <a
          onClick={() => {
            auditOk([id]);
          }}
          key="audit"
        >
          审核通过
        </a>
      ) : (
        <Button
          disabled={!selectRows.length}
          onClick={() => {
            auditOk(selectRows);
          }}
        >
          审核通过
        </Button>
      )}
    </>
  );
};

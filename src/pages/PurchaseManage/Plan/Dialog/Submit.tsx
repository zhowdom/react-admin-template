import { planSubmit } from '@/services/pages/purchasePlan';
import { pubConfig, pubModal, pubMsg } from '@/utils/pubConfig';
import { Button } from 'antd';

export default (props: any) => {
  const { id, selectRows, reload } = props;
  // 提交审核
  const saveAudit = async (ids?: any) => {
    if (!ids.length) return pubMsg('请选择要操作的数据！');
    pubModal(`是否确定提交审核？`)
      .then(async () => {
        const res = await planSubmit({ ids: ids.join(',') });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('提交审核成功！', 'success');
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
            saveAudit([id]);
          }}
          key="audit"
        >
          提交审核
        </a>
      ) : (
        <Button
          disabled={!selectRows.length}
          onClick={() => {
            saveAudit(selectRows);
          }}
        >
          提交审核
        </Button>
      )}
    </>
  );
};

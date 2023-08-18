import * as api from '@/services/pages/stockManager';
import { pubConfig, pubMsg, pubModal } from '@/utils/pubConfig';

// 自动入库
const AutomaticPlatformsNum: React.FC<{
  title: string;
  dataSource: any;
  reload: any;
}> = ({ title, dataSource, reload }) => {
  const save = () => {
    pubModal('是否自动入库')
      .then(async () => {
        const res = await api.syncPlatformStockInBill({
          orderNo: dataSource.order_no,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        pubMsg('操作成功！', 'success');
        reload();
      })
      .catch(() => {
        console.log('取消操作');
      });
  };
  return (
    <a
      onClick={() => {
        save();
      }}
      key="automatic"
    >
      {title}
    </a>
  );
};

export default AutomaticPlatformsNum;

import { useModel, useRequest, history } from 'umi';
import { useState, useEffect } from 'react';
import NoticeIcon from './NoticeIcon';
import styles from './index.less';
import { countUnread } from '@/services/pages/notification';

export type GlobalHeaderRightProps = {
  fetchingNotices?: boolean;
  onNoticeVisibleChange?: (visible: boolean) => void;
  onNoticeClear?: (tabName?: string) => void;
};
const NoticeIconView = () => {
  const { initialState }: any = useModel('@@initialState');
  const [num, setNum] = useState<any>(0);
  const { run, cancel } = useRequest(() => countUnread(initialState?.currentUser), {
    pollingInterval: 90000,
    pollingWhenHidden: false,
    manual: true,
    onSuccess(unreadMsgCount) {
      if (unreadMsgCount || unreadMsgCount === 0) {
        setNum(unreadMsgCount);
      } else {
        cancel();
      }
    },
  });
  useEffect(() => {
    if (initialState?.currentUser) {
      run();
    }
  }, []);
  return (
    <div onClick={() => history.push('/notification/list')}>
      <NoticeIcon
        className={styles.action}
        count={num || 0}
        loading={false}
        clearText="清空"
        viewMoreText="查看更多"
        clearClose
      />
    </div>
  );
};

export default NoticeIconView;

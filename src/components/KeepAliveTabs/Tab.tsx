import { useHistory, useLocation } from 'umi';
import { useAliveController } from 'react-activation';
import { CloseOutlined } from '@ant-design/icons';
import type { CachingNode } from './type';
import styles from './index.less';

export default function Tab({ node }: { node: CachingNode }) {
  const history = useHistory();
  const location = useLocation();
  // 同上，dropScope是释放节点，点删除后删掉当前节点信息
  const { getCachingNodes, dropScope } = useAliveController();
  const cachingNodes: CachingNode[] | any[] = getCachingNodes();
  // 执行tab的删除操作
  function dropTab(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    // 如果关闭激活中的 KeepAlive Tab，需要先离开当前路由
    // 触发 KeepAlive unactivated 后再进行 drop
    if (location.pathname + location.search === node.path) {
      // 路由异步加载控制
      const unlisten = history.listen(() => {
        setTimeout(() => {
          dropScope(node.name as string | RegExp);
        }, 30);
      });
      unlisten();
      // 前往排除当前 node 后的最后一个 tab
      if (cachingNodes.length <= 1) {
        history.push('/');
      } else {
        const { path } = cachingNodes.filter((item) => item.path !== node.path).pop();
        history.push(path);
      }
    } else {
      dropScope(node.name as string | RegExp);
    }
  }
  // 设置当前tab的样式
  const className = () => {
    if (location.pathname + location.search === node.path) {
      if (location.pathname === '/home') {
        return `${styles.active}  ${styles.home_active}`;
      }
      return `${styles.active}`;
    }
    return `${styles.deactive}`;
  };

  return (
    <li
      className={className()}
      onClick={() => {
        history.push(node.path);
      }}
    >
      <div className="tags-nav">
        <span>{node.name}</span>
        {<CloseOutlined className={styles['close-btn']} onClick={dropTab} />}
      </div>
    </li>
  );
}

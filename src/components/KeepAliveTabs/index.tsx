import { useAliveController } from 'react-activation';
import type { CachingNode } from './type';
import Tab from './Tab';
import styles from './index.less';
import { useHistory, useLocation, connect } from 'umi';
import { useEffect } from 'react';

const KeepAliveTabs = (props: any) => {
  const { dispatch } = props;
  useEffect(() => {
    dispatch({
      type: 'common/getDicAction',
      payload: {},
    });
    dispatch({
      type: 'common/getCityData',
      payload: {},
    });
  }, [dispatch]);

  // history导航
  const history = useHistory();
  // 本地路由信息
  const location = useLocation();
  // 获取缓存节点方法和信息
  const { getCachingNodes, dropScope } = useAliveController();
  const cachingNodes: CachingNode[] = getCachingNodes();
  //  // @ts-ignore
  //   cachingNodes = cachingNodes.map((v: CachingNode) => v.name != cachingNodes[cachingNodes.length-1].name)
  // 最多展示5个
  if (cachingNodes.length > 5) {
    const pre = cachingNodes.slice(0, cachingNodes.length - 5);
    for (const item of pre) {
      const name: any = item.name;
      dropScope(name);
    }
  }
  // 因为是异步组件，需要在这儿处理一下缓存中的重复问题
  const obj = {};
  let nodes: CachingNode[] = cachingNodes.reduce((cur, next: CachingNode) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    obj[next.path] ? '' : (obj[next.path] = true && cur.push(next as never));
    return cur;
  }, []);

  // 首页不参与tabs切换的关闭操作
  nodes = nodes.filter((item) => item.path !== '/welcome');
  return (
    <ul className={styles['alive-tabs']}>
      <li
        className={location.pathname === '/welcome' ? styles.home_active : styles.home_deactive}
        onClick={() => {
          history.push('/welcome');
        }}
      >
        <div className="tags-nav">
          <span>首页</span>
        </div>
      </li>
      {nodes.map((node) => (
        <Tab key={node!.id} node={node} />
      ))}
    </ul>
  );
};
export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(KeepAliveTabs);

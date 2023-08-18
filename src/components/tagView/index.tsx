import { Tabs } from 'antd';
import { useCallback, useEffect } from 'react';
import TagsViewAction from './tagViewAction';
import { connect, useHistory, useLocation } from 'umi';
import Routers from '../../../config/routes';
import './style.less';
import { useAliveController } from 'react-activation';

const TagsView = (props: any) => {
  const { tags, activeTagId } = props.tagsViewStore;
  const { dispatch } = props;
  const navigate = useHistory();
  const location = useLocation();
  const { dropScope } = useAliveController();
  // 递归取菜单
  const flatMapRoutes = (routes: any, pPath: string, result: any[]) => {
    return result.concat(
      routes?.flatMap((v: any) => {
        if (v?.routes?.length) {
          return result.concat(flatMapRoutes(v?.routes, `${pPath}/${v.path}`, result));
        }
        return v.component ? [{ ...v, path: `${pPath}/${v.path}` }] : [];
      }),
    );
  };
  // 获取菜单数据
  const routeList = Routers[0].routes.reduce((result: any, cur: any) => {
    if (cur.path != '/user') {
      if (cur?.routes?.length) {
        return flatMapRoutes(cur?.routes, cur?.path || '', result);
      } else {
        if (cur.component) {
          result.push(cur);
        }
      }
    }
    return result;
  }, []);

  // 设置选中
  const setCurrentTag = useCallback(
    (id?: string) => {
      const tag = tags.find((item: any) => {
        if (id) {
          return item.id === id;
        } else {
          return item.path === location.pathname;
        }
      });

      if (tag) {
        dispatch({
          type: 'tagsViewStore/setActiveTag',
          activeTagId: tag.id,
        });
      }
    },
    [location.pathname, tags, dispatch],
  );
  // 点击tab
  const onChange = (key: string) => {
    const tag = tags.find((tagItem: any) => tagItem.id === key);
    if (tag) {
      setCurrentTag(tag.id);
      navigate.push(tag.path);
    }
  };

  // 移除tab
  const onClose = (targetKey: string) => {
    console.log(targetKey);
    dropScope(targetKey);
    dispatch({
      type: 'tagsViewStore/removeTag',
      targetKey,
      navigate,
    });
  };

  useEffect(() => {
    if (routeList.length) {
      const menu = routeList.find(
        (m: any) => m.path === location.pathname || m.path + '/' === location.pathname,
      );
      if (menu) {
        dispatch({
          type: 'tagsViewStore/addTag',
          tagItem: {
            path: location.search ? menu.path + location.search : menu.path,
            name: menu.name || '',
            id: menu.path,
            closable: true,
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (tags && activeTagId) {
      const target = tags.find((e: any) => e.id === activeTagId);
      if (target) {
        navigate.push(target.path);
      } else {
        setCurrentTag(tags[1].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);
  return tags && tags.length ? (
      <Tabs
        style={{maxWidth: 'calc(100vw - 164px)'}}
        id={'pageTabs'}
        size={'small'}
        tabPosition={'top'}
        tabBarStyle={{ margin: 0 }}
        onChange={onChange}
        activeKey={activeTagId}
        type="editable-card"
        hideAdd
        onEdit={(targetKey, action) => action === 'remove' && onClose(targetKey as string)}
        tabBarExtraContent={tags.length == 1 ? false : <TagsViewAction activeTagId={activeTagId} />}
        items={tags.filter((item: any) => item.path != '/').map((tag: any, index: number) => ({
          label: tag.name,
          key: tag.id,
          closable: index == 0 && tags.length == 1 ? false : tag.closable,
        }))}
      />
  ) : null;
};

export default connect(({ tagsViewStore }: { tagsViewStore: Record<string, unknown> }) => ({
  tagsViewStore,
}))(TagsView);

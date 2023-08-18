import React, { useMemo } from 'react';
import { getMatchMenu, transformRoute } from '@umijs/route-utils';
import { WithExceptionOpChildren } from '@@/plugin-layout/layout/component/Exception';
import { useAccess } from 'umi';

const Layout: React.FC<any> = (props) => {
  const access = useAccess();
  const { children, location, userConfig = {} } = props;
  const currentPathConfig = useMemo(() => {
    const { menuData } = transformRoute(props?.route?.routes || [], undefined, undefined, true);
    // 动态路由匹配
    const matchMenu: any = getMatchMenu(location.pathname, menuData).pop() || {};
    // console.log(matchMenu)
    // 菜单显示, 但是'列表查询'按钮可能未授权情况下, 页面显示403
    if (
      !matchMenu.unaccessible &&
      matchMenu.access &&
      !matchMenu?.hideInMenu &&
      !matchMenu?.noAccessBtnCode
    ) {
      return {
        ...matchMenu,
        unaccessible: matchMenu?.accessBtnCode
          ? !access.canSee(matchMenu.accessBtnCode)
          : !access.canSee(matchMenu?.path),
      };
    }
    return matchMenu;
  }, [location?.pathname, props?.route?.routes, access]);
  // console.log(currentPathConfig, 'currentPathConfig');
  return (
    <WithExceptionOpChildren
      noFound={userConfig?.noFound}
      unAccessible={userConfig?.unAccessible}
      currentPathConfig={currentPathConfig}
    >
      {children}
    </WithExceptionOpChildren>
  );
};
export default Layout;

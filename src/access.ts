/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  const menus = currentUser?.menus || [];
  // 递归获取所有指定属性
  const filterPath = (arr: any[] = [], key: string): any[] =>
    arr.reduce((result, cur) => {
      const aa = cur[key].split('appPage_Scm')
      if(aa.length && aa.length>1){
        result.push(aa[aa.length-1]);
      }else{
        result.push(cur[key]);
      }
      if (cur.children && cur.children.length && cur.children[0].type == '1') {
        return result.concat(filterPath(cur.children, key));
      }
      return result;
    }, []);
  // 根据路由地址归类按钮权限code
  // const gatherPermission = (arr: any[] = []): Record<string, string[]> =>
  //   arr.reduce((result, cur) => {
  //     result[cur.routeUrl] = cur.permission;
  //     if (cur.children && cur.children.length) {
  //       return { ...result, ...gatherPermission(cur.children) };
  //     }
  //     return result;
  //   }, {});
  const getherPermission = (arr: any, list?: any) => {
    const newArr = list || [];
    arr.forEach((cur: any) => {
      if (cur.type == '1') {
        if (cur.children && cur.children.length) {
          getherPermission(cur.children, newArr);
        }
      } else {
        newArr.push(cur?.path);
      }
    });
    return newArr;
  };
  // 判断数组中的任何一个是否存在另一个数组中
  const isContained = (arr: any, list: any) => {
    const newList = list.split(',');
    let num = 0;
    newList.forEach((v: any) => {
      if (arr.includes(v)) {
        num++;
      }
    });
    return !!num;
  };
  const menuPaths: any[] = filterPath(menus, 'routeUrl');
  const buttons: any = getherPermission(menus).join(',').split(',');
  return {
    adminRouteFilter: currentUser?.name === 'sys_admin', // 只有管理员可访问
    routeFilter: (route: { path: string }) => menuPaths.includes(route.path), // 菜单权限
    canSee: (btnCode: string) => isContained(buttons, btnCode), // 按钮权限
    // canSee: () => true, // 按钮权限
  };
}

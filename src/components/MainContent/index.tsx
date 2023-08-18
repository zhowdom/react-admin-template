import { useEffect } from 'react';
import KeepAlive from 'react-activation';
import { connect, history } from 'umi';

function getItem(data?: any, list?: any) {
  let newList = list || [];
  data.forEach((element: any) => {
    if (element.children && element.children.length) {
      newList = [...newList, ...getItem(element.children)];
    } else {
      newList.push(element);
    }
  });
  return newList;
}
const MainContent: any = (getProps: any) => {
  const { dom, props, dispatch } = getProps;
  const myRouter = getItem(props?.route?.routes); // 拉平后的数组
  let nowUrl = history.location.pathname;
  if (nowUrl[nowUrl.length - 1] == '/') {
    nowUrl = nowUrl.slice(0, nowUrl.length - 1);
  }
  // console.log(nowUrl)
  // console.log(myRouter)
  // console.log(history.location.pathname)
  const routeData = myRouter.find((v: any) => v.path == nowUrl);
  // console.log(routeData)
  useEffect(() => {
    if(nowUrl!="/login"){
      dispatch({
        type: 'common/getDicAction',
        payload: {},
      });
      dispatch({
        type: 'common/getCityData',
        payload: {},
      });
    }
  }, [dispatch]);
  return routeData?.keepAlive ? (
    <KeepAlive
      id={history.location.pathname}
      name={history.location.pathname}
      path={history.location.pathname + history.location.search}
      saveScrollPosition="screen" //自动保存共享屏幕容器的滚动位置
      when={[true, true]}
    >
      {dom}
    </KeepAlive>
  ) : (
    dom
  );
};
export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(MainContent);

import type { BasicLayoutProps, Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import type { RequestOptionsInit } from 'umi-request';
import RightContent from '@/components/RightContent';
import MenuContent from '@/components/MenuContent';
import MainContent from '@/components/MainContent';
import Footer from '@/components/Footer';
import { getCurrentUser, getMenus, customColumnList, scmVersion } from '@/services/base';
import { ConfigProvider, BackTop, Modal } from 'antd';
import { pubMsg, pubAlert } from '@/utils/pubConfig';
import Cookies from 'js-cookie';
import TagsView from '@/components/tagView/index';
import { clearAndLogin } from '@/components/RightContent/AvatarDropdown';
import { logout } from '@/services/base';

const isDev = process.env.NODE_ENV === 'development';
const is82 = window.location.host == '172.16.99.82'; // 是不是82环境

// 如果是开发环境 初始定义代理 api
if ((isDev || is82) && !Cookies.get(`${window.location.port}proxy`)) {
  Cookies.set(`${window.location.port}proxy`, '/testapi,/testapi,/testapi,/testapi');
}

// 登录
const goLogin = () => {
  window.location.href = `${window.location.origin}/appPage_Scm/login`; // 登录链接
};

/** 获取用户信息比较慢的时候会展示一个 loading 状态 */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  unreadMsgCount?: number;
  dict?: any;
}> {
  const fetchUserInfo = async () => {
    try {
      let userInfo: any = {};
      const curr = await getCurrentUser(); // 获取用户信息
      if (!curr) return;
      userInfo = curr?.data;
      localStorage.setItem('userInfo', JSON.stringify({ user: userInfo }));
      if (userInfo && userInfo?.id) {
        const allMenu = await getMenus(); // 授权的菜单
        if (!allMenu?.data) return;
        userInfo.appList = allMenu.data.map((v: any) => ({
          // 授权的应用列表
          name: v.name,
          code: v.code,
          id: v.id,
        }));
        const myMenus = allMenu.data.filter((v: any) => v.code == 'liyi99Scm'); // 授权的菜单
        const isPSI = allMenu.data.find((v: any) => v.code == 'psi'); // 是否有 进销存的权限
        const scmMenus = myMenus.length
          ? myMenus[0].children.map((item: any) => ({
              ...item,
              // 所有的三级菜单Url 左侧菜单定位用
              allThreeUrl: (item?.children
                ? item?.children
                    .map((k: any) =>
                      k?.children
                        ? k?.children
                            .map((h: any) => {
                              const cueRul = h.routeUrl.split('appPage_Scm');
                              return cueRul.length && cueRul.length > 1
                                ? cueRul[cueRul.length - 1]
                                : h.routeUrl;
                            })
                            .join(',')
                        : [],
                    )
                    .join(',')
                : []
              ).split(','),
            }))
          : [];
        userInfo.menus = scmMenus;
        userInfo.isPSI = isPSI; // 是否有 进销存的权限
        // console.log(userInfo.menus);
        if (userInfo?.menus && userInfo?.menus?.length) {
          const res = await customColumnList({}); // 用户列
          if (res?.code == '0') {
            userInfo.customColumnSetting = res?.data || [];
          }
          return userInfo;
        } else {
          Modal.destroyAll();
          pubAlert('当前您无任何页面的访问权限, 可联系管理员开通权限哦~', '温馨提示');
          return userInfo;
        }
      }
    } catch (error) {
      console.error('error: ', error);
    }
    return undefined;
  };
  // 如果是登录页面，不执行
  // console.log(3453453, history.location)
  if (history.location.pathname !== '/login') {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: {},
      unreadMsgCount: 0, // 未读消息数量
    };
  }
  return {
    fetchUserInfo,
    settings: {},
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
const isInIframe = window.parent !== window; // 在iframe中打开的
if (isInIframe) window.parent.document.title = document.title;
export const layout: RunTimeLayoutConfig = ({ initialState }: any) => {
  console.log(history, 'history');
  const layouData: BasicLayoutProps = {
    //  // 控制组件是否可缓存
    disableMobile: true,
    headerContentRender: () => <TagsView />,
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    footerRender: () => history.location.pathname != '/cn-sales/cn-sales-statistics' && <Footer />,
    menuRender: () => <MenuContent />,
    childrenRender: (dom: JSX.Element, props: BasicLayoutProps) => (
      <ConfigProvider componentSize={'small'}>
        <MainContent dom={dom} props={props} />
        <BackTop />
      </ConfigProvider>
    ),
    onPageChange: async (location) => {
      if (isInIframe) {
        sessionStorage.setItem('iframeCurrentUrl', window.location.href);
        window.setTimeout(() => {
          window.parent.document.title = document.title;
        }, 800);
      }
      // 统一权限平台登录标识失效
      if (
        history.location.pathname !== '/login' &&
        !Cookies.get(isDev ? `${window.location.port}token` : 'ACCESS_TOKEN')
      ) {
        goLogin();
      }
      const version = await scmVersion();
      const scmVer = Cookies.get('SCM_VERSION');
      if (version && version?.length < 9) {
        Cookies.set('SCM_VERSION', version);
        if (version != scmVer) {
          window.location.reload();
        }
      }
      document.documentElement.dataset.url = location?.pathname || '';
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
  if (isInIframe) {
    layouData.headerRender = false;
  }
  return layouData;
};
const errorHandler = (error: any) => {
  console.error(error, 'errorHandler');
};
const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
  const token = isDev ? Cookies.get(`${window.location.port}token`) : Cookies.get('ACCESS_TOKEN');
  let headers: any = {
    ...options.headers,
  };
  if (token && url.indexOf('oauth/token') == -1) {
    headers.Authorization = `Bearer ${token}`;
  }
  const userData: any = localStorage.getItem(`userInfo`)
    ? JSON.parse(localStorage.getItem(`userInfo`) || '').user
    : '';

  //去掉汉字
  function RemoveChinese(strValue: any) {
    if (strValue != null && strValue != '') {
      const reg = /[\u4e00-\u9fa5]/g;
      return strValue.replace(reg, '');
    } else {
      return '';
    }
  }
  if (userData) {
    headers['x-userid-header'] = userData.id;
    headers['x-user-header'] = RemoveChinese(userData.account);
    headers['x-role-header'] = RemoveChinese(userData.roleCodes);
  }

  // 提交前 遍历所有data数据，去除前后空格
  function getObject(oldObject: any) {
    for (const k in oldObject) {
      if (typeof oldObject[k] == 'string') {
        oldObject[k] = oldObject[k].replace(/^\s+|\s+$/g, '');
      } else if (typeof oldObject[k] == 'object') {
        getObject(oldObject[k]);
      }
    }
    return oldObject;
  }
  options.data = options?.data ? getObject(options?.data) : {};
  // end
  const newHeader = options?.headers;
  const dingding_data = newHeader && newHeader['dingding-dept-id'] ? newHeader : null;
  if (dingding_data) {
    headers = { ...headers, ...dingding_data };
  }
  // 统一权限平台的接口要单独处理, 调用权限平台登录接口不需要Authorization header
  if (
    url.indexOf('/permissions/oauth/remove') > -1 ||
    url.indexOf('/permissions/oauth/getAuthorization') > -1
  ) {
    delete headers.Authorization;
  }
  let newUrl = '';
  if (isDev) {
    const nowProxy: any = Cookies.get(`${window.location.port}proxy`)?.split(',');
    // nowProxy 数组 第一个是权限平台， 第二个是供应链
    // console.log(nowProxy)
    if (url.indexOf('aliossapi') > -1) {
      // 上传固定到测试环境
      newUrl = 'https://liyi99-pic.oss-cn-shenzhen.aliyuncs.com/';
    } else if (url.indexOf('version') > -1) {
      // 版本文件不要代理
      newUrl = url;
    } else if (url.indexOf('/permissions') > -1) {
      // 权限平台
      newUrl = `${nowProxy[0]}${url}`;
    } else if (url.indexOf('/sc-scm') > -1) {
      // 供应链
      newUrl = `${nowProxy[1]}${url}`;
    } else if (url.indexOf('/report-service') > -1) {
      // 报表
      newUrl = `${nowProxy[2]}${url}`;
    } else if (url.indexOf('/order-service') > -1) {
      // 订单
      newUrl = `${nowProxy[3]}${url}`;
    } else {
      // 订单
      newUrl = url;
    }
  } else if (is82) {
    // console.log(9969696966)
    // console.log(url)
    const nowProxy: any = Cookies.get(`${window.location.port}proxy`)?.split(',');
    // console.log(nowProxy)
    if (url.indexOf('/permissions') > -1) {
      // 权限平台
      newUrl = !nowProxy[0] || nowProxy[0] == '/testapi' ? url : `${nowProxy[0]}${url}`;
    } else if (url.indexOf('/sc-scm') > -1) {
      // 供应链
      newUrl = !nowProxy[1] || nowProxy[1] == '/testapi' ? url : `${nowProxy[1]}${url}`;
    } else if (url.indexOf('/report-service') > -1) {
      // 报表
      newUrl = !nowProxy[2] || nowProxy[2] == '/testapi' ? url : `${nowProxy[2]}${url}`;
    } else if (url.indexOf('/order-service') > -1) {
      // 订单
      newUrl = !nowProxy[3] || nowProxy[3] == '/testapi' ? url : `${nowProxy[3]}${url}`;
    } else {
      // 其他 比如 上传 第三方等
      newUrl = url;
    }
  } else {
    // console.log(458458485)
    newUrl = url;
  }
  return {
    url: newUrl,
    options: {
      ...options,
      interceptors: true,
      headers: headers,
    },
  };
};

// const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
//   const headers = {
//     Authorization: isDev ? token : `Bearer ${Cookies.get(`${window.location.port}token`)}`,
//   };
//   return {
//     url: isDev ? `/api${url}` : url,
//     options: { ...options, interceptors: true, headers },
//   };
// };

const responseInterceptors = (response: Response) => {
  if (!response.ok) {
    console.error(response, 'Response');
    pubMsg('服务器异常, 请稍后重试!');
  } else {
    // 全局后端错误提示
    try {
      const responseClone = response?.clone();
      const responseClonePromise: any = responseClone && responseClone?.json();
      if (responseClonePromise) {
        responseClonePromise
          .then((res: any) => {
            // 登录超时
            if (res?.code == 1009) {
              logout().then(() => {
                console.log('clearAndLogin');
                clearAndLogin();
              });
              return;
            }
          })
          .catch(Function.prototype);
      }
    } catch (e) {
      console.log(e, '全局请求拦截');
    }
  }
  return response;
};

// 微前端
// export const qiankun = {
//   // 应用加载之前
//   async bootstrap(props: any) {
//     console.log('kpi-front bootstrap', props);
//   },
//   // 应用 render 之前触发
//   async mount(props: any) {
//     console.log('kpi-front mount', props);
//   },
//   // 应用卸载之后触发
//   async unmount(props: any) {
//     console.log('kpi-front unmount', props);
//   },
// };

export const request: RequestConfig = {
  errorHandler,
  // credentials: 'include',
  // 新增自动添加AccessToken的请求前拦截器`1
  requestInterceptors: [authHeaderInterceptor],
  responseInterceptors: [responseInterceptors],
};

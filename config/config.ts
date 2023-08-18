// https://umijs.org/config/
import { defineConfig } from 'umi';

import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: true,
  base: '/appPage_Scm/',
  publicPath: '/',
  outputPath: './../dist/appPage_Scm',
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    logo: `/logo.svg`,
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: false,
    siderWidth: 60,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  devtool: 'eval',
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn ~antd/es/style/themes/default.less
  theme: {
    'primary-color': defaultSettings.primaryColor,
    'table-border-color': '#d9d9d9',
    'border-color-base': '#d9d9d9',
    'border-color-split': '#d9d9d9',
    'font-size-base': '12px',
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  openAPI: [],
  nodeModulesTransform: { type: 'none' },
  mfsu: {},
  webpack5: {},
  metas: [
    {
      httpEquiv: 'Cache-Control',
      content: 'no-cache',
    },
    {
      httpEquiv: 'Pragma',
      content: 'no-cache',
    },
    {
      httpEquiv: 'Expires',
      content: '0',
    },
    {
      name: 'google',
      content: 'notranslate',
    },
  ],
  // 微前端
  // qiankun: {
  //   slave: {},
  // },
});

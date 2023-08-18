/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    '/testapi': {
      title: '测试环境',
      target: 'http://172.16.99.82', // 测试环境
      // target: 'http://172.16.99.125:18181', // 传盛
      changeOrigin: true,
      pathRewrite: { '/testapi': '' },
    },
    '/aliossapi': {
      target: 'https://liyi99-pic.oss-cn-shenzhen.aliyuncs.com/', // 测试环境
      changeOrigin: true,
      pathRewrite: { '/aliossapi': '' },
    },
    '/uatapi': {
      title: 'uat环境',
      target: 'http://172.16.99.166', // uat环境
      changeOrigin: true,
      pathRewrite: { '/uatapi': '' },
    },
    '/api1/order-service': {
      target: 'http://172.16.99.102:8888', // 超超
      changeOrigin: true,
      pathRewrite: { '/api1': '' },
    },
    '/api1/report-service': {
      target: 'http://172.16.99.102:8055', // 超超
      changeOrigin: true,
      pathRewrite: { '/api1': '' },
    },
    '/api1/permissions': {
      target: 'http://172.16.99.102:8081', // 超超
      changeOrigin: true,
      pathRewrite: { '/api1': '' },
    },
    '/api1/sc-scm': {
      title: '陈超超',
      target: 'http://172.16.99.102:18181', // 超超
      changeOrigin: true,
      pathRewrite: { '/api1': '' },
    },
    '/api2/order-service': {
      target: 'http://172.16.99.56:8888', // 书闯
      changeOrigin: true,
      pathRewrite: { '/api2': '' },
    },
    '/api2/report-service': {
      target: 'http://172.16.99.56:8055', // 书闯
      changeOrigin: true,
      pathRewrite: { '/api2': '' },
    },
    '/api2/permissions': {
      target: 'http://172.16.99.56:8081', // 书闯
      changeOrigin: true,
      pathRewrite: { '/api2': '' },
    },
    '/api2/sc-scm': {
      title: '宋书闯',
      target: 'http://172.16.99.56:18181', // 书闯
      changeOrigin: true,
      pathRewrite: { '/api2': '' },
    },
    '/api3/order-service': {
      target: 'http://172.16.99.128:8888', // 建华
      changeOrigin: true,
      pathRewrite: { '/api3': '' },
    },
    '/api3/report-service': {
      target: 'http://172.16.99.128:8055', // 建华
      changeOrigin: true,
      pathRewrite: { '/api3': '' },
    },
    '/api3/permissions': {
      target: 'http://172.16.99.128:8081', // 建华
      changeOrigin: true,
      pathRewrite: { '/api3': '' },
    },
    '/api3/sc-scm': {
      title: '苏建华',
      target: 'http://172.16.99.128:18181', // 建华
      changeOrigin: true,
      pathRewrite: { '/api3': '' },
    },
    '/api4/order-service': {
      target: 'http://172.16.99.225:8888', // 张俊
      changeOrigin: true,
      pathRewrite: { '/api4': '' },
    },
    '/api4/report-service': {
      target: 'http://172.16.99.225:8055', // 张俊
      changeOrigin: true,
      pathRewrite: { '/api4': '' },
    },
    '/api4/permissions': {
      target: 'http://172.16.99.225:8081', // 张俊
      changeOrigin: true,
      pathRewrite: { '/api4': '' },
    },
    '/api4/sc-scm': {
      title: '张俊',
      target: 'http://172.16.99.225:18181', // 张俊
      changeOrigin: true,
      pathRewrite: { '/api4': '' },
    },
    '/api5/order-service': {
      target: 'http://172.16.1.96:8888', // 邬湘东
      changeOrigin: true,
      pathRewrite: { '/api5': '' },
    },
    '/api5/report-service': {
      target: 'http://172.16.1.96:8055', // 邬湘东
      changeOrigin: true,
      pathRewrite: { '/api5': '' },
    },
    '/api5/permissions': {
      target: 'http://172.16.1.96:8081', // 邬湘东
      changeOrigin: true,
      pathRewrite: { '/api5': '' },
    },
    '/api5/sc-scm': {
      title: '邬湘东',
      target: 'http://172.16.1.96:18181', // 邬湘东
      changeOrigin: true,
      pathRewrite: { '/api5': '' },
    },
    '/api6/order-service': {
      target: 'http://172.16.99.125:8888', // 传盛
      changeOrigin: true,
      pathRewrite: { '/api6': '' },
    },
    '/api6/report-service': {
      target: 'http://172.16.99.125:8055', // 传盛
      changeOrigin: true,
      pathRewrite: { '/api6': '' },
    },
    '/api6/permissions': {
      target: 'http://172.16.99.125:8081', // 传盛
      changeOrigin: true,
      pathRewrite: { '/api6': '' },
    },
    '/api6/sc-scm': {
      title: '林传盛',
      target: 'http://172.16.99.125:18181', // 传盛
      changeOrigin: true,
      pathRewrite: { '/api6': '' },
    },
    '/api7/order-service': {
      target: 'http://172.16.99.215:8888', // 章发中
      changeOrigin: true,
      pathRewrite: { '/api7': '' },
    },
    '/api7/report-service': {
      target: 'http://172.16.99.215:8055', // 章发中
      changeOrigin: true,
      pathRewrite: { '/api7': '' },
    },
    '/api7/permissions': {
      target: 'http://172.16.99.215:8081', // 章发中
      changeOrigin: true,
      pathRewrite: { '/api7': '' },
    },
    '/api7/sc-scm': {
      title: '章发中',
      target: 'http://172.16.99.215:18181', // 章发中
      changeOrigin: true,
      pathRewrite: { '/api7': '' },
    },
  },
  test: {
    '/api/': {
      target: 'https://preview.pro.ant.design',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};

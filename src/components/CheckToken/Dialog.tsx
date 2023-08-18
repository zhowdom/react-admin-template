import {  useState } from 'react';
import { Button, Modal, Space, Tabs } from 'antd';
import Cookies from 'js-cookie';
import './style.less';
// @ts-ignore

const Dialog = (props: any) => {
  const [visible, setVisible] = useState(false); // 弹窗显示
  const [nowProxy, setNowProxy] = useState<any>({}); // 当前代理环境 nowProxy 数组 第一个是权限平台， 第二个是供应链
  if (props.dialogModel) {
    props.dialogModel.current = {
      open: () => {
        setVisible(true);
        const newD: any = Cookies.get(`${window.location.port}proxy`) || [];
        console.log(newD)
        setNowProxy(newD.split(','));
      },
    };
  }
  const proxyData: any = [
    {
      name: '权限平台',
      key: 'ams',
      list: [
        { title: '测试环境', api: '/testapi' },
        { title: 'uat环境', api: '/uatapi' },
        { title: '陈超超', api: '/api1' },
        { title: '宋书闯', api: '/api2' },
        { title: '苏建华', api: '/api3' },
        { title: '张俊', api: '/api4' },
        { title: '邬湘东', api: '/api5' },
        { title: '林传盛', api: '/api6' },
        { title: '章发中', api: '/api7' },
      ]
    },
    {
      name: '供应链系统',
      key: 'scm',
      list: [
        { title: '测试环境', api: '/testapi' },
        { title: 'uat环境', api: '/uatapi' },
        { title: '陈超超', api: '/api1' },
        { title: '宋书闯', api: '/api2' },
        { title: '苏建华', api: '/api3' },
        { title: '张俊', api: '/api4' },
        { title: '邬湘东', api: '/api5' },
        { title: '林传盛', api: '/api6' },
        { title: '章发中', api: '/api7' },
      ]
    },
    {
      name: '报表系统',
      key: 'report',
      list: [
        { title: '测试环境', api: '/testapi' },
        { title: 'uat环境', api: '/uatapi' },
        { title: '陈超超', api: '/api1' },
        { title: '宋书闯', api: '/api2' },
        { title: '苏建华', api: '/api3' },
        { title: '张俊', api: '/api4' },
        { title: '邬湘东', api: '/api5' },
        { title: '林传盛', api: '/api6' },
        { title: '章发中', api: '/api7' },
      ]
    },
    {
      name: '订单系统',
      key: 'order',
      list: [
        { title: '测试环境', api: '/testapi' },
        { title: 'uat环境', api: '/uatapi' },
        { title: '陈超超', api: '/api1' },
        { title: '宋书闯', api: '/api2' },
        { title: '苏建华', api: '/api3' },
        { title: '张俊', api: '/api4' },
        { title: '邬湘东', api: '/api5' },
        { title: '林传盛', api: '/api6' },
        { title: '章发中', api: '/api7' },
      ]
    }
  ]
  // 关闭
  const modalClose = () => {
    setVisible(false);
  };
  // 操作成功
  const modalSuccess = () => {
    Cookies.set(`${window.location.port}proxy`, nowProxy.join(','));
    setTimeout(() => {
      setVisible(false);
      location.reload();
    }, 500);
  };
  // 点击
  const selectedKey = (index: number, api: string) => {
    const cookiesKey = JSON.parse(JSON.stringify(nowProxy));
    cookiesKey[index] = api;
    setNowProxy(cookiesKey);
  };
  return (
    <Modal
      width={600}
      title="开发配置"
      open={visible}
      onCancel={modalClose}
      onOk={modalSuccess}
      destroyOnClose
    >
      <Tabs
        defaultActiveKey={'2'}
        type="card"
        items={[
          {
            label: '联调代理',
            key: '2',
            children: proxyData.map((item: any, index: number) => (
              <div key={item.key} className='checkTokenBody'>
                <div className='checkTokenBody-title'>{item.name}</div>
                <div className='checkTokenBody-nav'>
                  <Space style={{ overflow: 'auto' }}>
                    {
                      item.list.map((x: any) => {
                        return (
                          <Button
                            type={nowProxy[index] == x.api ? 'primary' : 'default'}
                            key={x.api}
                            size={'small'}
                            onClick={() => selectedKey(index, x.api)}
                          >
                            {x.title}
                          </Button>
                        );
                      })
                    }
                  </Space>
                </div>
              </div>
            ))
          },
        ]}
      />
    </Modal>
  );
};
export default Dialog;

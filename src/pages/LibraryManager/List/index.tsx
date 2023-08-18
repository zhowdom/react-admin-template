import { PageContainer } from '@ant-design/pro-layout';
import { useState } from 'react';
import CaiNiao from './CaiNiao';
import JdPop from './JdPop';
import JdFcs from './JdFcs';
import JdSelf from './JdSelf';
import Cloud from './Cloud';
import { connect, useAccess } from 'umi';
import NoListPage from '@/components/NoListPage';
const Index = (props: any) => {
  const access = useAccess();
  const { common } = props;
  const cacheTab = window.sessionStorage.getItem('stockManageTab');
  const dicList = common.dicList;
  const tabList: any = [];
  if (access.canSee('stock_cn')) {
    tabList.push({ tab: '菜鸟库存', key: 'cn' });
  }
  if (access.canSee('stock_pop')) {
    tabList.push({ tab: '京东POP库存', key: 'jdPop' });
  }
  if (access.canSee('stock_fcs')) {
    tabList.push({ tab: '京东FCS库存', key: 'jdFcs' });
  }
  if (access.canSee('stock_self')) {
    tabList.push({ tab: '京东自营库存', key: 'jdSelf' });
  }
  if (access.canSee('stock_yc')) {
    tabList.push({ tab: '云仓库存', key: 'cloud' });
  }
  const [tabActiveKey, tabActiveKeySet] = useState('');
  setTimeout(() => {
    console.log(2)
    tabActiveKeySet(cacheTab || tabList?.[0]?.key)
  }, 200);
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      className="pubPageTabs"
      tabList={tabList}
      tabActiveKey={tabActiveKey}
      onTabChange={(key: string) => {
        tabActiveKeySet(key);
        window.sessionStorage.setItem('stockManageTab', key);
      }}
    >
      {tabActiveKey === 'cn' ? (
        <CaiNiao dicList={dicList} />
      ) : tabActiveKey === 'jdPop' ? (
        <JdPop dicList={dicList} />
      ) : tabActiveKey === 'jdFcs' ? (
        <JdFcs dicList={dicList} />
      ) : tabActiveKey === 'jdSelf' ? (
        <JdSelf dicList={dicList} />
      ) : tabActiveKey === 'cloud' ? (
        <Cloud dicList={dicList} />
      ) : (
        <NoListPage />
      )}
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage = connect(({ common }: any) => ({ common }))(Index);
export default ConnectPage;

import { PageContainer } from '@ant-design/pro-layout';
import { useState } from 'react';
import CurrentEffect from './components/CurrentEffect';
import HistoryEffect from './components/HistoryEffect';
import { connect, useAccess } from 'umi';
import NoListPage from '@/components/NoListPage';

const Index = (props: any) => {
  const access = useAccess();
  let cacheTab = '';
  if(access.canSee('stock_up_logisticsPeriod_history_pageQuery') && access.canSee('/stock-up-in/storageRules/logisticsPeriod')){
    cacheTab = window.sessionStorage.getItem('baseBackupsDataTabEffect') || 'currentEffect'
  }else if(access.canSee('stock_up_logisticsPeriod_history_pageQuery') && !access.canSee('/stock-up-in/storageRules/logisticsPeriod')){
    cacheTab = 'historyEffect'
  }else if(!access.canSee('stock_up_logisticsPeriod_history_pageQuery') && access.canSee('/stock-up-in/storageRules/logisticsPeriod')){
    cacheTab = 'currentEffect'
  }
  const [tabActiveKey, tabActiveKeySet] = useState(cacheTab);
  const [tabList] = useState(
    access.canSee('stock_up_logisticsPeriod_history_pageQuery') &&
      access.canSee('/stock-up-in/storageRules/logisticsPeriod')
      ? [
          { tab: '当前时效', key: 'currentEffect' },
          { tab: '历史时效', key: 'historyEffect' },
        ]
      : access.canSee('/stock-up-in/storageRules/logisticsPeriod')
      ? [{ tab: '当前时效', key: 'currentEffect' }]
      : access.canSee('stock_up_logisticsPeriod_history_pageQuery')
      ? [{ tab: '历史时效', key: 'historyEffect' }]
      : [],
  );
  const dicList: any = props?.common?.dicList;

  return tabList.length == 0 ? (
    <NoListPage />
  ) : (
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
        window.sessionStorage.setItem('baseBackupsDataTabEffect', key);
      }}
    >
      <div style={{display: tabActiveKey === 'currentEffect' ? 'block' : 'none'}}><CurrentEffect dicList={dicList} /></div>
      <div style={{display: tabActiveKey === 'historyEffect' ? 'block' : 'none'}}><HistoryEffect dicList={dicList} /></div>
    </PageContainer>
  );
};

// 全局model注入
const ConnectPage = connect(({ common }: any) => ({ common }))(Index);
export default ConnectPage;

import { PageContainer } from '@ant-design/pro-layout';
import { useState } from 'react';
import Ipidata from './components/Ipidata';
import HistoryData from './components/HistoryData';
import { connect, useAccess } from 'umi';
import NoListPage from '@/components/NoListPage';

const Index = (props: any) => {
  const cacheTab = window.sessionStorage.getItem('baseBackupsDataTabIPI') || 'ipidata';
  const access = useAccess();
  const [tabActiveKey, tabActiveKeySet] = useState(
    !access.canSee('/stock-up-in/storageCapacity/IPIList')
      ? cacheTab || 'ipidata'
      : cacheTab || 'historyData',
  );
  const [tabList] = useState(
    access.canSee('/stock-up-in/storageCapacity/IPIList') &&
      access.canSee('scm_stock_up_ipi_getlist')
      ? [
          { tab: 'IPI数据', key: 'ipidata' },
          { tab: '历史数据', key: 'historyData' },
        ]
      : access.canSee('scm_stock_up_ipi_getlist')
      ? [{ tab: 'IPI数据', key: 'ipidata' }]
      : access.canSee('/stock-up-in/storageCapacity/IPIList')
      ? [{ tab: '历史数据', key: 'historyData' }]
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
        window.sessionStorage.setItem('baseBackupsDataTabIPI', key);
      }}
    >
      <div style={{display: tabActiveKey === 'ipidata' ? 'block' : 'none'}}><Ipidata dicList={dicList} /></div>
      <div style={{display: tabActiveKey === 'historyData' ? 'block' : 'none'}}><HistoryData dicList={dicList} /></div>
    </PageContainer>
  );
};

// 全局model注入
const ConnectPage = connect(({ common }: any) => ({ common }))(Index);
export default ConnectPage;

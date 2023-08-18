import { PageContainer } from '@ant-design/pro-layout';
import { useContext, useState } from 'react';
import { connect } from 'umi';
import Amazon from './Amazon';
import Walmart from './Walmart';
import { Context } from './context';
import All from './All';
const cacheKey = 'pageStorageManageBi';
const Page = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const [tabActiveKey, tabActiveKeySet] = useState(sessionStorage.getItem(cacheKey) || 'all');
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      className="pubPageTabs"
      tabList={[
        { tab: '库存汇总', key: 'all' },
        { tab: 'Amazon SC库存', key: 'amazon' },
        { tab: 'Walmart库存', key: 'walmart' },
      ]}
      tabActiveKey={tabActiveKey}
      onTabChange={(val) => {
        tabActiveKeySet(val);
        window.sessionStorage.setItem(cacheKey, val);
      }}
    >
      <Context.Provider value={{ ...useContext(Context), dicList }}>
        {tabActiveKey === 'all' ? <All /> : tabActiveKey === 'amazon' ? <Amazon /> : <Walmart />}
      </Context.Provider>
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

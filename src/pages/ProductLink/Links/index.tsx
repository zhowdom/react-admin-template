import { PageContainer } from '@ant-design/pro-layout';
import { useState } from 'react';
import { connect } from 'umi';
import All from './All';

const PageLinks = (props: any) => {
  const { common, history } = props;
  const business_scope = history.location?.pathname?.includes('/cn') ? 'CN' : 'IN';
  const { dicList } = common;
  const cacheTab = window.sessionStorage.getItem('linkPageTab');
  const [tabActiveKey, tabActiveKeySet] = useState(cacheTab || 'ALL');
  const [statistics, setStatistics] = useState({
    linkManageCount: '',
    reviewCount: '',
    exceptionCount: '',
    onSaleCount: '',
    soldOutCount: '',
  });
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      className="pubPageTabs"
      tabList={[
        { tab: `在售 (${statistics?.onSaleCount || 0})`, key: 'ON_SALE' },
        { tab: `评审中 (${statistics?.reviewCount || 0})`, key: 'REVIEWING' },
        { tab: `异常待处理 (${statistics?.exceptionCount || 0})`, key: 'EXCEPTION' },
        { tab: `已下架 (${statistics?.soldOutCount || 0})`, key: 'SOLD_OUT' },
        { tab: `全部 (${statistics?.linkManageCount || 0})`, key: 'ALL' },
      ]}
      tabActiveKey={tabActiveKey}
      onTabChange={(val: any) => {
        window.sessionStorage.setItem('linkPageTab', val);
        tabActiveKeySet(val);
      }}
    >
      <All
        label={tabActiveKey}
        business_scope={business_scope}
        dicList={dicList}
        setStatistics={setStatistics}
      />
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(PageLinks);
export default ConnectPage;

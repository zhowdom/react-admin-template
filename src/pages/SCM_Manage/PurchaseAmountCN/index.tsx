import { PageContainer } from '@ant-design/pro-layout';
import { useState } from 'react';
import Order from './Order';
import Stock from './Stock';

const Index = () => {
  const cacheTab = window.sessionStorage.getItem('purchaseAmountCNTab');
  const [tabActiveKey, tabActiveKeySet] = useState(cacheTab || 'order');
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      className="pubPageTabs"
      tabList={[
        { tab: '采购金额统计(采购下单维度)', key: 'order' },
        { tab: '采购金额统计(收货入库维度)', key: 'stock' },
      ]}
      tabActiveKey={tabActiveKey}
      onTabChange={(key: string) => {
        tabActiveKeySet(key);
        window.sessionStorage.setItem('purchaseAmountCNTab', key);
      }}
    >
      <div style={{display: tabActiveKey === 'order' ? 'block' : 'none'}}><Order /></div>
      <div style={{display: tabActiveKey === 'order' ? 'none' : 'block'}}><Stock /></div>
    </PageContainer>
  );
};

export default Index;

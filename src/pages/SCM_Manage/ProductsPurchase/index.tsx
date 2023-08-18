import { PageContainer } from '@ant-design/pro-layout';
import { useState } from 'react';
import Total from './components/Total';
import Details from './components/Details';
import { connect, useAccess } from 'umi';
import NoListPage from '@/components/NoListPage';

const Index = (props: any) => {
  const cacheTab = window.sessionStorage.getItem('productsPurchaseTab');
  const access = useAccess();
  const [tabActiveKey, tabActiveKeySet] = useState(
    !access.canSee('liyi99-report_products-purchase-total')
      ? cacheTab || 'details'
      : cacheTab || 'total',
  );
  const [fromTab, setFromTab] = useState(true);
  const [totalData, totalDataSet] = useState<any>();
  const [tabList] = useState(
    access.canSee('liyi99-report_products-purchase-total') &&
      access.canSee('liyi99-report_products-purchase-detail')
      ? [
          { tab: '汇总', key: 'total' },
          { tab: '采购明细', key: 'details' },
        ]
      : access.canSee('liyi99-report_products-purchase-total')
      ? [{ tab: '汇总', key: 'total' }]
      : access.canSee('liyi99-report_products-purchase-detail')
      ? [{ tab: '采购明细', key: 'details' }]
      : [],
  );
  const dicList: any = props?.common?.dicList;
  const toDetail = (data?: any) => {
    setFromTab(false);
    tabActiveKeySet('details');
    totalDataSet(data);
  };

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
        setFromTab(true);
        window.sessionStorage.setItem('productsPurchaseTab', key);
      }}
    >
      <div style={{display: tabActiveKey === 'total' ? 'block' : 'none'}}><Total dicList={dicList} toDetail={toDetail} /></div>
      <div style={{display: tabActiveKey === 'total' ? 'none' : 'block'}}><Details dicList={dicList} fromTab={fromTab} totalData={totalData} setFromTab={setFromTab} /></div>
    </PageContainer>
  );
};

// 全局model注入
const ConnectPage = connect(({ common }: any) => ({ common }))(Index);
export default ConnectPage;

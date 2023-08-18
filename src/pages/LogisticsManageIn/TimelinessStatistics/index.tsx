import { PageContainer } from '@ant-design/pro-layout';
import { useState } from 'react';
import { connect } from 'umi';
import BookingNumberTable from './components/BookingNumberTable';
import CompanyTable from './components/CompanyTable';
import ShippingMethodTable from './components/ShippingMethodTable';
import  './index.less'

const Index = (props: any) => {
  const { common } = props;
  const cacheTab = window.sessionStorage.getItem('timelinessStatistics');
  const dicList = common.dicList;
  const tabList: any = [
    {
      key: '1',
      tab: '船公司/快递公司时效统计',
    },
    {
      key: '2',
      tab: '出货渠道时效统计',
    },
    {
      key: '3',
      tab: '订舱号时效统计',
    },
  ];
  const [tabActiveKey, tabActiveKeySet] = useState<string>(cacheTab || '1');
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      className={`pubPageTabs pubPageTabsTime` }
      tabList={tabList}
      tabActiveKey={tabActiveKey}
      onTabChange={(key: string) => {
        tabActiveKeySet(key);
        window.sessionStorage.setItem('stockManageTab', key);
      }}
    >
      {tabActiveKey == '1' && <CompanyTable dicList={dicList} />}
      {tabActiveKey == '2' && <ShippingMethodTable dicList={dicList}/>}
      {tabActiveKey == '3' && <BookingNumberTable  dicList={dicList}/>}
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage = connect(({ common }: any) => ({ common }))(Index);
export default ConnectPage;

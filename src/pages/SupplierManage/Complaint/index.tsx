import { PageContainer } from '@ant-design/pro-layout';
import { useState } from 'react';
import List from './List';
import Template from './Template';
import { connect } from 'umi';
import NoListPage from '@/components/NoListPage';
const Index = (props: any) => {
  const { common } = props;
  const cacheTab = window.sessionStorage.getItem('supplierComplaintTab');
  const dicList = common.dicList;
  const tabList: any = [
    { tab: '反馈列表', key: 'list' },
    { tab: '公告模板', key: 'template' },
  ];
  const [tabActiveKey, tabActiveKeySet] = useState(cacheTab || tabList?.[0]?.key);
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
        window.sessionStorage.setItem('supplierComplaintTab', key);
      }}
    >
      {tabActiveKey === 'list' ? (
        <List dicList={dicList} />
      ) : tabActiveKey === 'template' ? (
        <Template dicList={dicList} />
      ) : (
        <NoListPage />
      )}
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage = connect(({ common }: any) => ({ common }))(Index);
export default ConnectPage;

import { PageContainer } from '@ant-design/pro-layout';
import React, { useState } from 'react';
import Amazon from './Amazon';
import Walmart from './Walmart';
import { connect, useAccess } from 'umi';
import { Result } from 'antd';
/*订单日统计报表*/
const Index: React.FC<{
  common: any;
}> = ({ common }) => {
  const access = useAccess();
  const cacheTabKey = 'orderStatisticsIndexTab';
  const cacheTab = window.sessionStorage.getItem(cacheTabKey);
  const tabList: any[] = [];
  if (access.canSee('liyi99-report_order-statistics-amazon-list')) {
    tabList.push({ tab: 'Amazon', key: 'Amazon' });
  }
  if (access.canSee('liyi99-report_order-statistics-walmart-list')) {
    tabList.push({ tab: 'Walmart', key: 'Walmart' });
  }
  let defaultTab: any;
  if (tabList.length) {
    if (tabList.find((item: any) => item.key == cacheTab)) {
      defaultTab = cacheTab;
    } else {
      defaultTab = tabList[0].key;
    }
  }
  const [tabActiveKey, tabActiveKeySet] = useState(defaultTab);
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      className="pubPageTabs"
      tabList={tabList}
      tabActiveKey={tabActiveKey}
      onTabChange={(tab: string) => {
        tabActiveKeySet(tab);
        window.sessionStorage.setItem(cacheTabKey, tab);
      }}
    >
      {tabActiveKey == 'Amazon' && <Amazon platform_code={'AMAZON_SC'} common={common} />}
      {tabActiveKey == 'Walmart' && <Walmart platform_code={'WALMART'} common={common} />}
      {tabList.length == 0 && (
        <Result
          status="403"
          title="403"
          subTitle="不好意思, 你当前无权限访问此页面, 可联系管理员开通权限."
        />
      )}
    </PageContainer>
  );
};
// 全局model注入
const OrderStatisticsIndex: React.FC = connect(({ common }: any) => ({ common }))(Index);
export default OrderStatisticsIndex;

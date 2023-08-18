import { PageContainer } from '@ant-design/pro-layout';
import { Result } from 'antd';
import React, { useState } from 'react';
import Order from './Order';
import Replaces from './Replaces';
import Refund from './Refund';
import Account from './Account';
import Sales from './Sales';
import { connect, useAccess } from 'umi';

const Index: React.FC<{
  common: any;
}> = ({ common }) => {
  const access = useAccess();
  const cacheTabKey = 'orderListAmazonTab';
  const cacheTab = window.sessionStorage.getItem(cacheTabKey);
  const tabList: any[] = [];
  if (access.canSee('liyi99-report_order-order-amazon-list')) {
    tabList.push({ tab: '订单报告', key: 'Order' });
  }
  if (access.canSee('liyi99-report_order-refund-amazon-list')) {
    tabList.push({ tab: '退货报告', key: 'Refund' });
  }
  if (access.canSee('liyi99-report_order-replaces-amazon-list')) {
    tabList.push({ tab: '换货报告', key: 'Replaces' });
  }
  if (access.canSee('liyi99-report_order-account-amazon-list')) {
    tabList.push({ tab: '结算报告', key: 'Account' });
  }
  if (access.canSee('liyi99-report_order-sales-amazon-list')) {
    tabList.push({ tab: '订单销量', key: 'Sales' });
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

      <div style={{display: tabActiveKey == 'Order' ? 'block' : 'none'}}><Order common={common} /></div>
      <div style={{display: tabActiveKey == 'Refund' ? 'block' : 'none'}}><Refund common={common} /></div>
      <div style={{display: tabActiveKey == 'Replaces' ? 'block' : 'none'}}><Replaces common={common} /></div>
      <div style={{display: tabActiveKey == 'Account' ? 'block' : 'none'}}><Account common={common} /></div>
      <div style={{display: tabActiveKey == 'Sales' ? 'block' : 'none'}}><Sales common={common} /></div>
      {tabList.length == 0 && (
        <Result
          status="403"
          title="权限不足"
          subTitle="不好意思, 你当前无权限访问此页面, 可联系管理员开通权限."
        />
      )}
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Index);
export default ConnectPage;

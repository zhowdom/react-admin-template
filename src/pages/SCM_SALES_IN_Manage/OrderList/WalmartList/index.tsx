import { PageContainer } from '@ant-design/pro-layout';
import React, { useState } from 'react';
import Order from './Order';
import Refund from './Refund';
import { connect, useAccess } from 'umi';
import { Result } from 'antd';

const Index: React.FC<{
  common: any;
}> = ({ common }) => {
  const access = useAccess();
  const cacheTabKey = 'orderListWalmartTab';
  const cacheTab = window.sessionStorage.getItem(cacheTabKey);
  const tabList: any[] = [];
  if (access.canSee('liyi99-report_order-order-walmart-list')) {
    tabList.push({ tab: '订单明细', key: 'Order' });
  }
  if (access.canSee('liyi99-report_order-refund-walmart-list')) {
    tabList.push({ tab: '退货明细', key: 'Refund' });
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
const WalmartIndex: React.FC = connect(({ common }: any) => ({ common }))(Index);
export default WalmartIndex;

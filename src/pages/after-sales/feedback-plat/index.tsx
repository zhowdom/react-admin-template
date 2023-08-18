import { PageContainer } from '@ant-design/pro-layout';
import React, { useState } from 'react';
import Good from './Good';
import Sku from './Sku';
import { connect } from 'umi';
import { Result } from 'antd';
/*客诉分类统计 - tab首页*/
const Index: React.FC<{
  common?: any;
  history?: any;
}> = (props) => {
  const cacheTabKey = 'feedbackPlatyPageTab';
  const cacheTab = window.sessionStorage.getItem(cacheTabKey);
  const tabList: any[] = [
    { tab: '按款式', key: 'Sku' },
    { tab: '按产品', key: 'Good' },
  ];
  let defaultTab: any;
  if (tabList.length) {
    if (tabList.find((item: any) => item.key == cacheTab)) {
      defaultTab = cacheTab;
    } else {
      defaultTab = tabList[0].key;
    }
  }
  const [tabActiveKey, tabActiveKeySet] = useState(defaultTab);
  const [goodsCode, goodsCodeSet] = useState(''); // 产品编码
  const [timeRange, timeRangeSet] = useState({}); // 下单时间
  const onTabChange = (tab: any) => {
    tabActiveKeySet(tab);
    window.sessionStorage.setItem(cacheTabKey, tab);
  };
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      className="pubPageTabs"
      tabList={tabList}
      tabActiveKey={tabActiveKey}
      onTabChange={onTabChange}
    >
      <div style={{ display: tabActiveKey == 'Good' ? 'block' : 'none' }}>
        <Good
          {...props}
          onTabChange={onTabChange}
          goodsCodeSet={goodsCodeSet}
          timeRangeSet={timeRangeSet}
          timeRange={timeRange}
        />
      </div>
      <div style={{ display: tabActiveKey == 'Sku' ? 'block' : 'none' }}>
        <Sku {...props} goodsCode={goodsCode} timeRange={timeRange} />
      </div>
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
const ModelIndex: React.FC = connect(({ common }: any) => ({ common }))(Index);
export default ModelIndex;

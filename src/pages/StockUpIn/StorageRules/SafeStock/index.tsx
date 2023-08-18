import { useRef, useState, useEffect } from 'react';
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { useActivate } from 'react-activation';
import { pubConfig } from '@/utils/pubConfig';
import { findLinkManagementStatistics } from '@/services/pages/link';
import { connect } from 'umi';
import All from './All';
import Unapproval from './Unapproval';
import SendGoods from './SendGoods';

const cacheKey = 'pageSafeStockTab';
const Page: React.FC<{ common: any }> = ({ common }) => {
  const actionRef = useRef<ActionType>();
  const [tabActiveKey, tabActiveKeySet] = useState(sessionStorage.getItem(cacheKey) || '0');
  console.log(tabActiveKey, 'tabActiveKey')
  const [tabList, tabListSet] = useState<any>([
    {
      tab: '全部',
      key: '0',
    },
    {
      tab: '运输方式待审批', // 待审批 ---> 运输方式待审批
      key: '1',
    },
    {
      tab: '目的仓待审批',
      key: '2',
    },
  ]);
  const getTabList = () => {
    findLinkManagementStatistics({
      business_scope:"IN"
    }).then((res: any) => {
      console.log(res.data, 'res.data')
      if (res?.code == pubConfig.sCode) {
        tabListSet([
          { tab: `全部(${res.data.shippingMethodAllPageCount})`, key: '0' },
          { tab: `运输方式待审批(${res.data.shippingMethodApprovalCount})`, key: '1' }, // 待审批 ---> 运输方式待审批
          { tab: `目的仓待审批(${res.data.deliveryRouteApprovalCount})`, key: '2' },
        ]);
      }
    });
  };
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
    getTabList();
  });
  useEffect(getTabList, []);
  return (
    <PageContainer
      className={'pubPageTabs'}
      tabList={tabList}
      tabActiveKey={tabActiveKey}
      onTabChange={(val) => {
        tabActiveKeySet(val);
        sessionStorage.setItem(cacheKey, val);
      }}
    >
      {tabActiveKey == '1' ?
      (
        <Unapproval getTabList={getTabList} common={common} tabActiveKey={tabActiveKey} />
      ) :
      (
        (
          tabActiveKey == '2' ?
          <SendGoods common={common} tabActiveKey={tabActiveKey} getTabList={getTabList} />
          :
          <All common={common} tabActiveKey={tabActiveKey} getTabList={getTabList} />
        )
      )
      }
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

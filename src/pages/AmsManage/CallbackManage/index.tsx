import { PageContainer } from '@ant-design/pro-components';
import { useState } from 'react';
import Dy from './components/Dy';
import Qm from './components/Qm';
import { connect } from 'umi';

const Callback: any = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const tabList: any = [
    {
      key: '1',
      tab: '抖音',
    },
    {
      key: '2',
      tab: '奇门',
    },
  ];
  const [tabActiveKey, tabActiveKeySet] = useState<string>('1');

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      className={`pubPageTabs`}
      tabList={tabList}
      tabActiveKey={tabActiveKey}
      onTabChange={(key: string) => {
        tabActiveKeySet(key);
      }}
    >
      {tabActiveKey == '1' && <Dy dicList={dicList} />}
      {tabActiveKey == '2' && <Qm dicList={dicList} />}
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Callback);
export default ConnectPage;

import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import { connect } from 'umi';
import './index.less';

const Page = () => {
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <Card title="首页" bordered={false}>
        <div className="home-main">
          <div className="home-main-title">欢迎使用供应链系统！</div>
          <div className="home-main-bg">
            <img src="/images/banner.svg" />
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { Space } from 'antd';
import ImportBtn from '@/components/ImportBtn';

const ContractManage = (props: any) => {
  const { common } = props;
  console.log(common);

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <Space>
        <ImportBtn
          btnText={'物流单导入'}
          isHidTem={true}
          reload={() => {}}
          business_type={'LOGISTICS_ORDER'}
          importHandle={'/sc-scm/systemImport/importFile?code=LOGISTICS_ORDER'}
        />
      </Space>
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(ContractManage);
export default ConnectPage;

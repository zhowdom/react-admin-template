import { PageContainer } from '@ant-design/pro-layout';
import { useState } from 'react';
import { connect } from 'umi';
import Supplier from './Supplier';
import Order from './Order';
import { useSessionStorageState } from 'ahooks';

const Statistical = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const [key, keySet] = useSessionStorageState('paymentPageTab', { defaultValue: 'supplier' });
  const [tabActiveKey, tabActiveKeySet] = useState(key || 'supplier');
  const [vendorId, setVendorId] = useState<any>();

  const toOrder = (record: any) => {
    tabActiveKeySet('order');
    setVendorId(record.vendor_id);
  };
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      className="pubPageTabs"
      tabList={[
        { tab: '按供应商', key: 'supplier' },
        { tab: '按采购单', key: 'order' },
      ]}
      tabActiveKey={tabActiveKey}
      onTabChange={(value: string) => {
        tabActiveKeySet(value);
        keySet(value);
        setVendorId('');
      }}
    >
      {tabActiveKey === 'supplier' ? (
        <Supplier dicList={dicList} toOrder={toOrder} />
      ) : (
        <Order dicList={dicList} vendorId={vendorId} />
      )}
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Statistical);
export default ConnectPage;

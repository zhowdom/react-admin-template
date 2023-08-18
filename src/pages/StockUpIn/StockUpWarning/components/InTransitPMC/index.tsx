import { Modal } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useState } from 'react';
import '../index.less';
import PlannedShipment from './PlannedShipment';
import InTransit from './InTransit';

const DetailInprocessNumList: React.FC<{
  open: any;
  openSet: any;
  data: Record<string, any>;
  dicList: Record<string, any>;
}> = ({ data = {}, dicList, open, openSet }) => {
  const tabList: any = [
    {
      key: '1',
      tab: '已计划发货数量详情',
    },
    {
      key: '2',
      tab: '在途数量（采购）详情',
    },
  ];
  const [tabActiveKey, tabActiveKeySet] = useState<string>('1');

  return (
    <>
      <Modal
        width={1400}
        title={'在途数量（PMC）'}
        open={open}
        onCancel={() => openSet(false)}
        bodyStyle={{ paddingTop: 0 }}
        destroyOnClose
        footer={false}
        maskClosable={false}
        className="modal-table"
      >
        <PageContainer
          header={{
            title: false,
            breadcrumb: {},
          }}
          className={`pubPageTabs stockUpWarning`}
          tabList={tabList}
          tabActiveKey={tabActiveKey}
          onTabChange={(key: string) => {
            tabActiveKeySet(key);
          }}
        >
          {tabActiveKey == '1' && <PlannedShipment dicList={dicList} data={data} />}
          {tabActiveKey == '2' && <InTransit dicList={dicList} data={data} />}
        </PageContainer>
      </Modal>
    </>
  );
};
export default DetailInprocessNumList;

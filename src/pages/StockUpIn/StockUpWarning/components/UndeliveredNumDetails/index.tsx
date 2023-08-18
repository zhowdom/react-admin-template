import { Modal } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useState } from 'react';
import '../index.less';
import PlannedNotSigned from './PlannedNotSigned';
import PlannedShipment from './PlannedShipment';
import InProcess from './InProcess';

const DetailInprocessNumList: React.FC<{
  open: any;
  openSet: any;
  data: Record<string, any>;
  dicList: Record<string, any>;
}> = ({ data = {}, dicList, open, openSet }) => {
  const tabList: any = [
    {
      key: '1',
      tab: '已计划未签约数量',
    },
    {
      key: '2',
      tab: '在制数量',
    },
    {
      key: '3',
      tab: '已计划发货数量',
    },
  ];
  const [tabActiveKey, tabActiveKeySet] = useState<string>('1');
  return (
    <>
      <Modal
        width={1400}
        title={'未交货数量(PMC)'}
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
          {tabActiveKey == '1' && <PlannedNotSigned dicList={dicList} data={data} />}
          {tabActiveKey == '2' && <InProcess dicList={dicList} data={data} />}
          {tabActiveKey == '3' && <PlannedShipment dicList={dicList} data={data} />}
        </PageContainer>
      </Modal>
    </>
  );
};
export default DetailInprocessNumList;

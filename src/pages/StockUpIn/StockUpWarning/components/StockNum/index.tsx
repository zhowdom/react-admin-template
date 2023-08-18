import { Modal } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useState } from 'react';
import '../index.less';
import InEstiOrActNum from './InEstiOrActNum';
import PlanedNoOrderNum from './PlanedNoOrderNum';

const DetailInprocessNumList: React.FC<{
  open: any;
  openSet: any;
  data: Record<string, any>;
  dicList: Record<string, any>;
}> = ({ data = {}, dicList, open, openSet }) => {
  const tabList: any = [
    {
      key: '1',
      tab: '已计划未建入库单预计库存数量',
    },
    {
      key: '2',
      tab: '跨境平台入库单预计库存',
    },
  ];
  const [tabActiveKey, tabActiveKeySet] = useState<string>('1');
  return (
    <>
      <Modal
        width={1400}
        title={'在库数量 - 详情'}
        open={open}
        onCancel={() => openSet(false)}
        bodyStyle={{ paddingTop: 0 }}
        destroyOnClose
        footer={false}
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
          {tabActiveKey == '1' && <PlanedNoOrderNum dicList={dicList} data={data} />}
          {tabActiveKey == '2' && <InEstiOrActNum dicList={dicList} data={data} />}
        </PageContainer>
      </Modal>
    </>
  );
};
export default DetailInprocessNumList;

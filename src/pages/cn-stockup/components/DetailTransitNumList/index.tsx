import { Modal, Tabs } from 'antd';
import NoStock from './NoStock'; // 已计划未建入库单数量
import InStock from './InStock'; // 已建入库单未入库数量
import { printFn } from '@/utils/pubConfirm';
// @ts-ignore
import './style.less';

const Page: React.FC<{
  open: any;
  openSet: any;
  title?: string;
  data: Record<string, any>;
  dicList: Record<string, any>;
}> = ({ title, data = {}, dicList, open, openSet }) => {
  console.log(data, '5555')
  data.not_created_inventory_quantity = data?.not_created_inventory_quantity || 0;
  data.warehouse_receipt_not_quantity = data?.warehouse_receipt_not_quantity || 0;
  return (
    <Modal
      width={1400}
      title={title || '在途数量（PMC） - 详情'}
      footer={null}
      open={open}
      onCancel={() => openSet(false)}
      bodyStyle={{ paddingTop: 0 }}
      destroyOnClose
      className='detail-in-process-num-content'
    >
      <Tabs
        items={[
          {
            label: '已计划未建入库单数量',
            key: `tab-aa`,
            children: (
              <NoStock data={data} dicList={dicList} />
            )
          },
          {
            label: '已建入库单未入库数量',
            key: `tab-bb`,
            children: (
              <InStock data={data} dicList={dicList} />
            )
          },
        ]}
      />
      <div className='detail-in-process-num-list'>
        在途数量（PMC）=
        已计划未建入库单数量 <strong>{data?.not_created_inventory_quantity}</strong>&nbsp;&nbsp;+&nbsp;&nbsp;
        已建入库单未入库数量 <strong>{data?.warehouse_receipt_not_quantity}</strong>&nbsp;&nbsp;=&nbsp;&nbsp;
        <strong>{printFn(data?.not_created_inventory_quantity + data?.warehouse_receipt_not_quantity)}</strong>
      </div>
    </Modal>
  );
};
export default Page;

import { Modal, Tabs } from 'antd';
import ProcureNum from './ProcureNum'; // 已审核采购计划总数量
import DeliverNum from './DeliverNum'; // 已审核发货计划总数量
import StockNum from './StockNum'; // 计划外入库单数量
import { printFn } from '@/utils/pubConfirm';
// @ts-ignore
import './style.less';

const DetailInprocessNumList: React.FC<{
  open: any;
  openSet: any;
  title?: string;
  data: Record<string, any>;
  dicList: Record<string, any>;
}> = ({ title, data = {}, dicList, open, openSet }) => {
  return (
    <>
      <Modal
        width={1400}
        title={title || '在制数量（PMC） - 详情'}
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
              label: '已审核采购计划总数量',
              key: `tab-aa`,
              children: (
                <ProcureNum data={data} dicList={dicList} />
              )
            },
            {
              label: '已审核发货计划总数量',
              key: `tab-bb`,
              children: (
                <DeliverNum data={data} dicList={dicList} />
              )
            },
            {
              label: '计划外入库单数量',
              key: `tab-cc`,
              children: (
                <StockNum data={data} dicList={dicList} />
              )
            },
          ]}
        />
        <div className='detail-in-process-num-list'>
          在制数量（PMC）=
          已审核采购计划总数量 <strong>{data?.in_process_purchase_num}</strong>&nbsp;&nbsp;-&nbsp;&nbsp;
          发货计划总数量 <strong>{data?.in_process_delivery_num}</strong>&nbsp;&nbsp;-&nbsp;&nbsp;
          计划外入库单发货数量 <strong>{data?.in_process_warehousing_order_num}</strong>&nbsp;&nbsp;=&nbsp;&nbsp;
          <strong>{printFn(data?.in_process_purchase_num - data?.in_process_delivery_num - data?.in_process_warehousing_order_num)}</strong>
        </div>
      </Modal>
    </>
  );
};
export default DetailInprocessNumList;

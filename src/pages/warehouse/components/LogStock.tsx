import {ProTable} from '@ant-design/pro-components';
import {Modal} from 'antd';
import {ownStockTurnoverPage} from "@/services/pages/warehouse/stock";
import {pubConfig, pubMsg} from "@/utils/pubConfig";
import {useState} from "react";
// 库存单据流水分页
const Component: React.FC<{
  title?: string,
  trigger?: any,
  goods_sku_id: any,
  stock_type: any,
  change_type: any,
  dicList: any,
}> = ({title, trigger, goods_sku_id, stock_type, dicList, change_type}) => {
  const [open, openSet] = useState(false)
  return (
    <>
      <span onClick={() => openSet(true)}>{trigger || <a>日志</a>}</span>
      <Modal bodyStyle={{padding: '0 12px'}} width={1000} title={title || '库存单据操作日志'} open={open} onCancel={() => openSet(false)} footer={null} destroyOnClose>
        <ProTable
          rowKey="id"
          bordered
          options={false}
          search={{defaultCollapsed: false, className: 'light-search-form', labelWidth: 'auto'}}
          cardProps={{bodyStyle: {padding: 0}}}
          dateFormatter="string"
          scroll={{y: 400}}
          defaultSize={'small'}
          columns={[
            {
              title: '单据类型',
              dataIndex: 'order_type',
              width: 90,
              align: 'center',
              valueEnum: dicList?.SCM_OWN_STOCK_ORDER_TYPE || {},
            },
            {
              title: '出入库类型',
              dataIndex: 'out_in_bound_type',
              width: 80,
              align: 'center',
              valueEnum: dicList?.SCM_OWN_STOCK_OUTINBOUND_TYPE || {},
            },
            {
              title: '单据编号',
              dataIndex: 'order_no',
            },
            {
              title: '商品名称',
              dataIndex: 'sku_name',
            },
            {
              title: '商品条形码',
              dataIndex: 'bar_code',
              hideInSearch: true,
            },
            {
              title: 'SKU',
              dataIndex: 'sku_code',
            },
            {
              title: '发生数量',
              dataIndex: 'change_qty',
              width: 80,
              align: 'center',
              hideInSearch: true,
            },
            {
              title: '出入库时间',
              dataIndex: 'change_time',
              width: 136,
              align: 'center',
              hideInSearch: true,
            },
          ]}
          params={{goods_sku_id, stock_type, change_type}}
          request={async (params: any) => {
            const formData = {
              ...params,
              current_page: params.current,
              page_size: params.pageSize,
            };
            const res = await ownStockTurnoverPage(formData);
            if (res?.code == pubConfig.sCode) {
              return {
                success: true,
                data: res?.data?.records || [],
                total: res?.data?.total || 0,
              }
            } else {
              pubMsg(res?.message);
              return {
                success: false,
                data: [],
                total: 0,
              };
            }
          }}
        />
      </Modal>
    </>
  );
};
export default Component;

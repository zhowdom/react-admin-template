import {ProTable} from '@ant-design/pro-components';
import {Modal, Table} from 'antd'
import {useState} from 'react'
import {partsOrderPage} from '@/services/pages/warehouse/input';
import {pubConfig} from "@/utils/pubConfig";
import './style.less'

const GoodTable: React.FC<{ dataSource: any[] }> = ({dataSource}) =>
  <Table dataSource={dataSource}
         className={'inner-table'}
         showHeader={false}
         pagination={false}
         columns={
           [
             {title: '商品名称', dataIndex: 'sku_name', width: 120,},
             {title: 'SKU', dataIndex: 'sku_code', width: 100,},
             {title: '商品条形码', dataIndex: 'bar_code', width: 100,},
             {title: '待入库数量', dataIndex: 'delivery_num', width: 80, align: 'center',}
           ]
         }/>
// 入库单选择
const Component: React.FC<{
  disabled?: boolean,
  title?: string,
  trigger?: any,
  value: any[],
  onChange: any,
  requestParams?: Record<string, any>, // 额外商品查询过滤参数
  dicList: any,
}> = ({title, trigger, value, onChange, disabled = false, requestParams = {}, dicList}) => {
  const [open, openSet] = useState(false)
  const [selectedRowKeys, selectedRowKeysSet] = useState<React.Key[]>([])
  const [selectedRows, selectedRowsSet] = useState<any[]>([])
  const resetAndClose = () => {
    selectedRowKeysSet([])
    selectedRowsSet([])
    openSet(false)
  }
  return (<>
      <div style={{display: 'inline-block'}} onClick={() => {
        if (!disabled) openSet(true)
      }}>{trigger || <a>查找</a>}</div>
      <Modal open={open} title={title || '选择入库单'}
             destroyOnClose
             bodyStyle={{padding: '0 12px'}}
             onCancel={resetAndClose}
             okText={'确定选择'}
             okButtonProps={{disabled: !selectedRowKeys.length}}
             onOk={() => {
               onChange(selectedRows)
               resetAndClose()
             }}
             width={1100}>
        <ProTable defaultSize={'small'}
                  rowKey={'id'}
                  bordered
                  search={{defaultCollapsed: false, className: 'light-search-form', span: 6}}
                  scroll={{y: 400}}
                  options={false}
                  rowSelection={{
                    type: 'radio',
                    preserveSelectedRowKeys: true,
                    selectedRowKeys,
                    getCheckboxProps: (item: any) => ({
                      disabled: value.find(v => v.id == item.id),
                    }),
                    onChange: (keys, rows) => {
                      selectedRowKeysSet(keys)
                      selectedRowsSet(rows)
                    },
                  }}
                  columns={[
                    {title: '入库单号', dataIndex: 'order_no'},
                    {title: '快递单号', dataIndex: 'logistics_order_no', hideInSearch: true,},
                    {title: '入库单状态', dataIndex: 'inboundStatus', valueEnum: dicList?.SCM_PARTS_INBOUND_STATUS || {}, hideInSearch: true},
                    {title: '商品名称', dataIndex: 'sku_name', hideInTable: true,},
                    {title: 'SKU', dataIndex: 'sku_code', hideInTable: true,},
                    {
                      title: '待入库明细', dataIndex: 'orderSkuList', hideInSearch: true,
                      children: [
                        {
                          title: '商品名称', dataIndex: 'sku_name', onCell: () => ({colSpan: 4, style: {padding: 0}}), width: 120,
                          render: (_: any, record: any) => <GoodTable dataSource={record.orderSkuList || []}/>
                        },
                        {title: 'SKU', dataIndex: 'sku_code', onCell: () => ({colSpan: 0, style: {padding: 0}}), width: 100,},
                        {title: '商品条形码', dataIndex: 'bar_code', onCell: () => ({colSpan: 0, style: {padding: 0}}), width: 100,},
                        {title: '待入库数量', dataIndex: 'delivery_num', onCell: () => ({colSpan: 0, style: {padding: 0}}), width: 80, align: 'center',},
                      ]
                    },
                  ]}
                  params={requestParams}
                  request={async (params) => {
                    const res = await partsOrderPage({
                      ...params,
                      current_page: 1,
                      page_size: 999,
                    })
                    if (res?.code == pubConfig.sCode) {
                      return {
                        success: true,
                        data: res?.data?.records || [],
                        total: res?.data?.total || 0,
                      }
                    } else {
                      return {
                        success: false,
                        data: [],
                        total: 0,
                      }
                    }
                  }}/>
      </Modal>
    </>
  );
};
export default Component;

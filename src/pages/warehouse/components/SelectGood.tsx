import {ProTable} from '@ant-design/pro-components';
import {Modal, Button} from 'antd'
import {useState} from 'react'
import {getGoodsSkuVendorPage} from '@/services/pages/cooperateProduct';
import {pubConfig} from "@/utils/pubConfig";
import {request} from 'umi'
// 商品选择
const Component: React.FC<{
  disabled?: boolean,
  title?: string,
  trigger?: any,
  value: any[],
  onChange: any,
  requestParams?: Record<string, any>, // 额外商品查询过滤参数
  requestApi?: string,
  extraColumns?: any[],
}> = ({
        title, trigger,
        value,
        onChange,
        disabled = false,
        requestParams = {},
        requestApi,
        extraColumns = [],
      }) => {
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
      }}>{trigger || <Button disabled={disabled} type={'primary'}>添加商品明细</Button>}</div>
      <Modal open={open} title={title || '选择商品'}
             destroyOnClose
             bodyStyle={{padding: '0 12px'}}
             onCancel={resetAndClose}
             okText={'确定选择'}
             okButtonProps={{disabled: !selectedRowKeys.length}}
             onOk={() => {
               onChange(selectedRows)
               resetAndClose()
             }}
             width={1000}>
        <ProTable defaultSize={'small'}
                  rowKey={'id'}
                  bordered
                  search={{defaultCollapsed: false, className: 'light-search-form', span: 6}}
                  scroll={{y: 400}}
                  options={false}
                  rowSelection={{
                    preserveSelectedRowKeys: true,
                    selectedRowKeys,
                    getCheckboxProps: (item: any) => {
                      return {disabled: value.find(v => v.goods_sku_id ? v.goods_sku_id === item.goods_sku_id : v.id === item.id)}
                    },
                    onChange: (keys, rows) => {
                      selectedRowKeysSet(keys)
                      selectedRowsSet(rows)
                    },
                  }}
                  columns={[
                    {title: '商品图片', dataIndex: 'image_url', align: 'center', valueType: 'image', width: 80, hideInSearch: true,},
                    {title: '商品条形码', dataIndex: 'bar_code'},
                    {title: '商品名称', dataIndex: 'sku_name'},
                    {title: 'SKU', dataIndex: 'sku_code'},
                    ...extraColumns,
                  ]}
                  pagination={{defaultPageSize: 10}}
                  params={requestParams}
                  request={async (params) => {
                    let res: any
                    if (requestApi) {
                      res = await request(requestApi, {
                        method: 'POST',
                        data: {
                          ...params,
                          current_page: params?.current,
                          page_size: params?.pageSize,
                        },
                      })
                    } else {
                      res = await getGoodsSkuVendorPage({
                        ...params,
                        current_page: params?.current,
                        page_size: params?.pageSize,
                      })
                    }
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

import {connect} from 'umi';
import {useRef} from 'react';
import {useActivate} from 'react-activation';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable, PageContainer} from '@ant-design/pro-components';
import {pubConfig, pubMsg} from '@/utils/pubConfig';
import {ownStockPage} from '@/services/pages/warehouse/stock'
import LogStock from '../components/LogStock'
// 包材配件库存 - 列表
const Page: React.FC<{ common: any }> = ({common}) => {
  const actionRef = useRef<ActionType>();
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  const columns: ProColumns<any>[] = [
    {
      title: '商品图片',
      dataIndex: 'image_url',
      valueType: 'image',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
    },
    {
      title: '商品条形码',
      dataIndex: 'bar_code',
    },
    {
      title: 'SKU',
      dataIndex: 'sku_code',
    },
    {
      title: '库存数量 (占用数量)',
      dataIndex: 'good_qty',
      hideInSearch: true,
      render: (_, record) => <div>
        <LogStock change_type={'GOOD'} dicList={common?.dicList} stock_type={'PARTS'} goods_sku_id={record.goods_sku_id} trigger={<a>{record.good_qty}</a>}/> ({record.good_preemption_qty})
      </div>,
      align: 'center',
    },
  ];
  return (
    <PageContainer header={{title: false, breadcrumb: {}}}>
      <ProTable
        headerTitle={'退货库存'}
        rowKey="id"
        bordered
        actionRef={actionRef}
        options={{fullScreen: true, setting: false}}
        search={{defaultCollapsed: false, className: 'light-search-form', labelWidth: 'auto'}}
        dateFormatter="string"
        scroll={{x: 800}}
        sticky={{offsetHeader: 48}}
        defaultSize={'small'}
        columns={columns}
        request={async (params: any) => {
          const formData = {
            ...params,
            stock_type: 'PARTS',
            current_page: params.current,
            page_size: params.pageSize,
          };
          const res = await ownStockPage(formData);
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
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({common}: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

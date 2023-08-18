import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import './index.less';

const Component: React.FC<{
  sourceDetail: any;
  dicList?: any;
}> = ({ sourceDetail }) => {
  const columns: ProColumns<any>[] = [
    {
      title: '序号',
      valueType: 'index',
      align: 'center',
      width: 50,
    },
    {
      title: '商品标题',
      dataIndex: 'goodsTitle',
      align: 'left',
    },
    {
      title: '商家编码(SKU)',
      dataIndex: 'outerSkuId',
      align: 'left',
      width: 96,
    },

    {
      title: '数量',
      dataIndex: 'num',
      width: 80,
      align: 'right',
    },
    {
      title: '定价',
      dataIndex: 'price',
      width: 80,
      align: 'right',
    },

    {
      title: '订单行状态',
      dataIndex: 'orderItemStatusDesc',
      align: 'center',
    },
    {
      title: '最后同步时间',
      dataIndex: 'lastSyncTime',
      width: 136,
      align: 'center',
    },
  ];
  return (
    <>
      <ProTable
        size={'small'}
        bordered
        loading={!sourceDetail}
        cardProps={{ bodyStyle: { padding: 0 } }}
        rowKey={'outerSkuId'}
        search={false}
        options={false}
        pagination={{defaultPageSize: 10}}
        dataSource={sourceDetail || []}
        columns={columns}
      />
    </>
  );
};
export default Component;

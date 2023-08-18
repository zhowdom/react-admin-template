// import { DownOutlined, UpOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
// import { Space } from 'antd';
// import { useState } from 'react';

const SkuTable = (props: any) => {
  // const [loadMore, setLoadMore] = useState(false);
  // const collapseChange = () => {
  //   setLoadMore((pre: boolean) => !pre);
  // };
  const columns: any[] = [
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      width: 120,
      align: 'center',
    },
    {
      title: 'SKU',
      dataIndex: 'sku_code',
      width: 120,
      align: 'center',
    },
    {
      title: 'ERP编码',
      dataIndex: 'erp_sku',
      width: 150,
      align: 'center',
    },

    {
      title: '条形码',
      dataIndex: 'bar_code',
      width: 150,
      align: 'center',
    },
    {
      title: '计划调拨数量',
      dataIndex: 'nums',
      width: 110,
      align: 'center',
    },
    {
      title: '调出数量',
      dataIndex: 'stockout_nums',
      align: 'center',
      width: 80,
    },
    {
      title: '调入数量',
      dataIndex: 'receive_nums',
      align: 'center',
      width: 80,
    },
    {
      title: '异常数量',
      dataIndex: 'abnormal_nums',
      hideInSearch: true,
      align: 'center',
      width: 80,
    },
  ];
  const data = JSON.parse(JSON.stringify(props.data));
  return (
    <div className="p-table-inTable-content">
      <ProTable
        dataSource={data || [{}]}
        className={'p-table-0'}
        rowKey={(record) =>
          record.goods_sku_id + record.sku_code + record.erp_sku + record.bar_code
        }
        showHeader={false}
        pagination={false}
        options={false}
        search={false}
        toolBarRender={false}
        cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
        style={{ wordBreak: 'break-all' }}
        bordered
        columns={columns}
      />
      {/* <Space
        style={{
          textAlign: 'right',
          margin: '6px',
          display: props?.data?.length > 2 ? 'block' : 'none',
        }}
        className="cl"
        onClick={collapseChange}
      >
        {loadMore ? (
          <a>
            <span>收起</span>
            <UpOutlined style={{ fontSize: '12px' }} />
          </a>
        ) : (
          <a>
            <span>展开</span>
            <DownOutlined style={{ fontSize: '12px' }} />
          </a>
        )}
      </Space> */}
    </div>
  );
};

export default SkuTable;

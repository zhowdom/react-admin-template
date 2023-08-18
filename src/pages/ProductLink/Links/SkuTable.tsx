import { pubFilter } from '@/utils/pubConfig';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Space, Statistic } from 'antd';
import { useState } from 'react';
import ProTable from '@ant-design/pro-table';
import { IsGrey } from '@/utils/pubConfirm';

const SkuTable = (props: any) => {
  const [loadMore, setLoadMore] = useState(false);
  const collapseChange = () => {
    setLoadMore((pre: boolean) => !pre);
  };
  const columns: any[] = [
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      width: 110,
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      width: 100,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      width: 200,
    },
    {
      title: '产品售价',
      dataIndex: 'sale_price',
      width: 90,
      align: 'right',
      render: (_: any, record: any) => {
        return IsGrey ? '' : [
          <span key="status">
            <Statistic
              value={record?.sale_price || '-'}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
              precision={2}
            />
          </span>,
        ];
      },
    },
    {
      title: '销售状态',
      dataIndex: 'sales_status',
      width: 100,
      align: 'center',
      valueEnum: props?.dicList?.LINK_MANAGEMENT_SALES_STATUS,
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList.LINK_MANAGEMENT_SALES_STATUS, record?.sales_status) || '-';
      },
    },
    {
      title: '是否可售',
      dataIndex: 'is_sale',
      align: 'center',
      width: 100,
      hideInTable: !['REVIEWING','ON_SALE','ALL'].includes(props?.label),
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList.SC_YES_NO, record?.is_sale) || '-';
      },
    },
  ];
  const data = JSON.parse(JSON.stringify(props?.data?.filter((v: any) => v.combination != 1)));
  return (
    <div className="p-table-inTable-content">
      <ProTable
        dataSource={data?.length ? (loadMore ? data : data.slice(0, 2)) : [{}]}
        className={'p-table-0'}
        rowKey="id"
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
      <Space
        style={{
          textAlign: 'right',
          margin: '6px',
          display: data?.length > 2 ? 'block' : 'none',
        }}
        className="cl"
        onClick={collapseChange}
      >
        {loadMore ? (
          <a>
            <span>收起</span>
            {props?.showCount && <span>{`(${data?.length})`}</span>}
            <UpOutlined style={{ fontSize: '12px' }} />
          </a>
        ) : (
          <a>
            <span>展开</span>
            {props?.showCount && <span>{`(${data?.length})`}</span>}
            <DownOutlined style={{ fontSize: '12px' }} />
          </a>
        )}
      </Space>
    </div>
  );
};

export default SkuTable;

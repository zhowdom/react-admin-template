import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { useState } from 'react';
import ProTable from '@ant-design/pro-table';

const SkuTable = (props: any) => {
  const [loadMore, setLoadMore] = useState(false);
  const collapseChange = () => {
    setLoadMore((pre: boolean) => !pre);
  };
  const columns: any[] = [
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      width: '100px',
      align: 'center',
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      width: '200px',
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      width: '100px',
      align: 'center',
    },
  ];
  const data = JSON.parse(JSON.stringify(props.data));
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
          display: props?.data?.length > 2 ? 'block' : 'none',
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

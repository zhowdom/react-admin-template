/*skus 表格
 * demo: <SkuTable skus={[{},{}]} />
 * */
import React, { useState } from 'react';
import ProTable from '@ant-design/pro-table';
import { Statistic } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';

const SkuTable: React.FC<{ skus: any; columnsKey?: any }> = ({
  skus,
  columnsKey = ['sku_name', 'sku_code', 'price'],
}) => {
  const [dataSource, dataSourceSet] = useState(skus?.slice(0, 2) || [{}]);
  const [state, { toggle }] = useBoolean(true);
  let columns: any = [
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      width: 160,
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      width: 120,
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      width: 120,
    },
    {
      title: 'ERP编码',
      dataIndex: 'erp_sku',
      width: 120,
    },
    {
      title: '采购价',
      align: 'right',
      dataIndex: 'price',
      width: 90,
      valueType: (item: any) => {
        return {
          type: 'money',
          locale: item.currency === 'USD' ? 'en-US' : 'zh-CN',
        };
      },
      render: (_: any, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.price || '-'}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
            />
          </span>,
        ];
      },
    },
  ];
  if (columnsKey && columnsKey.length) {
    columns = columns.filter((c: any) => columnsKey.includes(c.dataIndex));
  }
  return (
    <div className="p-table-inTable-content">
      <ProTable
        className={'p-table-0'}
        dataSource={dataSource}
        rowKey="id"
        showHeader={false}
        pagination={false}
        options={false}
        search={false}
        toolBarRender={false}
        cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
        style={{ wordBreak: 'break-all' }}
        size="small"
        bordered
        columns={columns}
      />
      {skus?.length > 2 ? (
        <div style={{ textAlign: 'right', margin: '6px' }}>
          <a
            onClick={() => {
              toggle();
              if (state) {
                dataSourceSet(skus);
              } else {
                dataSourceSet(skus.slice(0, 2));
              }
            }}
          >
            {state ? (
              <>
                展开
                <DownOutlined />
              </>
            ) : (
              <>
                收起
                <UpOutlined />
              </>
            )}
          </a>
        </div>
      ) : null}
    </div>
  );
};
export default SkuTable;

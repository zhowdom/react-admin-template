/*skus 表格
 * demo: <SkuTable skus={[{},{}]} />
 * */
import React, { useState, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';

const SkuTable: React.FC<{ skus: any; dicList?: any }> = ({ skus }) => {
  const [dataSource, dataSourceSet] = useState(skus.slice(0, 2));
  const [state, { toggle }] = useBoolean(true);
  const columns: any = [
    {
      title: '配件名称',
      dataIndex: 'sku_name',
      width: 150,
    },
    {
      title: '配件编码',
      dataIndex: 'sku_code',
      width: 120,
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      width: 120,
    },
    {
      title: '库存编号',
      dataIndex: 'stock_no',
      align: 'center',
      width: 120,
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      width: 120,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      width: 90,
      render: (_, row: any) => row?.create_time?.substring(0, 10),
    },
  ];
  useEffect(() => {
    if (!state) {
      toggle();
    }
    dataSourceSet(skus.slice(0, 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skus]);
  return (
    <div className="p-table-inTable-content">
      <ProTable
        className={'p-table-0'}
        dataSource={skus?.length ? dataSource : [{}]}
        rowKey={(record) => `${record?.sku_code}-${record?.shop_sku_code}`}
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

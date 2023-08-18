/*skus 表格
 * demo: <SkuTable skus={[{},{}]} />
 * */
import React, { useState } from 'react';
import ProTable from '@ant-design/pro-table';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { pubFilter } from '@/utils/pubConfig';

const SkuTable: React.FC<{ skus: any; columnsKey?: any; dicList?: any }> = ({
  skus,
  columnsKey = ['sku_name', 'sku_code', 'price'],
  dicList,
}) => {
  const [dataSource, dataSourceSet] = useState(skus ? skus.slice(0, 2) : []);
  const [state, { toggle }] = useBoolean(true);
  let columns: any = [
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku_code',
      width: 150,
    },
    {
      title: '平台库存编号',
      dataIndex: 'platform_stock_no',
      width: 180,
    },
    {
      title: '平台/店铺',
      dataIndex: 'name_or_shop_name',
      width: 200,
      renderText: (text: any, record: any) =>
        ['天猫', '京东POP'].includes(record.name) ? record.name : record.shop_name,
    },
    {
      title: '店铺名',
      dataIndex: 'shop_name',
      width: 150,
    },
    {
      title: '销售状态',
      dataIndex: 'sales_status',
      width: 100,
      align: 'center',
      valueEnum: dicList?.LINK_MANAGEMENT_SALES_STATUS,
      render: (_: any, record: any) => {
        return pubFilter(dicList.LINK_MANAGEMENT_SALES_STATUS, record?.sales_status) || '-';
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

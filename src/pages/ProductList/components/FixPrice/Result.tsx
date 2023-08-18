import ProTable from '@ant-design/pro-table';
import { Card } from 'antd';
import { pubFilter } from '@/utils/pubConfig';

export default (props: any) => {
  const { result, dicList } = props;
  const transferData = (data: any) => {
    let dataSource: any = [];
    dataSource =
      data.filter((v: any) => !['运营毛利率', '市场费率'].includes(v.fee_item_name)) || [];
    return dataSource.map((v: any) => {
      return {
        ...v,
        bold: ['运营毛利率', '市场费率', '市场费', '运营毛利额', '售价'].includes(v.fee_item_name),
      };
    });
  };
  return (
    <>
      <Card style={{ marginBottom: '12px' }}>
        <ProTable
          dataSource={[
            {
              name: result.name,
              length: result.length,
              width: result.width,
              high: result.high,
              volume_weight: result.volume_weight,
              actual_weight: result.actual_weight,
              billing_weight: result.billing_weight,
            },
          ]}
          options={false}
          bordered
          size="small"
          search={false}
          pagination={false}
          columns={[
            {
              title: '产品类型',
              dataIndex: 'name',
              align: 'center',
            },
            {
              title: '长(cm)',
              dataIndex: 'length',
              align: 'center',
            },
            {
              title: '宽(cm)',
              dataIndex: 'width',
              align: 'center',
            },
            {
              title: '高(cm)',
              dataIndex: 'high',
              align: 'center',
            },
            {
              title: '体积重(磅)',
              dataIndex: 'volume_weight',
              align: 'center',
            },
            {
              title: '实重(磅)',
              dataIndex: 'actual_weight',
              align: 'center',
            },
            {
              title: '计费重(磅)',
              dataIndex: 'billing_weight',
              align: 'center',
            },
          ]}
        />
      </Card>
      <Card>
        <ProTable
          dataSource={transferData(result?.feeItemList || [])}
          options={false}
          bordered
          size="small"
          pagination={false}
          search={false}
          columns={[
            {
              title: '费用项',
              dataIndex: 'fee_item_name',
              align: 'center',
              render: (_: any, record: any) =>
                record.bold ? (
                  <strong>{record.fee_item_name || '-'}</strong>
                ) : (
                  <>{record.fee_item_name || '-'}</>
                ),
            },
            {
              title: pubFilter(dicList.SC_CURRENCY, result?.feeItemList?.[0].dynamic_currency),
              dataIndex: 'dynamic_fee',
              align: 'center',
              hideInTable: !result?.feeItemList?.[0].dynamic_currency,
              render: (_: any, record: any) =>
                record.bold ? (
                  <strong>{record.dynamic_fee || '-'}</strong>
                ) : (
                  <>{record.dynamic_fee || '-'}</>
                ),
            },
            {
              title: '人民币',
              dataIndex: 'cny_fee',
              align: 'center',
              render: (_: any, record: any) =>
                record.bold ? (
                  <strong>{record.cny_fee || '-'}</strong>
                ) : (
                  <>{record.cny_fee || '-'}</>
                ),
            },
            {
              title: '占比',
              dataIndex: 'percentage',
              align: 'center',
              render: (_: any, record: any) => {
                const v: any =
                  record?.percentage || record?.percentage === 0 ? `${record?.percentage}%` : '-';
                return record.bold ? <strong>{v}</strong> : <>{v}</>;
              },
            },
          ]}
        />
        <div style={{ marginTop: '10px' }}>
          <div> 汇率：{result?.exchange_rate || '-'}</div>
        </div>
      </Card>
    </>
  );
};

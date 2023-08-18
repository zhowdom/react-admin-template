import PubWeekRender from '@/components/PubWeekRender';
import ProTable from '@ant-design/pro-table';

const InnerTable = (props: any) => {
  const columns: any[] = [
    {
        title: 'PMC负责人',
        dataIndex: 'pmc_name',
        align: 'center',
        width: 100,
      },
  
      {
        title: '计划出货周期',
        dataIndex: 'cycle_time',
        align: 'center',
        width: 110,
        render: (_: any, record: any) => (
          <PubWeekRender
            option={{
              cycle_time: record.cycle_time,
              begin: record.shipment_begin_cycle_time,
              end: record.shipment_end_cycle_time,
            }}
          />
        ),
      },
  ];
  const data = JSON.parse(JSON.stringify(props.data));
  return (
    <div className="p-table-inTable-content">
      <ProTable
        dataSource={data}
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
    </div>
  );
};

export default InnerTable;

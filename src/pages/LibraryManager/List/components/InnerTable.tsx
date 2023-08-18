import ProTable from '@ant-design/pro-table';

const innerTable = (props: any) => {
  const { data, tabType } = props;
  let columns:any = []
  if (!tabType) {
    columns = [
      {
        title: '仓库（区域）',
        dataIndex: 'region',
        align: 'center',
        width: '120px',
      },
      {
        title: '在途',
        dataIndex: 'in_transit_num',
        align: 'center',
        width: '120px',
      },
      {
        title: '在库',
        dataIndex: 'available',
        align: 'center',
        width: '120px',
      },
      {
        title: '总库存',
        dataIndex: 'total_quantity',
        align: 'center',
        width: '120px',
      },
    ];
  }
  
  // jdPop
  if (tabType == 'jdPop') {
    columns = [
      {
        title: '仓库（区域）',
        dataIndex: 'region',
        align: 'center',
        width: '120px',
      },
      {
        title: '在途',
        dataIndex: 'in_transit_num',
        align: 'center',
        width: '120px',
      },
      {
        title: '在库',
        dataIndex: 'available',
        align: 'center',
        width: '120px',
      },
      {
        title: 'VMI库存（共享给FCS）',
        dataIndex: 'fcs_vmi_qty',
        align: 'center',
        width: '120px',
      },
      {
        title: 'VMI库存（共享给自营）',
        dataIndex: 'operate_vmi_qty',
        align: 'center',
        width: '120px',
      },
      {
        title: '共享后在库可用数量',
        align: 'center',
        width: '120px',
        render: (_: any, record: any) => Number(record?.available == undefined ? 0 : record?.available) - Number(record?.fcs_vmi_qty == undefined ? 0 : record?.fcs_vmi_qty) - Number(record?.operate_vmi_qty == undefined ? 0 : record?.operate_vmi_qty)
      },
      {
        title: '总库存',
        dataIndex: 'total_quantity',
        align: 'center',
        width: '120px',
      },
    ];
  }

  // jdFcs
  if (tabType == 'jdFcs') {
    columns = [
      {
        title: '仓库（区域）',
        dataIndex: 'region',
        align: 'center',
        width: '120px',
      },
      {
        title: '在途',
        dataIndex: 'in_transit_num',
        align: 'center',
        width: '120px',
      },
      {
        title: 'VMI库存',
        dataIndex: 'vmi_qty',
        align: 'center',
        width: '120px',
      },
      {
        title: 'FCS在库库存',
        dataIndex: 'available',
        align: 'center',
        width: '120px',
      },
      {
        title: '在库',
        dataIndex: 'import_available',
        align: 'center',
        width: '120px',
      },
      {
        title: '总库存',
        dataIndex: 'total_quantity',
        align: 'center',
        width: '120px',
      },
    ]
  }

  // jdSelf
  if (tabType == 'jdSelf') {
    columns = [
      {
        title: '仓库（区域）',
        dataIndex: 'region',
        align: 'center',
        width: '120px',
      },
      {
        title: '在途',
        dataIndex: 'in_transit_num',
        align: 'center',
        width: '120px',
      },
      {
        title: 'VMI库存',
        dataIndex: 'vmi_qty',
        align: 'center',
        width: '120px',
      },
      {
        title: '自营在库库存',
        dataIndex: 'available',
        align: 'center',
        width: '120px',
      },
      {
        title: '在库',
        dataIndex: 'import_available',
        align: 'center',
        width: '120px',
      },
      {
        title: '总库存',
        dataIndex: 'total_quantity',
        align: 'center',
        width: '120px',
      },
    ]
  }

  return (
    <div className="p-table-inTable-content">
      <ProTable
        dataSource={data?.length ? data : [{}]}
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

export default innerTable;

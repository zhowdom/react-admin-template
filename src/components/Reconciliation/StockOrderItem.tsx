import ProTable from '@ant-design/pro-table';
import './stockOrderItem.less';
import HandleUnNormal from '@/pages/StockManager/Dialog/HandleUnNormal';
import { Space } from 'antd';
import CloseExceptionApplyModal from '@/pages/StockManager/INDialog/CloseExceptionApplyModal';

const StockOrderItem = (props: any) => {
  const {
    dataList = [],
    business,
    readonly,
    reload,
    tableKeySet,
    dicList,
    warehousing_type, // 1: 计划外
    isHandelException, // true 是否处理异常时候展示
    refreshKeySet, // 父组件request刷新需要
    recordS,
    common,
  } = props;
  const getColumns: any = (order_type: any) => [
    {
      title: '计划发货数量(总)',
      dataIndex: 'num',
      width: 110,
      align: 'center',
      renderText: (text: any) => (warehousing_type == 1 ? '计划外' : text),
      hideInTable: order_type == 2,
    },
    {
      title: '计划发货数量(本次)',
      dataIndex: 'delivery_plan_current_num',
      align: 'center',
      width: 110,
      renderText: (text: any) => (warehousing_type == 1 ? '计划外' : text),
      hideInTable: order_type == 2,
    },
    {
      title: (
        <div className="list_inner_table_header">
          <div className="list_inner_table_header_num t1">
            箱规（最多支持两种箱规）
            <br />
            长（cm）* 宽（cm）* 高（cm）= 体积（cm³）
          </div>
          <div className="list_inner_table_header_num t2">
            单箱重量
            <br />
            (kg)
          </div>
          <div className="list_inner_table_header_num t2">
            箱规
            <br />
            (每箱数量)
          </div>
          <div className="list_inner_table_header_num t3">箱数</div>
        </div>
      ),
      dataIndex: 'numTotal',
      align: 'center',
      width: 680,
      className: 'list_inner_table',
      render: (_: any, record: any) => {
        return (
          <div className="list_inner_table_body">
            {record.specificationList.map((kitem: any, i: number) => (
              <div className="list_inner_table_nav" key={i}>
                <div className="list_inner_table_body_num s1">
                  <span>{kitem.length}</span>
                  <i>*</i>
                  <span>{kitem.width}</span>
                  <i>*</i>
                  <span>{kitem.high}</span>
                  <i>=</i>
                  <span>{(kitem.length * kitem.width * kitem.high).toFixed(2)}</span>
                </div>
                <div className="list_inner_table_body_num s2">{kitem.unit_weight || '-'}</div>
                <div className="list_inner_table_body_num s2">{kitem.pics}</div>
                <div className="list_inner_table_body_num s3">{kitem.num}</div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: '发货数量',
      dataIndex: 'numTotal',
      align: 'center',
      width: 90,
      render: (_: any, record: any) => {
        const num = record.specificationList.reduce(
          (previousValue: any, currentValue: any) =>
            previousValue + currentValue.pics * currentValue.num,
          0,
        );
        return <span>{num}</span>;
      },
    },
    {
      title: '实际入库数量',
      dataIndex: 'warehousing_num',
      align: 'center',
      hideInTable: business != 'CN',
      render: (_: any, record: any) => {
        const num = record.specificationList.reduce(
          (previousValue: any, currentValue: any) =>
            previousValue + currentValue.pics * currentValue.num,
          0,
        );
        return <span>{isHandelException ? num : record.warehousing_num}</span>;
      },
    },
    {
      title: '国内入库箱数',
      dataIndex: 'arrival_actual_num',
      align: 'center',
      hideInTable: business != 'IN',
      render: (_: any, record: any) => {
        const num = record.specificationList.reduce((previousValue: any, currentValue: any) => {
          return previousValue + (currentValue.arrival_actual_num === null? 0: currentValue.arrival_actual_num);
        }, 0);
        return <span>{num}</span>;
      },
    },
    {
      title: (
        <span>
          国内入库数量
          <br />
          (到港数量)
        </span>
      ),
      dataIndex: 'arrival_num',
      align: 'center',
      render: (_: any, record: any) => {
        const num = record.specificationList.reduce(
          (previousValue: any, currentValue: any) =>
            previousValue + currentValue.arrival_actual_num * currentValue.pics,
          0,
        );
        return num || '-';
      },
      hideInTable: business != 'IN',
    },
    {
      title: '国内入库异常',
      dataIndex: 'difference_num',
      align: 'center',
      hideInTable: business == 'CN',
      render: (_: any, record: any) => {
        if (readonly) {
          return <span style={{ color: 'red' }}>{record.difference_num}</span>;
        }
        return (
          <HandleUnNormal
            tableKeySet={tableKeySet}
            refreshKeySet={refreshKeySet}
            dataSource={record}
            reload={reload}
            dicList={dicList}
            type={business == 'CN' ? 'cn' : 'in'}
          />
        );
      },
    },
    {
      title: (
        <span>
          入库数量
          <br />
          (平台仓)
        </span>
      ),
      dataIndex: 'warehousing_num',
      align: 'center',
      hideInTable: business != 'IN',
    },
    {
      title: '平台入库异常',
      dataIndex: 'difference_num',
      align: 'center',
      render: (_: any, record: any) => {
        if (readonly) {
          return isHandelException ? (
            <span>0</span>
          ) : (
            <span style={{ color: 'red' }}>{record.difference_num}</span>
          );
        }
        return (
          <HandleUnNormal
            recordS={{...recordS, goods_sku_id: record.goods_sku_id, id: record.order_id}}
            tableKeySet={tableKeySet}
            refreshKeySet={refreshKeySet}
            dataSource={record}
            reload={reload}
            dicList={dicList}
            common={common}
            type={business == 'CN' ? 'cn' : 'in'}
          />
        );
      },
      hideInTable: business == 'IN',
    },
    {
      title: '平台入库异常',
      dataIndex: 'warehousing_exception_num',
      align: 'center',
      hideInTable: business == 'CN',
      render: (_: any, record: any) => {
        return record.warehousing_exception_num ? (
          <Space direction={'vertical'}>
            {record.warehousing_exception_num}
            <CloseExceptionApplyModal
              readonly
              type={'approval'}
              dicList={dicList}
              dataSource={record}
            />
          </Space>
        ) : (
          '-'
        );
      },
    },
  ];

  return dataList.map((item: any, index: number) => {
    return (
      <div className="stock-order-item" key={index}>
        <div className="stock-item">
          <div className="stock-item-title">
            <span>商品名称：</span>
            <div>{item.sku_name}</div>
          </div>
        </div>
        <div className="stock-item">
          <div className="stock-item-title">
            <span>SKU：</span>
            <div>{business === 'CN' ? item.stock_no : item.shop_sku_code}</div>
          </div>
          {business == 'CN' ? (
            <div className="stock-item-title">
              <span>条形码：</span>
              <div>{item.bar_code}</div>
            </div>
          ) : (
            ''
          )}
        </div>
        <ProTable
          columns={getColumns(item.order_type)}
          search={false}
          options={false}
          bordered
          tableAlertRender={false}
          dateFormatter="string"
          dataSource={[item]}
          pagination={false}
          rowKey="goods_sku_id"
          size="small"
          className="p-table-0 "
          scroll={{ x: business == 'IN' ? 1600 : 1200 }}
        />
      </div>
    );
  });
};

export default StockOrderItem;

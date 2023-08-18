import { useState } from 'react';
import { Modal, Button, Empty } from 'antd';
import ProTable from '@ant-design/pro-table';
import { Line } from '@ant-design/charts';
import PubWeekRender from '@/components/PubWeekRender';

const ModalCalDetail: React.FC<{
  trigger?: React.ReactNode;
  allData?: any;
}> = ({ trigger, allData }) => {
  const [open, openSet] = useState(false);
  const [line1, line1Set] = useState<any[]>([]);
  const [line2, line2Set] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);

  const types = [
    {
      name: '实际销量',
      key: 'actual_sales',
    },
    {
      name: 'PMC预测总销量',
      key: 'total_pmc_sell_forecast',
    },
    {
      name: 'PMC预测偏差',
      key: 'pmc_forecast_affect',
    },
    {
      name: '系统预测销量',
      key: 'sell_forecast_radio',
    },
    {
      name: '系统预测偏差',
      key: 'system_forecast_affect',
    },
  ];
  // 数据转换
  const getNewData = (key: any, data: any) => {
    const newData: any = {};
    data.forEach((element: any, index: number) => {
      newData[`t${index}`] = element[key] || 0;
    });
    return newData;
  };
  // 得到列表的数据
  const getTable = () => {
    const editList = types.map((v: any) => {
      return {
        type: v.name,
        typeKey: v.key,
        ...getNewData(v.key, allData),
      };
    });
    // console.log(editList);
    const newColumns = [
      {
        title: ' ',
        dataIndex: 'type',
        align: 'center',
        width: 100,
      },
      ...allData?.map((v: any, index: number) => ({
        title: () => (
          <PubWeekRender
            option={{
              cycle_time: v.cycle_time,
              begin: v.cycle_time_begin,
              end: v.cycle_time_end,
              color: true,
            }}
            onlyFirst={true}
          />
        ),
        dataIndex: `t${index}`,
        align: 'center',
        width: 80,
      })),
    ];
    console.log(newColumns);
    setColumns(newColumns);
    setDataSource(editList);
  };
  // 得到图表数据
  const getLine = () => {
    const newD1: any = []
    const newD2: any = []
    allData.forEach((v: any) => {
      newD1.push({
        date: v.cycle_time,
        num: v.actual_sales, // 实际销量
        name: '实际销量'
      }, {
        date: v.cycle_time,
        num: v.total_pmc_sell_forecast, // PMC预测总销量
        name: 'PMC预测总销量'
      }, {
        date: v.cycle_time,
        num: v.sell_forecast_radio, // 系统预测销量
        name: '系统预测销量'
      })

      newD2.push({
        date: v.cycle_time,
        num: v.pmc_forecast_affect, // PMC预测偏差
        name: 'PMC预测偏差'
      }, {
        date: v.cycle_time,
        num: v.system_forecast_affect, // 系统预测偏差
        name: '系统预测偏差'
      })
    });
    line1Set(newD1)
    line2Set(newD2)
  };
  // 取消+关闭
  const modalClose = () => {
    openSet(false);
  };

  // 打开
  const modalOpen = () => {
    openSet(true);
    getTable();
    getLine();
  };
  return (
    <>
      {<div style={{ cursor: 'pointer' }} onClick={() => modalOpen()}>{trigger}</div>}
      <Modal
        title={`实际销量预测曲线图`}
        width={1200}
        onCancel={modalClose}
        footer={
          [
            <Button key="submit" type="primary" onClick={() => modalClose()}>
              关闭
            </Button>,
          ]
        }
        open={open}
        bodyStyle={{ paddingTop: 0 }}
        destroyOnClose
      >
        <div className={'history-actual-sales-nav'}>
          <div className={'history-actual-sales-item'}>
            <div className={'history-item-title'}>销量预测曲线图</div>
            {line1?.length ? (
              <Line
                {...{
                  data: line1,
                  height: 400,
                  xField: 'date',
                  yField: 'num',
                  seriesField: 'name',
                  label: {},
                  point: {
                    size: 4,
                    shape: 'diamond',
                  },
                  legend: {
                    position: 'top',
                    marker: {
                      symbol: 'circle',
                    },
                  },
                }}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
          <div className={'history-actual-sales-item'}>
            <div className={'history-item-title'}>销量偏差曲线图</div>
            {line2?.length ? (
              <Line
                {...{
                  data: line2,
                  height: 400,
                  xField: 'date',
                  yField: 'num',
                  seriesField: 'name',
                  label: {},
                  point: {
                    size: 4,
                    shape: 'diamond',
                  },
                  legend: {
                    position: 'top',
                    marker: {
                      symbol: 'circle',
                    },
                  },
                }}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </div>
        <div className={'history-actual-sales-table'}>
          <ProTable
            columns={columns}
            bordered
            options={false}
            scroll={{ x: columns.length * 80 + 100 }}
            dataSource={dataSource}
            rowKey="typeKey"
            search={false}
            pagination={false}
            dateFormatter="string"
            className="p-table-0"
          />
        </div>
      </Modal>
    </>
  );
};

export default ModalCalDetail;

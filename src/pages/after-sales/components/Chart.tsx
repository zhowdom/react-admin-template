import { Card, Empty, Modal, Radio } from 'antd';
import { useState } from 'react';
import { Line } from '@ant-design/charts';
import * as api from '@/services/pages/after-sales';
import { pubConfig } from '@/utils/pubConfig';
import moment from 'moment';
// 图表公共配置
const commonChartConfig: any = {
  smooth: true,
  autoFit: true,
  height: 400,
  xField: 'date',
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
    offsetY: 1,
  },
  xAxis: {
    label: {
      formatter: (text: any) => {
        return text;
      },
    },
  },
  tooltip: {
    title: (text: any) => {
      return text;
    },
  },
};
// 图表弹框
const ChartModal: React.FC<{
  params: Record<string, any>; // 参数
  title?: string;
  trigger?: React.ReactElement;
  page?: string;
  init?: string;
}> = ({ params = {}, title, trigger, page = 'return', init }) => {
  const [open, openSet] = useState<boolean>(false);
  const [data, dataSet] = useState<any>(null);
  const [slider, sliderSet] = useState<any>(false); //暂时没用　　日期太多时的　区间选择
  const [loading, loadingSet] = useState(false);
  const [dateType, dateTypeSet] = useState(init || 'W');

  const getData = async (type: string = dateType) => {
    // sliderSet(false);
    // sliderSet({ start: 0, end: 1 });
    loadingSet(true);
    let apiMethod: any = null;
    if (page == 'return') {
      if (type == 'W') {
        apiMethod = api.returnsGoodsSkuDay;
      } else {
        apiMethod = api.returnsGoodsSkuMonth;
      }
    } else if (page == 'KStongji') {
      apiMethod = api.statisticsChart;
      params.statisticsType = type;
    } else if (page == 'KStongjiPlarm') {
      console.log(params)
      apiMethod = api.statisticsChart;
      params.statisticsType = type;
    }
    const res: any = await apiMethod({
      ...params,
    });
    loadingSet(false);
    if (res?.code == pubConfig.sCodeOrder) {
      const newD = res.data.map((v: any)=> ({
        ...v,
        date: type == 'W' ? `${v.date}\n${moment(new Date(v.weekBeginTime)).format('MM.DD')}-${moment(new Date(v.weekEndTime)).format('MM.DD')}` : v.date
      }))
      console.log(newD)
      dataSet(newD);
    } else {
      dataSet([]);
    }
  };

  return (
    <>
      <Modal
        open={open}
        title={title || '图表'}
        width={'88%'}
        destroyOnClose
        footer={null}
        onCancel={() => openSet(false)}
      >
        <Card
          loading={loading}
          bodyStyle={{ minHeight: '460px' }}
          title={
            <Radio.Group
              defaultValue={dateType}
              options={[
                { label: '周', value: 'W' },
                { label: '月', value: 'M' },
              ]}
              onChange={(val) => {
                const type = val?.target?.value;
                dateTypeSet(type);
                getData(type);
              }}
            />
          }
        >
          {data && data?.length == 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : null}
          {data && data?.length ? (
            <Line
              data={data}
              {...commonChartConfig}
              yField={'num'}
              slider={slider}
              color={['#108ee9', '#06b956', '#ffb61e']}
              yAxis={{
                label: {
                  formatter: (v: any) => (page == 'return' ? `${v}%` : v),
                },
              }}
              tooltip={{
                customItems: (originalItems: any) => {
                  const tempArray = originalItems.map(({ data: item }: any) => {
                    return { name: item.name, value: page == 'return' ? `${item.num}%` : item.num };
                  });
                  const view = originalItems[0]?.data?.view;
                  if (view && page == 'return') {
                    return [
                      {
                        name: '销量',
                        value: view.sales,
                      },
                      {
                        name: '退款数',
                        value: view.reuturns,
                      },
                      {
                        name: '换货数',
                        value: view.exchanges,
                      },
                      {
                        name: '退款率',
                        value: view.returnRate + '%',
                      },
                      {
                        name: '换货率',
                        value: view.exchangeRate + '%',
                      },
                      {
                        name: '退换率',
                        value: view.returnExchangeRate + '%',
                      },
                    ];
                  }
                  return tempArray;
                },
              }}
              label={{
                formatter: (d: any) => {
                  return page == 'return' ? `${d.num}%` : d.num;
                },
              }}
            />
          ) : null}
        </Card>
      </Modal>
      <div
        onClick={() => {
          getData();
          openSet(true);
        }}
      >
        {trigger || <a>查看</a>}
      </div>
    </>
  );
};
export default ChartModal;

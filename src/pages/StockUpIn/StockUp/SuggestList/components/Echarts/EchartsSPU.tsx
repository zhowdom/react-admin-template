import { Card, Empty, Radio, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { Line, Pie } from '@ant-design/charts';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { stockUpAdviceSaleChart } from '@/services/pages/stockUpIn/stockUp/suggestList';
import { sortBy } from 'lodash';
import moment from 'moment';

export default (props: any) => {
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState<any[]>([]);
  const [dataListPie, setDataListPie] = useState<any[]>([]);
  const [key, setKey] = useState('week');
  const options = [
    { label: '按周统计', value: 'week' },
    { label: '按天统计', value: 'date' },
    { label: '更多', value: 'more' },
  ];
  const formatChartData = (data: any) => {
    return [].concat(
      ...data.map((v: any) => (Array.isArray(v.list) ? formatChartData(v.list) : v)),
    );
  };
  // 获取表格数据
  const getListAction = async (date_type: any): Promise<any> => {
    if(!props?.id) return;
    if (date_type == 'more') {
      const time = props?.detail?.update_time ? props?.detail?.update_time:props?.detail?.create_time;
      const endTime = moment(new Date(time)).format('YYYY-MM-DD')
      const startTime = moment(new Date(endTime)).subtract(90, 'day').format('YYYY-MM-DD')
      // console.log(startTime)
      // console.log(endTime)
      const url = `/scm-sales-in/sales-chart?pageSku=${[props?.detail?.link_name]}&pageType=SPU&pageDate=date&pageStartTime=${startTime}&pageEndTime=${endTime}`
      const btn = document.createElement('a');
      btn.href = url;
      btn.target = '_blank';
      btn.click();
      return;
    }
    setLoading(true);
    const res = await stockUpAdviceSaleChart({
      id: props?.id,
      date_type: date_type,
      type: 'SKU',
    });
    const resSpu = await stockUpAdviceSaleChart({
      id: props?.id,
      date_type: date_type,
      type: 'SPU',
    });
    setLoading(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setDataList([]);
      return;
    }
    const sortResData = formatChartData(sortBy(res.data?.list || [], 'date'));
    // 饼图需要累加数据
    const pieDataObj = {};
    sortResData.forEach((item: any) => {
      if (typeof pieDataObj[item.name] == 'number') {
        pieDataObj[item.name] += item.quantity;
      } else {
        pieDataObj[item.name] = item.quantity;
      }
    });
    const pieData: any = [];
    Object.keys(pieDataObj).forEach((prop: any) => {
      pieData.push({ name: prop, quantity: pieDataObj[prop] });
    });
    if (pieData.length == 1) {
      pieData[0].quantity = 100;
    }
    // console.log(pieData, 'pieData');
    setDataListPie(pieData);
    let tempArray = [];
    if (res?.data) {
      tempArray = res?.data?.list;
    }
    if (resSpu?.data) {
      tempArray = [...tempArray, ...resSpu.data?.list];
    }
    setDataList(formatChartData(sortBy(tempArray, 'date')));
  };
  useEffect(() => {
    getListAction(key);
  }, [props?.id]);
  return (
    <>
      <div className="suggers-sku-radio">
        <Radio.Group
          options={options}
          value={key}
          onChange={(e) => {
            if(e.target.value != 'more'){
              setKey(e.target.value)
            }
            getListAction(e.target.value);
          }}
          optionType="button"
          buttonStyle="solid"
        />
      </div>
      <Spin spinning={loading}>
        <div className="suggers-spu-echart">
          <div className="line-spu-echart">
            <Card>
                <div className='line-code-echart-title'>近90天销量统计</div>
              {dataList?.length ? (
                <Line
                  {...{
                    data: dataList,
                    height: 400,
                    xField: 'date',
                    yField: 'quantity',
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
            </Card>
          </div>
          <div className="line-code-echart">
            <Card>
                <div className='line-code-echart-title'>近90天销量统计</div>
              {dataList?.length ? (
                <Pie
                  {...{
                    legend: {
                      layout: 'horizontal',
                      position: 'bottom',
                    },
                    data: dataListPie,
                    angleField: 'quantity',
                    colorField: 'name',
                    radius: 0.5,
                    label: {
                      type: 'spider',
                      labelHeight: 28,
                      content: '{name}\n{percentage}',
                    },
                    interactions: [
                      {
                        type: 'pie-legend-active',
                      },
                      {
                        type: 'element-active',
                      },
                    ],
                  }}
                />
              ) : (
                ''
              )}
            </Card>
          </div>
        </div>
      </Spin>
    </>
  );
};

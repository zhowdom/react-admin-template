import { Radio, Card, Empty, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { Line } from '@ant-design/charts';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { stockUpAdviceSaleChart } from '@/services/pages/stockUpIn/stockUp/suggestList';
import { sortBy } from 'lodash';
import moment from 'moment';

export default (props: any) => {
  const [loading, setLoading] = useState(false);
  const [dataSource1, setDataSource1] = useState<any[]>([]);
  const [dataSource2, setDataSource2] = useState<any[]>([]);

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
  const getListAction = async (date_type: string): Promise<any> => {
    if (!props?.id) return;
    if (date_type == 'more') {
      const time = props?.detail?.update_time ? props?.detail?.update_time : props?.detail?.create_time;
      const endTime = moment(new Date(time)).format('YYYY-MM-DD')
      const startTime = moment(new Date(endTime)).subtract(90, 'day').format('YYYY-MM-DD')
      // console.log(startTime)
      // console.log(endTime)
      const url = `/scm-sales-in/sales-chart?pageSku=${[props?.detail?.shop_sku]}&pageType=SKU&pageDate=date&pageStartTime=${startTime}&pageEndTime=${endTime}`
      const btn = document.createElement('a');
      btn.href = url;
      btn.target = '_blank';
      btn.click();
      return;
    }
    const postData = {
      id: props?.id,
      date_type: date_type,
      type: 'SKU',
    };
    setLoading(true);
    const res = await stockUpAdviceSaleChart(postData);
    setLoading(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    let data = formatChartData(sortBy(res?.data?.list, 'date')) || [];
    if (props?.sku) {
      data = data.filter((item: any) => item.name == props?.sku);
    }
    const price = res?.data?.skuPriceList.find((item: any) => item.name == `${props?.sku}定价`)
    const priceData = price ? data.map((v: any) => ({
      ...v,
      name: price.name,
      average: price.price,
    })) : [];
    setDataSource1(data)
    setDataSource2([...data, ...priceData])
  };
  useEffect(() => {
    if (!props.id || !props.sku) return
    getListAction(key);
  }, [props.id, props.sku]);
  return (
    <>
      <div className="suggers-spu-radio">
        <Radio.Group
          options={options}
          value={key}
          onChange={(e) => {
            if(e.target.value != 'more'){
              setKey(e.target.value)
            }
            getListAction(e.target.value)
          }}
          optionType="button"
          buttonStyle="solid"
        />
      </div>
      <Card>
        <Spin spinning={loading}>
          <div className='suggest-echartsSku-nav'>
            <div className='suggest-echartsSku-item'>
              <>
                <div className='suggest-echartsSku-title'>近90天销量统计</div>
                {dataSource1?.length ? (
                  <Line
                    {...{
                      data: dataSource1,
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
              </>
            </div>
            <div className='suggest-echartsSku-item'>
              <>
                <div className='suggest-echartsSku-title'>近90天平均价统计</div>
                {dataSource2?.length ? (
                  <Line
                    {...{
                      data: dataSource2,
                      height: 400,
                      xField: 'date',
                      yField: 'average',
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
              </>
            </div>
          </div>
        </Spin>
      </Card>
    </>
  );
};

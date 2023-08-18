import { useMemo } from 'react';
import { Line } from '@ant-design/charts';
import { weekToDate } from '@/utils/filter';

export default ({ data, config = {}, type = { label: '按天统计', value: 'date' } }) => {
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
      maxItemWidth: 'auto',
    },
    xAxis: {
      label: {
        formatter: (text: any) => {
          return type.value == 'week' ? `${text}\n(${weekToDate(text)})` : text;
        },
      },
    },
    tooltip: {
      title: (text: any) => {
        return type.value == 'week' ? `${text}(${weekToDate(text)})` : text;
      },
    },
    ...config,
  };

  const component = useMemo(() => {
    console.log(data, 'data');
    return <Line data={data} {...commonChartConfig} />;
  }, [data]);

  return component;
};

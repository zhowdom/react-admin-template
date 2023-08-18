import { Card, Empty, Modal, Space } from 'antd';
import { useEffect, useState } from 'react';
import { Line } from '@ant-design/charts';
import { pubConfig } from '@/utils/pubConfig';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import moment from 'moment';
import { inventorySalesChart } from '@/services/pages/cn-sales';
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
  open: boolean;
  openSet: any;
  params: Record<string, any>; // 参数
  trigger?: React.ReactElement;
  dataC: any;
}> = ({ params = {}, open, openSet, dataC }) => {
  // console.log(moment('2023-02-03').startOf('month').format("YYYY-MM-DD"),

  // moment('2023-02-03').endOf('month').format("YYYY-MM-DD"),212)
  const [data, dataSet] = useState<any>(null);
  const [slider, sliderSet] = useState<any>(false);
  const [time, timeSet] = useState<any>(params.time);
  const [loading, loadingSet] = useState(false);
  const getData = async () => {
    sliderSet({ start: 0, end: 1 });
    loadingSet(true);
    const postData: any = {
      ...params,
      startSalesDate: moment(time[0]).format('YYYY-MM-DD'),
      endSalesDate: moment(time[1]).format('YYYY-MM-DD'),
    };
    delete postData.time;
    const res: any = await inventorySalesChart(postData);
    loadingSet(false);
    if (res?.code == pubConfig.sCodeOrder) {
      let dataH: any[] = [];
      res.data.forEach((v: any) => {
        dataH = [
          ...dataH,
          { date: `${v.date}\n(${dataC.life_cycle_name})`, name: `${dataC.region_name}-销量`, num: v.sales_qty },
          { date: `${v.date}\n(${dataC.life_cycle_name})`, name: `${dataC.region_name}-库存`, num: v.inventory_qty },
        ];
      });
      dataSet(dataH);
    } else {
      dataSet([]);
    }
  };
  useEffect(() => {
    if (open) {
      timeSet(
        moment(params.time[1]).diff(params.time[0], 'month') > 3
          ? [moment().add(-3, 'month'), moment()]
          : params.time,
      );
    } else {
      timeSet([]);
    }
  }, [open]);
  useEffect(() => {
    if (open) {
      getData();
    }
  }, [time]);
  return (
    <>
      <Modal
        open={open}
        title={<>&nbsp;</>}
        width={'90%'}
        destroyOnClose
        footer={null}
        onCancel={() => openSet(false)}
      >
        <Card
          loading={loading}
          bodyStyle={{ minHeight: '460px' }}
          title={
            <Space size={50}>
              <div>款式名称: {dataC.sku_name}</div>
              <div>SKU: {dataC.stock_no}</div>
              <Space>
                时间段：
                <NewDatePicker
                  allowClear={false}
                  value={time}
                  onChange={(val: any) => {
                    timeSet(val);
                  }}
                  // customDisabled1={(current: any, date: any) => {
                  //   return (current && (date[1] &&
                  //     current < moment(date[1]).add(-3, 'month')))
                  // }}
                  // customDisabled2={(current: any, date: any) => {
                  //   return (current && (date[0] &&
                  //     current > moment(date[0]).add(3, 'month')))
                  // }}
                  // needRange={true}
                />
              </Space>
            </Space>
          }
        >
          {data && data?.length == 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : null}
          {data && data?.length ? (
            <Line
              data={data}
              {...commonChartConfig}
              yField={'num'}
              slider={slider}
              color={['#108ee9', '#06b956']}
            />
          ) : null}
        </Card>
      </Modal>
    </>
  );
};
export default ChartModal;

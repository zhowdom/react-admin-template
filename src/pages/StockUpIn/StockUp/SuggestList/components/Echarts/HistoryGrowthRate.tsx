import { useState } from 'react';
import { Modal, Spin, Empty, Button } from 'antd';
import { monthGrowthRateChart } from '@/services/pages/stockUpIn/stockUp/suggestList';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { printFn } from '@/utils/pubConfirm';
import { Line } from '@ant-design/charts';

const ModalCalDetail: React.FC<{
  title?: any;
  allData?: any;
  trigger?: React.ReactNode;
  type?: string;  // week_growth_rate 环比周增长率    month_growth_rate 环比月增长率(要调新接口)
  id?: string; // 备货建议的ID
}> = ({ trigger, type, title, allData, id }) => {
  const [open, openSet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);

  // 取消+关闭
  const modalClose = () => {
    openSet(false);
  };

  // 请求 环比月增长率
  const getMonthDate = async () => {
    setLoading(true);
    const res = await monthGrowthRateChart({ id: id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    const newD: any = []
    res?.data.forEach((v: any) => {
      newD.push({
        date: v.month,
        num: Number(v.month_growth_rate), // 环比月增长率
        name: '月增长率'
      }, {
        date: v.month,
        num: Number(v.season_sale_ratio), // 淡旺季系数  接口得的，不需要减1
        name: '淡旺季系数'
      })
    });
    console.log(JSON.stringify(newD))
    setDataSource(newD)
    setLoading(false);
  };

  // 打开
  const modalOpen = () => {
    openSet(true);
    if (type == 'week_growth_rate') { // 环比周增长率
      const newD: any = []
      allData.forEach((v: any) => {
        newD.push({
          date: v.cycle_time,
          num: Number(v.week_growth_rate), // 环比周增长率
          name: '周增长率'
        }, {
          date: v.cycle_time,
          num: printFn(v.season_sale_ratio - 1), // 淡旺季系数  要减1
          name: '淡旺季系数'
        })
      });
      setDataSource(newD)
    }else if(type == 'month_growth_rate'){
      getMonthDate()
    }
  };
  return (
    <>
      {<div style={{ cursor: 'pointer' }} onClick={() => modalOpen()}>{trigger}</div>}
      <Modal
        title={title}
        width={800}
        onCancel={modalClose}
        footer={
          [
            <Button key="submit" type="primary" onClick={() => modalClose()}>
              关闭
            </Button>
          ]
        }
        open={open}
        bodyStyle={{ paddingTop: 0 }}
        destroyOnClose
      >
        <Spin spinning={loading}>
          {dataSource?.length ? (
            <Line
              {...{
                data: dataSource,
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
        </Spin>
      </Modal>
    </>
  );
};

export default ModalCalDetail;

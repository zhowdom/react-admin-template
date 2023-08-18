import ProTable from '@ant-design/pro-table';
import { useState, useEffect } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { printFn } from '@/utils/pubConfirm';
import { priceValue } from '@/utils/filter';
import { stockUpAdviceGetHistorysales } from '@/services/pages/stockUpIn/stockUp/suggestList';
import { Space } from 'antd';
import PubWeekRender from '@/components/PubWeekRender';
import HistoryActualSales from './HistoryActualSales';
import HistoryGrowthRate from './HistoryGrowthRate';
import '../index.less'

export default (props: any) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const types = [
    {
      name: '实际销量',
      key: 'actual_sales',
    },
    {
      name: '系统预测销量',
      key: 'sell_forecast_radio',
    },
    {
      name: 'PMC预测总销量',
      key: 'total_pmc_sell_forecast',
      editable: true,
    },
    {
      name: '淡旺季系数',
      key: 'season_sale_ratio',
    },
    {
      name: '环比周增长率',
      key: 'week_growth_rate',
    },
    {
      name: '环比月增长率',
      key: 'month_growth_rate',
    },
    {
      name: '期初库存',
      key: 'inventory_num',
    },
    {
      name: '期初周转',
      key: 'turnover_days',
    },
    {
      name: '销售平均价',
      key: 'avg_price',
    },
    {
      name: '产品定价',
      key: 'pricing_usd',
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

  // 获取表格数据
  const getListAction = async (): Promise<any> => {
    const res = await stockUpAdviceGetHistorysales({ id: props?.id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    const editList = types.map((v: any) => {
      return {
        type: v.name,
        typeKey: v.key,
        ...getNewData(v.key, res.data),
      };
    });
    // console.log(editList);
    const newColumns = [
      {
        title: '时间',
        dataIndex: 'type',
        align: 'center',
        width: 140,
        render: (_: any, record: any) => {
          if (record?.typeKey == 'actual_sales') { // 实际销量
            return (
              <Space>
                <span>{record?.type}</span>
                <HistoryActualSales trigger={<a>预测曲线图</a>}  allData={res?.data}/>

              </Space>
            )
          }
          if (record?.typeKey == 'week_growth_rate') { // 环比周增长率
            return (
              <Space>
                <span>{record?.type}</span>
                <HistoryGrowthRate title={'环比周增长率曲线图'} trigger={<a>曲线图</a>} allData={res?.data} type={'week_growth_rate'} />
              </Space>
            )
          }
          if (record?.typeKey == 'month_growth_rate') { // 环比月增长率
            return (
              <Space>
                <span>{record?.type}</span>
                <HistoryGrowthRate title={'环比月增长率曲线图'} trigger={<a>曲线图</a>} id={props?.id} allData={res?.data} type={'month_growth_rate'} />
              </Space>
            )
          }
          return record?.type;
        }
      },
      ...res?.data?.map((v: any, index: number) => ({
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
        render: (text: any, record: any) => {
          if (record?.typeKey == 'week_growth_rate' || record?.typeKey == 'month_growth_rate') { // 环比周增长率  环比月增长率
            return <span className={`${text >= 0 ? 'history-text-green' : ''} ${text < 0 ? 'history-text-red' : ''}`}>{text != 0 ? `${printFn(text * 100)}%` : 0}</span>;
          }
          if (record?.typeKey == 'avg_price' || record?.typeKey == 'pricing_usd') { // 销售平均价  产品定价
            return priceValue(text);
          }
          return text;
        }
      })),
    ];
    // console.log(newColumns);
    setColumns(newColumns);
    setTableData(editList);
  };
  useEffect(() => {
    getListAction();
  }, [props?.id]);
  return (
    <ProTable
      columns={columns}
      bordered
      options={false}
      scroll={{ x: columns.length * 80 + 140 }}
      dataSource={tableData}
      rowKey="typeKey"
      search={false}
      pagination={false}
      dateFormatter="string"
    />
  );
};

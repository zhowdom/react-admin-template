import { Card, DatePicker, Divider, Empty } from 'antd';
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Line } from '@ant-design/charts';
import { pubGetStoreList } from '@/utils/pubConfirm';
import { useRef, useState } from 'react';
import moment from 'moment';
import { getList } from '@/services/pages/SCM_SALES_IN_Manage/inventoryChart';
import { pubColumnSku, pubConfig, pubRequiredRule } from '@/utils/pubConfig';
import { sortBy } from 'lodash';
import { weekToDate } from '@/utils/filter';
import {useModel} from "@@/plugin-model/useModel";

const formatChartData = (data: any) => {
  return [].concat(...data.map((v: any) => (Array.isArray(v.list) ? formatChartData(v.list) : v)));
};

// AmazonSC库存曲线图
const AmazonSC: React.FC = () => {
  const { initialState }: any = useModel('@@initialState');
  const userInfo = initialState?.userInfo
  const [platform_code, platform_codeSet] = useState<'AMAZON_SC' | 'WALMART' | ''>('')
  const [platform_id, platform_idSet] = useState<string>('')
  const formRef = useRef<ProFormInstance>();
  const [slider, sliderSet] = useState<any>(false);
  const [dimension, dimensionSet] = useState<any>({ label: 'SKU', value: 'SKU' });
  const [type, typeSet] = useState<any>({ label: '按天统计', value: 'date' });
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    // console.log(params, 'params');
    if (!params?.dimensionNames && !params?.dimensionNames?.length) return;
    const res = await getList({ ...params, platformCode: platform_code });
    if (res?.code == pubConfig.sCode && res?.data) {
      // console.log(sortBy(res.data, 'date'), 'list');
      // 时间过长需要加图表slider
      if (params.dateStart && params.dateEnd) {
        if (moment(params.dateEnd).diff(moment(params.dateStart), 'days') > 60) {
          sliderSet({ start: 0, end: 1 });
        } else {
          sliderSet(false);
        }
      }
      return {
        data: formatChartData(sortBy(res.data, 'date')),
        success: true,
      };
    }
    return {
      data: [],
      success: false,
    };
  };

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
          return type.value == 'week' ? `${text}\n(${weekToDate(text)})` : text;
        },
      },
    },
    tooltip: {
      title: (text: any) => {
        return type.value == 'week' ? `${text}(${weekToDate(text)})` : text;
      },
    },
  };
  // 表格配置
  const columns: ProColumns<any>[] = [
    {
      title: '统计类型',
      dataIndex: 'type',
      hideInTable: true,
      valueType: 'radioButton',
      initialValue: type.value,
      valueEnum: {
        date: { text: '按天统计' },
        week: { text: '按周统计' },
        month: { text: '按月统计' },
      },
      fieldProps: {
        onChange: (v: any) => {
          formRef.current?.setFieldsValue({ date: [moment().subtract(1, 'months'), moment()] });
          typeSet(v?.target);
          formRef.current?.submit();
        },
      },
    },
    {
      title: '平台',
      order: 6,
      dataIndex: 'platform_code',
      hideInTable: true,
      valueType: 'select',
      initialValue: '',
      fieldProps: {
        allowClear: false,
        options: [
          {value: '', label: '所有平台', platform_id: ''},
          {value: 'AMAZON_SC', label: '亚马逊', platform_id: '1531560384958316546'},
          {value: 'WALMART', label: '沃尔玛', platform_id: '1532173059069337601'},
        ],
        onChange: (v: any, o: any) => {
          platform_codeSet(v)
          platform_idSet(o.platform_id)
        },
      },
    },
    {
      title: '店铺',
      order: 5,
      dataIndex: 'shopId',
      hideInTable: true,
      valueType: 'select',
      params: {platform_code},
      request: async () => {
        const res = await pubGetStoreList({
          platform_id,
          business_scope: 'IN',
        }, true);
        if (res) {
          return res.map((item: any) => ({ ...item, disabled: !item.status }));
        }
        return [];
      },
      fieldProps: { showSearch: true },
    },
    {
      title: '统计维度',
      order: 7,
      dataIndex: 'dimension',
      hideInTable: true,
      valueType: 'radioButton',
      initialValue: dimension?.value,
      valueEnum: {
        CATEGORY: { text: '产品线' },
        SPU: { text: 'SPU' },
        SKU: { text: 'SKU' },
      },
      fieldProps: {
        onChange: (v: any) => {
          formRef.current?.setFieldsValue({ dimensionNames: [] });
          formRef.current?.setFieldsValue({ [`dimensionNames${platform_code}`]: [] });
          let label
          if (v?.target?.value == 'CATEGORY') {
            label = '产品线'
          } else {
            label = v?.target?.value
          }
          dimensionSet({...v?.target, label});
        },
      },
    },
    {
      ...pubColumnSku(dimension?.label, dimension?.value, platform_code, userInfo?.id),
    },
    {
      title: '统计区间',
      dataIndex: 'date',
      hideInTable: true,
      valueType: 'dateRange',
      initialValue: [moment().subtract(1, 'months'), moment()],
      formItemProps: {
        rules: [pubRequiredRule],
      },
      renderFormItem: () => {
        return (
          // @ts-ignore
          <DatePicker.RangePicker
            placeholder={['开始', '结束']}
            picker={type.value}
            allowClear={false}
            ranges={{
              Now: [moment(), moment()],
              ThisMonth: [moment().startOf('month'), moment().endOf('month')],
              LastMonth: [
                moment().subtract(1, 'months').startOf('month'),
                moment().subtract(1, 'months').endOf('month'),
              ],
              '30Days': [moment().subtract(30, 'days').startOf('month'), moment()],
              '90Days': [moment().subtract(90, 'days').startOf('month'), moment()],
              '180Days': [moment().subtract(180, 'days').startOf('month'), moment()],
            }}
          />
        );
      },
      search: {
        transform: (v: any) => {
          if (type.value === 'week') {
            return {
              dateStart: moment(v[0]).startOf('week').format('YYYY-MM-DD'),
              dateEnd: moment(v[1]).endOf('week').format('YYYY-MM-DD'),
            };
          }
          if (type.value === 'month') {
            return {
              dateStart: moment(v[0]).startOf('month').format('YYYY-MM-DD'),
              dateEnd: moment(v[1]).endOf('month').format('YYYY-MM-DD'),
            };
          }
          if (type.value === 'year') {
            return {
              dateStart: moment(v[0]).startOf('year').format('YYYY-MM-DD'),
              dateEnd: moment(v[1]).endOf('year').format('YYYY-MM-DD'),
            };
          }
          return { dateStart: v[0], dateEnd: v[1] };
        },
      },
    },
  ];
  return (
    <ProTable
      form={{ ignoreRules: false }}
      formRef={formRef}
      columns={columns}
      request={getListAction}
      search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
      tableRender={(tableProps: any) => {
        return (
          <Card bordered={false}>
            <div className="pub-echarts-title">库存数量</div>
            {tableProps?.action?.dataSource?.length ? (
              <Line
                data={tableProps?.action?.dataSource}
                yField={'inventoryNum'}
                slider={slider}
                {...commonChartConfig}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
            <Divider />
            <div className="pub-echarts-title">入库数量</div>
            {tableProps?.action?.dataSource?.length ? (
              <Line
                data={tableProps?.action?.dataSource}
                yField={'warehousingNum'}
                slider={slider}
                {...commonChartConfig}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        );
      }}
    />
  );
};
export default AmazonSC;

import { Card, Divider, Empty } from 'antd';
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import Line from './Line';
import { pubGetPlatformList, pubGetStoreList } from '@/utils/pubConfirm';
import React, { useRef, useState } from 'react';
import type { Moment } from 'moment';
import moment from 'moment';
import { pubConfig, pubMsg, pubColumnSkuCN, pubRequiredRule } from '@/utils/pubConfig';
import { sortBy } from 'lodash';
import { useModel } from '@@/plugin-model/useModel';
import DateRangeComp from './DateRangeComp';
import { saleChartCn, salesRegionConfigList } from '@/services/pages/cn-sales';
import useListen from './useListen';

const formatChartData = (data: any) => {
  return [].concat(...data.map((v: any) => (Array.isArray(v.list) ? formatChartData(v.list) : v)));
};

// AmazonSC销量曲线图
const AmazonSC: React.FC = () => {
  const { initialState }: any = useModel('@@initialState');
  const userInfo = initialState?.userInfo;
  const [platform_code, platform_codeSet] = useState<any>('');
  const [platform_id, platform_idSet] = useState<string>('');
  const formRef = useRef<ProFormInstance>();
  const [slider, sliderSet] = useState<any>(false);
  const [dimension, dimensionSet] = useState<any>({ label: '款式', value: 'SKU' });
  const [type, typeSet] = useState<any>({ label: '按天统计', value: 'date' });
  // const weekOfday: any = moment().format('E'); //计算今天是这周第几天
  const [searchDate, searchDateSet] = useState<any>([null, null]);
  // const last_monday = moment()
  //   .add(-3, 'week')
  //   .subtract(weekOfday - 1, 'days')
  //   .format('YYYY-MM-DD');
  // const today = moment().format('YYYY-MM-DD');
  const addListen = useListen();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    console.log(params?.dimensionNames);
    if (!params?.dimensionNames || (params?.dimensionNames && !params?.dimensionNames?.length)) return;
    params.dimensionList = params?.dimensionNames?.map((v: any) => JSON.parse(v));
    const res = await saleChartCn({
      ...params,
      platformCode: platform_code,
    });
    if (res?.code !== pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    if (res?.data) {
      // 时间过长需要加图表slider
      if (params.dateStart && params.dateEnd) {
        if (moment(params.dateEnd).diff(moment(params.dateStart), 'days') > 60) {
          sliderSet({ start: 0, end: 1 });
        } else {
          sliderSet(false);
        }
      }
      const list: any = formatChartData(sortBy(res.data?.list || [], 'date'));
      const skuPriceList: any = [...list];
      const skuPriceListOrigin = res.data?.skuPriceList || [];
      list.forEach((item: any) => {
        skuPriceListOrigin.forEach((skuPrice: any) => {
          skuPriceList.push({ date: item.date, average: skuPrice.price, ...skuPrice });
        });
      });
      setTimeout(() => {
        addListen('.chartWrapper');
      }, 3000);
      return {
        data: [list, skuPriceList],
        success: true,
      };
    }
    return {
      data: [],
      success: false,
    };
  };
  // 表格配置
  const columns: ProColumns<any>[] = [
    {
      title: '统计类型',
      order: 8,
      dataIndex: 'type',
      hideInTable: true,
      valueType: 'radioButton',
      initialValue: type.value,
      valueEnum: {
        date: { text: '按天' },
        week: { text: '按周' },
        month: { text: '按月' },
        year: { text: '按年' },
      },
      fieldProps: {
        onChange: (v: any) => {
          typeSet(v?.target);
        },
      },
    },
    {
      title: '统计时间',
      dataIndex: 'dateDimension',
      hideInTable: true,
      valueType: 'radioButton',
      initialValue: 'order',
      valueEnum: {
        order: { text: '下单时间' },
        pay: { text: '付款时间' },
      },
      order: 7,
    },
    {
      title: '平台',
      order: 6,
      dataIndex: 'platform_code',
      hideInTable: true,
      valueType: 'select',
      initialValue: '',
      request: async () => {
        const res = await pubGetPlatformList({ business_scope: 'CN', isDy: true });
        const data =
          res
            ?.filter((v: any) => !['1552846034395881473', '1580120899712675841']?.includes(v.value))
            ?.map((v: any) => ({ platform_id: v.value, value: v.platform_code, label: v.label })) ||
          [];
        return [{ value: '', label: '所有平台', platform_id: '' }, ...data];
      },
      fieldProps: {
        allowClear: false,
        onChange: (v: any, o: any) => {
          platform_codeSet(v);
          platform_idSet(o.platform_id);
          if (v != '') {
            formRef.current?.setFieldsValue({ shopIdList: [] });
          }
        },
      },
    },
    {
      title: '店铺',
      order: 5,
      dataIndex: 'shopIdList',
      hideInTable: true,
      valueType: 'select',
      params: { platform_code },
      request: async () => {
        const res = await pubGetStoreList(
          {
            platform_id,
            business_scope: 'CN',
          },
          true,
        );
        if (res) {
          return res.map((item: any) => ({ ...item, disabled: !item.status }));
        }
        return [];
      },
      fieldProps: { showSearch: true, mode: 'multiple' },
    },
    {
      title: '区域',
      order: 5,
      dataIndex: 'regionList',
      hideInTable: true,
      valueType: 'select',
      request: async () => {
        const res: any = await salesRegionConfigList({});
        return (
          res?.data?.map((v: any) => ({ value: v.region, label: v.regionName || v.region })) || []
        );
      },
      fieldProps: { showSearch: true, mode: 'multiple' },
    },
    {
      title: '统计维度',
      order: 10,
      dataIndex: 'dimension',
      hideInTable: true,
      valueType: 'radioButton',
      initialValue: dimension?.value,
      valueEnum: {
        CATEGORY: { text: '产品线' },
        SPU: { text: '产品' },
        SKU: { text: '款式' },
      },
      fieldProps: {
        onChange: (v: any) => {
          let label;
          if (v?.target?.value == 'CATEGORY') {
            label = '产品线';
          } else if (v?.target?.value == 'SPU') {
            label = '产品';
          } else {
            label = '款式';
          }
          dimensionSet({ ...v?.target, label });
          // formRef.current?.submit();
        },
      },
    },
    {
      ...pubColumnSkuCN(dimension?.label, dimension?.value, userInfo?.id, 9),
    },
    {
      title: '统计区间',
      dataIndex: 'date',
      align: 'center',
      hideInTable: true,
      sorter: true,
      formItemProps: {
        rules: [
          pubRequiredRule,
          () => ({
            validator(_, value) {
              if (!value || value?.some((v: any) => !v)) {
                return Promise.reject(new Error('必填项'));
              }
              return Promise.resolve();
            },
          }),
        ],
      },
      renderFormItem: () => <DateRangeComp />,
      search: {
        transform: (val: any[]) => {
          searchDateSet(val ? [moment(val[0]).format('YYYY-MM-DD'), moment(val[1]).format('YYYY-MM-DD')] : []);
          return {
            dateStart: val ? moment(val[0]).format('YYYY-MM-DD') : null,
            dateEnd: val ? moment(val[1]).format('YYYY-MM-DD') : null,
          };
        },
      },
      order: 2,
    },
    {
      title: '对比年份1',
      dataIndex: 'compareYears1',
      hideInTable: true,
      valueType: 'dateYear',
      hideInSearch:
      !formRef?.current?.getFieldValue('date') || type.value == 'year' || moment(searchDate?.[0])?.year() != moment(searchDate?.[1])?.year(),
      fieldProps: {
        disabledDate: (current: Moment) => {
          return (
            current.year() > moment().year() ||
            current.year() == formRef?.current?.getFieldValue('date')?.[0]?.year() ||
            current.year() == formRef?.current?.getFieldValue('compareYears2')?.format('YYYY')
          );
        },
      },
      search: {
        transform: (v: any) => ({ compareYears: [v] }),
      },
    },
    {
      title: '对比年份2',
      dataIndex: 'compareYears2',
      hideInTable: true,
      valueType: 'dateYear',
      hideInSearch:
      !formRef?.current?.getFieldValue('date') || type.value == 'year' || moment(searchDate?.[0])?.year() != moment(searchDate?.[1])?.year(),
      fieldProps: {
        disabledDate: (current: Moment) => {
          return (
            current.year() > moment().year() ||
            current.year() == formRef?.current?.getFieldValue('date')?.[0]?.year() ||
            current.year() == formRef?.current?.getFieldValue('compareYears1')?.format('YYYY')
          );
        },
      },
      search: {
        transform: (v: any) => ({
          compareYears: [formRef.current?.getFieldValue('compareYears1')?.year().toString(), v],
        }),
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
            <div className="pub-echarts-title">销量</div>
            {tableProps?.action?.dataSource && tableProps?.action?.dataSource?.[0]?.length ? (
              <div className="chartWrapper">
                <Line
                  data={tableProps?.action?.dataSource[0]}
                  config={{ yField: 'quantity', slider: slider }}
                  type={type}
                />
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
            <Divider />
            <div className="pub-echarts-title">销售平均单价</div>
            {tableProps?.action?.dataSource && tableProps?.action?.dataSource?.[1]?.length ? (
              // 合并销售定价
              <div className="chartWrapper">
                <Line
                  data={tableProps?.action?.dataSource[1]}
                  config={{ yField: 'average', slider: slider }}
                  type={type}
                />
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
            <Divider />
            <div className="pub-echarts-title">销售额趋势图</div>
            {tableProps?.action?.dataSource && tableProps?.action?.dataSource?.[0]?.length ? (
              <div className="chartWrapper">
                <Line
                  data={tableProps?.action?.dataSource[0]}
                  config={{ yField: 'amount', slider: slider }}
                  type={type}
                />
              </div>
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

import { connect } from 'umi';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useActivate } from 'react-activation';
import { Space, Card, Radio, Button, Table, Spin } from 'antd';
import { OrderedListOutlined, LineChartOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import type { ProCoreActionType, ProFormInstance, ProColumns } from '@ant-design/pro-components';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import SelectDependency from '@/components/PubForm/SelectDependency';
import RangeDate from '@/components/PubForm/RangeDate';
import TypeStringSearch from '@/components/PubForm/TypeStringSearch';
import CustomSearch from '@/components/CustomSearch';
import CustomColumns from '@/components/CustomColumns';
import * as api from '@/services/pages/amazonAd';
import './style.less';
import { orderBy } from 'lodash';
import moment from 'moment';
// @ts-ignore
import accounting from 'accounting';
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from 'echarts/core';
// 引入柱状图图表，图表后缀都为 Chart
import { LineChart, BarChart, LineSeriesOption, BarSeriesOption } from 'echarts/charts';
// 引入提示框，标题，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  DatasetComponent,
  DatasetComponentOption,
  LegendComponent,
  LegendComponentOption,
  ToolboxComponent,
  ToolboxComponentOption,
  DataZoomComponent,
  DataZoomComponentOption,
  DataZoomInsideComponent,
} from 'echarts/components';
// 标签自动布局、全局过渡动画等特性
import { LabelLayout } from 'echarts/features';
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { SVGRenderer } from 'echarts/renderers';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
type ECOption = echarts.ComposeOption<
  | TooltipComponentOption
  | GridComponentOption
  | LineSeriesOption
  | BarSeriesOption
  | TitleComponentOption
  | DatasetComponentOption
  | LegendComponentOption
  | ToolboxComponentOption
  | DataZoomComponentOption
>;
// 注册必须的组件
echarts.use([
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  ToolboxComponent,
  LineChart,
  BarChart,
  LabelLayout,
  SVGRenderer,
  DataZoomComponent,
  DataZoomInsideComponent,
]);
// 格式化数据
/*
* 'date_format_str',
          'purchases7d',
          'units_sold_clicks7d',
          'sales7d',
          'cost',
          'acos',
          'roas',
          'impressions',
          'clicks',
          'clicks_rate',
          'cpc',
          'cvr',
          'cpa',*/
const formatValue = (value: any, dimensionName: string) => {
  if (['sales7d', 'cost', 'cpc', 'cpa'].includes(dimensionName)) {
    return accounting.formatMoney(value);
  }
  if (['acos', 'clicks_rate', 'cvr'].includes(dimensionName)) {
    return typeof value == 'number' ? accounting.toFixed(value, 2) + '%' : '--';
  }
  return typeof value == 'number' ? value : '--';
};
const Page: React.FC<{
  common: any;
}> = ({ common }) => {
  const actionRef: any = useRef<ProCoreActionType>();
  const formRef: any = useRef<ProFormInstance>();
  const [chart, chartSet] = useState<any>(null);
  const [chartData, chartDataSet] = useState<any[]>([]);
  const [chartQueryType, chartQueryTypeSet] = useState<string>('1');
  const [showChart, showChartSet] = useState<boolean>(true);
  const [columnsState, columnsStateSet] = useState<null | Record<string, any>>(null);
  const [summaryData, summaryDataSet] = useState<Record<string, any>>({});
  const seriesIndexFocus = useRef<number>(-1); // 高亮的系列index
  // const [selectedRowKeys, selectedRowKeysSet] = useState<React.Key[]>([]);
  const [loadingChart, loadingChartSet] = useState<boolean>(false);
  const [keyWords, keyWordsSet] = useState<string>(''); // 广告组, 广告活动 下拉搜索 默认关键词

  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  /*{
    "portfolios": 广告组合
    "campaigns": 广告活动
    "adgroups": 广告组
    "productads": 推广商品
    "keywords": 关键词
    "producttargeting": 投放
  }*/
  const tabList = useMemo(() => {
    if (common?.dicList?.AMAZON_ADS_SUB_TYPE) {
      return Object.keys(common.dicList.AMAZON_ADS_SUB_TYPE).map((key) => ({
        tab: common.dicList.AMAZON_ADS_SUB_TYPE[key]?.text,
        key,
      }));
    }
    return [];
  }, [common]);
  const [tabActiveKey, tabActiveKeySet] = useState('productads');

  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        title: '广告类型',
        dataIndex: 'ads_type',
        hideInTable: true,
        hideInSearch: ['portfolios'].includes(tabActiveKey),
        valueType: 'select',
        initialValue: 'sp',
        valueEnum: common?.dicList?.AMAZON_ADS_TYPE || {},
        fieldProps: {
          allowClear: false,
        },
        order: 7,
      },
      {
        title: '广告组合',
        dataIndex: ['portfolios'].includes(tabActiveKey) ? 'name' : 'portfolio_name',
        hideInTable: !['portfolios', 'campaigns'].includes(tabActiveKey),
        hideInSetting: ['portfolios'].includes(tabActiveKey),
        fixed: ['portfolios'].includes(tabActiveKey) ? 'left' : false,
        width: 140,
        order: 7,
        valueType: 'select',
        dependencies: ['shop_name'],
        fieldProps: {
          mode: 'multiple',
          showSearch: true,
          autoClearSearchValue: true,
        },
        request: async (params) => {
          const res = await api.portfoliosNameList({
            ...params,
            portfolio_name: params.keyWords,
            current_page: 1,
            page_size: 999,
          });
          if (res?.code == pubConfig.sCode) {
            return res?.data?.records.map((item: any) => ({
              label: item.name,
              value: item.portfolio_id,
            }));
          }
          return [];
        },
        search: {
          transform: (val) => ({ portfolio_id: val }),
        },
      },
      {
        title: '广告活动',
        dataIndex: ['campaigns'].includes(tabActiveKey) ? 'name' : 'campaign_name',
        hideInSetting: ['campaigns'].includes(tabActiveKey),
        hideInSearch: ['portfolios'].includes(tabActiveKey),
        hideInTable: ['portfolios'].includes(tabActiveKey),
        width: 140,
        fixed: ['campaigns'].includes(tabActiveKey) ? 'left' : false,
        order: 6,
        render: (dom, record) => {
          if (['campaigns'].includes(tabActiveKey)) {
            return dom;
          } else {
            return (
              <a
                onClick={() => {
                  keyWordsSet(record.campaign_name);
                  formRef.current?.setFieldsValue({ name: [record.campaign_id] });
                  tabActiveKeySet('campaigns');
                  formRef.current?.submit();
                  setTimeout(() => keyWordsSet(''), 0);
                }}
              >
                {record.campaign_name}
              </a>
            );
          }
        },
        valueType: 'select',
        dependencies: ['ads_type', 'shop_name', 'portfolio_name'],
        fieldProps: {
          mode: 'multiple',
          showSearch: true,
          autoClearSearchValue: true,
        },
        params: { defaultKeyWords: keyWords },
        request: async (params) => {
          const res = await api.campaignsNameList({
            ...params,
            campaign_name: params.keyWords || params.defaultKeyWords,
            keyWords: params.keyWords || params.defaultKeyWords,
            current_page: 1,
            page_size: 999,
          });
          if (res?.code == pubConfig.sCode) {
            return res?.data?.records.map((item: any) => ({
              label: item.name,
              value: item.campaign_id,
            }));
          }
          return [];
        },
        search: {
          transform: (val) => ({ campaign_id: val }),
        },
      },
      {
        title: '广告组',
        dataIndex: 'adgroup_name',
        hideInTable: ['portfolios', 'campaigns'].includes(tabActiveKey),
        hideInSearch: ['portfolios', 'campaigns'].includes(tabActiveKey),
        hideInSetting: ['adgroups'].includes(tabActiveKey),
        fixed: ['adgroups'].includes(tabActiveKey) ? 'left' : false,
        width: 140,
        order: 5,
        valueType: 'select',
        dependencies: ['ads_type', 'shop_name', 'portfolio_name', 'campaign_name'],
        fieldProps: {
          mode: 'multiple',
          showSearch: true,
          autoClearSearchValue: true,
        },
        params: { defaultKeyWords: keyWords },
        request: async (params) => {
          const res = await api.adGroupsPageList({
            ...params,
            adgroup_name: params.keyWords || params.defaultKeyWords,
            keyWords: params.keyWords || params.defaultKeyWords,
            current_page: 1,
            page_size: 999,
          });
          if (res?.code == pubConfig.sCode) {
            return res?.data?.records.map((item: any) => ({
              label: item.name,
              value: item.adgroup_id,
            }));
          }
          return [];
        },
        search: {
          transform: (val) => ({ adgroup_id: val }),
        },
        render: (dom, record) => {
          if (['adgroups'].includes(tabActiveKey)) {
            return dom;
          } else {
            return (
              <a
                onClick={() => {
                  keyWordsSet(record.adgroup_name);
                  tabActiveKeySet('adgroups');
                  formRef.current?.setFieldsValue({ adgroup_name: [record.adgroup_id] });
                  formRef.current?.submit();
                  setTimeout(() => keyWordsSet(''), 0);
                }}
              >
                {record.adgroup_name}
              </a>
            );
          }
        },
      },
      {
        title: '商品信息',
        dataIndex: 'product',
        hideInTable: !['productads'].includes(tabActiveKey),
        hideInSearch: true,
        hideInSetting: ['productads'].includes(tabActiveKey),
        fixed: ['productads'].includes(tabActiveKey) ? 'left' : false,
        render: (_, record) => (
          <Space>
            <img width={50} src={record.image_url} alt={''} />
            <div>
              <div style={{ color: 'gray' }}>
                Asin: <span style={{ color: '#333' }}>{record.asin}</span>
              </div>
              <div style={{ color: 'gray' }}>
                SKU: <span style={{ color: '#333' }}>{record.sku}</span>
              </div>
            </div>
          </Space>
        ),
        width: 180,
      },
      {
        title: '款式信息',
        dataIndex: 'product',
        hideInTable: !['productads'].includes(tabActiveKey),
        hideInSearch: true,
        hideInSetting: ['productads'].includes(tabActiveKey),
        fixed: ['productads'].includes(tabActiveKey) ? 'left' : false,
        render: (_, record) => (
          <Space>
            <div>
              <div style={{ color: 'gray' }}>
                {record.goods_sku_name} - {record.sku_code}
              </div>
            </div>
          </Space>
        ),
        width: 180,
      },
      {
        title: '关键词',
        dataIndex: 'keyword_text',
        hideInTable: !['keywords'].includes(tabActiveKey),
        hideInSearch: !['keywords'].includes(tabActiveKey),
        hideInSetting: ['keywords'].includes(tabActiveKey),
        fixed: ['keywords'].includes(tabActiveKey) ? 'left' : false,
        width: 100,
      },
      {
        title: '匹配类型',
        dataIndex: 'match_type',
        hideInTable: !['keywords'].includes(tabActiveKey),
        hideInSearch: !['keywords', 'producttargeting'].includes(tabActiveKey),
        width: 100,
        valueType: 'select',
        fieldProps: {
          mode: 'multiple',
        },
        valueEnum: ['producttargeting'].includes(tabActiveKey)
          ? common?.dicList?.AMAZON_ADS_SP_TARGETING_RESOLVED_EXPRESSION_TYPE || {}
          : common?.dicList?.AMAZON_ADS_SP_KEYWORD_MATCH_TYPE || {},
      },
      {
        title: '投放(非关键词)',
        dataIndex: 'targeting',
        hideInTable: !['producttargeting'].includes(tabActiveKey),
        hideInSearch: true,
        hideInSetting: ['producttargeting'].includes(tabActiveKey),
        fixed: ['producttargeting'].includes(tabActiveKey) ? 'left' : false,
        width: 130,
        renderText: (_, record) =>
          `${
            pubFilter(
              common?.dicList?.AMAZON_ADS_SP_TARGETING_RESOLVED_EXPRESSION_TYPE || {},
              record.expression_expression_type,
            ) || ''
          }${record.expression_expression_value ? '=' + record.expression_expression_value : ''}`,
      },
      {
        title: '广告组合状态',
        dataIndex: 'portfolio_state',
        hideInSearch: !['portfolios'].includes(tabActiveKey),
        hideInTable: true,
        valueType: 'select',
        initialValue: ['portfolios'].includes(tabActiveKey) ? ['enabled', 'paused'] : [],
        valueEnum: common?.dicList?.AMAZON_ADS_PORTFOLIOS_STATE || {},
        fieldProps: {
          mode: 'multiple',
        },
      },
      {
        title: '商品状态',
        dataIndex: 'productad_state',
        hideInSearch: !['productads'].includes(tabActiveKey),
        hideInTable: true,
        valueType: 'select',
        initialValue: ['productads'].includes(tabActiveKey) ? ['ENABLED', 'PAUSED'] : [],
        valueEnum: common?.dicList?.AMAZON_ADS_SP_CAMPAIGNS_STATE || {},
        fieldProps: {
          mode: 'multiple',
        },
      },
      {
        title: '广告活动状态',
        dataIndex: 'campaign_state',
        hideInSearch: ['portfolios'].includes(tabActiveKey),
        hideInTable: true,
        valueType: 'select',
        initialValue: ['campaigns'].includes(tabActiveKey) ? ['ENABLED', 'PAUSED'] : [],
        valueEnum: common?.dicList?.AMAZON_ADS_SP_CAMPAIGNS_STATE || {},
        fieldProps: {
          mode: 'multiple',
        },
      },
      {
        title: '广告组状态',
        dataIndex: 'adgroup_state',
        hideInTable: true,
        hideInSearch: !['productads', 'adgroups'].includes(tabActiveKey),
        valueType: 'select',
        initialValue: ['adgroups'].includes(tabActiveKey) ? ['ENABLED', 'PAUSED'] : [],
        valueEnum: common?.dicList?.AMAZON_ADS_SP_CAMPAIGNS_STATE || {},
        fieldProps: {
          mode: 'multiple',
        },
      },
      {
        title: '类型输入搜索',
        dataIndex: 'searchTyping',
        hideInTable: true,
        hideInSearch: !['productads'].includes(tabActiveKey),
        initialValue: ['asin', ''],
        renderFormItem: () => (
          <TypeStringSearch
            width={86}
            options={[
              {
                label: 'Asin',
                value: 'asin',
              },
              {
                label: 'SKU',
                value: 'sku',
              },
              {
                label: '款式名称',
                value: 'sku_name',
              },
            ]}
          />
        ),
        formItemProps: {
          label: '',
          noStyle: true,
        },
        search: {
          transform: (val: any[]) => {
            return {
              [val[0]]: val[1],
            };
          },
        },
      },
      {
        title: '关键词状态',
        dataIndex: 'keyword_state',
        hideInTable: true,
        hideInSearch: !['keywords'].includes(tabActiveKey),
        valueType: 'select',
        initialValue: ['keywords'].includes(tabActiveKey) ? ['ENABLED', 'PAUSED'] : [],
        valueEnum: common?.dicList?.AMAZON_ADS_SP_CAMPAIGNS_STATE || {},
        fieldProps: {
          mode: 'multiple',
        },
      },
      {
        title: '投放状态',
        dataIndex: 'producttargeting_state',
        hideInTable: true,
        hideInSearch: !['producttargeting'].includes(tabActiveKey),
        valueType: 'select',
        initialValue: ['producttargeting'].includes(tabActiveKey) ? ['ENABLED', 'PAUSED'] : [],
        valueEnum: common?.dicList?.AMAZON_ADS_SP_CAMPAIGNS_STATE || {},
        fieldProps: {
          mode: 'multiple',
        },
      },
      {
        title: '投放内容',
        dataIndex: 'product_targeting_expression_expression_value',
        hideInTable: true,
        hideInSearch: !['producttargeting'].includes(tabActiveKey),
      },
      {
        title: '状态',
        dataIndex: 'state',
        hideInSetting: true,
        hideInSearch: true,
        width: 100,
        valueType: 'select',
        valueEnum: () => {
          if (tabActiveKey == 'portfolios') {
            return common?.dicList?.AMAZON_ADS_PORTFOLIOS_STATE;
          }
          return common?.dicList?.AMAZON_ADS_SP_CAMPAIGNS_STATE;
        },
        fixed: 'left',
        align: 'center',
        /*render: (dom, entity: any) => {
          if (tabActiveKey == 'portfolios') {
            if (['enabled', 'paused'].includes(entity.state)) {
              return (
                <Switch
                  onChange={() => {
                    pubMsg('提示: 暂无此功能~');
                    // entity.state = checked;
                    // actionRef.current?.reload();
                  }}
                  checked={entity.state == 'enabled'}
                  checkedChildren="启动"
                  unCheckedChildren="暂停"
                />
              );
            }
            return pubFilter(common?.dicList?.AMAZON_ADS_PORTFOLIOS_STATE || {}, entity.state);
          } else {
            if (['ENABLED', 'PAUSED'].includes(entity.state)) {
              return (
                <Switch
                  onChange={() => {
                    pubMsg('提示: 暂无此功能~');
                    // entity.state = checked;
                    // actionRef.current?.reload();
                  }}
                  checked={entity.state == 'ENABLED'}
                  checkedChildren="启动"
                  unCheckedChildren="暂停"
                />
              );
            }
            return pubFilter(common?.dicList?.AMAZON_ADS_SP_CAMPAIGNS_STATE, entity.state);
          }
        },*/
      },
      {
        title: '店铺名',
        dataIndex: 'shop_name',
        width: 80,
        initialValue: ['US', []],
        renderFormItem: () => (
          <SelectDependency
            valueEnum={{ US: { text: 'US' }, DE: { text: 'DE' } }}
            requestMethod={'GET'}
            multiple
            placeholder={['站点', '店铺']}
            width={86}
            requestUrl={'/sc-scm/amazonAds/shopByCountryCode'}
            requestParam={'country_code'}
          />
        ),
        formItemProps: {
          label: '',
          noStyle: true,
        },
        search: {
          transform: (val: any[]) => ({
            country_code: val[0], // 平台
            shop_id: val[1], // 店铺
          }),
        },
        order: 9,
      },
      {
        title: '投放方式',
        dataIndex: 'targeting_type',
        hideInSearch: ['keywords', 'portfolios'].includes(tabActiveKey),
        hideInTable: ['keywords', 'portfolios'].includes(tabActiveKey),
        width: 80,
        valueType: 'select',
        valueEnum: common?.dicList?.AMAZON_ADS_TARGETING_TYPE || {},
        order: 5,
      },
      {
        title: '竞价策略',
        dataIndex: 'dynamic_bidding_strategy',
        hideInSearch: !['campaigns'].includes(tabActiveKey),
        hideInTable: !['campaigns'].includes(tabActiveKey),
        width: 100,
        valueType: 'select',
        valueEnum: common?.dicList?.AMAZON_ADS_DYNAMIC_BIDDING_STRATEGY || {},
        order: 4,
      },
      {
        title: '竞价',
        dataIndex: ['keywords', 'producttargeting'].includes(tabActiveKey) ? 'bid' : 'default_bid',
        hideInSearch: true,
        hideInTable: !['adgroups', 'keywords', 'producttargeting'].includes(tabActiveKey),
        width: 100,
        sorter: true,
        valueType: { type: 'money', locale: 'en-US' },
      },
      {
        title: '预算/类型',
        dataIndex: 'budget_budget',
        width: 100,
        align: 'center',
        hideInSearch: true,
        hideInTable: !['campaigns'].includes(tabActiveKey),
        sorter: true,
        render: (_, record) => (
          <>
            <span style={{ borderBottom: '1px dashed #d9d9d9' }}>
              {typeof record.budget_budget == 'number'
                ? accounting.formatMoney(record.budget_budget)
                : '-'}
            </span>
            <br />
            {pubFilter(
              common?.dicList?.AMAZON_ADS_SP_CAMPAIGNS_BUDGET_TYPE,
              record.budget_budget_type,
            ) || '-'}
          </>
        ),
      },
      {
        title: '起止日期',
        dataIndex: 'date',
        hideInTable: !['campaigns'].includes(tabActiveKey),
        tooltip: (
          <>
            广告活动开始和结束的日期。
            <br />
            1、您可以设置未来的某个日期作为开始日期，以便在该日期启动广告活动。
            <br />
            2、为确保广告始终投放而不错过展示或点击机会，可选择不设置结束日期，保持“无结束日期”。
            <br />
            3、您可以在广告活动开展期间随时延长、缩短或结束广告活动。
            <br />
          </>
        ),
        width: 86,
        dependencies: ['shop_name'],
        renderFormItem: (a, b, c) => {
          const platform: string = c.getFieldValue('shop_name') && c.getFieldValue('shop_name')[0];
          return <RangeDate width={114} timeZone={platform == 'DE' ? 1 : -5} />;
        },
        formItemProps: {
          label: '',
          noStyle: true,
        },
        search: {
          transform: (val: any[]) => {
            if (val[1]) {
              return {
                dateRangeType: val[0],
                start_date: val[1][0]?.format('YYYY-MM-DD') + ' 00:00:00',
                end_date: val[1][1]?.format('YYYY-MM-DD') + ' 23:59:59',
              };
            }
            return {
              dateRangeType: val[0],
              start_date: '',
              end_date: '',
            };
          },
        },
        order: 8,
        render: (_, record) => (
          <>
            {record.start_date} <br /> {record.end_date}
          </>
        ),
      },
      {
        title: '推广商品数',
        dataIndex: 'product_ads_count',
        tooltip:
          '广告活动页的推广商品数会根据Asin去重，例如一个广告活动下有三个广告组，且同时存在同一个商品，则统计推广商品数时，数量只会记为1而不是3',
        width: 100,
        hideInSearch: true,
        hideInTable: !['campaigns', 'adgroups'].includes(tabActiveKey),
        sorter: true,
        valueType: 'digit',
      },
      {
        title: '花费',
        dataIndex: 'cost',
        tooltip: (
          <>
            广告活动的点击或展示总费用。
            <br />
            特别说明：
            <br />
            1、一旦识别出无效点击，亚马逊最多会在 3
            天内从您的支出统计数据中删除这些点击记录。日期范围（含过去 3
            天内的支出）可能因点击和支出失效而有所调整；
            <br />
            2、以商品和站点不同维度查看数据，因数据来自亚马逊不同的接口，不同接口的请求时间或者报告生成时间可能不一致，因此可能导致两个维度下统计结果存在略微不一致；
            <br />
            3、因近30天（尤其近3天）亚马逊接口返回的数据，可能与亚马逊控制台展现的数据存在略微不一致，因此可能导致系统统计结果与亚马逊控制台展现的数据存在略微不一致；
            <br />
            4、计算规则：广告花费 = CPC竞价 * 被点击次数；
          </>
        ),
        width: 100,
        hideInSearch: true,
        sorter: true,
        valueType: { type: 'money', locale: 'en-US' },
      },
      {
        title: '展示量',
        dataIndex: 'impressions',
        tooltip: (
          <>
            广告投放给买家的展示总数。
            <br />
            没有曝光量就无法带来点击及购买转化，因此整体预算内，曝光量越高越好。
          </>
        ),
        width: 90,
        hideInSearch: true,
        sorter: true,
        valueType: 'digit',
      },
      {
        title: '点击量',
        dataIndex: 'clicks',
        tooltip: (
          <>
            点击量：广告被点击的总次数。
            <br />
            点击率：每一次曝光被点击的概率。
            <br />
            计算规则：广告点击率 = 点击量 / 展示量 * 100%；
            <br />
            亚马逊广告点击率一般在0.6%-2.5%左右。
            <br />
            点击率高：说明选词匹配度越高，同时您的商品标题、主图、价格、评论数量，较好的吸引用户点击。
            <br />
            点击率低：建议对选词，商品标题、主图、价格、评论数量进行优化。
            <br />
            特别说明：
            <br />
            一旦识别出无效点击，亚马逊最多会在 3
            天内从您的支出统计数据中删除这些点击记录。日期范围（含过去 3
            天内的支出）可能因点击和支出失效而有所调整；
          </>
        ),
        width: 90,
        hideInSearch: true,
        sorter: true,
        valueType: 'digit',
      },
      {
        title: '点击率',
        dataIndex: 'clicks_rate',
        valueType: 'percent',
        tooltip: (
          <>
            点击量：广告被点击的总次数。
            <br />
            点击率：每一次曝光被点击的概率。
            <br />
            计算规则：广告点击率 = 点击量 / 展示量 * 100%；
            <br />
            亚马逊广告点击率一般在0.6%-2.5%左右。
            <br />
            点击率高：说明选词匹配度越高，同时您的商品标题、主图、价格、评论数量，较好的吸引用户点击。
            <br />
            点击率低：建议对选词，商品标题、主图、价格、评论数量进行优化。
            <br />
            特别说明：
            <br />
            一旦识别出无效点击，亚马逊最多会在 3
            天内从您的支出统计数据中删除这些点击记录。日期范围（含过去 3
            天内的支出）可能因点击和支出失效而有所调整；
          </>
        ),
        width: 90,
        hideInSearch: true,
        sorter: true,
      },
      {
        title: 'CPC',
        dataIndex: 'cpc',
        tooltip: (
          <>
            CPC点击的平均价格。
            <br />
            计算规则：CPC均价=广告花费 / 点击量
          </>
        ),
        width: 90,
        hideInSearch: true,
        sorter: true,
        valueType: { type: 'money', locale: 'en-US' },
      },
      {
        title: 'CVR',
        dataIndex: 'cvr',
        valueType: 'percent',
        tooltip: (
          <>
            每一次点击带来订单的概率。
            <br />
            计算规则：CVR = 订单数 / 点击量 * 100%；
            <br />
            例如：CVR为10%，每100次点击，能带来10笔广告订单。
            <br />
            亚马逊广告，CVR一般为5-10%左右。
            <br />
            CVR的重要影响因素：商品图片、卖点、评论内容、促销活动，
            <br />
            如果CVR低，建议您优化listing，根据商品的受众人群，
            <br />
            提炼卖点、设计精美的场景图、善用Q&A，Review等。
          </>
        ),
        width: 90,
        hideInSearch: true,
        sorter: true,
      },
      {
        title: 'CPA',
        dataIndex: 'cpa',
        tooltip: (
          <>
            每一笔广告订单平均所需花费用。
            <br />
            计算规则：CPA = 花费 / 订单数
            <br />
            商品的新品期，CPA相对较高，
            <br />
            商品的稳定期，CPA逐渐降低。
          </>
        ),
        width: 90,
        hideInSearch: true,
        sorter: true,
        valueType: { type: 'money', locale: 'en-US' },
      },
      {
        title: 'ACOS',
        dataIndex: 'acos',
        valueType: 'percent',
        tooltip: (
          <>
            广告销售成本率，广告花费占广告销售额的比例。
            <br />
            计算规则：ACOS = 广告花费 / 广告销售额 * 100%；
            <br />
            例如，ACOS为90%，100美元的销售额，需要支付90%（90元）广告费。
            <br />
            ACOS是衡量广告效果的重要指标，一般来说越低越好，25%是业内普遍的衡量标准。
            <br />
            在不同的细分市场、商品周期、用户周期，品牌定位，都影响着ACOS的设置目标，
            <br />
            例如，客户复购率高、忠诚度高、终身价值高，或是有品牌光环和生态的商品，
            <br />
            通过广告一次获客，客户可带来长期的购买回报，
            <br />
            因此这类商品ACOS高，反而有益于创造更多利润。
          </>
        ),
        width: 90,
        hideInSearch: true,
        sorter: true,
      },
      {
        title: 'ROAS',
        dataIndex: 'roas',
        tooltip: (
          <>
            广告投入回报比，广告销售额与成本的倍数。
            <br />
            计算规则：ROAS = 广告销售额 / 广告花费；
            <br />
            例如，ROAS为2，说明花10美元做广告，带来了20美元的销售额。
            <br />
            ROAS是衡量广告效果投入成本的效率指标，一般情况下，越大越好，
            <br />
            亚马逊上的平均ROAS约为3，消费类电子产品的ROAS约为9，玩具和游戏的ROAS约为4.5。
          </>
        ),
        width: 100,
        hideInSearch: true,
        sorter: true,
      },

      {
        title: '当天订单数',
        dataIndex: 'purchases1d',
        tooltip: (
          <>
            销量是指买家在点击您广告后1/7/14/30天内提交的亚马逊订单数量。
            <br />
            不同维度查看数据可能存在误差，因为比如商品维度和广告组维度两者获取的数据。
            <br />
            来源于不同报告，可能因为更新时间等原因导致一些偏差。
          </>
        ),
        width: 110,
        hideInSearch: true,
        sorter: true,
        valueType: 'digit',
      },
      {
        title: '当天销量',
        dataIndex: 'units_sold_clicks1d',
        tooltip: (
          <>
            销量是指买家在点击您广告后1/7/14/30天内提交的亚马逊订单的商品销售数量。
            <br />
            不同维度查看数据可能存在误差，因为比如商品维度和广告组维度两者获取的数据
            <br />
            来源于不同报告，可能因为更新时间等原因导致一些偏差。
          </>
        ),
        width: 100,
        hideInSearch: true,
        sorter: true,
        valueType: 'digit',
      },
      {
        title: '当天销售额',
        dataIndex: 'sales1d',
        tooltip: (
          <>
            广告销售额是在某种广告活动投放期间的指定时间范围内，因广告被点击或浏览在1/7/14/30天内售出的推广商品及库存中其他商品的销售额。
            <br />
            不同维度查看数据可能存在误差，因为比如商品维度和广告组维度两者获取的数据
            <br />
            来源于不同报告，可能因为更新时间等原因导致一些偏差。
          </>
        ),
        width: 110,
        hideInSearch: true,
        sorter: true,
        valueType: { type: 'money', locale: 'en-US' },
      },

      {
        title: '7天订单数',
        dataIndex: 'purchases7d',
        tooltip: (
          <>
            销量是指买家在点击您广告后1/7/14/30天内提交的亚马逊订单数量。
            <br />
            不同维度查看数据可能存在误差，因为比如商品维度和广告组维度两者获取的数据。
            <br />
            来源于不同报告，可能因为更新时间等原因导致一些偏差。
          </>
        ),
        width: 110,
        hideInSearch: true,
        sorter: true,
        valueType: 'digit',
      },
      {
        title: '7天销量',
        dataIndex: 'units_sold_clicks7d',
        tooltip: (
          <>
            销量是指买家在点击您广告后1/7/14/30天内提交的亚马逊订单的商品销售数量。
            <br />
            不同维度查看数据可能存在误差，因为比如商品维度和广告组维度两者获取的数据
            <br />
            来源于不同报告，可能因为更新时间等原因导致一些偏差。
          </>
        ),
        width: 100,
        hideInSearch: true,
        sorter: true,
        valueType: 'digit',
      },
      {
        title: '7天销售额',
        dataIndex: 'sales7d',
        tooltip: (
          <>
            广告销售额是在某种广告活动投放期间的指定时间范围内，因广告被点击或浏览在1/7/14/30天内售出的推广商品及库存中其他商品的销售额。
            <br />
            不同维度查看数据可能存在误差，因为比如商品维度和广告组维度两者获取的数据
            <br />
            来源于不同报告，可能因为更新时间等原因导致一些偏差。
          </>
        ),
        width: 110,
        hideInSearch: true,
        sorter: true,
        valueType: { type: 'money', locale: 'en-US' },
      },

      {
        title: '14天订单数',
        dataIndex: 'purchases14d',
        tooltip: (
          <>
            销量是指买家在点击您广告后1/7/14/30天内提交的亚马逊订单数量。
            <br />
            不同维度查看数据可能存在误差，因为比如商品维度和广告组维度两者获取的数据。
            <br />
            来源于不同报告，可能因为更新时间等原因导致一些偏差。
          </>
        ),
        width: 110,
        hideInSearch: true,
        sorter: true,
        valueType: 'digit',
      },
      {
        title: '14天销量',
        dataIndex: 'units_sold_clicks14d',
        tooltip: (
          <>
            销量是指买家在点击您广告后1/7/14/30天内提交的亚马逊订单的商品销售数量。
            <br />
            不同维度查看数据可能存在误差，因为比如商品维度和广告组维度两者获取的数据
            <br />
            来源于不同报告，可能因为更新时间等原因导致一些偏差。
          </>
        ),
        width: 100,
        hideInSearch: true,
        sorter: true,
        valueType: 'digit',
      },
      {
        title: '14天销售额',
        dataIndex: 'sales14d',
        tooltip: (
          <>
            广告销售额是在某种广告活动投放期间的指定时间范围内，因广告被点击或浏览在1/7/14/30天内售出的推广商品及库存中其他商品的销售额。
            <br />
            不同维度查看数据可能存在误差，因为比如商品维度和广告组维度两者获取的数据
            <br />
            来源于不同报告，可能因为更新时间等原因导致一些偏差。
          </>
        ),
        width: 110,
        hideInSearch: true,
        sorter: true,
        valueType: { type: 'money', locale: 'en-US' },
      },

      {
        title: '30天订单数',
        dataIndex: 'purchases30d',
        tooltip: (
          <>
            销量是指买家在点击您广告后1/7/14/30天内提交的亚马逊订单数量。
            <br />
            不同维度查看数据可能存在误差，因为比如商品维度和广告组维度两者获取的数据。
            <br />
            来源于不同报告，可能因为更新时间等原因导致一些偏差。
          </>
        ),
        width: 110,
        hideInSearch: true,
        sorter: true,
        valueType: 'digit',
      },
      {
        title: '30天销量',
        dataIndex: 'units_sold_clicks30d',
        tooltip: (
          <>
            销量是指买家在点击您广告后1/7/14/30天内提交的亚马逊订单的商品销售数量。
            <br />
            不同维度查看数据可能存在误差，因为比如商品维度和广告组维度两者获取的数据
            <br />
            来源于不同报告，可能因为更新时间等原因导致一些偏差。
          </>
        ),
        width: 100,
        hideInSearch: true,
        sorter: true,
        valueType: 'digit',
      },
      {
        title: '30天销售额',
        dataIndex: 'sales30d',
        tooltip: (
          <>
            广告销售额是在某种广告活动投放期间的指定时间范围内，因广告被点击或浏览在1/7/14/30天内售出的推广商品及库存中其他商品的销售额。
            <br />
            不同维度查看数据可能存在误差，因为比如商品维度和广告组维度两者获取的数据
            <br />
            来源于不同报告，可能因为更新时间等原因导致一些偏差。
          </>
        ),
        width: 110,
        hideInSearch: true,
        sorter: true,
        valueType: { type: 'money', locale: 'en-US' },
      },
    ],
    [tabActiveKey, common],
  );
  // 图表数据
  const columnsChart: ProColumns<any>[] = useMemo(
    () => [
      {
        title: '时间',
        dataIndex: 'date_format_str',
        align: 'center',
        hideInSetting: true,
        width: 100,
        fixed: 'left',
      },
      {
        title: '7天订单数',
        dataIndex: 'purchases7d',
        align: 'right',
        valueType: 'digit',
      },
      {
        title: '7天销量',
        dataIndex: 'units_sold_clicks7d',
        align: 'right',
        valueType: 'digit',
      },
      {
        title: '7天销售额',
        dataIndex: 'sales7d',
        align: 'right',
        valueType: { type: 'money', locale: 'en-US' },
      },
      {
        title: '花费',
        dataIndex: 'cost',
        align: 'right',
        valueType: { type: 'money', locale: 'en-US' },
      },
      {
        title: 'ACOS',
        dataIndex: 'acos',
        align: 'right',
        valueType: 'percent',
      },
      {
        title: 'ROAS',
        dataIndex: 'roas',
        align: 'right',
      },
      {
        title: '展示量',
        dataIndex: 'impressions',
        align: 'right',
        valueType: 'digit',
      },
      {
        title: '点击量',
        dataIndex: 'clicks',
        align: 'right',
        valueType: 'digit',
      },
      {
        title: '点击率',
        dataIndex: 'clicks_rate',
        align: 'right',
        valueType: 'percent',
      },
      {
        title: 'CPC',
        dataIndex: 'cpc',
        align: 'right',
        valueType: { type: 'money', locale: 'en-US' },
      },
      {
        title: 'CVR',
        dataIndex: 'cvr',
        align: 'right',
        valueType: 'percent',
      },
      {
        title: 'CPA',
        dataIndex: 'cpa',
        align: 'right',
        valueType: { type: 'money', locale: 'en-US' },
      },
    ],
    [],
  );
  // 设置图表默认展示指标自定义列显示
  const columnsChartFormat: ProColumns<any>[] = useMemo(() => {
    let temp = columnsChart;
    if (columnsState && !showChart) {
      temp = temp.map((column) => {
        let index = 0;
        const matchedData = columnsState.find((item: any, i: number) => {
          index = i;
          return column.dataIndex == item.dataIndex;
        });
        if (matchedData) {
          return { ...column, hideInTable: !matchedData.show, order: index + 1 };
        } else {
          return { ...column, order: 0 };
        }
      });
    }
    return orderBy(temp, 'order');
  }, [columnsState]);
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 2300, tabActiveKey);
  // 总计
  const columnsStatePageTable = useMemo(() => {
    const summaryColumnsSet = ColumnSet.columnsState.value;
    // console.log(summaryColumnsSet, 'summaryColumnsSet');
    let temp = columns.filter((item) => !item.hideInTable && !item.hideInSetting);
    if (summaryColumnsSet) {
      temp = temp.map((column: any, index) => {
        const matchedData = summaryColumnsSet[column.dataIndex];
        if (matchedData) {
          return {
            dataIndex: column.dataIndex,
            title: column.title,
            hideInTable: !matchedData.show,
            order: typeof matchedData.order == 'number' ? matchedData.order + 1 : index + 1,
          };
        } else {
          return { dataIndex: column.dataIndex, title: column.title, order: 0 };
        }
      });
    }
    return orderBy(temp, 'order');
  }, [ColumnSet, columns]);
  // 图表配置
  const colors = ['#FF9800', '#2196F3', '#F44336', '#34bfa3'];
  const option: ECOption = useMemo(() => {
    const temp: ECOption = {
      grid: {
        left: 200,
        right: 200,
      },
      dataZoom:
        chartData?.length > 7
          ? [
              {
                type: 'slider',
                show: true,
                xAxisIndex: [0],
                start: 75,
                end: 100,
                height: 20,
              },
              {
                type: 'inside',
                xAxisIndex: [0],
                start: 75,
                end: 100,
              },
            ]
          : [],
      legend: {
        orient: 'vertical',
        right: 40,
        bottom: 4,
        type: 'scroll',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            show: true,
            formatter: (params: any) => {
              if (params.axisDimension == 'x' && params?.seriesData[params.axisIndex]) {
                if (chartQueryType == '1') {
                  return `${params.value}(${moment.weekdays(
                    moment(params?.seriesData[params.axisIndex]?.data?.date_format_str).day(),
                  )})`;
                } else {
                  return params.value;
                }
              }
              if (params.axisIndex == 3) {
                return accounting.toFixed(params.value, 0) + '%';
              } else if (params.axisIndex == 1) {
                return accounting.formatMoney(params.value);
              }
              return accounting.formatNumber(params.value, 0);
            },
          },
        },
        formatter: (params: any) => {
          const param = params[0];
          let paramsFilter = params;
          if (seriesIndexFocus.current > -1) {
            paramsFilter = params.filter(
              (item: any) => item.seriesIndex == seriesIndexFocus.current,
            );
          }
          const items: any[] = [`${param.axisValueLabel}`];
          paramsFilter.forEach((item: any) => {
            const dimensionName = item.dimensionNames[item.encode.y[0]];
            items.push(`<div>
                        <div style="display: flex; justify-content: space-between">
                            <div style="padding-right: 20px">${item.marker}${item.seriesName}</div>
                            ${formatValue(item.value[dimensionName], dimensionName)}
                        </div>
                      <div>`);
          });
          return items.join('');
        },
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        right: 6,
        top: 'center',
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false, title: '' },
          magicType: { show: true, type: ['line', 'bar', 'stack'] },
          saveAsImage: { show: true, title: '' },
        },
      },
      dataset: {
        dimensions: [
          'date_format_str',
          'purchases7d',
          'units_sold_clicks7d',
          'sales7d',
          'cost',
          'acos',
          'roas',
          'impressions',
          'clicks',
          'clicks_rate',
          'cpc',
          'cvr',
          'cpa',
        ],
        source: chartData,
      },
      xAxis: {
        type: 'category',
        axisLabel: {
          formatter: (value: string, index: number) => {
            if (chartQueryType == '1') {
              return `${value}(${moment.weekdays(
                moment(chartData[index]?.date_format_str).day(),
              )})`;
            } else {
              return value;
            }
          },
        },
        axisLine: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          position: 'left',
          offset: 130,
          axisLine: {
            show: true,
            lineStyle: {
              color: colors[0],
            },
          },
          axisTick: {
            show: true,
            lineStyle: {
              color: colors[0],
            },
          },
          splitLine: { show: false },
        },
        {
          type: 'value',
          position: 'left',
          offset: 65,
          axisLine: {
            show: true,
            lineStyle: {
              color: colors[1],
            },
          },
          axisTick: {
            show: true,
            lineStyle: {
              color: colors[1],
            },
          },
          splitLine: { show: false },
        },
        {
          type: 'value',
          position: 'left',
          offset: 0,
          axisLine: {
            show: true,
            lineStyle: {
              color: colors[2],
            },
          },
          axisTick: {
            show: true,
            lineStyle: {
              color: colors[2],
            },
          },
          splitLine: { show: false },
        },
        {
          type: 'value',
          position: 'right',
          axisLabel: { formatter: (value: number) => value + '%' },
          offset: 0,
          axisLine: {
            show: true,
            lineStyle: {
              color: colors[3],
            },
          },
          axisTick: {
            show: true,
            lineStyle: {
              color: colors[3],
            },
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '7天订单数',
          type: chartQueryType == '3' || chartData?.length < 2 ? 'bar' : 'line',
          showSymbol: false,
          emphasis: { focus: 'series' },
          yAxisIndex: 2,
          color: colors[2],
          id: 'purchases7d',
        },
        {
          name: '7天销量',
          type: chartQueryType == '3' || chartData?.length < 2 ? 'bar' : 'line',
          showSymbol: false,
          emphasis: { focus: 'series' },
          yAxisIndex: 2,
          color: colors[2],
          id: 'units_sold_clicks7d',
        },
        {
          name: '7天销售额',
          type: chartQueryType == '3' || chartData?.length < 2 ? 'bar' : 'line',
          showSymbol: false,
          emphasis: { focus: 'series' },
          yAxisIndex: 1,
          color: colors[1],
          id: 'sales7d',
        },
        {
          name: '花费',
          type: chartQueryType == '3' || chartData?.length < 2 ? 'bar' : 'line',
          showSymbol: false,
          emphasis: { focus: 'series' },
          yAxisIndex: 1,
          color: colors[1],
          id: 'cost',
        },
        {
          name: 'ACOS',
          type: chartQueryType == '3' || chartData?.length < 2 ? 'bar' : 'line',
          showSymbol: false,
          emphasis: { focus: 'series' },
          yAxisIndex: 3,
          color: colors[3],
          id: 'acos',
        },
        {
          name: 'ROAS',
          type: chartQueryType == '3' || chartData?.length < 2 ? 'bar' : 'line',
          showSymbol: false,
          emphasis: { focus: 'series' },
          yAxisIndex: 2,
          color: colors[2],
          id: 'roas',
        },
        {
          name: '展示量',
          type: chartQueryType == '3' || chartData?.length < 2 ? 'bar' : 'line',
          showSymbol: false,
          emphasis: { focus: 'series' },
          yAxisIndex: 0,
          color: colors[0],
          id: 'impressions',
        },
        {
          name: '点击量',
          type: chartQueryType == '3' || chartData?.length < 2 ? 'bar' : 'line',
          showSymbol: false,
          emphasis: { focus: 'series' },
          yAxisIndex: 2,
          color: colors[2],
          id: 'clicks',
        },
        {
          name: '点击率',
          type: chartQueryType == '3' || chartData?.length < 2 ? 'bar' : 'line',
          showSymbol: false,
          emphasis: { focus: 'series' },
          yAxisIndex: 3,
          color: colors[3],
          id: 'clicks_rate',
        },
        {
          name: 'CPC',
          type: chartQueryType == '3' || chartData?.length < 2 ? 'bar' : 'line',
          showSymbol: false,
          emphasis: { focus: 'series' },
          yAxisIndex: 1,
          color: colors[1],
          id: 'cpc',
        },
        {
          name: 'CVR',
          type: chartQueryType == '3' || chartData?.length < 2 ? 'bar' : 'line',
          showSymbol: false,
          emphasis: { focus: 'series' },
          yAxisIndex: 3,
          color: colors[3],
          id: 'cvr',
        },
        {
          name: 'CPA',
          type: chartQueryType == '3' || chartData?.length < 2 ? 'bar' : 'line',
          showSymbol: false,
          emphasis: { focus: 'series' },
          yAxisIndex: 1,
          color: colors[1],
          id: 'cpa',
        },
      ],
    };
    if (columnsState && showChart) {
      const mySeries: any = temp.series
        // @ts-ignore
        ?.map((item: any) => {
          let order = 0;
          const matched = columnsState.find((column: any, i: number) => {
            order = i;
            return column.dataIndex == item.id;
          });
          if (matched) {
            return { ...item, order, show: matched.show };
          }
          return item;
        })
        .filter((item: any) => item.show);
      const mySeriesOrder = orderBy(mySeries, 'order');
      // @ts-ignore
      temp.dataset.dimensions = [{ id: 'date_format_str' }, ...mySeriesOrder].map(
        (item) => item.id,
      );
      temp.series = mySeriesOrder;
    }
    return temp;
  }, [columnsState, chartData, chartQueryType]);
  const fetchChart = async (params = {}) => {
    loadingChartSet(true);
    const res = await api.amazonAdsChart({ ...params, date_format_type: chartQueryType });
    loadingChartSet(false);
    if (res?.code == pubConfig.sCode) {
      chartDataSet(res.data);
    } else {
      pubMsg(res.message);
      chartDataSet([]);
    }
  };
  useEffect(() => {
    if (chart) {
      chart.setOption(option, true);
      chart.resize();
    } else {
      if (chart) chart?.clear();
      const container = document.getElementById('chartContainer');
      if (container) {
        const myChart = echarts.init(container as HTMLElement);
        myChart.setOption(option);
        myChart.on('mouseover', 'series', (e: any) => {
          seriesIndexFocus.current = e.seriesIndex;
        });
        myChart.on('downplay', 'series', () => {
          seriesIndexFocus.current = -1;
        });
        chartSet(myChart);
        window.onresize = () => {
          if (myChart && showChart) myChart.resize();
        };
      }
    }
  }, [option]);
  return (
    <PageContainer
      header={{ title: false, breadcrumb: {} }}
      className="pubPageTabs page-adAdmin-amazon"
      tabList={tabList}
      tabActiveKey={tabActiveKey}
      onTabChange={(val) => {
        if (loadingChart || window.isLoadingData) return;
        formRef.current?.setFieldsValue({
          name: [],
          portfolio_name: [],
          campaign_name: [],
          adgroup_name: [],
          keyword_text: '',
          match_type: [],
          targeting_type: '', // 投放方式
          portfolio_state: ['portfolios'].includes(val) ? ['enabled', 'paused'] : [],
          campaign_state: ['campaigns'].includes(val) ? ['ENABLED', 'PAUSED'] : [],
          adgroup_state: ['adgroups'].includes(val) ? ['ENABLED', 'PAUSED'] : [],
          keyword_state: ['keywords'].includes(val) ? ['ENABLED', 'PAUSED'] : [],
          productad_state: ['productads'].includes(val) ? ['ENABLED', 'PAUSED'] : [],
          producttargeting_state: ['producttargeting'].includes(val) ? ['ENABLED', 'PAUSED'] : [],
        });
        tabActiveKeySet(val);
        formRef.current?.submit();
      }}
    >
      <ProTable
        tableExtraRender={() => (
          <Card
            bordered={false}
            size={'small'}
            className={'mb-3'}
            bodyStyle={{ padding: 0 }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Radio.Group
                  disabled={loadingChart}
                  onChange={(e: any) => {
                    chartDataSet([]);
                    chartQueryTypeSet(e.target.value);
                  }}
                  value={chartQueryType}
                >
                  <Radio value={'1'}>日</Radio>
                  <Radio value={'2'}>周</Radio>
                  <Radio value={'3'}>月</Radio>
                </Radio.Group>
                <Space>
                  <Button
                    size={'small'}
                    type={'text'}
                    onClick={() => {
                      showChartSet(!showChart);
                      setTimeout(() => {
                        if (chart) chart.resize();
                      }, 0);
                    }}
                    icon={showChart ? <OrderedListOutlined /> : <LineChartOutlined />}
                  >
                    {showChart ? '表格' : '图形'}
                  </Button>
                  <CustomColumns
                    columnsData={columnsChart}
                    menuKey={tabActiveKey}
                    onChange={(val: any) => {
                      columnsStateSet(val);
                    }}
                  />
                </Space>
              </div>
            }
          >
            <Spin spinning={loadingChart}>
              <div
                id={'chartContainer'}
                style={{
                  width: 'calc(100% - 6px)',
                  height: 260,
                  display: showChart ? 'block' : 'none',
                }}
              ></div>
            </Spin>
            <ProTable
              style={{ display: showChart ? 'none' : 'block', opacity: showChart ? 0 : 1 }}
              search={false}
              pagination={{ defaultPageSize: 10 }}
              options={false}
              defaultSize={'small'}
              rowKey={'date_format_str'}
              dataSource={chartData}
              columns={columnsChartFormat}
              scroll={{ x: 1200 }}
              cardProps={{ bodyStyle: { padding: 0 } }}
            />
          </Card>
        )}
        rowKey={(record: any) => record.id}
        bordered
        tableStyle={{ minHeight: 200 }}
        className={'has-fix-summary'}
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        pagination={{ defaultPageSize: 10 }}
        params={{ date_format_type: chartQueryType }}
        request={async (params, sort) => {
          const paramsData: any = {
            current_page: params.current,
            page_size: params.pageSize,
            ads_sub_type: tabActiveKey,
            ...params,
          };
          const sortKeys = Object.keys(sort);
          if (sortKeys.length) {
            paramsData.orderItems = [
              {
                column: sortKeys[0],
                asc: sort[sortKeys[0]] == 'ascend',
              },
            ];
          }
          // 获取图表
          fetchChart(paramsData);
          // 获取合并统计
          api.amazonAdsPageSummary(paramsData).then((resSummary) => {
            if (resSummary?.code == pubConfig.sCode) {
              summaryDataSet(resSummary.data);
            }
          });
          window.isLoadingData = true;
          const res = await api.amazonAdsPage(paramsData);
          window.isLoadingData = false;
          if (res?.code == pubConfig.sCode) {
            return {
              success: true,
              data: res.data?.records || [],
              total: res.data.total,
            };
          } else {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
        }}
        dateFormatter="string"
        toolBarRender={() => [<Space key={'tools'}></Space>]}
        {...ColumnSet}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        showSorterTooltip={false}
        search={{
          defaultCollapsed: false,
          className: 'light-search-form action-btn-flow',
          labelWidth: 88,
          // collapseRender: () => null,
          optionRender: (searchConfig, formProps, dom) => {
            return [
              <CustomSearch
                handleSearch={(val: any) => {
                  const queryData = {
                    ...val,
                    adgroup_name: val.adgroup_id,
                    [['campaigns'].includes(tabActiveKey) ? 'name' : 'campaign_name']:
                      val.campaign_id,
                    [['portfolios'].includes(tabActiveKey) ? 'name' : 'portfolio_name']:
                      val.portfolio_id,
                    date: [val.dateRangeType, [moment(val.start_date), moment(val.end_date)]],
                  };
                  formRef.current?.setFieldsValue(queryData);
                  formRef.current?.submit();
                }}
                // @ts-ignore
                config={formRef.current?.getFieldsFormatValue(true)}
                country_code={formRef.current?.getFieldValue('shop_name')[0]}
                ads_sub_type={tabActiveKey}
                key={'customSearch'}
              />,
              ...dom,
            ];
          },
        }}
        /*rowSelection={{
          fixed: 'left',
          selectedRowKeys,
          onChange: selectedRowKeysSet,
        }}*/
        summary={() => {
          const colSpan = ['productads'].includes(tabActiveKey) ? 3 : 2;
          // console.log(columnsStatePageTable, 'columnsStatePageTable')
          return (
            <Table.Summary fixed="top">
              <Table.Summary.Row style={{ fontWeight: 'bold' }}>
                <Table.Summary.Cell index={0} colSpan={colSpan} align="center">
                  总计
                </Table.Summary.Cell>
                {columnsStatePageTable
                  .filter((item) => !item.hasOwnProperty('hideInTable') || !item.hideInTable)
                  .map((item: any, index: number) => {
                    const isPercent = ['acos', 'cvr', 'clicks_rate'].includes(item.dataIndex);
                    const isMoney = [
                      'acos',
                      'bid',
                      'default_bid',
                      'cost',
                      'sales1d',
                      'sales7d',
                      'sales14d',
                      'sales30d',
                      'cpc',
                      'cpa',
                    ].includes(item.dataIndex);
                    return (
                      <Table.Summary.Cell index={index + colSpan} key={index}>
                        {/*竞价不需要展示*/}
                        {typeof summaryData[item.dataIndex] == 'number' &&
                        item.dataIndex != 'default_bid' &&
                        item.dataIndex != 'bid' ? (
                          <div title={item.title}>
                            <Field
                              text={summaryData[item.dataIndex]}
                              valueType={
                                isPercent
                                  ? 'percent'
                                  : isMoney
                                  ? { type: 'money', locale: 'en-US' }
                                  : 'digit'
                              }
                              mode={'read'}
                              plain={true}
                            />
                          </div>
                        ) : (
                          ''
                        )}
                      </Table.Summary.Cell>
                    );
                  })}
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

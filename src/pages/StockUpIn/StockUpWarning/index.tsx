import { PageContainer } from '@ant-design/pro-layout';
import { connect, useAccess } from 'umi';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BetaSchemaForm, ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { Button, Card, Tooltip } from 'antd';
import { exportExcel, getList } from '@/services/pages/stockUpIn/stockUpWarning';
import { flatData } from '@/utils/filter';
import ProductLine from '@/components/PubForm/ProductLine';
import WarningSearch from './components/WarningSearch';
import UndeliveredNumDetails from './components/UndeliveredNumDetails';
import useTip from './useTip';
import { QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import './index.less';
import moment from 'moment';
import WeekNum from './components/WeekNum';
import PubWeekRender from '@/components/PubWeekRender';
import InTransitPMC from './components/InTransitPMC';
import ReservedNum from './components/ReservedNum';
import StockNum from './components/StockNum';
import VirtualTable from './components/VirtualTableFixed';
import CustomColumnSet from '@/components/CustomColumnSet';
import { history } from 'umi';
// @ts-ignore
import accounting from 'accounting';
import DateRangeComp from './components/DateRangeComp';
import MarkDetails from './components/MarkDetails';

const Page = (props: any) => {
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const tableRef: any = useRef(null);
  const [exportForm, setExportForm] = useState<any>({});
  const [selectedRecord, selectedRecordSet] = useState<any>({});
  const [openUndeliveredNumDetails, openUndeliveredNumDetailsSet] = useState(false);
  const [openWeekNum, openWeekNumSet] = useState(false);
  const [openInTransitPMC, openInTransitPMCSet] = useState(false);
  const [openReserved, openReservedSet] = useState(false);
  const [openStock, openStockSet] = useState(false);
  const [openMark, openMarkSet] = useState(false);
  const access = useAccess();
  const { tipObj } = useTip();
  const [customColumns, customColumnsSet] = useState<React.Key[] | null>(null);
  const [customExportConfig, customExportConfigSet] = useState<any>({});
  const [loading, loadingSet] = useState<boolean>(false);
  const [dataSource, dataSourceSet] = useState<any[]>([]);
  const [downLoading, downLoadingSet] = useState(false);
  const getScrollY = () => {
    const documentClientHeight = document.body?.clientHeight - 327;
    return documentClientHeight && documentClientHeight > 300 ? documentClientHeight : 610; // 表格默认高度
  };
  let allData: any = []
  const defaultScrollY = getScrollY();
  const [scrollY, scrollYSet] = useState<number>(defaultScrollY);
  const [refreshColumns, refreshColumnsSet] = useState<number>(0);
  const [sortList, sortListSet] = useState({code: "SAFE_DAYS", asc: false});
  const weekC = Number(moment().format('WW'));
  const curYear = new Date().getFullYear();
  // 当前周
  const cycleTimeC = `${curYear}-${weekC}周`;
  const types = () => [
    {
      name: '周销量',
      key: 'week_safe_num',
    },
    {
      name: '在途数量（PMC）',
      key: 'way_planed_send_num',
    },
    {
      name: '预留数量',
      key: 'total_reserved_num',
    },
    {
      name: '库存数量',
      key: 'inventory_num',
      editable: true,
    },
    {
      name: '周转天数',
      key: 'turnover_days',
      editable: true,
    },
  ];
  // 数据转换
  const getNewData = (key: any, dataC: any) => {
    const newData: any = {};
    dataC?.forEach((element: any) => {
      newData[`${element.cycle_time}`] =
        typeof element[key] == 'number' ? element[key] : element[key] ?? null;
    });
    return newData;
  };
  useEffect(() => {
    formRef?.current?.submit();
  }, []);

  const initData: any = useMemo(
    () => [
      {
        title: '款式名称',
        dataIndex: 'sku_name',
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        fixed: 'left',
        sorter: true,
        width: 120,
      },
      {
        title: '店铺SKU',
        dataIndex: 'shop_sku',
        align: 'center',
        width: 120,
        fixed: 'left',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        sorter: true,
        render: (_: any, record: any) => {
          const stock_up_advice_code = record?.details?.filter(
            (v: any) => cycleTimeC == v.cycle_time,
          )?.[0]?.stock_up_advice_code;
          return access.canSee('suggestList_detail') ? (
            <a
              onClick={() => {
                if (!stock_up_advice_code) {
                  pubMsg('该店铺SKU没有生成备货建议', 'warning');
                } else {
                  history.push(
                    `/stock-up-in/stockUp/suggest-detail?code=${stock_up_advice_code}
                  `,
                  );
                }
              }}
              key="suggest"
            >
              {record?.shop_sku ?? '-'}
            </a>
          ) : (
            record?.shop_sku ?? '-'
          );
        },
      },
      {
        title: '链接名称',
        dataIndex: 'link_name',
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        sorter: true,
        width: 100,
      },
      {
        title: '店铺',
        dataIndex: 'shop_name',
        order: 10,
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        render: (_: any, record: any) => record?.shop_name || '-',
        hideInSearch: true,
        sorter: true,
        width: 100,
      },
      {
        title: '产品线',
        dataIndex: 'category_name',
        order: 10,
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        renderFormItem: (_, rest, form) => {
          return (
            <ProductLine
              defaultValue="IN"
              back={(v: any) => {
                form.setFieldsValue({ category_name: v });
              }}
            />
          );
        },
        search: {
          transform(value) {
            return {
              category_ids: value?.[1] ? value?.[1]?.split(',') : [],
            };
          },
        },
        sorter: true,
        width: 100,
        render: (_: any, record: any) => record?.category_name ?? '-',
      },
      {
        title: (
          <>
            款式生命
            <br />
            周期
          </>
        ),
        align: 'center',
        dataIndex: 'life_cycle_name',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        hideInSearch: true,
        sorter: true,
        width: 100,
      },
      {
        title: '销售状态',
        dataIndex: 'sales_status',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        hideInSearch: true,
        sorter: true,
        align: 'center',
        width: 100,
        render: (_: any, record: any) => record.sales_status_name ?? '-',
      },

      {
        title: '时间段（销量）',
        dataIndex: 'dateTimes',
        align: 'center',
        hideInTable: true,
        sorter: true,
        initialValue: [moment().add(-1, 'week'), moment().add(-1, 'day')],
        renderFormItem: () => (
          <DateRangeComp
            initialValue={[moment().add(-1, 'week'), moment().add(-1, 'day')]}
            disabledDateEnd={moment().add(-1, 'day')}
            allowClear={false}
          />
        ),
      },
      {
        title: (
          <>
            未交货数量
            <br />
            (PMC)
            <Tooltip
              placement="top"
              title={
                <>
                  <div>
                    一，未交货数量（PMC）是在PMC角度的定义，包含PMC采购计划已经审核通过到供应商交货给物流之前但未计划发货的数量，具体如下：
                  </div>
                  <div>（1）采购计划审核通过未下单数量；</div>
                  <div>（2）采购计划审核通过下单中的数量，即已创建采购单但是供应商还未签约；</div>
                  <div>
                    （3）采购计划审核通过采购单已经签约的数量，减去已经计划发货单没有占用采购单供应商未交货数量；
                  </div>
                  <div>二,</div>
                  <div>（1）未交货数量（PMC）=已计划未签约数量+在制数量</div>
                  <div>（2）已计划未签约数量=已计划未下单数量+已计划下单中数量</div>
                  <div>（3）在制数量=未交货数量（采购）-已计划发货数量</div>
                  <div>（4）已计划发货数量=发货计划未建入库单数量+入库单待发货数量</div>
                  <div>
                    （5）入库单待发货数量即已建入库单，但供应商没有确认发货之前的数量，包括入库单新建、已同步（待放舱）、已放舱、已通知发货、撤回中、已撤回六个状态入库单数量；
                  </div>
                </>
              }
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'no_deal_pmc_num',
        align: 'center',
        width: 100,
        hideInSearch: true,
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        sorter: true,
        valueType: 'digit',
        render: (text, record: any) => (
          <a
            onClick={() => {
              selectedRecordSet({
                ...record,
                params: {
                  shop_id: record.shop_id,
                  shop_sku: record.shop_sku,
                },
              });
              openUndeliveredNumDetailsSet(true);
            }}
          >
            {accounting.formatNumber(record.no_deal_pmc_num)}
          </a>
        ),
      },
      {
        title: (
          <>
            可售库存
            <Tooltip
              placement="top"
              title={
                <>
                  <div>该店铺SKU在平台店铺的可售库存；</div>
                  <div>接口获取的可售库存，查看供应链系统跨境备货管理库存报表库存可售库存；</div>
                </>
              }
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        align: 'center',
        dataIndex: 'fulfillable_num',
        hideInSearch: true,
        width: 100,
        valueType: 'digit',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        sorter: true,
      },
      {
        title: (
          <>
            日均销量
            <Tooltip
              placement="top"
              title={
                <>
                  <div>
                    一，根据筛选条件时间段，汇总该店铺SKU的销量除以筛选时间段实际天数得出日均销量；
                  </div>
                  <div>例如：今天是2022年11月9日，</div>
                  <div>如果选择的时间是 6、7、8号，则是三天的平均销量；</div>
                  <div>如果选择的时间是7、8、9好，则是</div>
                  <div>两天的平均销量；</div>
                  <div>因为当天的销量获取不到；</div>
                  <div>二，</div>
                  <div>销量，遇到小数点，向上取整</div>
                  <div>天数，遇到小数点，向下取整</div>
                  <div>日均销量小于0.5，则置为0</div>
                  <div>三，</div>
                  <div>销量统计逻辑判断</div>
                  <div>（1）在库库存为0 销量为0，这种场景，不纳入平均销量统计；</div>
                  <div>
                    （2）在库库存不为0 销量为0 ，即使是没有销量，这种场景，正常纳入平均销量统计；
                  </div>
                </>
              }
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        align: 'center',
        dataIndex: 'today_avg_sales_num',
        hideInSearch: true,
        width: 100,
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        sorter: true,
        valueType: 'digit',
      },
      {
        title: (
          <>
            库存可售天数
            <Tooltip
              placement="top"
              title={
                <>
                  <div>
                    一，根据筛选条件时间段，该店铺SKU可售库存，除以该店铺SKU对应日均销量，得到可售天数；
                  </div>
                  <div>
                    二，库存可售天数 =可售库存 ➗ 日均销量 =1.1 或者 1.5
                    或者1.9，都向下取整，可用天数为1天；
                  </div>
                </>
              }
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        align: 'center',
        dataIndex: 'safe_days',
        hideInSearch: true,
        width: 100,
        onCell: ({ rowSpan1, day }) => ({
          rowSpan: rowSpan1,
          className:
            typeof day == 'number' && day < 21
              ? 'bg-red'
              : typeof day == 'number' && day > 60
              ? 'bg-yellow'
              : '',
        }),
        sorter: true,
        defaultSortOrder: 'descend', //ascend | descend
      },
      {
        title: '预警查询',
        dataIndex: 'timeRange',
        hideInTable: true,
        renderFormItem: () => <WarningSearch />,
      },
    ],
    [common],
  );
  const [columns, setColumns] = useState<any>(initData);
  const [columnsFormat, columnsFormatSet] = useState<any>(
    columns.filter((item: any) => !(item.hideInTable || !customColumns?.includes(item.dataIndex))),
  );

  useEffect(() => {
    if (customColumns) {
      if (customColumns.length) {
        columnsFormatSet(
          columns.filter(
            (item: any) => !(item.hideInTable || !customColumns.includes(item.dataIndex)),
          ),
        );
      } else {
        columnsFormatSet([]);
      }
      return;
    }
    columnsFormatSet(columns);
  }, [customColumns, columns]);
  const handleColumns = (other?: any) => {
    const dataC = other ? [...initData, ...other] : initData;
    setColumns(() => {
      return dataC;
    });
    if (customColumns) {
      if (customColumns.length) {
        columnsFormatSet(
          dataC.filter(
            (item: any) => !(item.hideInTable || !customColumns.includes(item.dataIndex)),
          ),
        );
      } else {
        columnsFormatSet([]);
      }
    }
    columnsFormatSet(dataC);
  };
  const initColumnsAction = (res: any) => {
    const other: any = [];
    let cIndex: any = null;
    [{ title: '明细', key: 'type' }, ...res?.data?.records?.[0]?.details]?.forEach(
      (v: any, i: number) => {
        if (v.cycle_time == cycleTimeC) {
          cIndex = i;
        }
        const obj = {
          title: (
            <>
              {i == 0 ? (
                v.title
              ) : (
                <>
                  <PubWeekRender
                    option={{
                      cycle_time: v.cycle_time,
                      begin: v.cycle_time_begin,
                      end: v.cycle_time_end,
                      color: true,
                    }}
                  />
                  {cycleTimeC == v.cycle_time && (
                    <Tooltip
                      placement="top"
                      title={
                        <>
                          <div>1，当前时间属于全年第几周（自然周）；</div>
                          <div>2，后面按第一周依次类推后面十二周的自然周展示具体数据明细；</div>
                          <div>3，前面按第一周依次类推显示前面三周的历史销量、库存、周转天数；</div>
                          <div>4，总共展示16周；</div>
                          <div>
                            5，随着时间向前推进，报表周数同步向前滚动，统计的数据也向前滚动统计；
                          </div>
                        </>
                      }
                    >
                      <span
                        style={{
                          cursor: 'pointer',
                          position: 'absolute',
                          top: '8px',
                          right: '5px',
                        }}
                      >
                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                      </span>
                    </Tooltip>
                  )}
                </>
              )}
            </>
          ),
          dataIndex: i == 0 ? v.key : v.cycle_time,
          align: 'center',
          hideInSearch: true,
          width: 100,
          dynamicColumn: true,
          onHeaderCell: () => {
            return {
              className: cycleTimeC == v.cycle_time ? 'title-bg-blue' : '',
            };
          },
          render: (_: any, record: any) => {
            return i == 0 ? (
              <>
                {record.type == '在途数量（PMC）' ? (
                  <>
                    在途数量
                    <br />
                    （PMC）
                  </>
                ) : (
                  record.type
                )}
                <Tooltip placement="top" title={tipObj[record.type]}>
                  <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                </Tooltip>
              </>
            ) : (
              <>
                {record.type === '周销量' ? (
                  cIndex <= i ? (
                    <a
                      style={
                        typeof record[v.cycle_time] == 'number' ? undefined : { padding: '0 10px' }
                      }
                      onClick={() => {
                        if (typeof record[v.cycle_time] == 'number') {
                          selectedRecordSet({
                            ...record,
                            cycleTimeC,
                            params: {
                              cycle_time: cIndex >= i ? v.cycle_time : cycleTimeC,
                              shop_id: record.shop_id,
                              shop_sku: record.shop_sku,
                            },
                          });

                          openWeekNumSet(true);
                        } else {
                          pubMsg('无数据', 'warning');
                        }
                      }}
                    >
                      {typeof record[v.cycle_time] == 'number'
                        ? accounting.formatNumber(record[v.cycle_time])
                        : record[v.cycle_time] ?? '-'}
                    </a>
                  ) : (
                    <span>
                      {typeof record[v.cycle_time] == 'number'
                        ? accounting.formatNumber(record[v.cycle_time])
                        : record[v.cycle_time] ?? '-'}
                    </span>
                  )
                ) : (
                  ''
                )}
                {record.type === '在途数量（PMC）' ? (
                  cIndex <= i ? (
                    <a
                      onClick={() => {
                        selectedRecordSet({
                          ...record,
                          isWeekC: cIndex == i,
                          params: {
                            cycle_time: v.cycle_time,
                            cycle_time_begin: v.cycle_time_begin,
                            cycle_time_end: v.cycle_time_end,
                            timeRangeC: `${v?.cycle_time} (${moment(v?.cycle_time_begin).format(
                              'MM.DD',
                            )}-${moment(v?.cycle_time_end).format('MM.DD')})`,
                            shop_id: record.shop_id,
                            shop_sku: record.shop_sku,
                          },
                        });
                        openInTransitPMCSet(true);
                      }}
                    >
                      {accounting.formatNumber(record[v.cycle_time])}
                    </a>
                  ) : (
                    <span>{accounting.formatNumber(record[v.cycle_time])}</span>
                  )
                ) : (
                  ''
                )}
                {record.type === '预留数量' ? (
                  cIndex < i ? (
                    <a
                      onClick={() => {
                        selectedRecordSet({
                          ...record,
                          params: {
                            cycle_time: v.cycle_time,
                            cycle_time_begin: v.cycle_time_begin,
                            cycle_time_end: v.cycle_time_end,
                            timeRangeC: `${v?.cycle_time} (${moment(v?.cycle_time_begin).format(
                              'MM.DD',
                            )}-${moment(v?.cycle_time_end).format('MM.DD')})`,
                            shop_id: record.shop_id,
                            shop_sku: record.shop_sku,
                          },
                        });
                        openReservedSet(true);
                      }}
                    >
                      {accounting.formatNumber(record[v.cycle_time])}
                    </a>
                  ) : (
                    <span>{accounting.formatNumber(record[v.cycle_time])}</span>
                  )
                ) : (
                  ''
                )}
                {record.type === '库存数量' ? (
                  cIndex < i ? (
                    <a
                      onClick={() => {
                        selectedRecordSet({
                          ...record,
                          preNum: record[res?.data?.records?.[0]?.details[i - 2].cycle_time],
                          weekNum: record?.details?.filter(
                            (c: any) => v.cycle_time == c.cycle_time,
                          )?.[0]?.week_safe_num,
                          params: {
                            cycle_time: v.cycle_time,
                            cycle_time_begin: v.cycle_time_begin,
                            cycle_time_end: v.cycle_time_end,
                            timeRangeC: `${v?.cycle_time} (${moment(v?.cycle_time_begin).format(
                              'MM.DD',
                            )}-${moment(v?.cycle_time_end).format('MM.DD')})`,
                            shop_id: record.shop_id,
                            shop_sku: record.shop_sku,
                          },
                        });
                        openStockSet(true);
                      }}
                    >
                      {accounting.formatNumber(record[v.cycle_time])}
                    </a>
                  ) : (
                    <span>{accounting.formatNumber(record[v.cycle_time])}</span>
                  )
                ) : (
                  ''
                )}
                {record.type === '周转天数' ?
                (record[v.cycle_time] || record[v.cycle_time] == 0) ? (
                  <a
                    onClick={() => {
                      selectedRecordSet({
                        ...record,
                        params: {
                          cycle_time: v.cycle_time,
                          shop_id: record.shop_id,
                          shop_sku_code: record.shop_sku,
                          timeRangeC: `${v?.cycle_time} (${moment(v?.cycle_time_begin).format(
                            'MM.DD',
                          )}-${moment(v?.cycle_time_end).format('MM.DD')})`,
                          sku_name: record.sku_name,
                          shop_sku: record.shop_sku,
                        },
                      });
                      openMarkSet(true);
                    }}
                  >
                    {typeof record[v.cycle_time] == 'number'
                      ? accounting.formatNumber(record[v.cycle_time])
                      : record[v.cycle_time] ?? '-'}
                  </a>
                ) : (
                  <a
                    style={{padding: '10px'}}
                    onClick={() => {
                      selectedRecordSet({
                        ...record,
                        params: {
                          cycle_time: v.cycle_time,
                          shop_id: record.shop_id,
                          shop_sku_code: record.shop_sku,
                          timeRangeC: `${v?.cycle_time} (${moment(v?.cycle_time_begin).format(
                            'MM.DD',
                          )}-${moment(v?.cycle_time_end).format('MM.DD')})`,
                          sku_name: record.sku_name,
                          shop_sku: record.shop_sku,
                        },
                      });
                      openMarkSet(true);
                    }}
                  >
                    -
                  </a>
                ) : ''}
              </>
            );
          },
        };
        other.push(obj);
      },
    );
    handleColumns(other);
  };
  const start = moment().startOf('isoWeek').format('YYYY-MM-DD');
  const end = moment()
    .add(+12, 'week')
    .endOf('isoWeek')
    .format('YYYY-MM-DD');
  const getAction = async (params: any) => {
    if(params.current == 1){
      loadingSet(true);
    }
    const postData = {
      ...params,
      ...sortList,
      dateTimes: [
        moment(params?.dateTimes?.[0]).format('YYYY-MM-DD'),
        moment(params?.dateTimes?.[1]).format('YYYY-MM-DD'),
      ],
      category_ids: params?.category_name?.[1] ? params?.category_name?.[1]?.split(',') : [],
      current_page: params?.current,
      page_size: params?.pageSize,
      dates: [params?.timeRange?.dates?.[0] ?? start, params?.timeRange?.dates?.[1] ?? end],
      days: params?.timeRange?.days && params?.timeRange?.days?.split('-'),
    };
    delete postData.category_name;
    delete postData.timeRange;
    setExportForm(postData);
    const res = await getList(postData);
    loadingSet(false);
    if (res?.code !== pubConfig.sCode) {
      pubMsg(res?.message);
      return {
        success: false,
        data: [],
        total: 0,
      };
    }
    let dataFlat: any[] = [];
    if (res?.data?.records?.length) {
      initColumnsAction(res);
      const dataC: any = res?.data?.records;
      const newData = dataC.map((item: any,index: number) => {
        const newDetails = types().map((v: any) => {
          return {
            type: v.name,
            ...getNewData(v?.key, item?.details || []),
          };
        });
        item.newDetails = newDetails;
        if(index == dataC.length - 1) {
          item.lastRow = true
        }
        return item;
      });
      dataFlat = flatData(newData, 'newDetails');
    } else {
      if(params.current == 1){
        handleColumns();
      }
    }
    // paginationSet({
    //   ...pagination,
    //   current: res?.data.current_page,
    //   total: res?.data?.total || 0,
    // });
    const newSource= params.current == 1? dataFlat : allData.concat(dataFlat)
    dataSourceSet(newSource);
    allData = newSource
    refreshColumnsSet(Date.now());
    if(params.current * params.pageSize < res.data.total){
      const newPra = JSON.parse(JSON.stringify(params))
      newPra.current = (params.current + 1);
      getAction(newPra)
    }
    return true;
  };
  // 导出
  const exportAction = async () => {
    downLoadingSet(true);
    const res: any = await exportExcel({
      ...exportForm,
      current_page: 1,
      page_size: 999999,
      export_config: {
        column: JSON.stringify(customExportConfig),
      },
    });
    const type = res.response.headers.get('content-type');
    if (type.indexOf('application/json') > -1) {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `IN备货库存预警报表.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
    downLoadingSet(false);
  };
  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        {/*搜索条件*/}
        <BetaSchemaForm
          formRef={formRef}
          layoutType={'QueryFilter'}
          columns={columns.filter((c) => !(c.hideInSearch || c.search === false)) as any}
          className={'light-search-form'}
          style={{ padding: '10px 10px 0 10px', marginBottom: 10, background: '#fff' }}
          labelWidth={94}
          onFinish={async (values: any, sort) => {
            try {
              const postData = {
                ...values,
                current: 1,
                pageSize: 999,
                sortList,
              };
              setExportForm(postData);
              getAction(postData);
            } catch (e) {
              console.log(e, sort, 222);
            }
          }}
          onReset={() => formRef?.current?.submit()}
          submitter={{
            submitButtonProps: {
              loading,
            },
          }}
          autoFocusFirstInput={false}
          defaultCollapsed={false}
          onCollapse={() => {
            tableRef?.current?.reset();
          }}
        />
        {/*虚拟表格*/}

        <Card size={'small'} className="warning">
          <VirtualTable
            rowClassName="stripe"
            title={() => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div>
                  {access.canSee('scm_stockUpWarning_export') ? (
                    <Button
                      type="primary"
                      loading={downLoading}
                      onClick={() => {
                        exportAction();
                      }}
                    >
                      导出
                    </Button>
                  ) : (
                    <></>
                  )}
                  <Button
                    className={'ml-2'}
                    type={'text'}
                    icon={<ReloadOutlined />}
                    onClick={() => formRef?.current?.submit()}
                  />
                  <CustomColumnSet
                    defaultHideColumn={['shop_name']}
                    columns={columns}
                    customColumnsSet={customColumnsSet}
                    customExportConfigSet={customExportConfigSet}
                    refreshColumns={refreshColumns}
                    customClassName="warning-pop"
                  />
                </div>
              </div>
            )}
            size={'small'}
            overscanCount={6}
            loading={loading}
            rowKey={(record: any) => record.shop_id + record.shop_sku}
            bordered
            columns={columnsFormat as any}
            normalColumns={columnsFormat.filter((v: any) => !v.dynamicColumn)}
            dataSource={dataSource || []}
            pagination={false}
            scroll={{ y: scrollY + 12 }}
            scrollYSet={scrollYSet}
            scrollY={scrollY}
            onChange={(pagination, filters, sorter: any) => {
              if (sorter.order) {
                sortListSet({ code: sorter.field.toUpperCase(), asc: sorter.order == 'ascend' });
              } else {
                sortListSet({});
              }

              formRef.current?.submit();
            }}
          />
        </Card>
        {/*未交货数量PMC*/}
        <UndeliveredNumDetails
          data={selectedRecord}
          dicList={common?.dicList}
          open={openUndeliveredNumDetails}
          openSet={openUndeliveredNumDetailsSet}
        />
        {/* 周销量 */}
        <WeekNum data={selectedRecord} open={openWeekNum} openSet={openWeekNumSet} />
        {/* 在途数量（PMC） */}
        <InTransitPMC
          data={selectedRecord}
          open={openInTransitPMC}
          openSet={openInTransitPMCSet}
          dicList={common?.dicList}
        />
        {/* 预留数量 */}
        <ReservedNum
          data={selectedRecord}
          open={openReserved}
          openSet={openReservedSet}
          dicList={common?.dicList}
        />
        {/* 在库数量 */}
        <StockNum
          data={selectedRecord}
          open={openStock}
          openSet={openStockSet}
          dicList={common?.dicList}
        />
        <MarkDetails data={selectedRecord} open={openMark} openSet={openMarkSet} />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

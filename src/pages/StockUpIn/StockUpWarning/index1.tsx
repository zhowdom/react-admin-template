import { PageContainer } from '@ant-design/pro-layout';
import { connect, useAccess } from 'umi';
import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { Button, Pagination, Space, Tooltip } from 'antd';
import { getList, exportExcel } from '@/services/pages/stockUpIn/stockUpWarning';
import { flatData } from '@/utils/filter';
import ProductLine from '@/components/PubForm/ProductLine';
import WarningSearch from './components/WarningSearch';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import UndeliveredNumDetails from './components/UndeliveredNumDetails';
import useTip from './useTip';
import { QuestionCircleOutlined } from '@ant-design/icons';
import './index.less';
import moment from 'moment';
import WeekNum from './components/WeekNum';
import PubWeekRender from '@/components/PubWeekRender';
import InTransitPMC from './components/InTransitPMC';
import ReservedNum from './components/ReservedNum';
import StockNum from './components/StockNum';

const Page = (props: any) => {
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const [pagination, paginationSet] = useState({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [exportForm, setExportForm] = useState<any>({});
  const [selectedRecord, selectedRecordSet] = useState<any>({});
  const [openUndeliveredNumDetails, openUndeliveredNumDetailsSet] = useState(false);
  const [openWeekNum, openWeekNumSet] = useState(false);
  const [openInTransitPMC, openInTransitPMCSet] = useState(false);
  const [openReserved, openReservedSet] = useState(false);
  const [openStock, openStockSet] = useState(false);
  const [downLoading, downLoadingSet] = useState(false);
  const [tableData, tableDataSet] = useState<any>([]);
  const [cIndex, cIndexSet] = useState<any>();
  const access = useAccess();
  const { tipObj } = useTip();
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
      newData[`${element.cycle_time}`] = element[key] || 0;
    });
    return newData;
  };
  // 获取表格数据
  const getListAction = async (params: any, sort: any): Promise<any> => {
    const sortList: any = {};
    Object.keys(sort).forEach((key: any) => {
      sortList.code = key.toUpperCase();
      sortList.asc = sort[key] == 'ascend' ? true : false;
    });
    const postData = {
      ...params,
      ...sortList,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    setExportForm(postData);
    const res = await getList(postData);
    if (res?.code !== pubConfig.sCode) {
      tableDataSet([]);
      pubMsg(res?.message);
      return {
        success: false,
        data: [],
        total: 0,
      };
    }
    tableDataSet(res?.data?.records || []);
    let dataFlat: any[] = [];
    if (res?.data?.records?.length) {
      const dataC: any = res?.data?.records;
      const newData = dataC.map((item: any) => {
        const newDetails = types().map((v: any) => {
          return {
            type: v.name,
            ...getNewData(v.key, item?.details || []),
          };
        });
        item.newDetails = newDetails;
        return item;
      });
      const weekC = Number(moment().format('WW'));
      const curYear = new Date().getFullYear();
      // 当前周
      const cycleTimeC = `${curYear}-${weekC}周`;
      newData?.[0]?.details?.forEach((v: any, i: number) => {
        if (v.cycle_time == cycleTimeC) {
          cIndexSet(i + 1);
        }
      });
      dataFlat = flatData(newData, 'newDetails');
    }
    console.log(dataFlat,'dataFlat')
    paginationSet({
      ...pagination,
      current: res?.data.current_page,
      total: res?.data?.total || 0,
    });

    return {
      success: true,
      data: dataFlat || [],
      total: res.data?.total || 0,
    };
  };
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });
  const titles: any = [{ title: '明细', key: 'type' }, ...(tableData?.[0]?.details || [])];
  const columns: ProColumns<any>[] = [
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'center',
      onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
      fixed: 'left',
      sorter: true,
    },
    {
      title: '链接名称',
      dataIndex: 'link_name',
      align: 'center',
      onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
      sorter: true,
      fixed: 'left',
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
    },
    {
      title: '销售状态',
      dataIndex: 'sales_status',
      onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
      hideInSearch: true,
      sorter: true,
      align: 'center',
      render: (_: any, record: any) => record.sales_status_name ?? '-',
    },
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku',
      align: 'center',
      width: 100,
      onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
      sorter: true,
    },
    {
      title: '时间段（销量）',
      dataIndex: 'dateTimes',
      align: 'center',
      valueType: 'dateRange',
      hideInTable: true,
      sorter: true,
      initialValue: [moment().add(-1, 'week'), moment().add(-1, 'day')],
      fieldProps: {
        disabledDate: (current: any) => current && current > moment().add(-1, 'day'),
        allowClear: false,
      },
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
                  一，未交货数量（PMC）是在PMC角度的定义，包含PMC采购计划已经审核通过到供应商交货给物流之前的所有状态的数量，具体如下：
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
      width: 120,
      hideInSearch: true,
      onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
      sorter: true,
      render: (text, record: any) =>
        record.no_deal_pmc_num || record.no_deal_pmc_num == 0 ? (
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
            {record.no_deal_pmc_num}
          </a>
        ) : (
          '-'
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
      width: 110,
      onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
      sorter: true,
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
      width: 130,
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
    },
    {
      title: '预警查询',
      dataIndex: 'timeRange',
      hideInTable: true,
      renderFormItem: () => <WarningSearch />,
      search: {
        transform: (val: any) => {
          console.log(val, 111);
          // if (val?.dates && val.dates[0] && val.dates[1]) {
          //   return {

          //   };
          // }
          return {};
        },
      },
    },

    ...titles?.map((v: any, i: number) => {
      const weekC = Number(moment().format('WW'));
      const curYear = new Date().getFullYear();
      // 当前周
      const cycleTimeC = `${curYear}-${weekC}周`;

      return {
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
                        top: '17px',
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
        width: i == 0 ? 130 : 100,
        onHeaderCell: () => {
          return {
            className: cycleTimeC == v.cycle_time ? 'title-bg-blue' : '',
          };
        },
        onCell: (record: any) => {
          return {
            className:
              record.type === '周转天数'
                ? typeof record?.[v.cycle_time] == 'number' && record?.[v.cycle_time] < 21
                  ? 'bg-red'
                  : typeof record?.[v.cycle_time] == 'number' && record?.[v.cycle_time] > 60
                  ? 'bg-yellow'
                  : ''
                : '',
          };
        },
        render: (_: any, record: any) => {
          return i == 0 ? (
            <>
              {record.type}
              <Tooltip placement="top" title={tipObj[record.type]}>
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </>
          ) : (
            <>
              {record.type === '周销量' && (
                <a
                  onClick={() => {
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
                  }}
                >
                  {record[v.cycle_time]}
                </a>
              )}
              {record.type === '在途数量（PMC）' ? (
                cIndex <= i ? (
                  <a
                    onClick={() => {
                      selectedRecordSet({
                        ...record,
                        cycle_time: v.cycle_time,
                        cycle_time_begin: moment(v.cycle_time_begin).format('MM.DD'),
                        cycle_time_end: moment(v.cycle_time_end).format('MM.DD'),
                        params: {
                          shop_id: record.shop_id,
                          shop_sku: record.shop_sku,
                        },
                      });
                      openInTransitPMCSet(true);
                    }}
                  >
                    {record[v.cycle_time]}
                  </a>
                ) : (
                  <span>{record[v.cycle_time]}</span>
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
                        cycle_time: v.cycle_time,
                        cycle_time_begin: moment(v.cycle_time_begin).format('MM.DD'),
                        cycle_time_end: moment(v.cycle_time_end).format('MM.DD'),
                        params: {
                          shop_id: record.shop_id,
                          shop_sku: record.shop_sku,
                        },
                      });
                      openReservedSet(true);
                    }}
                  >
                    {record[v.cycle_time]}
                  </a>
                ) : (
                  <span>{record[v.cycle_time]}</span>
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
                        cycle_time: v.cycle_time,
                        cycle_time_begin: moment(v.cycle_time_begin).format('MM.DD'),
                        cycle_time_end: moment(v.cycle_time_end).format('MM.DD'),
                        params: {
                          shop_id: record.shop_id,
                          shop_sku: record.shop_sku,
                        },
                      });
                      openStockSet(true);
                    }}
                  >
                    {record[v.cycle_time]}
                  </a>
                ) : (
                  <span>{record[v.cycle_time]}</span>
                )
              ) : (
                ''
              )}
              {record.type === '周转天数' && <span>{record[v.cycle_time]}</span>}
            </>
          );
        },
      };
    }),
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 2300, '', 16, ['shop_name']);
  // 导出
  const exportAction = async () => {
    downLoadingSet(true);
    const res: any = await exportExcel(exportForm);
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
        <ProTable
          rowClassName="stripe"
          columns={columns}
          actionRef={ref}
          pagination={false}
          onSubmit={() => {
            pagination.current = 1;
          }}
          params={{
            current: pagination.current,
            pageSize: pagination.pageSize,
          }}
          bordered
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          // sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          rowKey="id"
          dateFormatter="string"
          revalidateOnFocus={false}
          toolBarRender={() => [
            <Space key="space">
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
              ) : null}
            </Space>,
          ]}
          {...ColumnSet}
          scroll={{ x: ColumnSet.scroll.x, y: 'calc( 100vh - 335px)' }}
        />
        {/*ProTable合并单元格分页bug, 需要自定义分页*/}
        <div
          className="custom-pagination"
          style={{
            position: 'sticky',
            padding: '10px 24px',
            borderTop: '1px solid #e9e9e9',
            bottom: 0,
            right: 0,
            zIndex: 2,
            width: '100%',
            textAlign: 'right',
            background: '#fff',
          }}
        >
          <Pagination
            showTotal={(total: number) => `总共${total}条`}
            onChange={(current, pageSize) => {
              if (pagination.pageSize == pageSize) {
                paginationSet({ ...pagination, current, pageSize });
              } else {
                paginationSet({ ...pagination, current: 1, pageSize });
              }
            }}
            showSizeChanger
            size={'small'}
            {...pagination}
          />
        </div>
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
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

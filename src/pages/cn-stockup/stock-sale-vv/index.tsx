import { connect } from 'umi';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAccess } from 'umi';
import { Tooltip, Card, Button } from 'antd';
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer, BetaSchemaForm } from '@ant-design/pro-components';
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { inventorySalesCnListV } from '@/services/pages/cn-sales';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { flatData } from '@/utils/filter';
import { add, pubGetPlatformList, pubProLineList } from '@/utils/pubConfirm';
import DetailInprocessNumList from '@/pages/cn-stockup/components/DetailInprocessNumList';
import DetailPlanedShipment from '@/pages/cn-stockup/components/DetailPlanedShipment';
import DetailTransitNumList from '@/pages/cn-stockup/components/DetailTransitNumList';
import DetailLastInstockTime from '@/pages/cn-stockup/components/DetailLastInstockTime';
import VirtualTable from '@/components/VirtualTable';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
// @ts-ignore
import accounting from 'accounting';
import moment from 'moment/moment';
import ExportBtn from '@/components/ExportBtn';
import CustomColumnSet from '@/components/CustomColumnSet';
import PubWeekRender from '@/components/PubWeekRender';
import Chart from '../components/Chart';

const tooltipObj = {
  '在制数量（PMC）': (
    <>
      在制总数量（PMC），是还可以计划发货的数量，即已审核通过的采购计划总数量-已审核通过的发货计划总数量-计划外入库单的发货总数量
    </>
  ),
  维修数量: <>供应商反馈的维修良品数量</>,
  在库数量: <>该SKU对应各个平台区域及区域合计在库数量</>,
  日均销量: (
    <>
      一，根据筛选条件时间段，汇总该SKU对应该平台区域及区域合计销量
      ，汇总后的销量除以筛选时间段实际天数得出日均销量，销量是按收货地址区域来统计，不是按仓库出货地址区域统计；
      <br />
      例如：今天是2022年11月9日，
      <br />
      如果选择的时间是 6、7、8号，则是三天的日均销量；
      <br />
      如果选择的时间是7、8、9好，则是
      <br />
      两天的日均销量；
      <br />
      二，
      <br />
      销量，遇到小数点，向上取整
      <br />
      天数，遇到小数点，向下取整
      <br />
      三，
      <br />
      销量统计逻辑判断
      <br />
      （1）在库库存为0 销量为0，这种场景，不纳入日均销量统计；
      <br />
      （2）在库库存不为0 销量为0 ，即使是没有导入，这种场景，正常纳入日均销量统计；
      <br />
      例如 9月30 日 导入了销量 国庆7天没有导入销量 10月8日导入了销量 ，那么我们 日均销量 是除以 是 9
      ；
    </>
  ),
  在途数量: <>
    1，实时汇总供应链系统已计划未建入库单数量和已建入库单未入库数量；
    <br />
    2，已建入库单未入库数量，包括入库单新建、已同步、撤回中、已撤回、国内在途五个状态的发货数量；
  </>,
  已计划发货数量: (
    <>
      一，发货计划已审批，但是供应商还未发货的数量，包括：
      <br />
      1，未建入库单的发货计划数量；
      <br />
      2，已建入库单，但是入库单状态还在新建、撤回中、已撤回状态的发货计划数量；
      <br />
      二，菜鸟仓库和京东仓库，未分仓数量无法统计，请务必将已审批通过数量进行分仓；
    </>
  ),
  '库存可用天数（日均销量）': (
    <>
      一，根据筛选条件时间段，该SKU对应各个平台区域及区域合计库存，分别对应除以该SKU对应各个平台区域及区域合计日均销量，得到各个平台区域及合计可用天数；
      <br />
      公式： 库存可用天数（日均销量） = 在库数量 ➗  （统计天数内的销量之和  ➗  有效天数 ）
      <br />
      二，可用天数=“库存” ÷ 平均销量 =1.1 或者 1.5 或者1.9，都向下取整，可用天数为1天；
    </>
  ),
  '库存可用天数（两周平均）': (
    <>
      一，根据筛选条件时间段，该SKU对应各个平台区域及区域合计库存，分别对应除以该SKU对应各个平台区域及区域合计前两周平均销量，得到各个平台区域及合计可用天数；
      <br />
      公式：库存可用天数（两周平均） = 在库数量 ➗  （前两周14天销量之和  ➗  14天 ）
      <br />
      二，可用天数=“库存” ÷ 平均销量 =1.1 或者 1.5 或者1.9，都向下取整，可用天数为1天；
    </>
  ),
  在途到仓后可用天数: (
    <>
      一，
      根据筛选条件时间段，该SKU对应各个平台区域及区域合计库存+在途数量，分别对应除以该SKU对应各个平台区域及区域合计销量，得到各个平台区域及合计可用天数；
      <br />
      二， 可用天数=“库存” ÷ 日均销量 =1.1 或者 1.5 或者1.9，都向下取整，可用天数为1天；
    </>
  ),
  '在途到仓后可用天数（PMC.日均销量）': (
    <>
      一，根据筛选条件时间段，该SKU对应各个平台区域及区域合计库存+PMC在途，分别对应除以该SKU对应各个平台区域及区域合计日均销量，得到各个平台区域及合计可用天数；
      <br />
      公式：在途到仓后可用天数（PMC.日均销量） = 【在途数量（PMC）+在库】 ➗  （统计天数内的销量之和  ➗  有效天数 ）
      <br />
      二，可用天数=“库存” ÷ 平均销量 =1.1 或者 1.5 或者1.9，都向下取整，可用天数为1天；
      <br />
      三，在途数量（PMC），即未入库的入库单数量和未建入库单的发货计划数量

    </>
  ),
  '在途到仓后可用天数（PMC.两周平均）': (
    <>
      一，根据筛选条件时间段，该SKU对应各个平台区域及区域合计库存+PMC在途数量，分别对应除以该SKU对应各个平台区域及区域合计前两周平均销量，得到各个平台区域及合计可用天数；
      <br />
      公式：在途到仓后可用天数（PMC.两周平均） = 【在途数量（PMC）+在库】 ➗  （前两周14天销量之和  ➗  14天 ）
      <br />
      二，可用天数=“库存” ÷ 平均销量 =1.1 或者 1.5 或者1.9，都向下取整，可用天数为1天；
      <br />
      三，在途数量（PMC），即未入库的入库单数量和未建入库单的发货计划数量
    </>
  ),
  下批到仓时间: (
    <>
      已同步和国内在途状态的国内平台入库单，时间最前的入库单的预计平台入库时间，例如：
      <br />
      已同步状态入库单1 ，预计平台入库时间是2022年12月26日；
      <br />
      国内在途状态入库单2，预计平台入库时间是2022年12月25日；
      <br />
      那么下批到仓时间为：2022年12月25日
      <br />
      没有符合条件的入库单，则不显示日期
    </>
  ),
  合计: (
    <>
      1，审批通过的计划数量，如果修改了分仓，导致部分计划数量没有分仓，已计划发货数量合计
      和各个区域已计划发货数量之和可能不相等；
      <br />
      2，各个区域和合计的日均销量是通过销量汇总除以天数，遇到小数点向上取整，各个区域分别向上取整后，可能之和不等于合计日均销量；
    </>
  ),
};
const getScrollY = () => {
  const documentClientHeight = document.body?.clientHeight - 330;
  return documentClientHeight && documentClientHeight > 300 ? documentClientHeight : 610; // 表格默认高度
};
const defaultScrollY = getScrollY();
// 国内库存-销量汇总(竖版) - 列表
const Page: React.FC<{
  common?: any;
}> = ({ common }) => {
  const access = useAccess();
  const formRef: any = useRef<ProFormInstance>(null);
  const tableRef: any = useRef(null);
  const [loading, loadingSet] = useState<boolean>(false);
  const [scrollY, scrollYSet] = useState<number>(defaultScrollY);
  const [dataSource, dataSourceSet] = useState<any[]>([]);
  const [selectedRecord, selectedRecordSet] = useState<any>({});
  const [open, openSet] = useState(false);
  const [openDetailPlanedShipment, openDetailPlanedShipmentSet] = useState(false);
  const [openDetailInprocessNumList, openDetailInprocessNumListSet] = useState(false);
  const [openDetailChart, openDetailChartSet] = useState(false);
  const [optionsPlatform, optionsPlatformSet] = useState([]);
  const [sortList, sortListSet] = useState({ goods_name: 'asc' });
  const [exportForm, exportFormSet] = useState({});
  const [customColumns, customColumnsSet] = useState<React.Key[] | null>(null);
  const [customExportConfig, customExportConfigSet] = useState<any>({});

  // 添加弹窗实例
  const lastInstockTimeModel = useRef();

  const [days, daysSet] = useState(
    moment().add(-1, 'day').diff(moment().add(-1, 'week'), 'day') + 1,
  );
  const year: any = String(new Date().getFullYear()).slice(2, 4);
  const pre = moment().add(-1, 'week');
  const preP = moment().add(-2, 'week');
  const dynamicData = {
    pre: {
      name: `${year}-${Number(moment(pre).format('WW'))}周销量`,
      startDate: moment(pre).weekday(0).format('YYYY-MM-DD'),
      endDate: moment(pre).weekday(6).format('YYYY-MM-DD'),
    },
    preP: {
      name: `${year}-${Number(moment(preP).format('WW'))}周销量`,
      startDate: moment(preP).weekday(0).format('YYYY-MM-DD'),
      endDate: moment(preP).weekday(6).format('YYYY-MM-DD'),
    },
  };
  const getOptionsPlatform = async () => {
    const res = await pubGetPlatformList({ business_scope: 'CN' });
    const temp = res
      ?.filter((item: any) => item.code != 'HUI_YE_CANG')
      .map((item: any) => {
        if (item.code == 'TM') {
          return { label: '菜鸟', value: item.code };
        }
        return { label: item.name, value: item.code };
      });
    optionsPlatformSet(temp);
  };
  useEffect(() => {
    getOptionsPlatform();
  }, []);

  // 下批到仓时间 弹窗
  const lastStockModalOpen: any = (row: any) => {
    const data: any = lastInstockTimeModel?.current;
    data.open({
      goods_sku_id: row?.goods_sku_id, //款式id
      platform_name: row?.platform_name, //平台名称
      warehouse_area: row?.region_name, //区域名称
      startTime: row?.last_instock_time,
    });
  };
  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        order: 7,
        title: '产品线',
        dataIndex: 'category_id',
        valueType: 'select',
        request: async () => pubProLineList({ business_scope: 'CN' }),
        debounceTime: 300,
        fieldProps: {
          showSearch: true,
        },
        sorter: true,
        width: 90,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        render: (_: any, record: any) => record.category_name || '-',
      },
      {
        title: '产品名称',
        dataIndex: 'goods_name',
        width: 140,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        sorter: true,
      },
      {
        title: '款式名称',
        dataIndex: 'sku_name',
        width: 220,
        sorter: true,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
      {
        title: 'SKU',
        dataIndex: 'stock_no',
        width: 140,
        sorter: true,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        fieldProps: {
          placeholder: '输入多个用逗号隔开',
        },
      },
      {
        title: '款式生命周期',
        dataIndex: 'life_cycle',
        width: 110,
        align: 'center',
        sorter: true,
        fieldProps: { showSearch: true },
        valueEnum: common?.dicList?.GOODS_LIFE_CYCLE || {},
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        render: (_: any, record: any) => record.life_cycle_name || '-',
      },
      {
        title: (
          <>
            未入库总数量
            <br />
            （PMC）
          </>
        ),
        dataIndex: 'no_stocked_total',
        width: 120,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        align: 'center',
        hideInSearch: true,
        tooltip: (
          <>
            未入库总数量（PMC）=在制数量（PMC）+在途数量（PMC）
          </>
        ),
      },
      {
        title: '时间段(销量)',
        dataIndex: 'timeRange',
        valueType: 'dateRange',
        hideInTable: true,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        initialValue: [moment().add(-1, 'week'), moment().add(-1, 'day')],
        fieldProps: {
          allowClear: false,
          disabledDate: (current: any) => {
            return current && current.isAfter(moment().add(-1, 'day'));
          },
        },
        renderFormItem: () => <NewDatePicker allowClear={false} needRange={true} />,
        search: {
          transform: (val: any) => ({ startSalesDate: val[0], endSalesDate: val[1] }),
        },
      },
      {
        title: (
          <>
            在制数量
            <br />
            （PMC）
          </>
        ),
        tooltip: tooltipObj['在制数量（PMC）'],
        dataIndex: 'in_process_num',
        align: 'right',
        hideInSearch: true,
        sorter: true,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        render: (text: any, record: any) => (
          <a
            className={record.in_process_num < 0 ? 'text-red' : ''}
            onClick={() => {
              selectedRecordSet(record);
              openDetailInprocessNumListSet(true);
            }}
          >
            {accounting.formatNumber(record.in_process_num)}
          </a>
        ),
        valueType: 'digit',
        width: 100,
      },
      {
        title: '维修数量',
        tooltip: tooltipObj['维修数量'],
        dataIndex: 'repair_num',
        align: 'right',
        hideInSearch: true,
        sorter: (a: any, b: any) => a.test1 - b.test1,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        valueType: 'digit',
        width: 100,
      },
      {
        title: '平台',
        dataIndex: 'platform_code',
        align: 'center',
        width: 90,
        sorter: true,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        valueType: 'select',
        fieldProps: {
          options: optionsPlatform,
        },
      },
      {
        title: '区域',
        dataIndex: 'region_name',
        align: 'center',
        hideInSearch: true,
        width: 90,
        search: false,
        renderText: (text: any) =>
          text == '合计' ? (
            <div style={{ fontWeight: 'bold' }}>
              {text}{' '}
              <Tooltip
                title={
                  <>
                    1，审批通过的计划数量，如果修改了分仓，导致部分计划数量没有分仓，已计划发货数量合计
                    和各个区域已计划发货数量之和可能不相等；
                    <br />
                    2，各个区域和合计的日均销量是通过销量汇总除以天数，遇到小数点向上取整，各个区域分别向上取整后，可能之和不等于合计日均销量；
                  </>
                }
              >
                <InfoCircleOutlined />
              </Tooltip>
            </div>
          ) : (
            text
          ),
      },
      {
        title: '在库数量',
        tooltip: tooltipObj['在库数量'],
        dataIndex: 'in_stock_num',
        align: 'right',
        hideInSearch: true,
        width: 90,
        valueType: 'digit',
      },
      {
        title: '日均销量',
        tooltip: tooltipObj['日均销量'],
        dataIndex: 'avg_sales',
        align: 'right',
        hideInSearch: true,
        width: 90,
        valueType: 'digit',
        render: (_: any, record: any) => (
          <a
            onClick={() => {
              selectedRecordSet(record);
              openDetailChartSet(true);
            }}
          >
            {record.avg_sales ?? '-'}
          </a>
        ),
      },
      {
        title: <><div>选择时间段</div><div>{`${days}天总销量`}</div></>,
        dataIndex: 'total_sales_qty',
        align: 'right',
        hideInSearch: true,
        width: 90,
        valueType: 'digit',
      },
      {
        title: (
          <PubWeekRender
            option={{
              cycle_time: dynamicData.preP.name,
              begin: dynamicData.preP.startDate,
              end: dynamicData.preP.endDate,
            }}
          />
        ),
        tooltip: '根据全年自然周，统计倒数第二周的总销量',
        dataIndex: 'last_two_week_sales_qty',
        align: 'right',
        hideInSearch: true,
        width: 140,
        valueType: 'digit',
      },
      {
        title: (
          <PubWeekRender
            option={{
              cycle_time: dynamicData.pre.name,
              begin: dynamicData.pre.startDate,
              end: dynamicData.pre.endDate,
            }}
          />
        ),
        tooltip: '根据全年自然周，统计上一周的总销量',
        dataIndex: 'last_one_week_sales_qty',
        align: 'right',
        hideInSearch: true,
        width: 140,
        valueType: 'digit',
      },
      {
        title: (
          <>
            在途数量
            <br />
            （PMC）
          </>
        ),
        tooltip: tooltipObj['在途数量'],
        dataIndex: 'in_transit_num',
        align: 'right',
        hideInSearch: true,
        width: 90,
        valueType: 'digit',
        render: (text: any, record: any) => (
          <a
            onClick={() => {
              selectedRecordSet(record);
              openSet(true);
            }}
          >
            {accounting.formatNumber(record.in_transit_num)}
          </a>
        ),
      },
      {
        title: '库存可用天数（日均销量）',
        tooltip: tooltipObj['库存可用天数（日均销量）'],
        dataIndex: 'total_available_day',
        align: 'right',
        hideInSearch: true,
        width: 110,
        renderText: (text: any) => text ?? '-',
      },
      {
        title: '库存可用天数（两周平均）',
        tooltip: tooltipObj['库存可用天数（两周平均）'],
        dataIndex: 'two_week_total_available_day',
        align: 'right',
        hideInSearch: true,
        width: 110,
        renderText: (text: any) => text ?? '-',
      },
      {
        title: (
          <>
            在途到仓后可用天数
            <br />
            （PMC.日均销量）
          </>
        ),
        tooltip: tooltipObj['在途到仓后可用天数（PMC.日均销量）'],
        dataIndex: 'planned_available_day',
        align: 'right',
        hideInSearch: true,
        width: 140,
        renderText: (text: any) => text ?? '-',
      },
      {
        title: (
          <>
            在途到仓后可用天数
            <br />
            （两周平均）
          </>
        ),
        tooltip: tooltipObj['在途到仓后可用天数（PMC.两周平均）'],
        dataIndex: 'two_week_planned_available_day',
        align: 'right',
        hideInSearch: true,
        width: 140,
        renderText: (text: any) => text ?? '-',
      },
      {
        title: '下批到仓时间',
        tooltip: tooltipObj['下批到仓时间'],
        dataIndex: 'last_instock_time',
        align: 'center',
        hideInSearch: true,
        width: 124,
        render: (text: any, row: any) => text ? (<a onClick={() => lastStockModalOpen(row)}>{text}</a>) : '-',
      },
    ],
    [common, optionsPlatform, days],
  );
  const columnsFormat: ProColumns<any>[] = useMemo(() => {
    if (customColumns) {
      if (customColumns.length) {
        return columns.filter(
          (item: any) => !(item.hideInTable || !customColumns.includes(item.dataIndex)),
        );
      } else {
        return [];
      }
    }
    return columns;
  }, [customColumns, columns]);
  const getAction = async (params: any) => {
    daysSet(moment(params.endSalesDate).diff(moment(params.startSalesDate), 'day') + 1);
    loadingSet(true);
    const res = await inventorySalesCnListV(params);
    loadingSet(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return {
        success: false,
        data: [],
        total: 0,
      };
    }
    let dataFlat: any[] = [];
    // 万里牛  库存为0+在途为0+已计划发货数量为0 时，万里牛仓库不显示
    if (!params.platform_code || params.platform_code == 'YUN_CANG') {
      res?.data?.list.forEach((item: any, index: number) => {
        const detailsC: any = [];
        item.details.forEach((v: any) => {
          if (
            !(
              typeof v.in_stock_num == 'number' &&
              typeof v.in_transit_num == 'number' &&
              typeof v.planned_shipment == 'number' &&
              add(add(v.in_stock_num, v.in_transit_num), v.planned_shipment) == 0 &&
              v.region_name == '万里牛云仓'
            )
          ) {
            detailsC.push(v);
          }
        });
        res.data.list[index].details = detailsC;
      });
    }
    if (res?.data?.list?.length) {
      dataFlat = flatData(res.data.list, 'details');
    }
    // console.log(dataFlat, 'dataFlat');
    dataSourceSet(dataFlat);
    return true;
  };
  useEffect(() => {
    formRef?.current?.submit();
  }, []);
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      {/*搜索条件*/}
      <BetaSchemaForm
        formRef={formRef}
        layoutType={'QueryFilter'}
        columns={columns.filter((c) => !(c.hideInSearch || c.search === false)) as any}
        className={'light-search-form'}
        style={{ padding: '10px 10px 0 10px', marginBottom: 10, background: '#fff' }}
        labelWidth={94}
        onFinish={async (values: any) => {
          const postData = {
            ...values,
            current: 1,
            pageSize: 9999,
            startSalesDate: values?.timeRange[0] || '',
            endSalesDate: values?.timeRange[1] || '',
            sortList,
          };
          delete postData.timeRange;
          postData.stock_no = postData?.stock_no
            ?.replaceAll(' ', '')
            ?.replaceAll('，', ',')
            .replace(/,$/gi, '');
          exportFormSet(postData);
          getAction(postData);
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
      <Card size={'small'} bordered={false} className="th-center">
        <VirtualTable
          offsetTop={347}
          title={() => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>国内库存-销量汇总(竖版)</span>
              <div>
                {access.canSee('liyi99-report_stock-sale-cn-export-v') ? (
                  /*导出*/
                  <ExportBtn
                    exportForm={{
                      ...exportForm,
                      exportConfig: { columns: customExportConfig },
                    }}
                    exportHandle={'/report-service/inventorySalesReport/exportV'}
                  />
                ) : null}
                <Button
                  className={'ml-2'}
                  type={'text'}
                  icon={<ReloadOutlined />}
                  onClick={() => formRef?.current?.submit()}
                />
                <CustomColumnSet
                  columns={columns}
                  customTitle={{
                    last_one_week_sales_qty: '上周',
                    last_two_week_sales_qty: '倒数第二周',
                  }}
                  customColumnsSet={customColumnsSet}
                  customExportConfigSet={customExportConfigSet}
                />
              </div>
            </div>
          )}
          from="vv"
          size={'small'}
          overscanCount={8}
          loading={loading}
          rowKey={(record: any) => record.id + record.region_code}
          bordered
          columns={columnsFormat as any}
          dataSource={dataSource}
          pagination={false}
          scroll={{ y: scrollY }}
          scrollYSet={scrollYSet}
          onChange={(pagination, filters, sorter: any) => {
            const sortParams = {};
            if (sorter.order) {
              sortParams[sorter.field] = sorter.order == 'ascend' ? 'asc' : 'desc';
            }
            sortListSet(sortParams);
            formRef.current?.submit();
          }}
        />
      </Card>
      {/*弹框 在途数量*/}
      <DetailTransitNumList
        data={selectedRecord}
        open={open}
        openSet={openSet}
        dicList={common?.dicList}
      />
      {/*已计划发货数量*/}
      <DetailPlanedShipment
        data={selectedRecord}
        dicList={common?.dicList}
        open={openDetailPlanedShipment}
        openSet={openDetailPlanedShipmentSet}
      />
      {/*在制数量*/}
      <DetailInprocessNumList
        data={selectedRecord}
        dicList={common?.dicList}
        open={openDetailInprocessNumList}
        openSet={openDetailInprocessNumListSet}
      />
      <Chart
        params={{
          time: formRef?.current?.getFieldValue('timeRange'),
          platform_code: selectedRecord.platform_code,
          goods_sku_id: selectedRecord.goods_sku_id,
          region_name: selectedRecord.region_name,
        }}
        dataC={selectedRecord}
        open={openDetailChart}
        openSet={openDetailChartSet}
      />
      {/*下批到仓时间 弹窗*/}
      <DetailLastInstockTime
        lastInstockTimeModel={lastInstockTimeModel}
        dicList={common?.dicList}
      />
    </PageContainer>
  );
};

// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

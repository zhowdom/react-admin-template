import { PageContainer } from '@ant-design/pro-layout';
import { connect, useAccess } from 'umi';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BetaSchemaForm, ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { Button, Card, Pagination } from 'antd';
import { flatData } from '@/utils/filter';
import { ReloadOutlined } from '@ant-design/icons';
import './index.less';
import moment from 'moment';
import VirtualTable from './components/VirtualTableFixed';
import CustomColumnSet from '@/components/CustomColumnSet';
// @ts-ignore
import accounting from 'accounting';
import DateRangeComp from './components/DateRangeComp';
import { pubGetPlatformList, pubGetStoreList } from '@/utils/pubConfirm';
import { salesRegionConfigList,exportExcel,listPage } from '@/services/pages/cn-sales';
// import data from './data.js';
const Page = (props: any) => {
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const [pagination, paginationSet] = useState({
    current: 1,
    total: 0,
    pageSize: 100,
  });
  const tableRef: any = useRef(null);
  const [exportForm, setExportForm] = useState<any>({});
  const access = useAccess();
  const [customColumns, customColumnsSet] = useState<React.Key[] | null>(null);
  const [customExportConfig, customExportConfigSet] = useState<any>({});
  const [loading, loadingSet] = useState<boolean>(false);
  const [dataSource, dataSourceSet] = useState<any[]>([]);
  const [downLoading, downLoadingSet] = useState(false);
  const [totalNum, totalNumSet] = useState(false);
  const getScrollY = () => {
    const documentClientHeight = document.body?.clientHeight - 408;
    return documentClientHeight && documentClientHeight > 300 ? documentClientHeight : 610; // 表格默认高度
  };
  const vRef = useRef<any>();
  const defaultScrollY = getScrollY();
  const [scrollY, scrollYSet] = useState<number>(defaultScrollY);
  const [refreshColumns, refreshColumnsSet] = useState<number>(0);
  const [columnsWidth, columnsWidthSet] = useState<any>(100);
  const [sortList, sortListSet] = useState({});
  const weekOfday: any = moment().format('E'); //计算今天是这周第几天
  const last_monday = moment()
    .add(-3, 'week')
    .subtract(weekOfday - 1, 'days')
    .format('YYYY-MM-DD');
  // const before_monday = moment(last_monday).subtract(21, 'days').format('YYYY-MM-DD');
  const today = moment().format('YYYY-MM-DD');
  // 数据转换
  const getNewData = (key: any, dataC: any) => {
    const newData: any = {};
    dataC?.forEach((element: any) => {
      const elementC = { ...element, ...element.details };
      newData[`${elementC.cycleTime}`] =
        typeof elementC[key] == 'number' ? elementC[key] : elementC[key] ?? null;
    });
    return newData;
  };
  useEffect(() => {
    formRef?.current?.submit();
  }, []);

  const initData: any = useMemo(
    () => [
      {
        title: '平台',
        order: 10,
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        dataIndex: 'platformCode',
        valueType: 'select',
        initialValue: '',
        fixed: 'left',
        request: async () => {
          const res = await pubGetPlatformList({ business_scope: 'CN', isDy: true });
          const data =
            res
              ?.filter(
                (v: any) => !['1552846034395881473', '1580120899712675841']?.includes(v.value),
              )
              ?.map((v: any) => ({
                platform_id: v.value,
                value: v.platform_code,
                label: v.label,
              })) || [];
          return data;
        },
        fieldProps: {
          onChange: (v: any, o: any) => {
            formRef?.current?.setFieldsValue({platform_id: o.platform_id})
            formRef.current?.setFieldsValue({ shopIdList: [] });
            formRef.current?.setFieldsValue({ regionList: [] });
          },
        },
        render: (_: any, record: any) => record?.platformName ?? '-',
      },
      {
        title: 'platform_id',
        order: 10,
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        dataIndex: 'platform_id',
        hideInSearch: true,
        hideInTable: true
      },
      {
        title: '店铺',
        order: 10,
        dataIndex: 'shopIdList',
        hideInTable: true,
        valueType: 'select',
        dependencies: ['platform_id'],
        request: async () => {
          const res = await pubGetStoreList(
            {
              platform_id: formRef?.current?.getFieldValue('platform_id') ,
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
        order: 10,
        dataIndex: 'regionList',
        hideInTable: true,
        valueType: 'select',
        request: async () => {
          const res: any = await salesRegionConfigList({ platformCode: formRef?.current?.getFieldValue('platform_code') });
          return (
            res?.data?.map((v: any) => ({ value: v.region, label: v.regionName || v.region })) || []
          );
        },
        dependencies: ['platform_code'],
        // fixed: 'left',
        fieldProps: { showSearch: true, mode: 'multiple'},
      },

      {
        title: '产品线',
        dataIndex: 'categoryName',
        hideInSearch: true,
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        fixed: 'left',
      },
      {
        title: '产品名称',
        dataIndex: 'goodsName',
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        fixed: 'left',
        order: 9,
      },
      {
        title: '产品编码',
        dataIndex: 'goodsCode',
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        hideInTable: true,
        order: 8,

      },
      {
        title: 'ERP编码',
        dataIndex: 'erpNo',
        order: 10,
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        order: 6,
        fixed: 'left',
      },
      {
        title: '款式名称',
        dataIndex: 'goodsSkuName',
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        fixed: 'left',
        order: 7,
        hideInSearch: true,
      },
      {
        title: '库存编号',
        dataIndex: 'stockNo',
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        fixed: 'left',
        order: 5,
      },
      // {
      //   title: '区域',
      //   dataIndex: 'plat_area',
      //   hideInTable: true,
      //   renderFormItem: () => <AreaSelect/>,
      //   search: {
      //     transform: (val: any[]) => ({
      //       platform_area: val[0],
      //       area_id: val[1],
      //     }),
      //   },
      //   order: 4
      // },
      {
        title: '统计维度',
        dataIndex: 'type',
        hideInTable: true,
        valueType: 'radioButton',
        initialValue: 'order',
        valueEnum: {
          order: { text: '下单时间' },
          pay: { text: '付款时间' },
        },
        order: 3,
      },
      {
        title: '统计时间',
        dataIndex: 'dateTimes',
        align: 'center',
        hideInTable: true,
        sorter: true,
        initialValue: [moment(last_monday), moment(today)],
        renderFormItem: () => (
          <DateRangeComp
            initialValue={[moment(last_monday), moment(today)]}
            disabledDateEnd={moment(today)}
            allowClear={false}
            limitMonth={2}
          />
        ),
        search: {
          transform: (val: any[]) => {
            return {
              dateStart: moment(val[0]).format('YYYY-MM-DD'),
              dateEnd: moment(val[1]).format('YYYY-MM-DD'),
            };
          },
        },
        order: 2,
      },
      {
        title: '统计方式',
        dataIndex: 'dimension',
        hideInTable: true,
        valueType: 'radioButton',
        initialValue: 'WEEK',
        valueEnum: {
          MOTH: { text: '按月' },
          WEEK: { text: '按周' },
          DAY: { text: '汇总' },
        },
        order: 1,
      },
    ],
    [common],
  );
  const [columns, setColumns] = useState<any>([]);
  const [columnsFormat, columnsFormatSet] = useState<any>(
    columns.filter((item: any) => !(item.hideInTable || !customColumns?.includes(item.dataIndex))),
  );
  useEffect(() => {
    if (customColumns) {
      let data = [];
      if (customColumns.length) {
        data = columns.filter(
          (item: any) => !(item.hideInTable || !customColumns.includes(item.dataIndex)),
        );
      } else {
        data = [];
      }
      columnsFormatSet(data);
      // getColumnsWidth(data)
      return;
    }
    columnsFormatSet(columns);
    // getColumnsWidth(columns)
  }, [customColumns, columns]);
  useEffect(() => {
    const widthColumnCount = columnsFormat!.filter(
      ({ hideInTable }: any) => !hideInTable,
    ).length
    const demo1: any = document.querySelector('.warning>.ant-card-body');
    const demo1_w: any =
      Number(window.getComputedStyle(demo1).getPropertyValue('width').replaceAll('px', '')) - 24;
      columnsWidthSet(widthColumnCount * 100 > demo1_w || (!widthColumnCount) ? 100 : Math.floor(demo1_w/widthColumnCount))
      console.log(widthColumnCount * 100 > demo1_w  || (!widthColumnCount) ? 100 : Math.floor(demo1_w/widthColumnCount),55544)
  },[columnsFormat])
  const handleColumns = (other?: any) => {
    const dataC =  [...initData, ...other];
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
  const initColumnsAction = (res: any, dimension?: any) => {
    const other: any = [];
    console.log(res?.data?.data?.list?.[0]?.details, 0);
    [{ title: '区域', key: 'type' }, ...res?.data?.data?.list?.[0]?.details]?.forEach(
      (v: any, i: number) => {
        const obj = {
          title: (
            <>
              {i == 0 ? (
                v.title) : 
              // dimension == 'WEEK' ? (
              //   <>
              //     <PubWeekRender
              //       option={{
              //         cycleTime: v.cycleTime,
              //         begin: v.cycleTimeBegin,
              //         end: v.cycleTimeEnd,
              //         color: true,
              //       }}
              //     />
              //   </>
              // ) : (
              //   v.cycleTime
              // )
              v.cycleTime}
            </>
          ),
          dataIndex: i == 0 ? v.key : v.cycleTime,
          align: 'center',
          hideInSearch: true,
          fixed: i == 0 && 'left',
          render: (_: any, record: any) => {
            return i == 0 ? (
              <span style={{ fontWeight: record.type == '合计' ? 'bold' : 'normal' }}>
                {record.type}
              </span>
            ) : (
              <span style={{ fontWeight: record.type == '合计' ? 'bold' : 'normal' }}>
                {typeof record[v.cycleTime] == 'number'
                  ? accounting.formatNumber(record[v.cycleTime])
                  : record[v.cycleTime] ?? '-'}
              </span>
            );
          },
        };
        other.push(obj);
      },
    );
    handleColumns(other);
  };
  // const start = moment().startOf('isoWeek').format('YYYY-MM-DD');
  // const end = moment()
  //   .add(+12, 'week')
  //   .endOf('isoWeek')
  //   .format('YYYY-MM-DD');
  const getAction = async (params: any) => {
    vRef.current.resetScroll();
    loadingSet(true);
    // console.log(params, 'params');
    // console.log(moment(moment(today).weekday(6).format('YYYY-MM-DD')), 11);
    // console.log(initTime([moment(last_monday), moment(today)]));
    // console.log(Number(moment().format('WW')), 112);
    const postData = {
      ...params,
      // ...sortList,

      orderDateStart: moment(params?.dateTimes?.[0]).format('YYYY-MM-DD'),
      orderDateEnd: moment(params?.dateTimes?.[1]).format('YYYY-MM-DD'),
      current_page: params?.current,
      page_size: params?.pageSize,
      // dateTimes: ['2023-04-06', '2023-04-12'],
    };
    delete postData.category_name;
    // delete postData.dateTimes;
    setExportForm(postData);
    const res = await listPage(postData);
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
    if (res?.data?.data?.list?.length) {
      // res.data.records = res?.data?.records.map((item: any) => ({...item,details: [item.details[0],item.details[1]]}))
      console.log(res.data.data.list)
      initColumnsAction(res, params.dimension);
      const dataC: any = res?.data?.data?.list;
      const newData = dataC.map((item: any) => {
        // // 假数据
        // item.details[0].details = {
        //   华南: 1,
        //   华北: 2,
        // };
        // // 结束
        const typesC = item?.details?.[0]?.details;
        const arr: any = [];
        Object.entries(typesC).forEach(([key]: any) => {
          const obj = {
            name: key,
            key,
          };
          arr.push(obj);
        });
        const newDetails = arr.map((v: any) => {
          // // 假数据
          // item.details = item.details.map((c: any) => ({
          //   ...c,
          //   details: {
          //     华南: 1,
          //     华北: 2,
          //   },
          // }));
          // // 结束
          return {
            type: v.name,
            ...getNewData(v?.key, item?.details || []),
          };
        });
        item.newDetails = newDetails;
        return item;
      });
      dataFlat = flatData(newData, 'newDetails');
    } else {
      handleColumns([]);
    }
    paginationSet({
      ...pagination,
      pageSize: params.pageSize,
      current: params.pageIndex,
      total: res?.data?.data?.total || 0,
    });
    totalNumSet(res.data?.total || '-')
    dataSourceSet(dataFlat);
    console.log(dataFlat, 'dataFlat');
    refreshColumnsSet(Date.now());
    return true;
  };
  // 导出
  const exportAction = async () => {
    downLoadingSet(true);
    const res: any = await exportExcel({
      ...exportForm,
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
      let fileName = `CN销量统计报表.xls`;
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
          columns={initData.filter((c) => !(c.hideInSearch || c.search === false)) as any}
          className={'light-search-form'}
          style={{ padding: '10px 10px 0 10px', marginBottom: 10, background: '#fff' }}
          labelWidth={94}
          onFinish={async (values: any, sort) => {
            try {
              const postData = {
                ...values,
                pageIndex: 1,
                pageSize: pagination.pageSize,
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

        <Card size={'small'} className="warning no-paddingb">
          <VirtualTable
            rowClassName="stripe"
            columnsWidth={columnsWidth}
            columnsWidthSet={columnsWidthSet}
            title={() => (
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>总销量：{totalNum}</span>
                <div>
                  {access.canSee('report_cnSalesStatistics_export') ? (
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
                    defaultHideColumn={['erp_sku']}
                    columns={columns}
                    customColumnsSet={customColumnsSet}
                    customExportConfigSet={customExportConfigSet}
                    refreshColumns={refreshColumns}
                    customClassName="warning-pop"
                  />
                </div>
              </div>
            )}
            _ref={vRef}
            size={'small'}
            overscanCount={12}
            loading={loading}
            rowKey={(record: any) => record.shop_id + record.shop_sku}
            bordered
            columns={columnsFormat as any}
            dataSource={dataSource || []}
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
          {/*ProTable合并单元格分页bug, 需要自定义分页*/}
          <div
            style={{
              position: 'sticky',
              padding: '0px 24px',
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
                let setting: any = {};
                if (pagination.pageSize == pageSize) {
                  setting = { ...pagination, current, pageSize };
                } else {
                  setting = { ...pagination, current: 1, pageSize };
                }
                paginationSet(setting);
                const postData = {
                  ...formRef?.current?.getFieldsValue(),
                  pageIndex: setting.current,
                  pageSize: setting.pageSize,
                  sortList,
                };
                setExportForm(postData);
                getAction(postData);
              }}
              showSizeChanger
              size={'small'}
              {...pagination}
            />
          </div>
        </Card>
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

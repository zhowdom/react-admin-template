import { PageContainer } from '@ant-design/pro-layout';
import { connect, useAccess } from 'umi';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BetaSchemaForm, ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { Button, Pagination, Space } from 'antd';
import { flatData } from '@/utils/filter';
import './index.less';
import moment from 'moment';
// @ts-ignore
import accounting from 'accounting';
import DateRangeComp from './components/DateRangeComp';
import { pubGetPlatformList, pubGetStoreList } from '@/utils/pubConfirm';
import { salesRegionConfigList, exportExcel, listPage } from '@/services/pages/cn-sales';
import { ProTable } from '@ant-design/pro-components';
import CustomColumnSet from '@/components/CustomColumnSet';
import PubWeekRender from '@/components/PubWeekRender';
const Page = (props: any) => {
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const [pagination, paginationSet] = useState({
    current: 1,
    total: 0,
    pageSize: 100,
  });
  const [exportForm, setExportForm] = useState<any>({});
  const access = useAccess();
  const [customColumns, customColumnsSet] = useState<React.Key[] | null>(null);
  const [customExportConfig, customExportConfigSet] = useState<any>({});
  const [downLoading, downLoadingSet] = useState(false);
  const [totalNum, totalNumSet] = useState(false);
  const weekOfday: any = moment().format('E'); //计算今天是这周第几天
  const [loading, loadingSet] = useState<boolean>(false);
  const [dataSource, dataSourceSet] = useState<any[]>([]);
  // const [dimensionChange, dimensionChangeSet] = useState(false);
  
  const last_monday = moment()
    .add(-3, 'week')
    .subtract(weekOfday - 1, 'days')
    .format('YYYY-MM-DD');
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
  const getStyleByAttr = (obj: any, name: any) => {
    return getComputedStyle(obj, null)[name];
  };
  const addListenTds = () => {
    const trs: any = [...document.querySelectorAll('.custom-cn table tbody tr:not(:first-child)')];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((item) => {
          if (item.isIntersecting) {
            item.target.querySelectorAll('td').forEach((v: any) => {
              v.style.display = '';
            });
          } else {
            item.target.style.height = getStyleByAttr(item.target, 'height');
            item.target.querySelectorAll('td').forEach((v: any) => {
              if (!v.rowSpan || v.rowSpan == 1) {
                v.style.display = 'none';
              }
            });
          }
        });
      },
      {
        root: document.querySelector('.ant-table-body'),
      },
    );

    // observe遍历监听所有tr节点
    trs.forEach((tr: any) => io.observe(tr));
    setTimeout(() => {
      loadingSet(false);
    },100)
  };

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
        width: 100,
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
            formRef?.current?.setFieldsValue({ platform_id: o.platform_id });
            formRef.current?.setFieldsValue({ shopIdList: [] });
            formRef.current?.setFieldsValue({ regionList: [] });
          },
        },
        render: (_: any, record: any) => record?.platformName ?? '-',
      },
      {
        title: 'platform_id',
        order: 10,

        dataIndex: 'platform_id',
        hideInSearch: true,
        hideInTable: true,
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
              platform_id: formRef?.current?.getFieldValue('platform_id'),
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
          const res: any = await salesRegionConfigList({
            platformCode: formRef?.current?.getFieldValue('platform_code'),
          });
          return (
            res?.data?.map((v: any) => ({ value: v.region, label: v.regionName || v.region })) || []
          );
        },
        dependencies: ['platform_code'],
        // fixed: 'left',
        fieldProps: { showSearch: true, mode: 'multiple' },
      },

      {
        title: '产品线',
        dataIndex: 'categoryName',
        hideInSearch: true,
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        fixed: 'left',
        width: 100,
      },
      {
        title: '产品名称',
        dataIndex: 'productName',
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        fixed: 'left',
        order: 9,
      },
      {
        title: '产品编码',
        dataIndex: 'productCode',
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        order: 8,
        width: 100,
        fixed: 'left',
      },
      {
        title: 'ERP编码',
        dataIndex: 'erpNo',
        order: 10,
        align: 'center',
        onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
        order: 6,
        fixed: 'left',
        width: 100,
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
        width: 100,
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
        // initialValue: [moment('2023-01-17'), moment('2023-03-17')],
        renderFormItem: () => (
          <DateRangeComp
            initialValue={[moment(last_monday), moment(today)]}
            // initialValue={[moment('2023-01-17'), moment('2023-03-17')]}
            disabledDateEnd={moment(today)}
            allowClear={false}
            limitMonth={2}
          />
        ),
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
        // fieldProps: {
        //   onChange: () => {
        //     dimensionChangeSet(true)
        //   }
        // }
      },
    ],
    [common],
  );
  const [columns, setColumns] = useState<any>(initData);
  const [columnsFormat, columnsFormatSet] = useState<any>(
    columns.filter((item: any) => !(item.hideInTable || !customColumns?.includes(item.dataIndex))),
  );
  const [refreshColumns, refreshColumnsSet] = useState<any>(0);
  useEffect(() => {
    console.log(columns, 'columns');
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
      return;
    }
    columnsFormatSet(columns);
  }, [customColumns, columns]);
  const handleColumns = (other?: any) => {
    console.log(other, 'other');
    const dataC = [...initData, ...other];
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
    [{ title: '区域', key: 'type' }, ...res?.data?.data?.list?.[0]?.details]?.forEach(
      (v: any, i: number) => {
        const obj = {
          title: (
            <>
              {i == 0 ? (
                v.title
              ) : (
                <PubWeekRender
                  option={{
                    cycle_time: v.cycleTime,
                    begin: v.cycleTimeBegin,
                    end: v.cycleTimeEnd,
                    color: true,
                  }}
                />
              )}
            </>
          ),
          dataIndex: i == 0 ? v.key : v.cycleTime,
          align: 'center',
          hideInSearch: true,
          fixed: i == 0 && 'left',
          width: 100,
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
  const getAction = async (params: any) => {
    loadingSet(true);
    const postData = {
      ...params,
      orderDateStart: moment(params?.dateTimes?.[0]).format('YYYY-MM-DD'),
      orderDateEnd: moment(params?.dateTimes?.[1]).format('YYYY-MM-DD'),
      current_page: params?.current,
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
    };
    delete postData.category_name;
    setExportForm(postData);
    const res = await listPage(postData);
    if (res?.code !== pubConfig.sCode) {
      pubMsg(res?.message);
      dataSourceSet([]);
    }
    let dataFlat: any[] = [];
    if (res?.data?.data?.list?.length) {
      initColumnsAction(res);
      const dataC: any = res?.data?.data?.list;
      // const dataC = new Array(100).fill(res?.data?.data?.list[2])
      const newData = dataC.map((item: any) => {
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
    totalNumSet(res.data?.total || '-');
    // if ((refreshColumns != dataFlat?.[0]?.details?.length) || dimensionChange) {
    //   refreshColumnsSet(getUuid());
    // }
    // dimensionChangeSet(false)
    refreshColumnsSet(Date.now());
    dataSourceSet(dataFlat);
    setTimeout(() => {
      addListenTds();
    }, 1000);
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
            const postData = {
              ...values,
              pageIndex: 1,
              pageSize: pagination.pageSize,
            };
            setExportForm(postData);
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
        />
        <ProTable
          className="custom-cn"
          columns={columnsFormat}
          pagination={false}
          onSubmit={() => {
            pagination.current = 1;
          }}
          params={{
            current: pagination.current,
            pageSize: pagination.pageSize,
          }}
          search={false}
          bordered
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          loading={loading}
          dataSource={dataSource || []}
          headerTitle={<span>总销量：{totalNum}</span>}
          options={false}
          defaultSize={'small'}
          rowKey="id"
          dateFormatter="string"
          revalidateOnFocus={false}
          toolBarRender={() => [
            <Space key="space">
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
              <CustomColumnSet
                defaultHideColumn={['erpNo']}
                columns={columns}
                customColumnsSet={customColumnsSet}
                customExportConfigSet={customExportConfigSet}
                refreshColumns={refreshColumns}
                customClassName="warning-pop"
              />
            </Space>,
          ]}
          scroll={{ x: 1200, y: 'calc( 100vh - 360px)' }}
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
              let setting: any = {};

              if (pagination.pageSize == pageSize) {
                setting = { ...pagination, current, pageSize };
              } else {
                setting = { ...pagination, current: 1, pageSize };
              }
              console.log(current, pageSize, setting, '99');
              paginationSet(setting);
              const postData = {
                ...formRef?.current?.getFieldsValue(),
                pageIndex: setting.current,
                pageSize: setting.pageSize,
              };
              setExportForm(postData);
              getAction(postData);
            }}
            showSizeChanger
            size={'small'}
            {...pagination}
          />
        </div>
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

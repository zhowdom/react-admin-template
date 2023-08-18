import { useAccess } from 'umi';
import React, { useRef, useState } from 'react';
import { Space, Button, Pagination } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import * as api from '@/services/pages/after-sales';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import RangeTimeSearch from '@/components/PubForm/RangeTimeSearch';
import { pubProLineList } from '@/utils/pubConfirm';
import moment from 'moment';
import { pubBlobDownLoad } from '@/utils/pubConfirm';
import { DownloadOutlined } from '@ant-design/icons';
import { flatData } from '@/utils/filter';
import Chart from '../components/Chart';

/*客诉分类统计 - 列表页*/
const Page: React.FC<{
  onTabChange?: any;
  history?: any;
  common?: any;
  goodsCodeSet: any;
  timeRangeSet: any;
  [k: string]: any;
}> = ({ history, common, onTabChange, goodsCodeSet, timeRangeSet }) => {
  const [downloading, downloadingSet] = useState(false);
  const [exportForm, exportFormSet] = useState<any>({});
  const [pagination, paginationSet] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
  });
  const formRef: any = useRef<ProFormInstance>();
  const actionRef: any = useRef<ActionType>();
  const access = useAccess();

  // 导出excel
  const downLoad = async () => {
    if (!access.canSee('liyi99-report_feedback_classify_export')) {
      pubMsg('您暂无"导出"权限, 可联系管理员开通哦~');
      return;
    }
    downloadingSet(true);
    const res: any = await api.statisticsExport(exportForm);
    downloadingSet(false);
    pubBlobDownLoad(res, '商品数据');
  };
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '下单时间',
      dataIndex: 'timeRange',
      hideInTable: true,
      order: 22,
      initialValue: {
        type: '30day',
        dates: [
          moment(new Date()).add(-30, 'day'),
          moment(new Date()),
        ],
      },
      renderFormItem: () => <RangeTimeSearch />,
      search: {
        transform: (val: any) => {
          // console.log(moment(val.dates[0]).format('YYYY-MM-DD'))
          // console.log(moment(val.dates[1]).format('YYYY-MM-DD'))
          if (val?.dates && val.dates[0] && val.dates[1]) {
            return {
              purchaseTimeStart: moment(val.dates[0]).format('YYYY-MM-DD') + ' 00:00:00',
              purchaseTimeEnd: moment(val.dates[1]).format('YYYY-MM-DD') + ' 23:59:59',
            };
          }
          return {};
        },
      },
    },
    {
      title: '产品线',
      dataIndex: 'categoryName',
      align: 'center',
      hideInSearch: true,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '产品线',
      dataIndex: 'categoryId',
      align: 'center',
      valueType: 'select',
      request: () => pubProLineList({ business_scope: 'IN' }),
      fieldProps: { showSearch: true },
      hideInTable: true,
    },
    {
      title: '产品编码',
      dataIndex: 'goodsCode',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      search: {
        transform: (val: any) => ({ goodsCode: val.trim() }),
      },
    },
    {
      title: '产品名称',
      dataIndex: 'goodsName',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      search: {
        transform: (val: any) => ({ goodsName: val.trim() }),
      },
    },
    {
      title: '产品生命周期',
      dataIndex: 'goodsLifeCycle',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      fieldProps: { showSearch: true },
      valueEnum: common?.dicList?.GOODS_LIFE_CYCLE || {},
    },
    {
      title: '总客诉数',
      tooltip: '客诉明细中按款式汇总所有客诉记录',
      dataIndex: 'total',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      render: (_, record) => (
        <Chart
          params={{ goodsId: record.goodsId,
            purchaseTimeStart: exportForm.purchaseTimeStart,
            purchaseTimeEnd: exportForm.purchaseTimeEnd }}
          trigger={<a>{record.total}</a>}
          title={'总客诉数 - 趋势图'}
          page={'KStongji'}
        />
      ),
      hideInSearch: true,
    },
    {
      title: '客诉分类',
      dataIndex: 'parentLabelName',
      align: 'center',
      hideInSearch: true,
      onCell: (record: any) => ({ rowSpan: record.rowSpan2 }),
      colSpan: 2,
      render: (_, record) => (
        <Chart
          params={{
            goodsId: record.goodsId,
            parentLabelId: record.parentLabelId,
            purchaseTimeStart: exportForm.purchaseTimeStart,
            purchaseTimeEnd: exportForm.purchaseTimeEnd,
          }}
          trigger={<a>{record.parentLabelName}</a>}
          title={`客诉分类: ${record.parentLabelName} - 趋势图`}
          page={'KStongji'}
        />
      ),
    },
    {
      title: '',
      dataIndex: 'labelName',
      align: 'center',
      colSpan: 0,
      hideInSearch: true,
    },
    {
      title: '客诉数量',
      tooltip: '客诉明细中按款式+平台分类的汇总的客诉数',
      dataIndex: 'num',
      align: 'center',
      hideInSearch: true,
      render: (_, record) => (
        <Chart
          params={{
            goodsId: record.goodsId, labelId: record.labelId,
            purchaseTimeStart: exportForm.purchaseTimeStart,
            purchaseTimeEnd: exportForm.purchaseTimeEnd,
          }}
          trigger={<a>{record.num}</a>}
          title={`客诉子分类: ${record.labelName} - 趋势图`}
          page={'KStongji'}
        />
      ),
    },
    {
      title: '占比',
      tooltip: '客诉数量 / 总客诉数',
      dataIndex: 'ratio',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      tooltip: (<>
        1、点击查看客诉明细，可跳转到客诉明细页面，并将当前款式编码和时间带过去作为查询条件
        <br />
        2、点击款式分类统计，跳转到按款式页面，并将产品编码和时间带过去作为查询条件
      </>),
      width: 90,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (_, record: any) => (
        <Space>
          <a
            onClick={() => {
              history.push({
                pathname: '/after-sales/feedback-detail',
                state: {
                  ...formRef?.current?.getFieldsFormatValue(),
                  searchType: 'purchaseTime',//  下单时间
                  skuCode: record.goodsCode,
                },
              });
            }}
          >
            查看客诉明细
          </a>
          <a
            onClick={() => {
              goodsCodeSet(record.goodsCode);
              timeRangeSet(formRef?.current?.getFieldFormatValue('timeRange'));
              setTimeout(() => {
                onTabChange('Sku');
              }, 200);
            }}
          >
            款式分类统计
          </a>
        </Space>
      ),
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
  ];
  return (
    <>
      <ProTable
        bordered
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        pagination={false}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        params={{
          current: pagination.current,
          pageSize: pagination.pageSize,
        }}
        onSubmit={() => {
          pagination.current = 1;
        }}
        request={async (params: any) => {
          const formData = {
            ...params,
            pageIndex: params.current,
            dimension: 'GOODS',
          };
          delete formData.timeRange;
          delete formData.current;
          exportFormSet(formData);
          const res = await api.statisticsPage(formData);
          if (res?.code != pubConfig.sCodeOrder) {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          let dataFlat: any[] = [];
          if (res?.data?.list?.length) {
            dataFlat = flatData(res.data.list, 'parentLabelList', 'labelList');
          }
          // console.log(dataFlat, 'dataFlat');
          paginationSet({ ...pagination, total: res?.data?.total || 0 });
          return {
            success: true,
            data: dataFlat || [],
          };
        }}
        rowKey={(record: any) => record.goodsId + record.parentLabelId + record.labelId}
        dateFormatter="string"
        headerTitle={'客诉分类统计'}
        toolBarRender={() => [
          <Space key={'tools'}>
            {access.canSee('liyi99-report_feedback_classify_export') ? (
              <Button
                icon={<DownloadOutlined />}
                ghost
                type="primary"
                disabled={downloading}
                loading={downloading}
                onClick={() => {
                  downLoad();
                }}
              >
                导出
              </Button>
            ) : null}
          </Space>,
        ]}
        scroll={{ x: 800 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        showSorterTooltip={false}
        search={{span: 8, defaultCollapsed: false, className: 'light-search-form' }}
      />
      {/*ProTable合并单元格分页bug, 需要自定义分页*/}
      <div
        style={{
          position: 'sticky',
          padding: '1px 24px',
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
    </>
  );
};

export default Page;

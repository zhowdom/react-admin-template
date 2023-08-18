import { Access, useAccess } from 'umi';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Space } from 'antd';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import * as api from '@/services/pages/after-sales';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import Update from './Dialogs/Update';
import RangeTimeSearchFeeDetail from '@/components/PubForm/RangeTimeSearchFeeDetail';
import FeedBackDeatilComments from '@/components/PubForm/FeedBackDeatilComments';
import TagLabel from '@/components/PubForm/TagLabel';
import moment from 'moment';
import { pubBlobDownLoad,pubProLineList } from '@/utils/pubConfirm';
import { DownloadOutlined } from '@ant-design/icons';

/*客诉明细 - 列表页*/
const Page: React.FC<{ common: any; history: any }> = ({ history }) => {
  const [downloading, downloadingSet] = useState(false);
  const [exportForm, exportFormSet] = useState({});
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [selectedRowKeys, selectedRowKeysSet] = useState([]);
  const [selectedRow, selectedRowSet] = useState([]);
  const [tableKey, tableKeySet] = useState<any>(0);
  const reload = () => {
    selectedRowKeysSet([]);
    selectedRowSet([]);
    actionRef.current?.reload();
  };
  // 导出excel
  const downLoad = async () => {
    if (!access.canSee('liyi99-report_feedback_detail_export')) {
      pubMsg('您暂无"导出"权限, 可联系管理员开通哦~');
      return;
    }
    downloadingSet(true);
    const res: any = await api.tagExport(exportForm);
    downloadingSet(false);
    pubBlobDownLoad(res, '商品数据');
  };
  console.log(history.location?.state, 'history.location?.state');
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '下单时间',
      dataIndex: 'timeRange',
      hideInTable: true,
      formItemProps: {
        noStyle: true,
        label: '',
      },
      order: 20,
      initialValue: {
        type: history.location?.state?.timeRange?.type || '30day',
        searchType: history.location?.state?.searchType || 'purchaseTime',
        dates: history.location?.state?.timeRange?.dates
          ? [
            moment(history.location?.state?.timeRange?.dates[0]),
            moment(history.location?.state?.timeRange?.dates[1]),
          ]
          : [moment(new Date()).add(-30, 'day'), moment(new Date()),],
      },
      renderFormItem: () => <RangeTimeSearchFeeDetail />,
      search: {
        transform: (val: any) => {
          // console.log(val)
          // console.log(moment(val.dates[0]).format('YYYY-MM-DD'))
          // console.log(moment(val.dates[1]).format('YYYY-MM-DD'))
          if (val?.dates && val.dates[0] && val.dates[1]) {
            return {
              beginComplaintTime: val.searchType == 'complaintTime' ? moment(val.dates[0]).format('YYYY-MM-DD') + ' 00:00:00' : null, // 客诉时间
              endComplaintTime: val.searchType == 'complaintTime' ? moment(val.dates[1]).format('YYYY-MM-DD') + ' 23:59:59' : null, // 客诉时间
              purchaseTimeStart: val.searchType == 'purchaseTime' ? moment(val.dates[0]).format('YYYY-MM-DD') + ' 00:00:00' : null, // 下单时间
              purchaseTimeEnd: val.searchType == 'purchaseTime' ? moment(val.dates[1]).format('YYYY-MM-DD') + ' 23:59:59' : null, // 下单时间
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
    },
    {
      title: '产品线',
      dataIndex: 'categoryId',
      align: 'center',
      valueType: 'select',
      order: 19,
      request: () => pubProLineList({ business_scope: 'IN' }),
      fieldProps: { showSearch: true },
      hideInTable: true,
    },
    {
      title: '款式名称',
      dataIndex: 'skuName',
      align: 'center',
      order: 18,
      search: {
        transform: (val: any) => ({ skuName: val.trim() }),
      },
    },
    {
      title: '款式编码',
      dataIndex: 'skuCode',
      align: 'center',
      order: 17,
      initialValue: history.location?.state?.skuCode || '',
      search: {
        transform: (val: any) => ({ skuCode: val.trim() }),
      },
    },
    {
      title: '店铺SKU',
      dataIndex: 'sku',
      align: 'center',
      order: 16,
      search: {
        transform: (val: any) => ({ sku: val.trim() }),
      },
    },
    {
      title: '客诉类型',
      tooltip: (
        <div>
          <p>1、当前客诉类型只包括退货和换货，数据来源于退货报告和换货报告，根据原订单号去查询</p>
          <p>2、当换货发生的时候，退货报告也会有一条退货数据，但是因为和换货报告中的数据重复，本页面不会保留这一条退货记录</p>
          <p>3、Feedback和Review类型的客诉，目前还在想办法抓取，进入系统后会第一时间通知</p>
        </div>
      ),
      dataIndex: 'typeName',
      initialValue: history.location?.state?.typeName || '',
      align: 'center',
      valueType: 'select',
      order: 15,
      valueEnum: {
        RETURN: '退货',
        REPLACE: '换货',
        FEEDBACK: 'Feedback',
        REVIEW: 'Review',
      },
      search: {
        transform: (val: string) => ({ type: val }),
      },
    },
    {
      title: '原订单号',
      dataIndex: 'originalOrderId',
      align: 'center',
      order: 11,
    },
    {
      title: '平台客诉分类',
      tooltip: (
        <div>退换货报告中的中文原因</div>
      ),
      dataIndex: 'platformClassifyName',
      align: 'center',
      order: 12,
      width: 110,
    },
    {
      title: '客诉描述',
      tooltip: (
        <div>退换货报告中的客诉英文描述</div>
      ),
      dataIndex: 'customerComments',
      align: 'center',
      order: 10,
      renderFormItem: () => <FeedBackDeatilComments />,
      search: {
        transform: (val: any) => {
          return {
            isNotNullComments: val.type || '',
            customerComments: val.text || '',
          };
        },
      },
    },
    {
      title: '下单时间/客诉时间',
      tooltip: (
        <div>
          <p>1、下单时间：指的是原订单的下单时间</p>
          <p>2、客诉时间：</p>
          <p>2.1 当客诉类型为退货时，客诉时间指的是退货时间</p>
          <p>2.2 当客诉类型为换货时，客诉时间指的是换货单发货时间</p>
          <p>2.3 其他类型则指的是创建时间，目前尚未入系统</p>
        </div>
      ),
      dataIndex: 'complaintTime',
      align: 'left',
      width: 150,
      ellipsis: true,
      hideInSearch: true,
      render: (_, record: any) => (
        <span>
          下单时间：<br />{record.purchaseTime || '-'}<br />
          客诉时间：<br />{record.complaintTime || '-'}
        </span>
      ),
    },
    {
      title: '自定义分类状态',
      hideInTable: true,
      dataIndex: 'status',
      order: 14,
      align: 'center',
      renderText: (text) => (text == 1 ? '已确认' : '未确认'),
      valueType: 'select',
      request: async () => {
        return [
          { label: '已确认', value: 1 },
          { label: '未确认', value: 0 },
        ];
      },
    },
    {
      title: '自定义分类',
      tooltip: (
        <div>
          <p>1、用户可针对产品线设置自定义分类标签</p>
          <p>2、针对具体订单客诉，用户可根据自己理解对客诉打上标签，用于后续的Amz客诉自定义分类统计</p>
        </div>
      ),
      dataIndex: 'labelName',
      align: 'center',
      order: 13,
      renderFormItem: () => <TagLabel />,
      search: {
        transform: (val: string[]) => ({ parentLabelId: val[0] || '', labelId: val[1] || '' }),
      },
    },
    {
      title: '自定义分类说明',
      tooltip: (
        <div>用户给客诉打上自定义分类标签时，可以根据实际情况添加说明，显示在此列 </div>
      ),
      dataIndex: 'remark',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '自定义分类时间',
      dataIndex: 'classifyTime',
      hideInSearch: true,
      width: 130,
      align: 'left',
      render: (_: any, record: any) => (
        <div>
          {record.classifyTime}
          <br />
          {record.classifyName}
        </div>
      ),
    },
    {
      title: '操作',
      width: 80,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => (
        <Space>
          <Access accessible={access.canSee('liyi99-report_feedback_detail_classify')}>
            {/*分类*/}
            <Update selectedRow={[record]} reload={reload} />
          </Access>
        </Space>
      ),
    },
  ];
  // 列表
  useEffect(() => {
    console.log(3636363)
    // console.log(timeRange)
    tableKeySet(new Date().getTime())
  }, [history.location?.state]);
  return (
    <PageContainer
      header={{ title: false, breadcrumb: {} }}
    >
      <ProTable
        bordered
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        pagination={{
          showSizeChanger: true,
        }}
        key={tableKey}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={async (params: any) => {
          const formData = {
            ...params,
            // isNotNullComments: tabStatus == 'all' ? null : Number(tabStatus),
            pageIndex: params.current,
          };
          delete formData.timeRange;
          delete formData.current;
          exportFormSet(formData);
          const res = await api.tagPage(formData);
          if (res?.code != pubConfig.sCodeOrder) {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          return {
            success: true,
            data: res?.data?.list || [],
            total: res?.data?.total || 0,
          };
        }}
        rowKey="id"
        dateFormatter="string"
        headerTitle={'客诉明细'}
        toolBarRender={() => [
          <Space key={'tools'}>
            {access.canSee('liyi99-report_feedback_detail_export') ? (
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
            <Access accessible={access.canSee('liyi99-report_feedback_detail_classify')}>
              {/*批量分类*/}
              <Update multiple selectedRow={selectedRow} reload={reload} />
            </Access>
          </Space>,
        ]}
        scroll={{ x: 1200 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        showSorterTooltip={false}
        search={{span: 8, labelWidth: 'auto', defaultCollapsed: false, className: 'light-search-form' }}
        rowSelection={{
          selectedRowKeys,
          onChange: (rowKeys: any, rows: any) => {
            selectedRowKeysSet(rowKeys);
            selectedRowSet(rows);
          },
        }}
      />
    </PageContainer>
  );
};

export default Page;

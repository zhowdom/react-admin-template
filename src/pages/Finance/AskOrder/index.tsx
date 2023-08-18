import React, { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import { Button, Space } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubGetUserList } from '@/utils/pubConfirm';
import { pubConfig, pubMsg, pubModal } from '@/utils/pubConfig';
import { Access, connect, useAccess } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import moment from 'moment';
import ExportBtn from '@/components/ExportBtn';
import Detail from './components/Detail';
import PriceSearch from './components/PriceSearch';
import { history } from 'umi';
import RemarkModal from './components/RemarkModal';
import { ReconciliationOutlined } from '@ant-design/icons';
import {
  confirmDocument,
  confirmPayment,
  exportExcel,
  requestFundsProcessList,
  statusCount,
} from '@/services/pages/askOrder';
import { priceValue } from '@/utils/filter';

const cacheTabKey = 'FINANCEASKORDER'; // tab缓存
const In: React.FC<{ common: any; history?: any }> = ({ common }) => {
  const { dicList } = common;
  const access = useAccess();
  const formRef = useRef<ProFormInstance>(); // 页面查询条件
  const _ref = useRef();
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, selectedRowKeysSet] = useState<any[]>([]);
  const [selectedRowData, selectedRowDataSet] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState<any>(20);
  const [tabList, setTabList] = useState<any>([]);
  const [tabStatus, setTabStatus] = useState<any>(
    window.sessionStorage.getItem(cacheTabKey) || '2',
  );
  const [exportForm, setExportForm] = useState<any>({});
  // 搜索清除前后空格
  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  // 激活页面请求列表
  useActivate(() => {
    if (actionRef?.current) actionRef?.current?.reload();
  });

  // 批量打印
  const batchPrint = (selectedRowDataC: any, single?: any) => {
    if (selectedRowDataC.some((v: any) => v.print_times)) {
      const orders = selectedRowDataC?.filter((v: any) => v.print_times);
      const content = orders.map((v: any, i: number) => (
        <>
          <div key={v.process_instance_id}>
            {i == orders.length - 1 ? `${v.process_instance_id}` : `${v.process_instance_id}、`}
          </div>
          <div style={{ display: i == orders.length - 1 ? 'block' : 'none' }}>
            请款单已存在打印记录，是否继续，确认则继续
          </div>
        </>
      ));
      pubModal(content, '提示', {
        okText: '是',
        cancelText: '否',
        width: 400,
      })
        .then(async () => {
          if (single) {
            _ref?.current?.visibleChange(false);
          }
          setTimeout(() => {
            // const el: any = document.createElement('a');
            // document.body.appendChild(el);
            // el.href = encodeURI(
            //   `/askOrder-print?ids=${selectedRowDataC
            //     ?.map((v: any) => v.process_instance_id)
            //     ?.join(',')}`,
            // );
            // el.target = '_blank';
            // el.click();
            // document.body.removeChild(el);
            history.push(
              `/askOrder-print?ids=${selectedRowDataC
                ?.map((v: any) => v.process_instance_id)
                ?.join(',')}`,
            );
          }, 200);
        })
        .catch(() => {});
    } else {
      pubModal(undefined, single ? '确定打印吗?' : '确定批量打印吗?')
        .then(async () => {
          if (single) {
            _ref?.current?.visibleChange(false);
          }
          setTimeout(() => {
            history.push(
              `/askOrder-print?ids=${selectedRowDataC
                ?.map((v: any) => v.process_instance_id)
                ?.join(',')}`,
            );
          }, 200);
        })
        .catch(() => {
          console.log('点击了取消');
        });
    }
  };
  // table配置
  const columns: any[] = [
    {
      title: '审批编号',
      dataIndex: 'process_instance_id',
      align: 'center',
      hideInSearch: true,
      width: 280,
      render: (_: any, record: any) =>
        access.canSee('scm_askOrder_detail') ? (
          <Detail
            batchPrint={() => {
              batchPrint([record], true);
            }}
            _ref={_ref}
            print_times={record.print_times}
            id={record.process_instance_id}
            record={record}
            dicList={common.dicList}
            access={access}
            reload={actionRef?.current?.reload}
            btnText={record?.process_instance_id ?? '-'}
          />
        ) : (
          record?.process_instance_id ?? '-'
        ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      align: 'center',
      hideInSearch: true,
      width: 300,
    },
    {
      title: '费用类型',
      dataIndex: 'funds_type',
      align: 'center',
      order: 6,
      //   valueType: 'select',
      //   valueEnum: dicList?.SC_YES_NO || {},
    },
    {
      title: '请款金额',
      dataIndex: 'request_amount',
      align: 'center',
      order: 5,
      renderFormItem: () => <PriceSearch />,
      render: (_: any, record: any) => priceValue(record?.request_amount),
      search: {
        transform: (val: any) => ({
          funds_min: val[0],
          funds_max: val[1],
        }),
      },
    },
    {
      title: '发起时间',
      dataIndex: 'initiate_time',
      align: 'center',
      hideInSearch: true,
      width: 140,
    },
    {
      title: '要求付款时间',
      dataIndex: 'request_payment_time',
      align: 'center',
      width: 140,
      render: (_: any, record: any) => record.request_payment_time ?? '-',
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (val: any) => ({
          request_payment_time_start: val[0] && moment(val[0]).format('YYYY-MM-DD'),
          request_payment_time_end: val[1] && moment(val[1]).format('YYYY-MM-DD'),
        }),
      },
      order: 2,
    },
    {
      title: '确认付款时间',
      dataIndex: 'confirm_payment_time',
      align: 'center',
      hideInSearch: true,
      width: 140,
    },
    {
      title: '请款人',
      dataIndex: 'request_id',
      hideInTable: true,
      order: 4,
      fieldProps: selectProps,
      valueType: 'select',
      request: async (v: any) => {
        const res: any = await pubGetUserList(v);
        return res.map((k: any) => ({
          ...k,
          value: k.dingdingId
        }));
      },
      render: (_: any, record: any) => record?.requester_name,
    },
    {
      title: '请款时间',
      dataIndex: 'ask_time',
      align: 'center',
      width: 120,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (val: any) => ({
          request_time_start: val[0] && moment(val[0]).format('YYYY-MM-DD'),
          request_time_end: val[1] && moment(val[1]).format('YYYY-MM-DD'),
        }),
      },
      hideInTable: true,
      order: 3,
    },
    {
      title: '流程状态',
      dataIndex: 'status',
      align: 'center',
      order: 1,
      valueType: 'select',
      valueEnum: dicList?.REQUEST_FUNDS_LIST_STATUS || {},
    },
    {
      title: '操作',
      fixed: 'right',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 120,
      render: (_, record: any) => {
        return (
          <Space direction={'vertical'} size={0}>
            {access.canSee('scm_askOrder_detail') && (
              <Detail
                batchPrint={() => {
                  batchPrint([record], true);
                }}
                _ref={_ref}
                print_times={record.print_times}
                id={record.process_instance_id}
                record={record}
                dicList={common.dicList}
                access={access}
                reload={actionRef?.current?.reload}
                title={<a key="detail">详情</a>}
              />
            )}
          </Space>
        );
      },
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 2300);
  // 获取状态及数据统计
  const statusCountAction = async () => {
    let allNum = 0;
    const res: any = await statusCount({});
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const tabs = res.data.map((v: any) => {
        allNum += v.count;
        return {
          key: v.key,
          tab: `${v.name} (${v.count})`,
        };
      });
      setTabList([...tabs, { key: 'all', tab: `全部(${allNum})` }]);
    }
  };
  // 切换tabs时
  const changeTabs = async (key: any) => {
    setTabStatus(key);
    window.sessionStorage.setItem(cacheTabKey, key);
    setPageSize(20);
  };

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      fixedHeader
      tabActiveKey={tabStatus || '2'}
      className="pubPageTabs askOrderWrapper"
      tabList={tabList}
      onTabChange={changeTabs}
    >
      <ProTable<any>
        size={'small'}
        actionRef={actionRef}
        formRef={formRef}
        bordered
        rowKey="process_instance_id"
        pagination={{
          showSizeChanger: true,
          pageSize,
          onChange: (page, size) => {
            setPageSize(size);
          },
        }}
        params={{ tabStatus }}
        dateFormatter="string"
        request={async (params) => {
          selectedRowKeysSet([]);
          selectedRowDataSet([]);
          const postData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
            tab_status: tabStatus == 'all' ? '5' : tabStatus, //状态
            shipment_begin_cycle_time: params?.cycle_time?.[1] || null, //下单时间-开始
            shipment_end_cycle_time: params?.cycle_time?.[2] || null, //下单时间-结束
            cycle_time: params?.cycle_time?.[0] || null,
          };
          const res = await requestFundsProcessList(postData);
          setExportForm(postData);
          statusCountAction();
          const data = res.data?.records?.map((v: any) => ({
            ...v,
            box_num: v.num,
          }));
          if (res && res.code == pubConfig.sCode) {
            return {
              total: res.data?.total || 0,
              data: data || [],
              success: true,
            };
          }
          return {
            total: 0,
            data: [],
            success: false,
          };
        }}
        columns={columns}
        search={{ labelWidth: 120, className: 'light-search-form', defaultCollapsed: false }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        rowSelection={{
          selectedRowKeys,
          onChange: (rowKeys: any, rowItems: any) => {
            selectedRowKeysSet(rowKeys);
            selectedRowDataSet(rowItems);
          },
          fixed: 'left',
        }}
        tableAlertRender={false}
        headerTitle={
          <Space>
            <Access key="print" accessible={access.canSee('scm_askOrder_printB')}>
              <Button
                type="primary"
                ghost
                disabled={!selectedRowData?.length}
                size="small"
                icon={<ReconciliationOutlined />}
                onClick={() => {
                  batchPrint(selectedRowData);
                }}
              >
                批量打印
              </Button>
            </Access>
            <Access key="makeOrder" accessible={access.canSee('scm_askOrder_confirmOrderB') && !['3','4'].includes(tabStatus)}>
              <RemarkModal
                api={confirmDocument}
                selectedRowData={selectedRowData}
                btnText="批量确认制单"
                reload={actionRef?.current?.reload}
              />
            </Access>
            <Access key="pay" accessible={access.canSee('scm_askOrder_confirmPaidB') && !['3','4'].includes(tabStatus)}>
              <RemarkModal
                api={confirmPayment}
                selectedRowData={selectedRowData}
                btnText="批量确认付款"
                reload={actionRef?.current?.reload}
              />
            </Access>
          </Space>
        }
        {...ColumnSet}
        toolBarRender={() => [
          <Space key="space">
            {access.canSee('scm_askOrder_export') && (
              <ExportBtn
                exportHandle={exportExcel}
                btnText="导出明细"
                exportForm={{
                  ...exportForm,
                  export_config: { columns: ColumnSet.customExportConfig },
                }}
              />
            )}
          </Space>,
        ]}
      />
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(In);
export default ConnectPage;

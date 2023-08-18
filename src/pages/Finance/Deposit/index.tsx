import React, { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import { Space } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubGetUserList } from '@/utils/pubConfirm';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { Access, connect, useAccess } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import moment from 'moment';
import Detail from '../AskOrder/components/Detail';
import Update from './components/Update';
import CollectionLog from './components/CollectionLog';
import { requestFundsDeposit, statusCount } from '@/services/pages/deposit';
import { priceValue } from '@/utils/filter';

const cacheTabKey = 'FINANCEDEPOSIT'; // tab缓存
const In: React.FC<{ common: any; history?: any }> = ({ common }) => {
  const { dicList } = common;
  const access = useAccess();
  const formRef = useRef<ProFormInstance>(); // 页面查询条件
  const actionRef = useRef<ActionType>();
  const [pageSize, setPageSize] = useState<any>(20);
  const [tabList, setTabList] = useState<any>([]);
  const [tabStatus, setTabStatus] = useState<any>(
    window.sessionStorage.getItem(cacheTabKey) || '1',
  );
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

  // table配置
  const columns: any[] = [
    {
      title: '来源单号',
      dataIndex: 'process_instance_id',
      align: 'center',
      hideInTable: true,
      order: 3,
    },
    {
      title: '收款单号',
      dataIndex: 'receipt_no',
      align: 'center',
      hideInSearch: true,
      width: 140,
    },
    {
      title: '预计收款时间',
      dataIndex: 'expect_receive_time',
      align: 'center',
      hideInSearch: true,
      width: 140,
      render: (_: any, record: any) =>
        record?.expect_receive_time
          ? moment(record?.expect_receive_time).format('YYYY-MM-DD')
          : '-',
    },
    {
      title: '预计收款时间',
      dataIndex: 'expect_receive_time',
      align: 'center',
      width: 120,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (val: any) => ({
          expect_receive_time_start: val[0] && moment(val[0]).format('YYYY-MM-DD') + ' 00:00:00',
          expect_receive_time_end: val[1] && moment(val[1]).format('YYYY-MM-DD') + ' 23:59:59',
        }),
      },
      hideInTable: true,
      order: 1,
    },
    {
      title: '押金金额',
      dataIndex: 'deposit_amount',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        typeof record.deposit_amount == 'number' ? priceValue(record.deposit_amount) : '-',
    },
    {
      title: '押金内容',
      dataIndex: 'deposit_content',
      align: 'center',
      hideInSearch: true,
      width: 300,
    },
    {
      title: '已收金额',
      dataIndex: 'received_amount',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        typeof record.received_amount == 'number' ? priceValue(record.received_amount) : '-',
    },
    {
      title: '结算币种',
      dataIndex: 'settlement_currency',
      align: 'center',
      hideInSearch: true,
      valueType: 'select',
      valueEnum: dicList?.SC_CURRENCY || {},
    },
    {
      title: '收款状态',
      dataIndex: 'payment_status',
      align: 'center',
      hideInSearch: true,
      valueType: 'select',
      valueEnum: dicList?.REQUEST_FUNDS_DEPOSIT_STATUS || {},
    },
    {
      title: '请款人',
      dataIndex: 'request_id',
      order: 2,
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
      title: '来源单号(请款审批编号)',
      dataIndex: 'process_instance_id',
      align: 'center',
      width: 280,
      hideInSearch: true,
      render: (_: any, record: any) =>
        access.canSee('scm_deposit_sourceOrder_detail') ? (
          <Detail
            from="deposit"
            id={record.process_instance_id}
            record={record}
            dicList={common.dicList}
            reload={actionRef?.current?.reload}
            title={<a key="detail">详情</a>}
          />
        ) : (
          record?.record.process_instance_id ?? '-'
        ),
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
          <Space>
            <Access key="edit" accessible={access.canSee('scm_deposit_collection')}>
              <Update
                record={record}
                reload={() => {
                  actionRef?.current?.reload();
                }}
              />
            </Access>
            <Access key="edit" accessible={access.canSee('scm_deposit_record')}>
              <CollectionLog receipt_no={record.receipt_no} />
            </Access>
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
      tabActiveKey={tabStatus || '1'}
      className="pubPageTabs deposit-wrapper"
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
          const postData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
            tab_status: tabStatus == 'all' ? '4' : tabStatus, //状态
          };
          const res = await requestFundsDeposit(postData);
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
        tableAlertRender={false}
        {...ColumnSet}
      />
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(In);
export default ConnectPage;

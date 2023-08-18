import {Access, connect, useAccess} from 'umi';
import React, {useRef} from 'react';
import {useActivate} from 'react-activation';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable, PageContainer} from '@ant-design/pro-components';
import {Button, Popconfirm, Space} from 'antd';
import {history} from 'umi'
import {pubConfig, pubMsg, pubResponse} from '@/utils/pubConfig';
import {page, applyApproval, voided, withdraw} from '@/services/pages/warehouse/stock'
import {createUserList} from "@/services/pages/warehouse/input";
import OutputAndReturn from '../components/OutputAndReturn'
import CommonLogAms from "@/components/CommonLogAms";
// 包材配件领用出库 - 列表
const Page: React.FC<{ common: any }> = ({common}) => {
  const actionRef = useRef<ActionType>();
  const _refL: any = useRef();
  const access = useAccess();
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  const columns: ProColumns<any>[] = [
    {
      title: '出库单号',
      dataIndex: 'order_no',
    },
    {
      title: '状态',
      dataIndex: 'approve_status',
      align: 'center',
      valueType: 'select',
      fieldProps: {
        mode: 'multiple',
      },
      valueEnum: common.dicList?.SCM_OWN_STOCK_ORDER_STATUS || {},
    },
    {
      title: '创建人',
      dataIndex: 'create_user_id',
      align: 'center',
      render: (_, record) => record.create_user_name,
      fieldProps: {showSearch: true},
      request: async (params) => {
        const res = await createUserList({user_name: params.keyWords, order_type: 'USE_PARTS_STOCK_OUT'})
        if (res?.code == pubConfig.sCode) {
          return res?.data || []
        } else {
          return []
        }
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 136,
      align: 'center',
      valueType: 'dateRange',
      render: (_, record: any) => record.create_time
    },
    {
      title: '操作',
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => <Space wrap>
        {/*FAIL_APPROVAL: 审核不通过, FINISHED: 已完成, ISSUED: 已出库, NEW, PASS_APPROVAL: 审核通过, RETURNED: 已归还, VOIDED; 已作废, WAIT_APPROVAL: 待审核*/}
        <Access accessible={access.canSee('warehouse-output-po-edit') && ['NEW', 'VOIDED'].includes(record.approve_status)}>
          <a onClick={() => history.push(`/warehouse/output/po-detail?id=${record.id}&edit=1`)}>编辑</a>
        </Access>
        <Access accessible={access.canSee('warehouse-output-po-approval') && record.approve_status == 'NEW'}>
          <Popconfirm
            title={'确定"提交审核"?'}
            onConfirm={async () => {
              const res = await applyApproval({id: record.id})
              pubResponse(res, actionRef.current?.reload)
            }}
            okText="确定"
            cancelText="取消"
          >
            <a>提交审核</a>
          </Popconfirm>
        </Access>
        <Access accessible={access.canSee('warehouse-output-po-voided') && ['NEW', 'FAIL_APPROVAL', 'PASS_APPROVAL'].includes(record.approve_status)}>
          <Popconfirm
            title={'确定"作废"?'}
            onConfirm={async () => {
              const res = await voided({id: record.id})
              pubResponse(res, actionRef.current?.reload)
            }}
            okText="确定"
            cancelText="取消"
          >
            <a>作废</a>
          </Popconfirm>
        </Access>
        <Access accessible={access.canSee('warehouse-output-po-withdraw') && ['WAIT_APPROVAL'].includes(record.approve_status)}>
          <Popconfirm
            title={'确定"撤回"?'}
            onConfirm={async () => {
              const res = await withdraw({id: record.id})
              pubResponse(res, actionRef.current?.reload)
            }}
            okText="确定"
            cancelText="取消"
          >
            <a>撤回</a>
          </Popconfirm>
        </Access>
        <Access accessible={access.canSee('warehouse-output-po-output') && record.approve_status == 'PASS_APPROVAL'}>
          <OutputAndReturn title={'出库确认'} initialValues={record} reload={actionRef.current?.reload} />
        </Access>
        <Access accessible={access.canSee('warehouse-output-po-approval') && record.approve_status == 'WAIT_APPROVAL'}>
          <a onClick={() => history.push(`/warehouse/output/po-detail?id=${record.id}&approval=1`)}>审核</a>
        </Access>
        <Access accessible={access.canSee('warehouse-output-po-detail')}>
          <a onClick={() => history.push(`/warehouse/output/po-detail?id=${record.id}`)}>详情</a>
        </Access>
        <Access accessible={access.canSee('warehouse-output-po-log')}>
          <a
            onClick={() => {
              _refL.current.visibileChange(
                true,
                record?.id
              );
            }}
          >
            操作日志
          </a>
        </Access>
      </Space>,
    },
  ];
  return (
    <PageContainer header={{title: false, breadcrumb: {}}}>
      <ProTable
        headerTitle={<Space key="toolbar">
          <Access accessible={access.canSee('warehouse-output-po-create')}>
            <Button onClick={() => {
              history.push('/warehouse/output/po-detail')
            }} type={'primary'}>创建出库单</Button>
          </Access>
        </Space>}
        rowKey="id"
        bordered
        actionRef={actionRef}
        options={{fullScreen: true, setting: false}}
        search={{defaultCollapsed: false, className: 'light-search-form', labelWidth: 'auto'}}
        dateFormatter="string"
        scroll={{x: 900}}
        sticky={{offsetHeader: 48}}
        defaultSize={'small'}
        columns={columns}
        params={{order_type: 'USE_PARTS_STOCK_OUT'}}
        request={async (params: any) => {
          const formData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
          };
          const res = await page(formData);
          if (res?.code == pubConfig.sCode) {
            return {
              success: true,
              data: res?.data?.records || [],
              total: res?.data?.total || 0,
            }
          } else {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
        }}
      />
      <CommonLogAms dicList={common?.dicList} _ref={_refL} />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({common}: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

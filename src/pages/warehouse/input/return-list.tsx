import {Access, connect, useAccess} from 'umi';
import React, {useRef} from 'react';
import {useActivate} from 'react-activation';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable, PageContainer} from '@ant-design/pro-components';
import {Space} from 'antd';
import {history} from 'umi'
import {pubConfig, pubMsg} from '@/utils/pubConfig';
import {returnOrderPage, returnWarehousingUserList} from '@/services/pages/warehouse/input'
import CommonLogAms from "@/components/CommonLogAms";
// 退货入库单 - 列表
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
      title: '退货入库单号',
      dataIndex: 'order_no',
    },
    {
      title: '销售订单号',
      dataIndex: 'erp_no',
    },
    {
      title: '销退单号',
      dataIndex: 'return_order_no',
    },
    {
      title: '是否关联销售订单号',
      dataIndex: 'is_relation_order',
      hideInTable: true,
      valueEnum: {0: '否', 1: '是'},
    },
    {
      title: '快递单号',
      dataIndex: 'express_code',
    },
    {
      title: '入库操作员',
      dataIndex: 'warehousing_user_id',
      width: 90,
      align: 'center',
      render: (_, record: any) => record.warehousing_user_name,
      fieldProps: {showSearch: true},
      request: async (params) => {
        const res = await returnWarehousingUserList({user_name: params.keyWords})
        if (res?.code == pubConfig.sCode) {
          return res?.data || []
        } else {
          return []
        }
      },
    },
    {
      title: '入库时间',
      dataIndex: 'warehousing_time',
      width: 136,
      align: 'center',
      valueType: 'dateRange',
      render: (_, record: any) => record.warehousing_time
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => <Space wrap>
        <Access accessible={access.canSee('warehouse-input-return-list-detail')}>
          <a onClick={() => {
            history.push('/warehouse/input/return-list-detail?id=' + record.id)
          }}>详情</a>
        </Access>
        <Access accessible={access.canSee('warehouse-input-return-list-log')}>
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
        headerTitle={'退货入库单'}
        rowKey="id"
        bordered
        actionRef={actionRef}
        options={{fullScreen: true, setting: false}}
        search={{defaultCollapsed: false, className: 'light-search-form', labelWidth: 'auto'}}
        dateFormatter="string"
        scroll={{x: 1000}}
        sticky={{offsetHeader: 48}}
        defaultSize={'small'}
        columns={columns}
        request={async (params: any) => {
          const formData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
          };
          const res = await returnOrderPage(formData);
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

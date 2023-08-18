import {Access, connect, useAccess} from 'umi';
import React, {useRef} from 'react';
import {useActivate} from 'react-activation';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable, PageContainer} from '@ant-design/pro-components';
import {Space} from 'antd';
import {history} from 'umi'
import {pubConfig, pubMsg} from '@/utils/pubConfig';
import {partsOrderPage, returnWarehousingUserList, partsPurchaserList} from '@/services/pages/warehouse/input'
import {pubGetVendorList } from "@/utils/pubConfirm";
import {getOperationHistory} from "@/services/pages/stockManager";
import CommonLog from "@/components/CommonLog";
// 包材配件入库单 - 列表
const Page: React.FC<{ common: any }> = ({common}) => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  const columns: ProColumns<any>[] = [
    {
      title: '入库单号',
      dataIndex: 'order_no',
    },
    {
      title: '状态',
      dataIndex: 'inboundStatus',
      width: 90,
      align: 'center',
      fieldProps: {
        mode: 'multiple',
      },
      valueEnum: common?.dicList?.SCM_PARTS_INBOUND_STATUS || {},
    },
    {
      title: '供应商',
      dataIndex: 'vendor_id',
      render: (_, record) => record.vendor_name,
      fieldProps: {showSearch: true},
      request: async (params) => pubGetVendorList(params),
    },
    {
      title: '采购员',
      dataIndex: 'create_user_id',
      width: 90,
      align: 'center',
      render: (_, record) => record.create_user_name,
      fieldProps: {showSearch: true},
      request: async (params) => {
        const res = await partsPurchaserList({user_name: params.keyWords})
        if (res?.code == pubConfig.sCode) {
          return res?.data || []
        } else {
          return []
        }
      },
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
      title: '创建时间',
      dataIndex: 'create_time',
      width: 136,
      align: 'center',
      valueType: 'dateRange',
      render: (_, record: any) => record.create_time
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => <Space wrap>
        <Access accessible={access.canSee('warehouse-input-po-list-detail')}>
          <a onClick={() => {
            history.push(`/warehouse/input/po-list-detail?id=${record.id}&order_no=${record.order_no}`)
          }}>详情</a>
        </Access>
        <Access accessible={access.canSee('warehouse-input-po-list-log')}>
          <CommonLog
            api={getOperationHistory}
            business_no={record.order_no}
            dicList={common?.dicList}
          />
        </Access>
      </Space>,
    },
  ];
  return (
    <PageContainer header={{title: false, breadcrumb: {}}}>
      <ProTable
        headerTitle={'包材配件入库单'}
        rowKey="id"
        bordered
        actionRef={actionRef}
        options={{fullScreen: true, setting: false}}
        search={{defaultCollapsed: false, className: 'light-search-form', labelWidth: 'auto'}}
        dateFormatter="string"
        scroll={{x: 800}}
        sticky={{offsetHeader: 48}}
        defaultSize={'small'}
        columns={columns}
        request={async (params: any) => {
          const formData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
          };
          const res = await partsOrderPage(formData);
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
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({common}: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

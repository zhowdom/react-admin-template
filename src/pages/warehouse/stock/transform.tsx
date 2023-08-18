import {Access, connect, useAccess} from 'umi';
import React, {useRef} from 'react';
import {useActivate} from 'react-activation';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable, PageContainer} from '@ant-design/pro-components';
import {Button, Space} from 'antd';
import {history} from 'umi'
import {pubConfig, pubMsg} from '@/utils/pubConfig';
import {page} from '@/services/pages/warehouse/stock'
import {createUserList} from "@/services/pages/warehouse/input";
import UploadFiles from '../components/UploadFiles'
import CommonLogAms from "@/components/CommonLogAms";
// 良品转不良品 - 列表
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
      title: '转换单号',
      dataIndex: 'order_no',
    },
    {
      title: '创建人',
      dataIndex: 'create_user_id',
      align: 'center',
      render: (_, record) => record.create_user_name,
      fieldProps: {showSearch: true},
      request: async (params) => {
        const res = await createUserList({user_name: params.keyWords, order_type: 'GOOD_TRANS_BAD'})
        if (res?.code == pubConfig.sCode) {
          return res?.data || []
        } else {
          return []
        }
      },
    },
    {
      title: '是否上传审核凭证',
      dataIndex: 'is_uploaded_approve',
      valueEnum: {
        1: {text: '已上传'},
        0: {text: '未上传'},
      },
      hideInTable: true,
    },
    {
      title: '状态',
      dataIndex: 'approve_status',
      align: 'center',
      renderText: () => '已完成',
      hideInSearch: true,
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
        <Access accessible={access.canSee('warehouse-stock-transform-upload')}>
          <UploadFiles title={`上传审核凭证(单号:${record.order_no})`}
                       initialValues={record}
                       requestUrl={'/sc-scm/ownStockManagement/uploadApproveFiles'}
                       requestDetailUrl={'/sc-scm/ownStockManagement/detail'}
                       requestParams={{id: record.id}}
                       reload={actionRef.current?.reload}/>
        </Access>
        <Access accessible={access.canSee('warehouse-stock-transform-detail')}>
          <a onClick={() => history.push(`/warehouse/stock/transform-detail?id=${record.id}`)}>详情</a>
        </Access>
        <Access accessible={access.canSee('warehouse-stock-transform-log')}>
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
          <Access accessible={access.canSee('warehouse-stock-transform-create')}>
            <Button onClick={() => {
              history.push('/warehouse/stock/transform-detail')
            }} type={'primary'}>创建转换单</Button>
          </Access>
        </Space>}
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
        params={{order_type: 'GOOD_TRANS_BAD'}}
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

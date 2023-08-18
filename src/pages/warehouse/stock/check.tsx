import {Access, connect, useAccess} from 'umi';
import React, {useRef} from 'react';
import {useActivate} from 'react-activation';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable, PageContainer} from '@ant-design/pro-components';
import {Button, Space, Popover, Popconfirm} from 'antd';
import {history} from 'umi'
import {pubConfig, pubMsg} from '@/utils/pubConfig';
import {page, detailDownload} from '@/services/pages/warehouse/stock'
import {createUserList} from "@/services/pages/warehouse/input";
import {pubBlobDownLoad} from "@/utils/pubConfirm";
import UploadFiles from '../components/UploadFiles'
import CommonLogAms from "@/components/CommonLogAms";
// 盘点管理 - 列表
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
      title: '盘点单号',
      dataIndex: 'order_no',
    },
    {
      title: '盘点类型',
      dataIndex: 'order_sub_type',
      valueEnum: {
        'TAKE_GOOD_STOCK': {text: '良品盘点'},
        'TAKE_BAD_STOCK': {text: '不良品盘点'},
      },
    },
    {
      title: '状态',
      dataIndex: 'approve_status',
      align: 'center',
      fieldProps: {
        mode: 'multiple',
      },
      valueEnum: {
        'NEW': {text: '新建'},
        'FINISHED': {text: '已完成'},
      },
    },
    {
      title: '创建人',
      dataIndex: 'create_user_id',
      align: 'center',
      render: (_, record) => record.create_user_name,
      fieldProps: {showSearch: true},
      request: async (params) => {
        const res = await createUserList({user_name: params.keyWords, order_type: 'TAKE_STOCK'})
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
        <Access accessible={access.canSee('warehouse-stock-check-upload') && record.approve_status == 'FINISHED'}>
          <UploadFiles title={`上传审核凭证(单号:${record.order_no})`}
                       initialValues={record}
                       requestUrl={'/sc-scm/ownStockManagement/uploadApproveFiles'}
                       requestDetailUrl={'/sc-scm/ownStockManagement/detail'}
                       requestParams={{ id: record.id }}
                       reload={actionRef.current?.reload} />
        </Access>
        <Access accessible={access.canSee('warehouse-stock-check-edit') && record.approve_status == 'NEW'}>
          <a onClick={() => history.push(`/warehouse/stock/check-detail?id=${record.id}&edit=1&type=${record.order_sub_type == 'TAKE_BAD_STOCK' ? 'bad_qty' : 'good_qty'}`)}>编辑</a>
        </Access>
        <Access accessible={access.canSee('warehouse-stock-check-detail')}>
          <a onClick={() => history.push(`/warehouse/stock/check-detail?id=${record.id}&type=${record.order_sub_type == 'TAKE_BAD_STOCK' ? 'bad_qty' : 'good_qty'}`)}>详情</a>
        </Access>
        <Access accessible={access.canSee('warehouse-stock-check-download')}>
          <Popconfirm
            title="下载Excel文件"
            onConfirm={async () => {
              const res = await detailDownload({id: record.id})
              pubBlobDownLoad(res)
            }}
            okText="确定"
            cancelText="取消"
          >
            <a>下载盘点单</a>
          </Popconfirm>
        </Access>
        <Access accessible={access.canSee('warehouse-stock-check-log')}>
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
          <Access accessible={access.canSee('warehouse-stock-check-create')}>
            <Popover content={
              <Space>
                <Button onClick={() => {
                  history.push('/warehouse/stock/check-detail?type=good_qty')
                }} style={{minWidth: 76}} ghost type={'primary'}>良品盘点</Button>
                <Button onClick={() => {
                  history.push('/warehouse/stock/check-detail?type=bad_qty')
                }} ghost danger type={'primary'}>不良品盘点</Button>
              </Space>
            } title="选择盘点类型" trigger="click">
              <Button type="primary">创建盘点单</Button>
            </Popover>
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
        params={{order_type: 'TAKE_STOCK'}}
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

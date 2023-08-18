import React, { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { projectsSamplePage } from '@/services/pages/signEstablish';
import type { TableListItem, TableListPagination, TableListParams } from './data';
import { connect, Link, useAccess, Access } from 'umi';
import { useActivate } from 'react-activation';
import { pubGetUserList, pubGetVendorList } from '@/utils/pubConfirm';
import SkuTable from '@/components/PubSKU/SkuTable';
import ProductLine from '@/components/PubForm/ProductLine';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
// 页面主体 - 签样管理
const Page: React.FC = ({ common }: any) => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  useActivate(() => {
    if (actionRef?.current) actionRef?.current?.reload();
  });
  // table配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '签样编号',
      dataIndex: 'st_code',
      align: 'center',
      width: 80,
    },
    {
      title: '签样状态',
      dataIndex: 'approval_status',
      align: 'center',
      valueType: 'select',
      valueEnum: common.dicList.PROJECTS_APPROVAL_STATUS,
      width: 100,
      order: 6,
    },
    {
      title: '图片',
      editable: false,
      dataIndex: 'image_id',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      renderText(text, record) {
        return record.skus && record.skus.length ? record.skus[0].image_url : '';
      },
      width: 100,
    },
    {
      title: '产品线',
      dataIndex: 'vendor_group_name',
      hideInSearch: true,
      width: 90,
      renderText: (text, record: any) =>
        `${pubFilter(common?.dicList?.SYS_BUSINESS_SCOPE, record.business_scope)}-${text}`,
    },
    {
      title: '产品线',
      dataIndex: 'category_data',
      hideInTable: true,
      order: 7,
      renderFormItem: (_, rest, form) => {
        return (
          <ProductLine
            back={(v: any) => {
              form.setFieldsValue({ category_data: v });
            }}
          />
        );
      },
    },
    {
      title: '产品编码',
      dataIndex: 'goods_code',
      width: 120,
      order: 1,
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      ellipsis: true,
      order: 5,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'left',
      ellipsis: true,
      search: false,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_id',
      hideInTable: true,
      valueType: 'select',
      order: 4,
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
      fieldProps: {
        showSearch: true,
        filterOption: (input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        },
      },
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      onCell: () => ({ colSpan: 3, style: { padding: 0 } }),
      className: 'p-table-inTable noBorder',
      render: (_: any, record: any) => <SkuTable skus={record.skus} />,
      width: 160,
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: 120,
    },
    {
      title: '采购价',
      dataIndex: 'skus',
      hideInSearch: true,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: 90,
      align: 'right',
    },
    {
      title: '签样时间',
      dataIndex: 'sample_time',
      align: 'center',
      valueType: 'dateTime',
      width: 146,
      hideInSearch: true,
      render: (text, record) => {
        return (
          <>
            <div>{record.sample_time}</div>
            <div> {record?.sample_user_name ? `(${record?.sample_user_name})` : ''}</div>
          </>
        );
      },
    },
    {
      title: '签样时间',
      dataIndex: 'create_time',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            time_start: `${value[0]}`,
            time_end: `${value[1]}`,
          };
        },
      },
      order: 3,
    },
    {
      title: '签样人',
      dataIndex: 'sample_user_id',
      hideInTable: true,
      fieldProps: { showSearch: true },
      valueType: 'select',
      request: async (v: any) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
      order: 2,
    },
    {
      title: '操作',
      fixed: 'right',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 100,
      render: (_, row) => [
        row.approval_status == 10 ? (
          <Access key="sign" accessible={access.canSee('signature_sample')}>
            <Link to={`/sign-establish/signature/detail?id=${row.id}`}>签样上架</Link>
          </Access>
        ) : (
          <Access key="view" accessible={access.canSee('signature_detail')}>
            <Link to={`/sign-establish/signature/detail?id=${row.id}&readonly=1`}>查看</Link>
          </Access>
        ),
      ],
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<TableListItem, TableListPagination>
        bordered
        size={'small'}
        actionRef={actionRef}
        rowKey="id"
        dateFormatter="string"
        request={async (params: any) => {
          const queryParams: TableListParams = {
            ...params,
            business_scope: params?.category_data ? params?.category_data[0] : '', //业务范畴
            vendor_group_id: params?.category_data ? params?.category_data[1] : '', //产品线
            page_size: params.pageSize,
            current_page: params.current,
          };
          delete queryParams.current;
          delete queryParams.pageSize;
          const res = await projectsSamplePage(queryParams);
          if (res.code == pubConfig.sCode) {
            return {
              total: res.data.total,
              data: res.data.records,
              success: true,
            };
          } else {
            pubMsg(res.message);
            return {
              success: false,
            };
          }
        }}
        columns={columns}
        search={{ className: 'light-search-form', defaultCollapsed: false }}
        sticky={{offsetScroll: 32, offsetHeader: 48}}
        scroll={{ x: 1400}}
      />
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

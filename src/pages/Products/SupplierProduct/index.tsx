import React, { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { vendorList } from '@/services/pages/products';
import type { TableListItem, TableListPagination, TableListParams } from './data';
import { connect, history } from 'umi';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetVendorList } from '@/utils/pubConfirm';
import { useAccess } from 'umi';

const Page: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const valueEnum = {
    '': { text: '全部', status: 'Default' },
    1: { text: '是', status: 'Success' },
    0: { text: '否', status: 'Error' },
  };
  // table配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '产品图片',
      editable: false,
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      width: 150,
    },
    {
      title: '产品名称',
      dataIndex: 'name_cn',
      render: (dom, entity) => {
        return access.canSee('product_supplier_detail') ? (
          <a
            onClick={() => {
              history.push(`/products/supplier-product/detail?readonly=1&id=${entity.id}`);
            }}
          >
            {dom}
          </a>
        ) : (
          { dom }
        );
      },
    },
    {
      title: '合作供应商',
      dataIndex: 'vendor_id',
      hideInTable: true,
      valueType: 'select',
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
      debounceTime: 300,
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
      title: '单位',
      dataIndex: 'uom',
      align: 'center',
      hideInSearch: true,
      width: 90,
    },
    {
      title: '是否含税',
      dataIndex: 'tax_included_purchase_situation',
      align: 'center',
      initialValue: '',
      valueEnum,
      width: 100,
    },
    {
      title: '进货价',
      dataIndex: 'tax_included_price',
      align: 'right',
      valueType: (item: any) => {
        return {
          type: 'money',
          locale: item.currency === 'USD' ? 'en-US' : 'zh-CN',
        };
      },
      hideInSearch: true,
      width: 140,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '录入时间',
      dataIndex: 'create_time',
      align: 'center',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '录入时间',
      dataIndex: 'create_time',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            begin_create_time: `${value[0]} 00:00:00`,
            end_create_time: `${value[1]} 23:59:59`,
          };
        },
      },
    },
  ];

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <ProTable<TableListItem, TableListPagination>
        actionRef={actionRef}
        rowKey="id"
        dateFormatter="string"
        pagination={{}}
        request={async (params) => {
          const queryParams: TableListParams = {
            ...params,
            page_size: params.pageSize,
            current_page: params.current,
          };
          delete queryParams.current;
          delete queryParams.pageSize;
          const res = await vendorList(queryParams);
          if (res.code == pubConfig.sCode) {
            return {
              total: res.data.total,
              data: res.data.records,
              success: true,
            };
          } else {
            pubMsg(res?.message);
            return {
              success: false,
            };
          }
        }}
        search={{ className: 'light-search-form', defaultCollapsed: false }}
        columns={columns}
      />
    </PageContainer>
  );
};

// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

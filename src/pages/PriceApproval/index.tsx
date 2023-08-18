import React, { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { priceApprovalPage, terminate } from '@/services/pages/signEstablish';
import type { TableListItem, TableListPagination, TableListParams } from './data';
import { connect, Link, useAccess, Access } from 'umi';
import { useActivate } from 'react-activation';
import { pubGetUserList, pubGetVendorList } from '@/utils/pubConfirm';
import SkuTable from '@/components/PubSKU/SkuTable';
import { pubConfig, pubFilter, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import ProductLine from '@/components/PubForm/ProductLine';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
// 撤销弹框
const TerminateModal: React.FC<{ data: any; reload: any }> = ({ data, reload }: any) => {
  return (
    <ModalForm
      title={'撤回/撤销审批流程'}
      trigger={<a>撤回</a>}
      width={500}
      layout={'horizontal'}
      onFinish={async (values: any) => {
        const res = await terminate(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        reload();
        return true;
      }}
    >
      <ProFormText name={'id'} initialValue={data.id} noStyle hidden />
      <ProFormTextArea label={'撤回审批备注'} name={'remarks'} rules={[pubRequiredRule]} />
    </ModalForm>
  );
};
// 页面主体 - 价格审批
const Page: React.FC = ({ common }: any) => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  useActivate(() => {
    if (actionRef?.current) actionRef?.current?.reload();
  });

  // table配置
  const columns: ProColumns<any>[] = [
    {
      title: '审批编号',
      dataIndex: 'pa_code',
      align: 'center',
      width: 80,
    },
    {
      title: '审批状态',
      dataIndex: 'approval_status',
      align: 'center',
      valueType: 'select',
      valueEnum: () => {
        const temp = common.dicList?.PROJECTS_APPROVAL_STATUS
          ? JSON.parse(JSON.stringify(common.dicList.PROJECTS_APPROVAL_STATUS))
          : null;
        if (temp) {
          delete temp?.['0'];
          delete temp?.['1'];
          delete temp?.['2'];
          delete temp?.['3'];
          delete temp?.['4'];
          delete temp?.['5'];
          delete temp?.['9'];
          delete temp?.['12'];
        }
        return temp;
      },
      width: 130,
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
      width: 100,
      renderText: (text, record: any) =>
        `${pubFilter(common?.dicList?.SYS_BUSINESS_SCOPE, record.business_scope)}-${text}`,
    },
    {
      title: '产品线',
      dataIndex: 'category_data',
      hideInTable: true,
      order: 10,
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
      hideInSearch: true,
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      ellipsis: true,
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
      className: 'p-table-inTable noBorder',
      onCell: () => ({ colSpan: 3, style: { padding: 0 } }),
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
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      valueType: 'dateTime',
      width: 150,
      hideInSearch: true,
      render: (text, record) => {
        return (
          <>
            <div>{record.create_time}</div>
            <div>({record.create_user_name})</div>
          </>
        );
      },
    },
    {
      title: '创建时间',
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
    },
    {
      title: '创建人',
      dataIndex: 'create_user_id',
      hideInTable: true,
      fieldProps: { showSearch: true },
      valueType: 'select',
      request: async (v: any) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
    },
    {
      title: '操作',
      fixed: 'right',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 130,
      render: (_, row: any) => [
        <Access key="view" accessible={access.canSee('price_approval_detail')}>
          <Link to={`/sign-establish/price-approval/detail?id=${row.id}&readonly=1`}>查看</Link>
        </Access>,
        (row.approval_status == 8 || row.approval_status == 6) &&
        access.canSee('price_approval_submit') ? (
          <Link key="edit" to={`/sign-establish/price-approval/detail?id=${row.id}`}>
            价格审批
          </Link>
        ) : (
          ''
        ),
        /*撤回*/
        [7].includes(Number(row.approval_status)) && access.canSee('price_approval_cancel') ? (
          <TerminateModal key="cancel" data={row} reload={() => actionRef?.current?.reload()} />
        ) : null,
      ],
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<TableListItem, TableListPagination>
        bordered
        size="small"
        actionRef={actionRef}
        rowKey="id"
        dateFormatter="string"
        request={async (params: any) => {
          const queryParams: TableListParams = {
            ...params,
            business_scope: params.category_data ? params.category_data[0] : '', //业务范畴
            vendor_group_id: params.category_data ? params.category_data[1] : '', //产品线
            page_size: params.pageSize,
            current_page: params.current,
          };
          delete queryParams.current;
          delete queryParams.pageSize;
          const res = await priceApprovalPage(queryParams);
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
        scroll={{ x: 1400 }}
      />
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

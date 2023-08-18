import { connect, useAccess } from 'umi';
import React, { useRef } from 'react';
import { Space } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormTextArea, ProFormText } from '@ant-design/pro-form';
import * as api from '@/services/pages/vendorBackup';
import type { TableListItem, TableListPagination } from './data';
import { pubGetUserList, pubGetVendorList } from '@/utils/pubConfirm';
import { pubConfig, pubFilter, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import ProductLine from '@/components/PubForm/ProductLine';
import { useActivate } from 'react-activation';
import SkuTable from '@/components/PubSKU/SkuTable';
// 撤销弹框
const TerminateModal: React.FC<{ data: any; reload: any }> = ({ data, reload }: any) => {
  return (
    <ModalForm
      title={'撤回/撤销审批流程'}
      trigger={<a>撤回</a>}
      width={500}
      layout={'horizontal'}
      onFinish={async (values: any) => {
        const res = await api.terminate(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        if (typeof reload === 'function') reload();
        return true;
      }}
    >
      <ProFormText name={'id'} initialValue={data.id} noStyle hidden />
      <ProFormTextArea label={'撤回审批备注'} name={'remarks'} rules={[pubRequiredRule]} />
    </ModalForm>
  );
};

/*供应商备份列表页*/
const Page: React.FC<any> = ({ history, common }: any) => {
  const { canSee } = useAccess();
  const actionRef = useRef<ActionType>();
  // 激活页面后刷新页面
  useActivate(() => {
    if (actionRef?.current) actionRef?.current?.reload();
  });
  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await api.page(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }

    return {
      data: res?.code == pubConfig.sCode ? res.data.records : [],
      success: res?.code == pubConfig.sCode,
      total: res?.data?.total || 0,
    };
  };
  // table配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '备份编号',
      dataIndex: 'backup_code',
      align: 'center',
      width: 80,
    },
    {
      title: '图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '产品名称',
      dataIndex: 'goods_name',
      width: 180,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      order: 7,
      width: 160,
      className: 'p-table-inTable noBorder',
      onCell: () => ({ colSpan: 4, style: { padding: 0 } }),
      render: (_: any, record: any) => (
        <SkuTable
          skus={record.backupGoodsSkus}
          columnsKey={['sku_code', 'erp_sku', 'sku_name', 'bar_code']}
        />
      ),
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },

    {
      title: '商品条码',
      dataIndex: 'bar_code',
      order: 8,
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: 'ERP编码',
      dataIndex: 'erp_sku',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '备份供应商',
      dataIndex: 'vendor_id',
      hideInTable: true,
      valueType: 'select',
      order: 9,
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
      debounceTime: 300,
      fieldProps: { showSearch: true },
    },
    {
      title: '备份供应商',
      dataIndex: 'vendor_name',
      hideInSearch: true,
      width: 140,
    },
    {
      title: '产品线',
      dataIndex: 'vendor_group',
      hideInTable: true,
      order: 10,
      renderFormItem: () => <ProductLine />,
      search: {
        transform: (v: any) => {
          return { business_scope: v[0], vendor_group_id: v[1] };
        },
      },
    },
    {
      title: '产品线',
      dataIndex: 'vendor_group_name',
      align: 'center',
      hideInSearch: true,
      width: 100,
      renderText: (_: any, record: any) =>
        `${pubFilter(common.dicList.SYS_BUSINESS_SCOPE, record?.business_scope)}-${
          record.vendor_group_name
        }`,
    },
    {
      title: '备份状态',
      dataIndex: 'approval_status',
      align: 'center',
      width: 120,
      valueEnum: () => {
        const valueEnum = {};
        for (const i in common?.dicList.PROJECTS_APPROVAL_STATUS) {
          if (Number(i) > 6) {
            valueEnum[i] = common?.dicList.PROJECTS_APPROVAL_STATUS[i];
          }
        }
        return valueEnum;
      },
    },
    {
      title: '发起时间',
      dataIndex: 'time',
      valueType: 'dateRange',
      hideInTable: true,
      order: 4,
      search: {
        transform: (v: any) => ({ time_start: v[0], time_end: v[1] }),
      },
    },
    {
      title: '发起时间/发起人',
      dataIndex: 'create_time',
      hideInSearch: true,
      align: 'center',
      width: 150,
      render: (text, row) => {
        return (
          <div>
            {text}
            <div>{row.create_user_name}</div>
          </div>
        );
      },
    },
    {
      title: '发起人',
      dataIndex: 'create_user_id',
      hideInTable: true,
      order: 5,
      fieldProps: { showSearch: true },
      valueType: 'select',
      request: async (v: any) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 140,
      fixed: 'right',
      render: (_: any, record: any) => (
        /*价格审批中	7, 价格审批不通过	8, 价格审批通过	9, 待签样	10, 已签样	11, 撤回: 12*/
        <Space direction={'vertical'}>
          {/*价格审批查看*/}
          {[7, 8, 9, 12].includes(Number(record.approval_status)) &&
          canSee('vendor_backup_approval_view') ? (
            <a
              onClick={() => {
                history.push(
                  `/products/vendor-backup/price-approval?id=${record.id}&vendor_id=${record.vendor_id}&copy=1&readonly=1`,
                );
              }}
            >
              查看价格审批
            </a>
          ) : null}
          {/*价格审批不通过 再次提交*/}
          {[8, 12].includes(Number(record.approval_status)) && canSee('vendor_backup_approval') ? (
            <a
              onClick={() => {
                history.push(
                  `/products/vendor-backup/price-approval?id=${record.id}&vendor_id=${record.vendor_id}&copy=1&edit=1`,
                );
              }}
            >
              再次提交
            </a>
          ) : null}
          {/*签样查看*/}
          {[10, 11].includes(Number(record.approval_status)) &&
          canSee('vendor_backup_signature_view') ? (
            <a
              onClick={() => {
                history.push(`/products/vendor-backup/signature?id=${record.id}&copy=1&readonly=1`);
              }}
            >
              查看签样信息
            </a>
          ) : null}
          {/*价格审批通过 签样确认*/}
          {[9, 10].includes(Number(record.approval_status)) && canSee('vendor_backup_signature') ? (
            <a
              onClick={() => {
                history.push(`/products/vendor-backup/signature?id=${record.id}&copy=1`);
              }}
            >
              签样确认
            </a>
          ) : null}
          {/*撤回*/}
          {[7].includes(Number(record.approval_status)) && canSee('vendor_backup_approval') ? (
            <TerminateModal data={record} reload={actionRef?.current?.reload} />
          ) : null}
        </Space>
      ),
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
        headerTitle={'供应商备份'}
        actionRef={actionRef}
        bordered
        rowKey="id"
        pagination={{}}
        dateFormatter="string"
        request={getList}
        columns={columns}
        search={{ className: 'light-search-form', defaultCollapsed: false }}
        scroll={{ x: 1400 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
      />
    </PageContainer>
  );
};

// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

import { PageContainer } from '@ant-design/pro-layout';
import { connect, useAccess } from 'umi';
import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { getList, exportData } from '@/services/pages/lostDetails';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import ExportBtn from '@/components/ExportBtn';
import { Space } from 'antd';
import { pubGetVendorList } from '@/utils/pubConfirm';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import './index.less';
import { priceValue } from '@/utils/filter';
import Details from './Details';
import StockOrderDetail from '@/components/Reconciliation/StockOrderDetail';

const Page = (props: any) => {
  const { common } = props;
  console.log(common?.dicList, common?.dicList?.LOGISTICS_EXPRESS_STATUS);
  const [exportForm, setExportForm] = useState<any>({});
  const access = useAccess();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await getList(postData);
    setExportForm(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });
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
  const columns: ProColumns<any>[] = [
    {
      title: '入库单号',
      dataIndex: 'order_no',
      align: 'center',
      render: (_: any, record: any) =>
        access.canSee('stockManager_view_detail_cn') ? (
          <StockOrderDetail
            id={record.order_id}
            access={access}
            dicList={common.dicList}
            title={<a key="detail">{record.order_no}</a>}
          />
        ) : (
          record.order_no || '-'
        ),
    },
    {
      title: '平台入库单号',
      dataIndex: 'platform_warehousing_order_no',
      align: 'center',
    },
    {
      title: '物流商',
      dataIndex: 'logistics_company',
      align: 'center',
    },
    {
      title: '运单号',
      dataIndex: 'logistics_order_no',
      align: 'center',
      width: 100,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'left',
      hideInSearch: true,
    },
    {
      title: 'SKU',
      dataIndex: 'stock_no',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '商品条形码',
      dataIndex: 'bar_code',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '物流丢失数量',
      dataIndex: 'logistics_loss_qty',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record.logistics_loss_qty ? (
          <span style={{ color: 'red' }}>{record.logistics_loss_qty}</span>
        ) : (
          '-'
        ),
    },
    {
      title: '供应商名称',
      dataIndex: 'vendor_id',
      align: 'center',
      order: 2,
      fieldProps: selectProps,
      valueType: 'select',
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
      render: (_: any, record: any) => record.vendor_name ?? '-',
    },
    {
      title: '采购单号',
      dataIndex: 'purchase_order_no',
      align: 'center',
      hideInTable: true,
    },
    {
      title: '出货采购单',
      dataIndex: 'purchase_order_nos',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record.purchase_order_nos ? (
          <Details
            trigger={record.purchase_order_nos?.split(',')?.map((v: any) => {
              return (
                <a style={{ display: 'block' }} key={v}>
                  {v}
                </a>
              );
            })}
            id={record.order_id}
          />
        ) : (
          '-'
        ),
    },
    {
      title: '对账单号',
      dataIndex: 'account_statement_order_no',
      align: 'center',
    },
    {
      title: (
        <>
          赔偿金额
          <br />
          （人民币）
        </>
      ),
      dataIndex: 'satisfaction_amount',
      align: 'right',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return priceValue(record.satisfaction_amount);
      },
    },
    {
      title: '赔偿凭证',
      dataIndex: 'satisfaction_voucher_file_list',
      align: 'center',
      width: 200,
      className: 'wrap',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record?.satisfaction_voucher_file_list?.length ? (
          <ShowFileList
            data={record.satisfaction_voucher_file_list || []}
            isShowDownLoad={true}
            listType="text-line"
          />
        ) : (
          '-'
        ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      align: 'left',
      hideInSearch: true,
    },
    {
      title: '确认丢失时间',
      width: 80,
      dataIndex: 'create_time',
      align: 'center',
      valueType: 'dateRange',
      search: {
        transform: (val) => ({ begin_confirm_time: val[0]+' 00:00:00', end_confirm_time: val[1]+' 23:59:59' }),
      },
      render: (_: any,record: any) => record.create_time ?? '-'
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 2300);
  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable
          className="loss-table"
          bordered
          sticky={{ offsetHeader: 48 }}
          columns={columns}
          actionRef={ref}
          toolBarRender={() => [
            <Space key="space">
              {access.canSee('scm_lostDetails_export_cn') ? (
                <ExportBtn
                  exportHandle={exportData}
                  exportForm={{
                    ...exportForm,
                    export_config: {
                      columns: ColumnSet.customExportConfig?.filter(
                        (v: any) => v.dataIndex != 'satisfaction_voucher_file_list',
                      ),
                    },
                  }}
                />
              ) : null}
            </Space>,
          ]}
          pagination={{
            showSizeChanger: true,
          }}
          {...ColumnSet}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{ defaultCollapsed: false, labelWidth: 'auto' }}
          rowKey="id"
          dateFormatter="string"
          revalidateOnFocus={false}
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

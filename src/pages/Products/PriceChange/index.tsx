import React, { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getGoodsChangePricePage } from '@/services/pages/productPriceChange';
import type { TableListItem, TableListPagination } from './data';
import { connect } from 'umi';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { pubGetVendorList, pubGetUserList } from '@/utils/pubConfirm';
import ChangePriceList from './../CooperateProduct/Dialog/ChangePriceList';
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示
import { useAccess, Access } from 'umi';
import { IsGrey } from '@/utils/pubConfirm';

const Page: React.FC = ({ common }: any) => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  // 添加弹窗实例
  const changePriceListModel = useRef();
  // 价格变更弹窗
  const changePriceListModelOpen: any = (type: string, row: any) => {
    const data: any = changePriceListModel?.current;
    data.open(type, row);
  };
  // 弹窗关闭
  const modalClose = (data: any) => {
    if (!data) return;
    setTimeout(() => {
      actionRef?.current?.reload();
    }, 200);
  };

  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      begin_date: params?.time?.[0] || null, //开始日期
      end_date: params?.time?.[1] || null, //结束日期
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await getGoodsChangePricePage(postData);
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
  // table配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '审批状态',
      dataIndex: 'approval_status',
      align: 'center',
      width: 100,
      valueType: 'select',
      valueEnum: common.dicList.GOODS_SKU_CHANGE_PRICE_STATUS,
      render: (_, record: any) => {
        return pubFilter(common.dicList.GOODS_SKU_CHANGE_PRICE_STATUS, record.approval_status);
      },
    },
    {
      title: 'ID',
      dataIndex: 'change_no',
      hideInSearch: true,
    },
    {
      title: '变更原因',
      dataIndex: 'remarks',
      hideInSearch: true,
      ellipsis: true,
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
      title: '供应商',
      dataIndex: 'vendor_name',
      hideInSearch: true,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      hideInTable: true,
    },
    {
      title: '报价单',
      dataIndex: 'sys_files',
      hideInSearch: true,
      render: (_, record: any) => {
        return IsGrey ? '' : <ShowFileList data={record?.sys_files || []} />;
      },
    },
    {
      title: '生效时间',
      dataIndex: 'take_effect_date',
      align: 'center',
      width: 160,
      hideInSearch: true,
    },
    {
      title: '发起时间',
      dataIndex: 'create_time',
      align: 'center',
      width: 160,
      hideInSearch: true,
    },
    {
      title: '发起人',
      dataIndex: 'create_user_name',
      align: 'center',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '发起人',
      dataIndex: 'create_user_id',
      hideInTable: true,
      fieldProps: selectProps,
      valueType: 'select',
      request: async (v: any) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
    },
    {
      title: '发起时间',
      dataIndex: 'time',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 90,
      fixed: 'right',
      render: (_, row) => {
        const renderList = [];
        renderList.push(
          <Access key="detail" accessible={access.canSee('price_change_detail')}>
            <a
              onClick={() => {
                changePriceListModelOpen('detail', row);
              }}
              key="detail"
            >
              查看
            </a>
          </Access>,
        );
        if (row.approval_status == 3 && access.canSee('price_change_edit')) {
          renderList.push(
            <a
              onClick={() => {
                changePriceListModelOpen('edit', row);
              }}
              key="edit"
            >
              编辑
            </a>,
          );
        }
        return renderList;
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
      <ChangePriceList changePriceListModel={changePriceListModel} handleClose={modalClose} />

      <ProTable<TableListItem, TableListPagination>
        actionRef={actionRef}
        rowKey="id"
        scroll={{ x: 1400 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        dateFormatter="string"
        request={getList}
        columns={columns}
        pagination={{}}
        search={{ labelWidth: 100, className: 'light-search-form', defaultCollapsed: false }}
      />
    </PageContainer>
  );
};

// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

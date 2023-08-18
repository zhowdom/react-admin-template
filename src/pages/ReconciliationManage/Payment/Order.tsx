import React, { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import * as api from '@/services/pages/payment';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import { priceValue } from '@/utils/filter';
import { IsGrey, pubGetSigningListContract, pubGetUserList } from '@/utils/pubConfirm';
import { useAccess, Access } from 'umi';
import OrderDetail from '@/components/OrderDetail';

const Order: React.FC<any> = (props: any) => {
  const [tempKey, setTempKey] = useState(new Date().getTime());
  const ref = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();
  // 搜索清除前后空格
  const selectProps = {
    showSearch: true,
  };
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await api.purchaseOrderPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  // keepAlive页面激活钩子函数
  useActivate(() => {
    setTempKey(new Date().getTime());
    ref?.current?.reload();
  });
  // 获取人
  const pubGetUserListAction = async (v: any): Promise<any> => {
    const res: any = await pubGetUserList(v);
    return res?.map((item: any) => ({ ...item, value: item.value })) || [];
  };

  // 表格配置
  const columns: any = [
    {
      title: '采购单号',
      dataIndex: 'order_no',
      align: 'center',
      onCell: (record: any) => {
        return { rowSpan: record.paymentStatisticsDetail?.length || 0 };
      },
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      fieldProps: selectProps,
      debounceTime: 1000,
      align: 'center',
      valueType: 'select',
      request: pubGetSigningListContract,
      onCell: (record: any) => {
        return { rowSpan: record.paymentStatisticsDetail?.length || 0 };
      },
      initialValue: props.vendorId,
      params: { tempKey },
      order: 1,
      search: {
        transform: (v: any) => ({ vendor_id: v }),
      },
    },
    {
      title: '结算方式/账期',
      dataIndex: 'payment_method',
      align: 'center',
      valueEnum: props?.dicList?.VENDOR_PAYMENT_METHOD || {},
      onCell: (record: any) => {
        return { rowSpan: record.paymentStatisticsDetail?.length || 0 };
      },
    },
    {
      title: '流水号',
      dataIndex: 'serial_number',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      align: 'center',
      hideInSearch: true,
      valueEnum: props?.dicList?.PAYMENT_STATISTICS_TYPE || {},
      width: 100,
    },
    {
      title: '付款金额',
      dataIndex: 'amount',
      align: 'right',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.amount);
      },
    },
    {
      title: '付款时间',
      dataIndex: 'payment_time',
      valueType: 'dateTime',
      align: 'center',
      hideInSearch: true,
      width: 146,
    },
    {
      title: '操作人',
      dataIndex: 'create_user_name',
      align: 'center',
      hideInSearch: true,
      width: 100,
    },
    {
      title: '下单时间',
      dataIndex: 'create_time',
      valueType: 'dateRange',
      render: (_, record: any) => record.create_time,
      search: {
        transform(date: any) {
          return {
            begin_create_time: `${date[0]} 00:00:00`,
            end_create_time: `${date[1]} 23:59:59`,
          };
        },
      },
      align: 'center',
      onCell: (record: any) => {
        return { rowSpan: record.paymentStatisticsDetail?.length || 0 };
      },
      width: 146,
    },
    {
      title: '采购员',
      dataIndex: 'purchaser_name',
      align: 'center',
      hideInSearch: true,
      onCell: (record: any) => {
        return { rowSpan: record.paymentStatisticsDetail?.length || 0 };
      },
      width: 100,
    },
    {
      title: '采购员',
      dataIndex: 'purchaser_id',
      align: 'center',
      valueType: 'select',
      request: pubGetUserListAction,
      fieldProps: selectProps,
      debounceTime: 1000,
      hideInTable: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 80,
      align: 'center',
      fixed: 'right',
      valueType: 'option',
      onCell: (record: any) => {
        return { rowSpan: record.paymentStatisticsDetail?.length || 0 };
      },
      render: (text: any, record: any) => {
        return (
          <Access key="addButton" accessible={access.canSee('purchaseOrder_detail')}>
            <OrderDetail id={record.id} title={<a>详情</a>} dicList={props?.dicList} />
          </Access>
        );
      },
    },
  ];

  return (
    <>
      <ProTable
        columns={columns}
        options={{ fullScreen: true, setting: false }}
        pagination={{
          showSizeChanger: true,
        }}
        bordered
        actionRef={ref}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        rowKey="id"
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
        dateFormatter="string"
        headerTitle={false}
        scroll={{ x: 1600 }}
        postData={(data: any) => {
          // 为了单元合并摊开子数组
          if (data && data.length) {
            const formatData: any[] = [];
            data.forEach((dataItem: any) => {
              formatData.push(dataItem);
              if (dataItem.paymentStatisticsDetail && dataItem.paymentStatisticsDetail.length) {
                dataItem.paymentStatisticsDetail.forEach((item: any, index: number) => {
                  if (index == 0) {
                    formatData[formatData.length - 1] = {
                      ...formatData[formatData.length - 1],
                      ...item,
                    };
                  } else {
                    formatData.push({ ...item, id: dataItem.id + index });
                  }
                });
              }
            });
            return formatData;
          }
          return [];
        }}
      />
    </>
  );
};

export default Order;

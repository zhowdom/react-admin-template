import { PageContainer } from '@ant-design/pro-layout';
import { connect, Link, useAccess, Access, useAliveController, history } from 'umi';
import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { deleteById, getList, terminate } from '@/services/pages/sample';
import { pubGetUserList, pubGetVendorList } from '@/utils/pubConfirm';
import { Button, Popconfirm, Space } from 'antd';
import PaymentHistory from './modal/PaymentHistory';
import PaymentRequest from './modal/PaymentRequest';
import PaymentRequestM from './modal/PaymentRequestM';
import { PlusOutlined } from '@ant-design/icons';

const Sample = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const access = useAccess();
  const [tempKey, setTempKey] = useState(new Date().getTime());
  const { dropScope } = useAliveController();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      vendor_id: params.vendor_name,
      purchaser_id: params.purchaser_name,
      current_page: params?.current,
      page_size: params?.pageSize,
      time_start: (params.time && params.time[0]) || null,
      time_end: (params.time && params.time[1]) || null,
    };
    const res = await getList(postData);
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
    setTempKey(new Date().getTime());
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
  // ---操作---
  //删除
  const remove = async (id: any) => {
    const res: any = await deleteById({ id });
    if (res && res.code == pubConfig.sCode) {
      pubMsg(res.message, 'success');
      ref.current?.reload();
    } else {
      pubMsg(res.message);
    }
  };
  // 撤回审批
  const cancelApproval = async (id: any) => {
    const res: any = await terminate({ id });
    if (res && res.code == pubConfig.sCode) {
      pubMsg(res.message, 'success');
      ref.current?.reload();
    } else {
      pubMsg(res.message);
    }
  };
  const columns: ProColumns<any>[] = [
    {
      title: '样品单号',
      dataIndex: 'order_no',
      align: 'center',
      fieldProps: {
        placeholder: '请输入样品单号',
      },
    },
    {
      title: '订单类型',
      dataIndex: 'type',
      align: 'center',
      valueEnum: dicList.PURCHASE_SAMPLE_ORDER_TYPE,
    },
    {
      title: '产品名称',
      dataIndex: 'goods_name',
      align: 'center',
      fieldProps: {
        placeholder: '请输入产品名称',
      },
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      hideInTable: true,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'center',
      hideInTable: true,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      fieldProps: selectProps,
      align: 'center',
      valueType: 'select',
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
      params: { tempKey },
    },
    {
      title: '订单金额',
      dataIndex: 'order_amount',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '结算币种',
      dataIndex: 'currency',
      align: 'center',
      valueEnum: dicList.SC_CURRENCY,
      hideInSearch: true,
    },
    {
      title: '订单状态',
      dataIndex: 'approval_status',
      valueType: 'select',
      fieldProps: selectProps,
      align: 'center',
      valueEnum: dicList?.PURCHASE_SAMPLE_ORDER_STATUS,
      render: (_, record: any) => {
        const item = dicList.PURCHASE_SAMPLE_ORDER_STATUS;
        const key = record?.approval_status;
        return [<span key="approval_status">{item?.[key]?.text || '-'}</span>];
      },
    },
    {
      title: '付款状态',
      dataIndex: 'pay_status',
      valueType: 'select',
      fieldProps: selectProps,
      align: 'center',
      valueEnum: dicList.PURCHASE_SAMPLE_ORDER_PAY_STATUS,
    },
    {
      title: '创建人',
      dataIndex: 'purchaser_name',
      align: 'center',
      fieldProps: selectProps,
      request: async (v) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      width: 160,
      sorter: (a: any, b: any) =>
        new Date(a.create_time).getTime() - new Date(b.create_time).getTime(),
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'time',
      align: 'center',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: '操作',
      key: 'option',
      className: 'wrap',
      width: 180,
      align: 'center',
      valueType: 'option',
      render: (text: any, record: any) => (
        <Space size={'small'}>
          <Access key="review" accessible={access.canSee('sample_detail')}>
            {record.type == '2' ? (
              <Link to={`/sign-establish/apply-mould?typeEdit=2&orderId=${record.id}`}>查看</Link>
            ) : (
              <Link to={`/sign-establish/sample-detail?typeEdit=2&orderId=${record.id}`}>查看</Link>
            )}
          </Access>
          {[3, 5].includes(Number(record.approval_status)) ? (
            <Access key="edit" accessible={access.canSee('sample_edit')}>
              {record.type == '2' ? (
                <Link
                  to={`/sign-establish/apply-mould?typeEdit=1&orderId=${record.id}&mould_type=${record.mould_type}`}
                >
                  重新提交
                </Link>
              ) : (
                <Link to={`/sign-establish/sample-detail?typeEdit=1&orderId=${record.id}`}>
                  重新提交
                </Link>
              )}
            </Access>
          ) : null}
          {[3, 5].includes(Number(record.approval_status)) ? (
            <Access key="remove" accessible={access.canSee('sample_delete')}>
              <Popconfirm
                title="确定删除?"
                onConfirm={() => remove(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <a>删除</a>
              </Popconfirm>
            </Access>
          ) : null}
          {[1].includes(Number(record.approval_status)) ? (
            <Access key="cancle" accessible={access.canSee('sample_cancel')}>
              <Popconfirm
                title="确定撤回?"
                onConfirm={() => cancelApproval(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <a>撤回</a>
              </Popconfirm>
            </Access>
          ) : null}
          <Access
            key={'sample_payment_history'}
            accessible={access.canSee('sample_payment_history')}
          >
            <PaymentHistory
              title={`请款记录(${record.goods_name})`}
              dataSource={record}
              dicList={dicList}
            />
          </Access>
          <Access
            key={'sample_payment_request'}
            accessible={
              access.canSee('sample_payment_request') &&
              [2].includes(Number(record.approval_status)) &&
              record.pay_status != 2
            }
          >
            {record.type == '2' ? (
              <PaymentRequestM
                id={record.id}
                reload={ref.current?.reload}
                dicList={dicList}
                title={`开模单请款(${record.goods_name})`}
              />
            ) : (
              <PaymentRequest
                id={record.id}
                reload={ref.current?.reload}
                dicList={dicList}
                title={`样品单请款(${record.goods_name})`}
              />
            )}
          </Access>
        </Space>
      ),
      fixed: 'right',
    },
  ];
  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          toolBarRender={() => [
            <Space key="item">
              <Access key="sample_goods_stock" accessible={access.canSee('sample_goods_stock')}>
                <Button
                  onClick={() => {
                    dropScope('/sign-establish/sample-detail');
                    setTimeout(() => {
                      history.push(`/sign-establish/sample-detail?typeEdit=1&type=0`);
                    }, 200);
                  }}
                  ghost
                  type="primary"
                  icon={<PlusOutlined />}
                >
                  现货采样
                </Button>
              </Access>
              <Access key="perfect_mould" accessible={access.canSee('sample_perfect_mould')}>
                <Button
                  onClick={() => {
                    dropScope('/sign-establish/apply-mould');
                    setTimeout(() => {
                      history.push(`/sign-establish/apply-mould`);
                    }, 200);
                  }}
                  ghost
                  type="primary"
                  icon={<PlusOutlined />}
                >
                  优化开模申请
                </Button>
              </Access>
            </Space>,
          ]}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          rowKey="id"
          dateFormatter="string"
          headerTitle="样品单管理"
          scroll={{ x: 1400 }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Sample);
export default ConnectPage;

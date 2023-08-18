import { useRef, useState } from 'react';
import { Popconfirm, Space, Button } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProFormText, ProFormTextArea, ProTable } from '@ant-design/pro-components';
import { useActivate } from 'react-activation';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import {
  shippingMethodApproval,
  shippingMethodApprovalPage,
  shippingMethodApprovalExport,
} from '@/services/pages/link';
import PlatStore from '@/components/PubForm/PlatStore';
import LinkSearch from '@/components/PubForm/LinkSearch';
import { pubGetUserList, pubProLineList, pubBlobDownLoad } from '@/utils/pubConfirm';
import { useModel } from 'umi';
import { Access, useAccess } from 'umi';
import ApprovalCancel from './Dialogs/ApprovalCancel';
// 未审核
const All: React.FC<{
  common: any;
  tabActiveKey: any;
  getTabList: any;
}> = ({ common, tabActiveKey, getTabList }) => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const formRef = useRef<any>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };
  const [exporting, exportingSet] = useState(false);
  const [queryParams, queryParamsSet] = useState<any>({});
  const { initialState } = useModel('@@initialState');
  const { currentUser }: any = initialState;
  const { dicList } = common;

  // 添加弹窗实例
  const approvalCancelModel = useRef();
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  // 导出
  const exportExcel = async () => {
    exportingSet(true);
    const res: any = await shippingMethodApprovalExport(Object.assign({type: 'delivery_route'}, queryParams));
    exportingSet(false);
    pubBlobDownLoad(res, `安全库存(${queryParams.cycle_time})`);
    return;
  };
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    getTabList();
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      business_scope: 'IN', //业务范畴
      category_ids: params?.category_ids && params?.category_ids.toString(), //产品线
      platform_id: params.plat_store ? params.plat_store?.[0] : null, // 平台
      shop_id: params.plat_store ? params.plat_store?.[1] : null, // 店铺
      begin_time: params.time?.[0] ? `${params.time?.[0]} 00:00:00` : null,
      end_time: params.time?.[1] ? `${params.time?.[1]} 23:59:59` : null,
      shop_sku_code: params?.link_search?.[0] === 'skuCode' ? params?.link_search?.[1] : null,
      link_id: params?.link_search?.[0] === 'linkId' ? params?.link_search?.[1] : null,
      link_name: params?.link_search?.[0] === 'linkName' ? params?.link_search?.[1] : null,
    };
    const res = await shippingMethodApprovalPage(Object.assign({type: 'delivery_route'}, postData));
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    queryParamsSet(postData);
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 批量撤销
  const approvalCancelModelOpen: any = (type: string, row?: any) => {
    const data: any = approvalCancelModel?.current;
    data.open(type, row);
  };

  // 弹窗关闭
  const modalClose = (data: any) => {
    console.log(data);
    if (!data) return;
    setTimeout(() => {
      actionRef?.current?.reload();
    }, 200);
  };

  const columns: ProColumns<any>[] = [
    {
      title: '图片',
      editable: false,
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      // width: 100,
    },
    {
      title: '链接名称 / 链接ID',
      dataIndex: 'goods_code',
      align: 'center',
      // width: 130,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return record.link_name || record.link_id ? (
          <>
            <div>{record.link_name}</div>
            {access.canSee('stock_up_safeStock_link') ? (
              <a href={record.link_url || '#'} target="_blank" rel="noreferrer">
                <div>{record.link_id}</div>
              </a>
            ) : (
              ''
            )}
          </>
        ) : (
          '-'
        );
      },
    },
    {
      title: '',
      dataIndex: 'link_search',
      hideInTable: true,
      renderFormItem: (_, rest, form) => {
        return (
          <LinkSearch
            back={(v: any) => {
              console.log(v);
              form.setFieldsValue({ link_search: v });
            }}
          />
        );
      },
    },
    {
      title: '生命周期',
      dataIndex: 'life_cycle',
      valueType: 'select',
      align: 'center',
      // width: 80,
      order: 4,
      fieldProps: {
        showSearch: true,
      },
      valueEnum: dicList.LINK_MANAGEMENT_LIFE_CYCLE,
      render: (_: any, record: any) => {
        return pubFilter(dicList.LINK_MANAGEMENT_LIFE_CYCLE, record?.life_cycle) || '-';
      },
    },
    {
      title: '平台',
      dataIndex: 'platform_code',
      // width: 90,
      align: 'center',
      hideInSearch: true,
      valueEnum: dicList?.SYS_PLATFORM_NAME,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.SYS_PLATFORM_NAME, record?.platform_code) || '-';
      },
    },
    {
      title: '店铺/推广',
      dataIndex: 'store_spread',
      hideInSearch: true,
      align: 'center',
      // width: 180,
      renderText: (text, record: any) =>
        record.shop_name || record.spread_user_name
          ? `${record.shop_name}-${record.spread_user_name}`
          : '-',
    },
    /*合并start*/
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      // width: '110px',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '对应款式名',
      dataIndex: 'sku_name',
      // width: 200,
    },
    {
      title: '安全库存天数',
      dataIndex: 'safe_days',
      // width: '120px',
      align: 'center',
      hideInSearch: true,
    },
    // {
    //   title: '原运输方式',
    //   dataIndex: 'shipping_method',
    //   width: 90,
    //   align: 'center',
    //   fixed: 'right',
    //   valueEnum: dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || {},
    // },
    // {
    //   title: '新运输方式',
    //   dataIndex: 'new_shipping_method',
    //   width: 90,
    //   align: 'center',
    //   fixed: 'right',
    //   valueEnum: dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || {},
    // },
    // {
    //   title: '尺寸类型',
    //   dataIndex: 'belong_classify',
    //   valueType: 'select',
    //   // width: 90,
    //   valueEnum: {
    //     1: '标准件',
    //     2: '大件',
    //   },
    // },
    // {
    //   title: '装柜方式',
    //   dataIndex: 'box_type',
    //   valueType: 'select',
    //   align: 'center',
    //   // width: 90,
    //   valueEnum: {
    //     'whole': '整柜',
    //     'part': '拼柜',
    //   },
    // },
    {
      title: '目的仓',
      dataIndex: 'delivery_route',
      key: 'delivery_route',
      align: 'center',
      valueEnum: common?.dicList?.LOGISTICS_TIME_MANAGE_IN_DELIVERY_ROUTE || {},
      fieldProps: {
        showSearch: true,
      },
      hideInTable: true
    },
    {
      title: '运输方式',
      dataIndex: 'shipping_method',
      key: 'shipping_method',
      align: 'center',
      valueEnum: common?.dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || {},
      fieldProps: {
        showSearch: true,
      },
      hideInTable: true
    },
    {
      title: '原目的仓',
      dataIndex: 'before',
      // width: '120px',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
                    record.type == 'shipping_method' ? pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD, _) : pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_DELIVERY_ROUTE, _)
    },
    {
      title: '新目的仓',
      dataIndex: 'after',
      // width: '120px',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
                    record.type == 'shipping_method' ? pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD, _) : pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_DELIVERY_ROUTE, _)
    },
    {
      title: '申请备注',
      dataIndex: 'reason',
      // width: 120,
      align: 'center',
      fixed: 'right',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '申请人',
      dataIndex: 'create_user_name',
      // width: 80,
      align: 'center',
      fixed: 'right',
      hideInSearch: true,
    },
    /*合并end*/
    {
      title: '产品线',
      dataIndex: 'category_ids',
      hideInTable: true,
      order: 7,
      valueType: 'select',
      request: () => pubProLineList({ business_scope: 'IN' }),
      fieldProps: { mode: 'multiple' },
    },
    {
      title: '店铺',
      dataIndex: 'plat_store',
      hideInTable: true,
      order: 6,
      renderFormItem: (_, rest, form) => {
        return (
          <PlatStore
            business_scope={'IN'}
            back={(v: any) => {
              form.setFieldsValue({ plat_store: v });
            }}
          />
        );
      },
    },
    {
      title: '推广：',
      dataIndex: 'spread_user_id',
      align: 'center',
      request: async (v) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
      valueType: 'select',
      hideInTable: true,
      fieldProps: {
        showSearch: true,
      },
      order: 5,
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space direction={'vertical'}>
          {access.canSee('safe_stock_shipping_ship_approve') || access.canSee('safe_stock_shipping_ship_reject') ? (
            <>
              <Popconfirm
                title={'确定同意?'}
                onConfirm={async () => {
                  const res = await shippingMethodApproval({
                    ids: [record.id],
                    approval_remarks: '',
                    status: '2',
                  });
                  if (res.code == pubConfig.sCode) {
                    pubMsg('操作成功!', 'success');
                    actionRef?.current?.reload();
                    return;
                  }
                  pubMsg(res?.message || '操作失败');
                }}
              >
                <a>同意</a>
              </Popconfirm>
              <ModalForm
                title={'运输方式变更审批'}
                trigger={<a>不同意</a>}
                layout={'horizontal'}
                labelAlign={'right'}
                labelCol={{ flex: '100px' }}
                grid
                modalProps={{
                  destroyOnClose: true,
                  maskClosable: false,
                }}
                onFinish={async (values: any) => {
                  const res = await shippingMethodApproval({
                    ids: [record.id],
                    approval_remarks: values.approval_remarks,
                    status: '3',
                  });
                  if (res.code == pubConfig.sCode) {
                    pubMsg('操作成功!', 'success');
                    actionRef?.current?.reload();
                    return true;
                  }
                  pubMsg(res?.message || '操作失败');
                  return false;
                }}
                onFinishFailed={() => {
                  pubMsg('表单未正确或完整填写, 请检查');
                }}
              >
                <ProFormText
                  readonly
                  label={'审批结果'}
                  name={'approval_result'}
                  initialValue={'不同意'}
                />
                <ProFormTextArea label={'不同意原因'} name={'approval_remarks'} />
              </ModalForm>
            </>
          ) : null}
          {currentUser?.name == record.create_user_name &&
          access.canSee('safe_stock_shipping_ship_cancel') ? (
            <a
              onClick={() => {
                approvalCancelModelOpen('one', record);
              }}
            >
              撤销
            </a>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        pagination={{
          showSizeChanger: true,
        }}
        bordered
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        params={{ shipping_method_status: tabActiveKey == '0' ? '' : tabActiveKey }}
        request={getListAction}
        search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
        scroll={{ x: 1800 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        rowKey="id"
        dateFormatter="string"
        headerTitle={
          <Space>
            {access.canSee('safe_stock_shipping_ship_batchapprove') || access.canSee('safe_stock_shipping_ship_batchreject') ? (
              <>
                {selectedRowKeys.length == 0 ? (
                  <Button type={'primary'} disabled>
                    批量同意
                  </Button>
                ) : (
                  <Popconfirm
                    title={'确定同意?'}
                    onConfirm={async () => {
                      const res = await shippingMethodApproval({
                        ids: selectedRowKeys,
                        approval_remarks: '',
                        status: '2',
                      });
                      if (res.code == pubConfig.sCode) {
                        pubMsg('操作成功!', 'success');
                        actionRef?.current?.reload();
                        setSelectedRowKeys([]);
                        return;
                      }
                      pubMsg(res?.message || '操作失败');
                    }}
                  >
                    <Button type={'primary'}>批量同意</Button>
                  </Popconfirm>
                )}
                <ModalForm
                  title={'目的仓变更审批'}
                  trigger={
                    <Button type={'primary'} disabled={selectedRowKeys.length == 0}>
                      批量不同意
                    </Button>
                  }
                  layout={'horizontal'}
                  labelAlign={'right'}
                  labelCol={{ flex: '100px' }}
                  grid
                  modalProps={{
                    destroyOnClose: true,
                    maskClosable: false,
                  }}
                  onFinish={async (values: any) => {
                    const res = await shippingMethodApproval({
                      ids: selectedRowKeys,
                      approval_remarks: values.approval_remarks,
                      status: '3',
                    });
                    if (res.code == pubConfig.sCode) {
                      pubMsg('操作成功!', 'success');
                      actionRef?.current?.reload();
                      setSelectedRowKeys([]);
                      return true;
                    }
                    pubMsg(res?.message || '操作失败');
                    return false;
                  }}
                  onFinishFailed={() => {
                    pubMsg('表单未正确或完整填写, 请检查');
                  }}
                >
                  <ProFormText
                    readonly
                    label={'审批结果'}
                    name={'approval_result'}
                    initialValue={'不同意'}
                  />
                  <ProFormTextArea label={'不同意原因'} name={'approval_remarks'} />
                </ModalForm>
              </>
            ) : null}

            <Access
              key="safe_stock_shipping_ship_batchcancel"
              accessible={access.canSee('safe_stock_shipping_ship_batchcancel')}
            >
              <Button
                type={'primary'}
                disabled={selectedRowKeys.length == 0}
                onClick={() => {
                  approvalCancelModelOpen('list', selectedRowKeys);
                }}
              >
                批量撤销
              </Button>
            </Access>
            <Access key="export" accessible={access.canSee('safe_up_export_ship')}>
              <Button key="export" onClick={() => exportExcel()} loading={exporting} type="primary">
                {exporting ? '导出中' : '导出'}
              </Button>
            </Access>
          </Space>
        }
        rowSelection={rowSelection}
        size={'small'}
      />
      <ApprovalCancel
        approvalCancelModel={approvalCancelModel}
        dicList={dicList}
        handleClose={modalClose}
      />
    </>
  );
};

export default All;

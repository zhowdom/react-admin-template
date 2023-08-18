import { useRef, useState } from 'react';
import { Tooltip, Statistic, Space, Button } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useActivate } from 'react-activation';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { shippingMethodAllPage, shippingMethodAllExport } from '@/services/pages/link';
import PlatStore from '@/components/PubForm/PlatStore';
import LinkSearch from '@/components/PubForm/LinkSearch';
import { pubGetUserList, pubProLineList, pubBlobDownLoad } from '@/utils/pubConfirm';
import { Access, useAccess } from 'umi';
import EditTransport from './Dialogs/EditTransport';
import EditStock from './Dialogs/EditStock';
import HistoryLog from './Dialogs/HistoryLog';
// 全部列表
const All: React.FC<{
  common: any;
  tabActiveKey: any;
  getTabList: any;
}> = ({ common, tabActiveKey, getTabList }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };
  const [exporting, exportingSet] = useState(false);
  const [queryParams, queryParamsSet] = useState<any>({});
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const formRef = useRef<any>();

  // 添加弹窗实例
  const editTransportModel = useRef();
  const editStockModel = useRef();
  const historyLogModel = useRef();

  const { dicList } = common;
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  // 导出
  const exportExcel = async () => {
    exportingSet(true);
    const res: any = await shippingMethodAllExport(queryParams);
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
    const res = await shippingMethodAllPage(postData);
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

  const selectProps = {
    showSearch: true,
  };

  // 批量修改运输方式、批量修改目的仓、批量修改装柜方式|单个修改运输方式、单个修改目的仓、单个修改装柜方式
  const editTransportModelOpen: any = (type: string, row?: any, category?: string) => {
    const data: any = editTransportModel?.current;
    data.open(type, row, category);
  };
  // 批量修改安全库存
  const editStockModelOpen: any = (type: string, row?: any) => {
    const data: any = editStockModel?.current;
    data.open(type, row);
  };
  // 查看变更日志
  const historyLogModelOpen: any = (row?: any) => {
    const data: any = historyLogModel?.current;
    data.open(row);
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
      width: 80,
    },
    {
      title: '链接名称 / 链接ID',
      dataIndex: 'link_name',
      // width: 150,
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
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      // width: '110px',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '对应款式名',
      dataIndex: 'sku_name',
      hideInSearch: true,
      // width: '200px',
    },
    {
      title: '产品售价',
      dataIndex: 'sale_price',
      hideInSearch: true,
      // width: 90,
      align: 'center',
      render: (_: any, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.sale_price || '-'}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
              precision={2}
            />
          </span>,
        ];
      },
    },
    // {
    //   title: '运输方式',
    //   dataIndex: 'shipping_method',
    //   width: 100,
    //   align: 'center',
    //   hideInSearch: true,
    //   valueEnum: dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || {},
    // },
    // {
    //   title: '变更日志',
    //   dataIndex: 'showLog',
    //   width: 90,
    //   align: 'center',
    //   hideInSearch: true,
    //   render: (_: any, record: any) =>
    //     access.canSee('stock_up_safeStock_log') ? (
    //       <a onClick={() => historyLogModelOpen(record)}>查看</a>
    //     ) : (
    //       '-'
    //     ),
    // },
    {
      title: '生命周期',
      dataIndex: 'life_cycle',
      valueType: 'select',
      align: 'center',
      // width: 80,
      order: 4,
      fieldProps: selectProps,
      valueEnum: dicList.LINK_MANAGEMENT_LIFE_CYCLE,
      render: (_: any, record: any) => {
        return pubFilter(dicList.LINK_MANAGEMENT_LIFE_CYCLE, record?.life_cycle) || '-';
      },
    },
    {
      title: '产品线',
      dataIndex: 'category_name',
      hideInSearch: true,
      align: 'center',
      // width: 100,
      renderText: (text, record: any) =>
        record.business_scope && text
          ? `${pubFilter(dicList?.SYS_BUSINESS_SCOPE, record.business_scope)}-${text}`
          : '-',
    },
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
      title: 'ERP编码',
      dataIndex: 'erp_sku',
      align: 'center',
      hideInTable: true,
      order: 5,
    },
    {
      title: '推广',
      dataIndex: 'spread_user_id',
      align: 'center',
      request: async (v) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
      valueType: 'select',
      hideInTable: true,
      fieldProps: selectProps,
      order: 5,
    },
    {
      title: '店铺/推广',
      dataIndex: 'store_spread',
      hideInSearch: true,
      // width: 180,
      renderText: (text, record: any) =>
        record.shop_name || record.spread_user_name
          ? `${record.shop_name}-${record.spread_user_name}`
          : '-',
    },
    /*合并end*/
    {
      title: (
        <>
          是否可售
          <Tooltip
            placement="top"
            title={
              <div>
                <p>各平台可售状态说明：</p>
                <p>1、Amazon：状态为BUYABLE为可售</p>
                <p>2、walmart：状态为published为可售</p>
                <p>3、京东：后台标记为可售即为可售</p>
                <p>4、天猫：库存大于0即为可售</p>
              </div>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'is_sale',
      hideInSearch: true,
      align: 'center',
      // width: 100,
      render: (_: any, record: any) => {
        return pubFilter(dicList.SC_YES_NO, record?.is_sale) || '-';
      },
    },
    {
      title: '是否可售',
      dataIndex: 'is_sale',
      hideInTable: true,
      align: 'center',
      order: 2,
      valueEnum: dicList?.SC_YES_NO,
    },
    {
      title: '销售状态',
      dataIndex: 'sales_status',
      // width: 90,
      align: 'center',
      valueEnum: dicList?.LINK_MANAGEMENT_SALES_STATUS,
      render: (_: any, record: any) => {
        return pubFilter(dicList.LINK_MANAGEMENT_SALES_STATUS, record?.sales_status) || '-';
      },
    },
    {
      title: (
        <>
          上架时间
          <Tooltip placement="top" title="产品上架到平台的时间">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'sales_time',
      hideInSearch: true,
      // width: 150,
      sorter: (a: any, b: any) =>
        new Date(a.sales_time).getTime() - new Date(b.sales_time).getTime(),
      align: 'center',
    },
    {
      title: '上架时间',
      dataIndex: 'time',
      align: 'center',
      valueType: 'dateRange',
      hideInTable: true,
      order: 3,
    },
    {
      title: '尺寸类型',
      dataIndex: 'belong_classify',
      valueType: 'select',
      // width: 90,
      valueEnum: {
        1: '标准件',
        2: '大件',
      },
    },
    {
      title: '装柜方式',
      dataIndex: 'box_type',
      valueType: 'select',
      align: 'center',
      // width: 90,
      valueEnum: {
        'whole': '整柜',
        'part': '散货',
      },
    },
    {
      title: '默认运输方式',
      dataIndex: 'shipping_method',
      key: 'shipping_method',
      align: 'center',
      valueEnum: common?.dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || {},
      fieldProps: {
        showSearch: true,
      },
    },
    {
      title: '目的仓',
      dataIndex: 'delivery_route',
      key: 'delivery_route',
      align: 'center',
      valueEnum: common?.dicList?.LOGISTICS_TIME_MANAGE_IN_DELIVERY_ROUTE || {},
      fieldProps: {
        showSearch: true,
      },
    },
    {
      title: '安全库存天数',
      dataIndex: 'safe_days',
      hideInSearch: true,
      // width: 110,
      align: 'center',
    },
    {
      title: '操作',
      width: 145,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => (
        <Space direction={'vertical'}>
          <Access key="safeStock" accessible={access.canSee('stock_up_safeStock_edit')}>
            <a onClick={() => editStockModelOpen('one', record)} type="primary">
              修改安全库存
            </a>
          </Access>
          <Access key="shipping_method_one" accessible={access.canSee('stock_up_safeStock_shipment')}>
            <a onClick={() => editTransportModelOpen('one', record, 'shipping_method')} type="primary">
              修改运输方式
            </a>
          </Access>
          <Access key="delivery_route_one" accessible={access.canSee('stock_up_safeStock_singlealter_ship')}>
          <a onClick={() => editTransportModelOpen('one', record, 'delivery_route')} type="primary">
            修改目的仓
          </a>
        </Access>
        <Access key="box_type_one" accessible={access.canSee('stock_up_safeStock_singlealter_box')}>
        <a onClick={() => editTransportModelOpen('one', record, 'box_type')} type="primary">
          修改装柜方式
        </a>
      </Access>
      <Access key="show_log" accessible={access.canSee('stock_up_safeStock_log')}>
        <a onClick={() => historyLogModelOpen(record)} type="primary">
          日志
        </a>
      </Access>
    </Space>),
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
        headerTitle={
          <Space>
            <Access
              key="stock_up_safeStock_shipment_list"
              accessible={access.canSee('stock_up_safeStock_shipment_list')}
            >
              <Button
                type={'primary'}
                disabled={selectedRowKeys.length == 0}
                onClick={() => {
                  editTransportModelOpen('list', selectedRowKeys, 'shipping_method');
                }}
              >
                批量修改运输方式
              </Button>
            </Access>

            <Access
              key="stock_up_safeStock_batchalter_ship"
              accessible={access.canSee('stock_up_safeStock_batchalter_ship')}
            >
              <Button
                type={'primary'}
                disabled={selectedRowKeys.length == 0}
                onClick={() => {
                  editTransportModelOpen('list', selectedRowKeys, 'delivery_route');
                }}
              >
                批量修改目的仓
              </Button>
            </Access>

            <Access
              key="stock_up_safeStock_batchalter_box"
              accessible={access.canSee('stock_up_safeStock_batchalter_box')}
            >
              <Button
                type={'primary'}
                disabled={selectedRowKeys.length == 0}
                onClick={() => {
                  editTransportModelOpen('list', selectedRowKeys, 'box_type');
                }}
              >
                批量修改装柜方式
              </Button>
            </Access>

            <Access
              key="stock_up_safeStock_edit_list"
              accessible={access.canSee('stock_up_safeStock_edit_list')}
            >
              <Button
                type={'primary'}
                disabled={selectedRowKeys.length == 0}
                onClick={() => {
                  editStockModelOpen('list', selectedRowKeys);
                }}
              >
                批量修改安全库存
              </Button>
            </Access>
            <Access key="export" accessible={access.canSee('safe_up_export_all')}>
              <Button key="export" onClick={() => exportExcel()} loading={exporting} type="primary">
                {exporting ? '导出中' : '导出'}
              </Button>
            </Access>
          </Space>
        }
        bordered
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        params={{ shipping_method_status: tabActiveKey == '0' ? '' : tabActiveKey }}
        request={getListAction}
        search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
        scroll={{ x: 1800 }}
        sticky={{ offsetHeader: 48 }}
        rowKey="link_management_sku_id"
        dateFormatter="string"
        rowSelection={rowSelection}
        size={'small'}
      />
      <EditTransport
        editTransportModel={editTransportModel}
        dicList={dicList}
        handleClose={modalClose}
      />
      <EditStock editStockModel={editStockModel} dicList={dicList} handleClose={modalClose} />
      <HistoryLog historyLogModel={historyLogModel} dicList={dicList} handleClose={modalClose} />
    </>
  );
};

export default All;

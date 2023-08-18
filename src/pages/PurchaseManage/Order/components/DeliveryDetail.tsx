import { connect } from 'umi';
import { useRef, useState } from 'react';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import { getDeliveryList } from '@/services/pages/purchaseOrder';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import type { ActionType } from '@ant-design/pro-table';
import { Tooltip } from 'antd';
import { getUuid, pubGetPlatformList } from '@/utils/pubConfirm';

const TooltipOccupy = () => (
  <>
    未交货数量：已签约采购单，未被入库单占用数量，以及占用数量的入库单处于以下状态的采购数量 <br />
    ①国内：新建、已同步、已撤回、撤回中 <br />
    ②跨境：新建、已同步、已放舱、已通知发货、已撤回、撤回中 <br />
    预占用数量：已签约采购单，关联入库单处于以下状态的采购数量（国内在途状态之前的采购数量） <br />
    ①国内：新建、已同步、已撤回、撤回中 <br />
    ②跨境：新建、已同步、已放舱、已通知发货、已撤回、撤回中 <br />
  </>
);
const Detail = (props: any) => {
  const ref = useRef<ActionType>();
  const formRef: any = useRef<ProFormInstance>();
  const [activeKey, setActiveKey] = useState<React.Key>('plat');
  const [platform_code, platform_codeSet] = useState<any>(null);
  const [timeStamp, timeStampSet] = useState<any>(null);
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    // console.log(params, 'params');
    const res = await getDeliveryList({
      platform_code,
      ...params,
      id: props.items.id,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }

    // 处理表格数据
    const data =
      res?.data?.reduce((pre: any[], current: any) => {
        const detail = current.detail || [];
        if (detail?.length) {
          const tempObj = {
            platform_name: '汇总',
            cn_transit_num: 0,
            warehouse_num: 0,
            exception_num: 0,
            exception_num_in: 0,
            arrival_num: 0,
            in_transit_num: 0,
            logistics_loss_qty: 0
          };
          detail.forEach((v: any) => {
            tempObj.cn_transit_num += v.cn_transit_num ?? 0;
            tempObj.warehouse_num += v.warehouse_num ?? 0;
            if (v.exception_handling_num && v.exception_handling_num > 0) {
              tempObj.exception_num += 0;
            } else {
              tempObj.exception_num += v.exception_num ?? 0;
            }
            tempObj.exception_num_in += v.exception_num_in ?? 0;
            tempObj.arrival_num += v.arrival_num ?? 0;
            tempObj.in_transit_num += v.in_transit_num ?? 0;
            tempObj.logistics_loss_qty += v.logistics_loss_qty ?? 0;
          });
          detail.push(tempObj);
        }

        if (detail.length) {
          const arr = detail.map((value: any, index: number) => {
            delete value.undelivered_num;
            delete value.purchase_num;
            return value.platform_name === '汇总'
              ? {
                  ...value,
                  rowSpan: 0,
                  key: value.sku_id ? value.sku_id + index : getUuid(),
                }
              : {
                  ...current,
                  ...value,
                  rowSpan: 0,
                  key: value.sku_id ? value.sku_id + index : getUuid(),
                };
          });
          arr[0].rowSpan = arr.length;
          // eslint-disable-next-line no-param-reassign
          pre = [...pre, ...arr];
        } else {
          current.key = current.sku_id ? current.sku_id + Date.now() : getUuid();
          // eslint-disable-next-line no-param-reassign
          pre = [...pre, current];
        }
        return pre;
      }, []) || [];
    console.log(data, 'data');
    return {
      data: data,
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 云仓
  const cloudColumns: any[] = [
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInSearch: true,
    },
    {
      title: 'SKU',
      dataIndex: 'stock_no',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInSearch: true,
    },
    {
      title: '采购下单数量',
      dataIndex: 'purchase_num',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInSearch: true,
    },
    {
      title: (
        <>
          未交货数量 <br /> (预占用)
        </>
      ),
      tooltip: <TooltipOccupy />,
      dataIndex: 'undelivered_num',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInSearch: true,
      render: (text: any, record: any) => (
        <>
          {record.undelivered_num || 0} <br /> ({record.occupy_num || 0})
        </>
      ),
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '在途数量',
      dataIndex: 'cn_transit_num',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '入库数量',
      dataIndex: 'warehouse_num',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '入库异常',
      dataIndex: 'exception_num',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record.exception_handling_num && record.exception_handling_num > 0 ? (
          `${record.exception_handling_num}(已处理)`
        ) : record.exception_num ? (
          <Tooltip title="可到 '入库单' 中处理异常哦~">
            <span
              style={{
                color: record.platform_name != '汇总' ? 'red' : '',
              }}
            >
              {record.exception_num}
              {record.platform_name == '汇总' ? '(未处理)' : ''}
            </span>
          </Tooltip>
        ) : (
          <span>
            {record.exception_num}
            {record.platform_name == '汇总' ? '(未处理)' : ''}
          </span>
        ),
    },
    {
      title: '仓库',
      dataIndex: 'warehouse_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '入库单号',
      dataIndex: 'warehousing_order_no',
      align: 'center',
    },
    {
      title: '要求入库时间',
      dataIndex: 'required_warehousing_time',
      align: 'center',
      hideInSearch: true,
      sorter: (a: any, b: any) =>
        new Date(a.required_warehousing_time).getTime() -
        new Date(b.required_warehousing_time).getTime(),
    },
    {
      title: '实际入库时间',
      dataIndex: 'warehousing_time',
      align: 'center',
      hideInSearch: true,
      sorter: (a: any, b: any) =>
        new Date(a.warehousing_time).getTime() - new Date(b.warehousing_time).getTime(),
    },
  ];
  // 表格配置
  const columns: any[] = [
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInSearch: true,
    },
    {
      title: 'SKU',
      dataIndex: props.items.business_scope == 'CN' ? 'stock_no' : 'shop_sku_code',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInSearch: true,
    },
    {
      title: '采购下单数量',
      dataIndex: 'purchase_num',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInSearch: true,
    },
    {
      title: (
        <>
          未交货数量 <br /> (预占用)
        </>
      ),
      tooltip: <TooltipOccupy />,
      dataIndex: 'undelivered_num',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInSearch: true,
      width: 120,
      render: (text: any, record: any) => (
        <>
          {record.undelivered_num || 0} <br /> ({record.occupy_num || 0})
        </>
      ),
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      hideInSearch: true,
      width: 100,
    },
    {
      title: '平台',
      dataIndex: 'platform_code',
      align: 'center',
      hideInTable: true,
      valueType: 'select',
      fieldProps: { showSearch: true },
      request: async () => {
        const res = await pubGetPlatformList({ business_scope: props.items?.business_scope || '' });
        if (res?.length) {
          return res
            .map((item: any) => ({ ...item, value: item.platform_code }))
            .filter((item: any) => item.value != 'YUN_CANG');
        }
        return [];
      },
    },
    {
      title: props.items.business_scope == 'CN' ? '在途数量' : '国内在途数量',
      dataIndex: 'cn_transit_num',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '平台入库数量',
      dataIndex: 'warehouse_num',
      align: 'center',
      hideInTable: props.items.business_scope != 'CN',
      hideInSearch: true,
    },
    {
      title: '物流丢失数量',
      dataIndex: 'logistics_loss_qty',
      align: 'center',
      hideInTable: props.items.business_scope != 'CN',
      hideInSearch: true,
    },
    {
      title: '国内入库数量',
      dataIndex: 'arrival_num',
      align: 'center',
      hideInTable: props.items.business_scope == 'CN',
      hideInSearch: true,
    },
    {
      title: props.items.business_scope == 'CN' ? '平台入库异常(不含物流丢失)' : '国内入库异常',
      dataIndex: 'exception_num',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record.exception_handling_num && record.exception_handling_num > 0 ? (
          `${record.exception_handling_num}(已处理)`
        ) : record.exception_num ? (
          <Tooltip title="可到 '入库单' 中处理异常哦~">
            <span
              style={{
                color: record.platform_name != '汇总' ? 'red' : '',
              }}
            >
              {record.exception_num}
              {record.platform_name == '汇总' ? '(未处理)' : ''}
            </span>
          </Tooltip>
        ) : (
          <span>
            {record.exception_num}
            {record.platform_name == '汇总' ? '(未处理)' : ''}
          </span>
        ),
    },
    {
      title: '境外在途数量',
      dataIndex: 'in_transit_num',
      align: 'center',
      hideInTable: props.items.business_scope == 'CN',
      hideInSearch: true,
    },
    {
      title: '跨境平台入库数量',
      dataIndex: 'warehouse_num',
      align: 'center',
      hideInTable: props.items.business_scope == 'CN',
      hideInSearch: true,
    },
    {
      title: '跨境平台入库异常',
      dataIndex: 'exception_num_in',
      align: 'center',
      hideInTable: props.items.business_scope == 'CN',
      hideInSearch: true,
    },
    {
      title: (
        <div>
          入库仓库
          <br />
          （区域）
        </div>
      ),
      width: 110,
      dataIndex: 'warehouse_area',
      align: 'center',
      hideInTable: props.items.business_scope == 'IN',
      hideInSearch: true,
    },
    {
      title: (
        <div>
          入库仓库
          <br />
          （店铺）
        </div>
      ),
      width: 110,
      dataIndex: 'shop_name',
      align: 'center',
      hideInTable: props.items.business_scope == 'CN',
      hideInSearch: true,
    },
    {
      title: '入库单号',
      dataIndex: 'warehousing_order_no',
      align: 'center',
    },
    {
      title: '平台入库单号',
      dataIndex: 'platform_warehousing_order_no',
      align: 'center',
      hideInTable: props.items.business_scope == 'IN',
      hideInSearch: props.items.business_scope == 'IN',
    },
    {
      title: (
        <div>
          平台入库单号
          <br />
          （货件号）
        </div>
      ),
      width: 110,
      dataIndex: 'shipment_id',
      align: 'center',
      hideInTable: props.items.business_scope == 'CN',
      hideInSearch: props.items.business_scope == 'CN',
    },
    {
      title: '要求入库时间',
      dataIndex: 'required_warehousing_time',
      align: 'center',
      hideInSearch: true,
      sorter: (a: any, b: any) =>
        new Date(a.required_warehousing_time).getTime() -
        new Date(b.required_warehousing_time).getTime(),
    },
    {
      title: '实际入库时间',
      dataIndex: 'warehousing_time',
      align: 'center',
      hideInSearch: true,
      sorter: (a: any, b: any) =>
        new Date(a.warehousing_time).getTime() - new Date(b.warehousing_time).getTime(),
    },
  ];
  // 汇业仓
  const columnsHyc: any[] = [
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInSearch: true,
    },
    {
      title: 'SKU',
      dataIndex: 'stock_no',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInSearch: true,
    },
    {
      title: '采购下单数量',
      dataIndex: 'purchase_num',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInSearch: true,
    },
    {
      title: (
        <>
          未交货数量 <br /> (预占用)
        </>
      ),
      tooltip: <TooltipOccupy />,
      dataIndex: 'undelivered_num',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      hideInSearch: true,
      render: (text: any, record: any) => (
        <>
          {record.undelivered_num || 0} <br /> ({record.occupy_num || 0})
        </>
      ),
    },

    {
      title: '在途数量',
      dataIndex: 'cn_transit_num',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '入库数量',
      dataIndex: 'warehouse_num',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '入库异常',
      dataIndex: 'exception_num',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record.exception_handling_num && record.exception_handling_num > 0 ? (
          `${record.exception_handling_num}(已处理)`
        ) : record.exception_num ? (
          <Tooltip title="可到 '入库单' 中处理异常哦~">
            <span
              style={{
                color: record.platform_name != '汇总' ? 'red' : '',
              }}
            >
              {record.exception_num}
              {record.platform_name == '汇总' ? '(未处理)' : ''}
            </span>
          </Tooltip>
        ) : (
          <span>
            {record.exception_num}
            {record.platform_name == '汇总' ? '(未处理)' : ''}
          </span>
        ),
    },
    {
      title: '仓库',
      dataIndex: 'warehouse_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '入库单号',
      dataIndex: 'warehousing_order_no',
      align: 'center',
    },

    {
      title: '实际入库时间',
      dataIndex: 'warehousing_time',
      align: 'center',
      hideInSearch: true,
      sorter: (a: any, b: any) =>
        new Date(a.warehousing_time).getTime() - new Date(b.warehousing_time).getTime(),
    },
  ];
  return (
    <>
      <ProTable<TableListItem>
        columns={
          platform_code === 'YUN_CANG'
            ? cloudColumns
            : platform_code === 'HUI_YE_CANG'
            ? columnsHyc
            : columns
        }
        cardProps={{
          style: { padding: 0, marginBottom: '20px', marginTop: '-12px' },
          bodyStyle: { padding: 0 },
        }}
        key={timeStamp}
        actionRef={ref}
        options={false}
        pagination={false}
        bordered
        formRef={formRef}
        params={{ timeStamp }}
        request={getListAction}
        rowKey="key"
        dateFormatter="string"
        scroll={{ x: platform_code ? 1200 : 1800 }}
        search={{
          labelWidth: 106,
          className: 'light-search-form',
          defaultCollapsed: false,
        }}
        columnEmptyText={true}
        toolbar={
          props.items.business_scope == 'CN'
            ? {
                menu: {
                  type: 'tab',
                  activeKey: activeKey,
                  items: [
                    {
                      key: 'plat',
                      label: '平台入库单',
                    },
                    {
                      key: 'cloud',
                      label: '云仓入库单',
                    },
                    {
                      key: 'hyc',
                      label: '汇业仓入库单',
                    },
                  ],
                  onChange: (key) => {
                    setActiveKey(key as string);
                    if (key == 'cloud') {
                      formRef.current.resetFields();
                      platform_codeSet('YUN_CANG');
                      formRef.current.setFieldsValue({ platform_code_yuncang: 'YUN_CANG' });
                      timeStampSet(Date.now());
                    } else if (key == 'hyc') {
                      formRef.current.resetFields();
                      platform_codeSet('HUI_YE_CANG');
                      setTimeout(() => {
                        timeStampSet(Date.now());
                      }, 0);
                    } else {
                      formRef.current.resetFields();
                      platform_codeSet('');
                      setTimeout(() => {
                        timeStampSet(Date.now());
                      }, 0);
                    }
                  },
                },
              }
            : {}
        }
        headerTitle={
          props.items.business_scope == 'IN' ? (
            <span style={{ fontSize: '12px', color: 'red', lineHeight: '24px' }} key="tip">
              *采购下单数量=未交货数量+国内在途数量+国内入库数量+未处理国内入库异常数量; 跨境平台入库异常=国内入库数量-跨境平台入库数量
            </span>
          ) : undefined
        }
        toolBarRender={() =>
          props.items.business_scope == 'CN'
            ? [
                <span style={{ fontSize: '12px', color: 'red', lineHeight: '24px' }} key="tip">
                  *采购下单数量=未交货数量+在途数量+入库数量+物流丢失数量+未处理入库异常数量
                </span>,
              ]
            : []
        }
      />
    </>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Detail);

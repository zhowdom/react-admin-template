import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { ProTable } from '@ant-design/pro-components';
import { Space, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { getPlanedSendNumDetail } from '@/services/pages/stockUpIn/stockUpWarning';
import { getPlanedNoCheckNumDetail } from '@/services/pages/stockUpIn/stockUpWarning';
import { getProductNumDetail } from '@/services/pages/stockUpIn/stockUpWarning';
import { add } from '@/utils/pubConfirm';

export default (props: any) => {
  const { dicList, data } = props;
  const [obj, setObj] = useState<any>({});
  const [obj1, setObj1] = useState<any>({});
  const [obj2, setObj2] = useState<any>({});
  const columns: any = useMemo(
    () => [
      {
        title: '商品名称',
        dataIndex: 'goods_sku_name',
        search: false,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
      {
        title: '店铺SKU',
        dataIndex: 'shop_sku_code',
        search: false,
        width: 70,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
      {
        title: '发货计划编号',
        dataIndex: 'delivery_plan_no',
        width: 110,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        render: (_: any, record: any) => record?.plan_no ?? '-',
      },
      {
        title: '发货计划状态',
        dataIndex: 'status',
        valueEnum: dicList?.DELIVERY_PLAN_STATUS || {},
        hideInSearch: true,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        width: 110,
      },
      {
        title: '计划发货数量(总)',
        dataIndex: 'totalNum',
        width: 90,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        hideInSearch: true,
        valueType: 'digit',
      },
      {
        title: '未建入库单数量',
        dataIndex: 'delivery_plan_no_order_num',
        hideInSearch: true,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        width: 120,
        valueType: 'digit',
      },
      {
        title: '入库单号',
        dataIndex: 'order_no',
        width: 120,
        hideInSearch: true,
      },
      {
        title: '状态',
        dataIndex: 'approval_status',
        hideInSearch: true,
        width: 110,
        render: (_: any, record: any) =>
          (record.order_no &&
            pubFilter(dicList?.WAREHOUSING_ORDER_IN_STATUS, record.approval_status)) ||
          '-',
      },
      {
        title: '待发货数量',
        dataIndex: 'plan_num',
        hideInSearch: true,
        valueType: 'digit',
        width: 80,
      },

      // {
      //   title: '已计划发货数量',
      //   dataIndex: 'delivery_planed_send_num',
      //   valueType: 'digit',
      //   search: false,
      //   width: 110,
      //   onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      // },
    ],
    [dicList],
  );
  const getNotSigned = async () => {
    const res = await getPlanedNoCheckNumDetail({ ...data.params });
    if (res?.code !== pubConfig.sCode) {
      pubMsg(res?.message);
      setObj1({});
      return;
    }
    setObj1(res.data || {});
  };
  const getInProcess = async () => {
    const res = await getProductNumDetail({ ...data.params });
    if (res?.code !== pubConfig.sCode) {
      pubMsg(res?.message);
      setObj2({});
      return;
    }
    setObj2(res.data || {});
  };
  useEffect(() => {
    getNotSigned();
    getInProcess();
  }, []);
  return (
    <>
      <ProTable
        headerTitle={
          <span className={'text-red'}>说明：已计划发货数量 = 未建入库单数量+待发货数量</span>
        }
        rowKey={(record: any) => record.purchase_order_id}
        bordered
        columns={columns}
        options={false}
        pagination={false}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 6 }}
        request={async (params) => {
          const res = await getPlanedSendNumDetail({ ...params, ...data.params });
          if (res?.code !== pubConfig.sCode) {
            pubMsg(res?.message);
            setObj({});
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          setObj(res?.data || {});
          const dataFlat: any = [];
          if (res?.data?.deliveryPlanList?.length) {
            res?.data?.deliveryPlanList?.forEach((item: any) => {
              if (!item?.responseWarehousingOrders?.length) {
                item.rowSpan1 = 1;
                dataFlat.push({ ...item, status: item.approval_status, totalNum: item.num });
              } else {
                item?.responseWarehousingOrders?.forEach((v: any, i: number) => {
                  v.rowSpan1 = i == 0 ? item?.responseWarehousingOrders?.length : 0;
                  dataFlat.push({
                    ...item,
                    ...v,
                    status: item.approval_status,
                    totalNum: item.num,
                  });
                });
              }
            });
          }
          return {
            success: true,
            data: dataFlat || [],
          };
        }}
        scroll={{ x: 1000, y: 'calc(75vh - 373px)' }}
        sticky={{ offsetHeader: 0 }}
        showSorterTooltip={false}
        cardProps={{ bodyStyle: { padding: 0 } }}
      />
      <div className='bottom-info'>
        <Space size={40}>
          <span>
            未建入库单数量：
            <span className={'text-red'}>{obj?.delivery_plan_no_order_num ?? '0'}</span>
          </span>
          <span>
            待发货数量：
            <span className={'text-red'}>{obj?.wait_send_num ?? '0'}</span>
          </span>
          <span>
            已计划发货数量：
            <span className={'text-red'}>{obj?.delivery_planed_send_num ?? '0'}</span>
          </span>
        </Space>
      </div>
      <div className='bottom-info'>
        <span>
          未交货数量（PMC）= 已计划未签约数量
          <span className={'text-red'}>{obj1?.no_check_order_num ?? 0}</span>
        </span>
        <span>
          &nbsp;+&nbsp;在制数量
          <span className={'text-red'}>
            {obj2?.product_num && obj2?.product_num < 0
              ? `(${obj2.product_num ?? '0'})`
              : `${obj2.product_num ?? '0'}`}
          </span>
        </span>
        <span>
          &nbsp;=&nbsp;
          <span className={'text-red'}>
            {add(obj1?.no_check_order_num ?? 0, obj2.product_num ?? 0)}
          </span>
        </span>
      </div>
    </>
  );
};

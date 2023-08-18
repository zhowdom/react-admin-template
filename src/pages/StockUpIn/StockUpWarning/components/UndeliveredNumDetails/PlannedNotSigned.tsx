import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { ProTable } from '@ant-design/pro-components';
import { Space, Table } from 'antd';
import { useEffect, useMemo } from 'react';
import { getPlanedNoCheckNumDetail } from '@/services/pages/stockUpIn/stockUpWarning';
import { useState } from 'react';
import { getProductNumDetail } from '@/services/pages/stockUpIn/stockUpWarning';
import { add } from '@/utils/pubConfirm';

export default (props: any) => {
  const { dicList, data } = props;
  const [obj, setObj] = useState<any>({});
  const [obj1, setObj1] = useState<any>({});
  const columns: any = useMemo(
    () => [
      {
        title: '商品名称',
        dataIndex: 'sku_name',
        search: false,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
      {
        title: '店铺SKU',
        dataIndex: 'shop_sku_code',
        align: 'center',
        search: false,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
      {
        title: '采购计划编号',
        dataIndex: 'purchase_plan_no',
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        render: (_: any, record: any) => record?.plan_no ?? '-',
      },
      {
        title: '采购单计划状态',
        dataIndex: 'status',
        search: false,
        valueEnum: dicList?.PURCHASE_PLAN_STATUS || {},
        align: 'center',
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      },
      {
        title: '计划下单数量(总)',
        dataIndex: 'num',
        align: 'center',
        search: false,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        valueType: 'digit',
      },
      {
        title: '未下单数量',
        dataIndex: 'purchase_planed_no_order_num',
        align: 'center',
        hideInSearch: true,
        onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
        valueType: 'digit',
      },
      {
        title: '采购单号',
        dataIndex: 'order_no',
        align: 'center',
        hideInSearch: true,
      },
      {
        title: '采购单状态',
        dataIndex: 'approval_status',
        align: 'center',
        hideInSearch: true,
        width: 100,
        render: (_: any, record: any) => {
          return record?.order_no
            ? pubFilter(props?.dicList?.PURCHASE_APPROVAL_STATUS, record.approval_status) || '-'
            : '-';
        },
      },
      {
        title: '下单中数量',
        dataIndex: 'num1',
        width: 110,
        align: 'center',
        hideInSearch: true,
        valueType: 'digit',
      },
      // {
      //   title: '已计划未签约数量',
      //   dataIndex: 'no_check_order_num',
      //   align: 'right',
      //   valueType: 'digit',
      //   search: false,
      //   width: 120,
      //   onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      // },
    ],
    [dicList],
  );
  const getInProcess = async () => {
    const res = await getProductNumDetail({ ...data.params });
    if (res?.code !== pubConfig.sCode) {
      pubMsg(res?.message);
      setObj1({});
      return;
    }
    setObj1(res.data || {});
  };
  useEffect(() => {
    getInProcess();
  }, []);
  return (
    <>
      <ProTable
        headerTitle={
          <span className={'text-red'}>
            说明：已计划未签约数量=已计划未下采购单数量+已计划采购下单中数量
          </span>
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
          const res = await getPlanedNoCheckNumDetail({
            ...params,
            ...data.params,
          });
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
          if (res?.data?.purchasePlansList?.length) {
            res?.data?.purchasePlansList?.forEach((item: any) => {
              if (!item?.ordered_list?.length) {
                item.rowSpan1 = 1;
                dataFlat.push({ ...item });
              } else {
                item?.ordered_list?.forEach((v: any, i: number) => {
                  v.rowSpan1 = i == 0 ? item?.ordered_list?.length : 0;
                  dataFlat.push({ ...item, ...v, num: item.num, num1: v.num });
                });
              }
            });
          }
          return {
            success: true,
            data: dataFlat,
          };
        }}
        scroll={{ x: 1000, y: 'calc(75vh - 373px)' }}
        sticky={{ offsetHeader: 0 }}
        showSorterTooltip={false}
        cardProps={{ bodyStyle: { padding: 0 } }}
      />
      <div className="bottom-info">
        <Space size={40}>
          <span>
            未下单数量：
            <span className={'text-red'}>{obj?.purchase_planed_no_order_num ?? '0'}</span>
          </span>
          <span>
            下单中数量：
            <span className={'text-red'}>{obj?.rel_purchase_order_num ?? '0'}</span>
          </span>
          <span>
            已计划未签约数量：
            <span className={'text-red'}>{obj?.no_check_order_num ?? '0'}</span>
          </span>
        </Space>
      </div>
      <div className="bottom-info">
        <span>
          未交货数量（PMC）= 已计划未签约数量
          <span className={'text-red'}>{obj?.no_check_order_num ?? 0}</span>
        </span>
        <span>
          &nbsp;+&nbsp;在制数量
          <span className={'text-red'}>
            {obj1?.product_num && obj1?.product_num < 0
              ? `(${obj1.product_num ?? '0'})`
              : `${obj1.product_num ?? '0'}`}
          </span>
        </span>
        <span>
          &nbsp;=&nbsp;
          <span className={'text-red'}>
            {add(obj?.no_check_order_num ?? 0, obj1.product_num ?? 0)}
          </span>
        </span>
      </div>
    </>
  );
};

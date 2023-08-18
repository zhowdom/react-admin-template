import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { ProTable } from '@ant-design/pro-components';
import { Space, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getProductNumDetail } from '@/services/pages/stockUpIn/stockUpWarning';
import { getPlanedNoCheckNumDetail } from '@/services/pages/stockUpIn/stockUpWarning';
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
        align: 'left',
      },
      {
        title: '店铺SKU',
        dataIndex: 'shop_sku_code',
        align: 'left',
        search: false,
      },
      {
        title: '采购单号',
        dataIndex: 'purchase_order_no',
        align: 'left',
        render: (_: any, record: any) => record?.order_no ?? '-',
      },
      {
        title: '采购单状态',
        dataIndex: 'approval_status',
        align: 'left',
        hideInSearch: true,
        width: 100,
        render: (_: any, record: any) => {
          return pubFilter(props?.dicList?.PURCHASE_APPROVAL_STATUS, record.approval_status) || '-';
        },
      },
      {
        title: '入库状态',
        dataIndex: 'delivery_status',
        align: 'left',
        hideInSearch: true,
        render: (_: any, record: any) => {
          return pubFilter(props?.dicList?.PURCHASE_DELIVERY_STATUS, record.delivery_status) || '-';
        },
      },
      {
        title: (
          <>
            下单数量
            <br />
            (含备品)
          </>
        ),
        dataIndex: 'num',
        align: 'left',
        hideInSearch: true,
        valueType: 'digit',
      },
      {
        title: (
          <>
            未交货数量（采购）
            <br />
            (含备品)
          </>
        ),
        dataIndex: 'no_deal_for_check_num',
        align: 'left',
        valueType: 'digit',
        search: false,
        width: 200,
      },
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
  useEffect(() => {
    getNotSigned();
  }, []);
  return (
    <>
      <ProTable
        headerTitle={
          <span className={'text-red'}>说明：在制数量=未交货数量（采购） - 已计划发货数量</span>
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
          const res = await getProductNumDetail({
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
          setObj(res.data || {});
          return {
            success: true,
            data: res?.data?.purchaseOrderList || [],
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
            未交货数量（采购）：
            <span className={'text-red'}>{obj.no_deal_for_check_num ?? '0'}</span>
          </span>
          <span>
            已计划发货数量：
            <span className={'text-red'}>{obj.delivery_planed_send_num ?? '0'}</span>
          </span>
          <span>
            在制数量：
            <span className={'text-red'}> {obj.product_num ?? '0'}</span>
          </span>
        </Space>
      </div>
      <div className="bottom-info">
        <span>
          未交货数量（PMC）= 已计划未签约数量
          <span className={'text-red'}>{obj1?.no_check_order_num ?? 0}</span>
        </span>
        <span>
          &nbsp;+&nbsp;在制数量
          <span className={'text-red'}>
            {obj?.product_num && obj?.product_num < 0
              ? `(${obj.product_num ?? '0'})`
              : `${obj.product_num ?? '0'}`}
          </span>
        </span>
        <span>
          &nbsp;=&nbsp;
          <span className={'text-red'}>
            {add(obj1?.no_check_order_num ?? 0, obj.product_num ?? 0)}
          </span>
        </span>
      </div>
    </>
  );
};

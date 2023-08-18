import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { ProTable } from '@ant-design/pro-components';
import { useEffect, useMemo, useState } from 'react';
import {
  getOnwayNumDetail,
  getPlanedSendNumDetail,
} from '@/services/pages/stockUpIn/stockUpWarning';
import { add } from '@/utils/pubConfirm';

export default (props: any) => {
  const { dicList, data } = props;
  const columns: any = useMemo(
    () => [
      {
        title: '商品名称',
        dataIndex: 'sku_name',
        hideInSearch: true,
        align: 'left',
        width: 150,
      },
      {
        title: '店铺SKU',
        dataIndex: 'shop_sku_code',
        align: 'left',
        hideInSearch: true,
        width: 80,
      },
      {
        title: '平台',
        dataIndex: 'platform_name',
        align: 'left',
        ellipsis: true,
        hideInSearch: true,
        width: 80,
      },
      {
        title: '店铺',
        dataIndex: 'shop_name',
        align: 'left',
        ellipsis: true,
        hideInSearch: true,
        width: 90,
      },
      {
        title: '货件号',
        dataIndex: 'shipment_id',
        align: 'left',
        width: 110,
      },
      {
        title: '入库单号',
        dataIndex: 'delivery_order_no',
        align: 'left',
        width: 100,
        render: (_: any, record: any) => record?.order_no ?? '-',
      },
      {
        title: '入库单状态',
        dataIndex: 'approval_status',
        render: (_: any, record: any) => {
          return pubFilter(dicList?.WAREHOUSING_ORDER_IN_STATUS, record.approval_status) || '-';
        },
        hideInSearch: true,
        width: 100,
        align: 'left',
      },
      {
        title: '跨境物流单号',
        dataIndex: 'in_logistics_order_no',
        align: 'left',
        width: 110,
      },
      {
        title: '跨境物流单状态',
        dataIndex: 'logisticsOrder_status',
        align: 'left',
        render: (_: any, record: any) => {
          return pubFilter(dicList?.LOGISTICS_ORDER_STATUS, record.logisticsOrder_status) || '-';
        },
        hideInSearch: true,
        width: 80,
      },
      {
        title: '要求物流入仓时间',
        dataIndex: 'required_warehousing_time',
        align: 'left',
        hideInSearch: true,
        width: 120,
      },
      {
        title: '预计入仓时间',
        dataIndex: 'platform_appointment_warn_time',
        width: 110,
        hideInSearch: true,
        align: 'left',
      },

      {
        title: '实际入仓时间',
        dataIndex: 'actual_warehouse_date',
        width: 110,
        hideInSearch: true,
        align: 'left',
      },
      {
        title: '发货数量',
        dataIndex: 'delivery_plan_current_num',
        align: 'left',
        hideInSearch: true,
        valueType: 'digit',
        width: 90,
      },
      {
        title: '预留数量',
        dataIndex: 'in_on_way_num',
        align: 'left',
        hideInSearch: true,
        valueType: 'digit',
        tooltip: (
          <>
            一，预计预留数量和预计库存逻辑：
            <br />
            1，系统没有实际入仓时间时，判断预计入仓时间，没有预计入仓时间，判断要求物流入仓时间；
            <br />
            2，根据判断的要求物流入仓时间、预计或实际入仓时间，在这三个时间之前统计为在途，15天内（含）算作预留数量，15天后算作预计库存；
            <br />
            <br />
            二，当前实际预留数量，取Amazon后台的预留数量（跨境备货管理库存报表取值）；
            <br />
            <br />
            三， <br />
            1，本周预留数量 = Amazon后台的预留数量 + 预计预留数量（不含实际入仓的）； <br />
            备注：因为是每日更新数据，例如周一的时候，周四的预计入仓后也统计为本周的预留数量；
            <br />
            2，未来周预计预留数量，根据预计入仓时间、实际入仓时间判断，15天内算预留数量，15天后算预计库存；
            <br />
            3，历史前三周的，分别取当周周一凌晨00:00计算并且保存的数量；
          </>
        ),
        width: 90,
      },
    ],
    [dicList],
  );
  const [obj, setObj] = useState<any>({});
  const [obj1, setObj1] = useState<any>({});
  const getPlanned = async () => {
    const res = await getPlanedSendNumDetail({
      ...data.params,
      identification: 'YL',
    });
    if (res?.code !== pubConfig.sCode) {
      pubMsg(res?.message);
      setObj1({});
      return;
    }
    setObj1(res.data || {});
  };
  useEffect(() => {
    getPlanned();
  }, []);
  return (
    <>
      <ProTable
        rowKey={(record: any) => record.purchase_order_id}
        toolBarRender={() => [<strong key="time">{`${data?.params?.timeRangeC}`}</strong>]}
        bordered
        columns={columns}
        options={false}
        pagination={false}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 6 }}
        headerTitle={
          <span className={'text-red'}>
           说明：根据要求平台入库时间、预计入仓时间、实际入仓时间预测统计跨境平台入库单预留数量，入库当周统计并显示为预留数量。
          </span>
        }
        request={async (params) => {
          const res = await getOnwayNumDetail({
            ...params,
            ...data.params,
            identification: 'YL',
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
          return {
            success: true,
            data: res?.data?.warehousingOrderList || [],
          };
        }}
        scroll={{ x: 1200, y: 'calc(75vh - 310px)' }}
        sticky={{ offsetHeader: 0 }}
        showSorterTooltip={false}
        cardProps={{ bodyStyle: { padding: 0 } }}
      />
      <div className="bottom-info">
        <span>
          预留数量（汇总）= 已计划未建入库单预留数量
          <span className={'text-red'}>{obj1?.delivery_plan_no_order_num ?? 0}</span>
        </span>
        <span>
          &nbsp;+ &nbsp;跨境平台入库单预留数量
          <span className={'text-red'}>{obj?.in_on_way_num ?? 0}</span>
        </span>
        <span>
          &nbsp;=&nbsp;
          <span className={'text-red'}>
            {add(obj1?.delivery_plan_no_order_num ?? 0, obj.in_on_way_num ?? 0)}
          </span>
        </span>
      </div>
    </>
  );
};

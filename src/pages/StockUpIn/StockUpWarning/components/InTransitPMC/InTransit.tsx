import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { ProTable } from '@ant-design/pro-components';
import { Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getOnwayNumDetail } from '@/services/pages/stockUpIn/stockUpWarning';
import { getPlanedSendNumDetail } from '@/services/pages/stockUpIn/stockUpWarning';
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
        hideInSearch: true,
      },
      {
        title: '店铺SKU',
        dataIndex: 'shop_sku_code',
        width: 70,
        hideInSearch: true,
      },
      {
        title: '平台',
        dataIndex: 'platform_name',
        hideInSearch: true,
        width: 80,
      },
      {
        title: '店铺',
        dataIndex: 'shop_name',
        hideInSearch: true,
        width: 90,
      },
      {
        title: '货件号',
        dataIndex: 'shipment_id',
        width: 110,
      },
      {
        title: '入库单号',
        dataIndex: 'delivery_order_no',
        width: 110,
        render: (_: any, record: any) => record?.order_no ?? '-',
      },
      {
        title: '跨境物流单号',
        dataIndex: 'in_logistics_order_no',
        width: 110,
      },
      {
        title: '入库单状态',
        dataIndex: 'approval_status',
        render: (_: any, record: any) => {
          return pubFilter(dicList?.WAREHOUSING_ORDER_IN_STATUS, record.approval_status) || '-';
        },
        hideInSearch: true,
        width: 100,
      },
      {
        title: '要求物流入仓时间',
        dataIndex: 'required_warehousing_time',
        hideInSearch: true,
        width: 90,
      },
      {
        title: '预计入仓时间',
        dataIndex: 'platform_appointment_warn_time',
        width: 90,
        hideInSearch: true,
      },

      {
        title: '实际入仓时间',
        dataIndex: 'actual_warehouse_date',
        width: 90,
        hideInSearch: true,
      },
      {
        title: '发货数量',
        dataIndex: 'delivery_plan_current_num',
        hideInSearch: true,
        width: 80,
        valueType: 'digit',
      },
      {
        title: (
          <>
            在途数量
            <br />
            (采购)
          </>
        ),
        dataIndex: 'in_on_way_num',
        hideInSearch: true,
        width: 90,
        valueType: 'digit',
        tooltip: (
          <>
            一，此在途数量，仅包含供应商已发货到平台目的仓库入仓前的数量，入库单及物流单状态包括：
            <br />
            1，国内在途,
            <br />
            2，国内已入库（包含物流单新建状态）
            <br />
            3，跨境在途且物流单已装柜/已送货状态
            <br />
            4，跨境在途且物流单已开船状态
            <br />
            5，跨境在途且物流单已到港状态
            <br />
            6， <br />
            平台入库中 （未入库部分） <br />
            备注：跨境在途且物流单已到仓及已签收状态，并且没有上架非可售数量，统计到预留数量里面。
            <br />
            二，
            <br />
            1，平台入库中，已入库部分根据已入仓时间判断是预留数量，还是预计库存；
            <br />
            2，平台入库中，未入库部分根据预计入仓时间判断是预留数量，还是预计库存；
            <br />
            三， <br />
            根据入库单关联物流单的预计入仓时间和实际入仓时间判断，如果预计入仓时间和实际入仓时间在计算周的时间之内，则不统计到在途数量，而是统计到预留数量或者预计库存；
            <br />
            四， <br />
            1，实际在途数量，统计国内在途、国内已入库、跨境在途、平台入库中未入库部分之和； <br />
            2，预计在途数量，根据入库单的要求物流入仓时间和关联的物流单预计入库时间判断，在预计入库时间前，统计为在途，在预计入库时间和实际入仓时间之后统计为预留数量（15天内）或者预计库存（15天后）；
            <br />
            五，注意： <br />
            1，亚马逊预留时间为15天：当前时间与要求物流入仓时间、预计入仓时间、实际入仓时间对比，15天内为预留数量，15天后为预计库存；
            <br />
            2，沃尔玛预留时间为7天：当前时间与要求物流入仓时间、预计入仓时间、实际入仓时间对比，7天内为预留数量，7天后为预计库存；
          </>
        ),
      },
    ],
    [dicList],
  );
  const getPlanned = async () => {
    const res = await getPlanedSendNumDetail({
      ...data.params,
      identification: 'ZT',
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
        bordered
        toolBarRender={() => [<strong key="time">{`${data?.params?.timeRangeC}`}</strong>]}
        headerTitle={<span style={{ lineHeight: '14px' }}></span>}
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 6 }}
        columns={columns}
        options={false}
        pagination={false}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={async (params) => {
          const res = await getOnwayNumDetail({
            ...params,
            ...data.params,
            identification: 'ZT',
          });
          if (res?.code !== pubConfig.sCode) {
            pubMsg(res?.message);
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
        scroll={{ x: 1000, y: 'calc(75vh - 373px)' }}
        sticky={{ offsetHeader: 0 }}
        showSorterTooltip={false}
        cardProps={{ bodyStyle: { padding: 0 } }}
      />
      <div className="bottom-info">
        <Space size={40}>
          <span>
            在途数量（采购）：
            <span className={'text-red'}>{obj?.in_on_way_num ?? '0'}</span>
          </span>
        </Space>
      </div>
      <div className="bottom-info">
        <span>
          在途数量（PMC）=&nbsp;已计划发货数量
          <span className={'text-red'}>{obj1?.delivery_planed_send_num ?? 0}</span>
        </span>
        <span>
          &nbsp;+&nbsp;在途数量（采购）
          <span className={'text-red'}>{obj?.in_on_way_num ?? '0'}</span>
        </span>
        <span>
          &nbsp;=&nbsp;
          <span className={'text-red'}>
            {add(obj1?.delivery_planed_send_num ?? 0, obj.in_on_way_num ?? 0)}
          </span>
        </span>
      </div>
    </>
  );
};

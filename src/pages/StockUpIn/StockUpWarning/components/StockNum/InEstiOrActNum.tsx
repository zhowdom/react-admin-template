import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { ProTable } from '@ant-design/pro-components';
import { Table, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
// @ts-ignore
import accounting from 'accounting';
import {
  getOnwayNumDetail,
  getPlanedSendNumDetail,
} from '@/services/pages/stockUpIn/stockUpWarning';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { add, sub } from '@/utils/pubConfirm';

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
        width: 90,
      },
      {
        title: '平台',
        dataIndex: 'platform_name',
        align: 'left',
        ellipsis: true,
        hideInSearch: true,
        width: 90,
      },
      {
        title: '店铺',
        dataIndex: 'shop_name',
        align: 'left',
        ellipsis: true,
        hideInSearch: true,
        width: 110,
      },
      {
        title: '货件号',
        dataIndex: 'shipment_id',
        align: 'left',
        width: 90,
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
        width: 110,
      },
      {
        title: '要求物流入仓时间',
        dataIndex: 'required_warehousing_time',
        align: 'left',
        hideInSearch: true,
        width: 100,
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
        width: 100,
      },
      {
        title: '预留数量',
        dataIndex: 'in_on_way_num',
        align: 'left',
        hideInSearch: true,
        valueType: 'digit',
        width: 100,
        tooltip: (
          <>
            一，预计预留数量和预计库存逻辑：
            <br />
            1，系统没有实际入仓时间时，判断预计入仓时间，没有预计入仓时间，判断要求物流入仓时间；
            <br />
            2，根据判断的要求物流入仓时间、预计或实际入仓时间，在这三个时间之前统计为在途，15天内（含）算作预留数量，15天后算作预计库存；
            <br />
            <br />
            二，Amazon后台的可售数量（跨境备货管理库存报表取值）；
            <br />
            <br />
            1，本周库存数量 = Amazon后台的可售数量 + 预计库存数量（不含实际入仓的）；
            <br />
            备注：因为是每日更新数据，例如周一的时候，周四到了上个入库单的预计入库时间或实际入库时间到了15天后这个时间节点，也统计到本周；
            <br />
            2，未来周预计库存，根据要求物流入仓时间、预计入仓时间、实际入仓时间判断，15天内算预留数量，15天后算预计库存；
            <br />
            3，历史前三周的库存取真实库存（取实际当周第一天实际库存数量，每周周一00:00的数量）；
            <br />
            <br />
            四，
            <br />
            跨境平台入库单统计入库单新建、已同步（待放舱）、已放舱、已通知发货、已撤回、撤回中、国内在途、国内已入库、跨境在途、平台入库中（部分）十个状态的发货数量；{' '}
            <br />
            <br />
            五，注意：
            <br />
            1，亚马逊预留时间为15天：当前时间与要求物流入仓时间、预计入仓时间、实际入仓时间对比，15天内为预留数量，15天后为预计库存；
            <br />
            2，沃尔玛预留时间为7天：当前时间与要求物流入仓时间、预计入仓时间、实际入仓时间对比，7天内为预留数量，7天后为预计库存；
          </>
        ),
      },
    ],
    [dicList],
  );
  const [obj, setObj] = useState<any>({});
  const [obj1, setObj1] = useState<any>({});
  const getPlanned = async () => {
    const res = await getPlanedSendNumDetail({
      ...data.params,
      identification: 'YJ',
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
        toolBarRender={() => [<strong key="time">{`${data?.params?.timeRangeC}`}</strong>]}
        headerTitle={
          <span className={'text-red'}>
           说明：根据要求平台入库时间、预计入仓时间、实际入仓时间预测统计跨境平台入库单预计库存，通过接口获取平台实际库存数量。
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
          const res = await getOnwayNumDetail({
            ...params,
            ...data.params,
            identification: 'YJ',
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
        scroll={{ x: 1000, y: 'calc(75vh - 310px)' }}
        sticky={{ offsetHeader: 0 }}
        showSorterTooltip={false}
        cardProps={{ bodyStyle: { padding: 0 } }}
      />
      <div className="bottom-info">
        <span>
          库存数量（汇总）
          <Tooltip
            placement="top"
            title={
              <>
                <div>
                  未来周显示预计当周库存结余，公式：剩余库存=上周期末库存+当周入库数量-当周销售量
                </div>
                <div>1，上周期末库存取上一周计算的剩余库存，已经减去了上一周销售量的库存；</div>
                <div>2，当周入库数量，即未来周预计入库库存数量；</div>
                <div>3，当周销售量，取周销量预测的销量；</div>
              </>
            }
          >
            <QuestionCircleOutlined style={{ position: 'absolute', left: '114px' }} />
          </Tooltip>
          <span style={{ marginLeft: '8px' }}>= 上周期末库存</span>
          <span className={'text-red'}>{data?.preNum ?? 0}</span>
        </span>
        <span>
        &nbsp;+&nbsp;已计划未建入库单预计库存数量
          <span className={'text-red'}>{obj1?.delivery_plan_no_order_num ?? 0}</span>
        </span>
        <span>
        &nbsp;+&nbsp;跨境平台入库单预计库存数量
          <span className={'text-red'}>{obj?.in_on_way_num ?? 0}</span>
        </span>
        <span>
        &nbsp;-&nbsp;当周销量
          <span className={'text-red'}>{data?.weekNum ?? 0}</span>
        </span>
        <span>
        &nbsp;=&nbsp;
          <span className={'text-red'}>
            {sub(
              add(
                add(data?.preNum ?? 0, obj1?.delivery_plan_no_order_num ?? 0),
                obj?.in_on_way_num ?? 0,
              ),
              data?.weekNum ?? 0,
            )}
          </span>
        </span>
      </div>
    </>
  );
};

import {
  getOnwayNumDetail,
  getPlanedSendNumDetail,
} from '@/services/pages/stockUpIn/stockUpWarning';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Table, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { add, sub } from '@/utils/pubConfirm';

export default (props: any) => {
  const { dicList, data } = props;
  const [obj, setObj] = useState<any>({});
  const [obj1, setObj1] = useState<any>({});
  const getInT = async () => {
    const res = await getOnwayNumDetail({
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
    getInT();
  }, []);
  const columns: any = useMemo(
    () => [
      {
        title: '商品名称',
        dataIndex: 'goods_sku_name',
        hideInSearch: true,
        align: 'left',
      },
      {
        title: '店铺SKU',
        dataIndex: 'shop_sku_code',
        align: 'left',
        hideInSearch: true,
        width: 120,
      },
      {
        title: '发货计划编号',
        dataIndex: 'delivery_plan_no',
        align: 'left',
        order: 9,
        width: 130,
        render: (_: any, record: any) => record?.plan_no ?? '-',
      },
      {
        title: '发货计划状态',
        dataIndex: 'approval_status',
        align: 'left',
        valueEnum: dicList?.DELIVERY_PLAN_STATUS || {},
        order: 1,
        hideInSearch: true,
        width: 130,
      },
      {
        title: '要求物流入仓时间',
        dataIndex: 'warehousing_time',
        align: 'left',
        hideInSearch: true,
        width: 130,
      },
      {
        title: '计划发货数量(总)',
        dataIndex: 'num',
        align: 'left',
        width: 120,
        hideInSearch: true,
        valueType: 'digit',
      },
      {
        title: '未建入库单数量',
        dataIndex: 'delivery_plan_no_order_num',
        align: 'left',
        hideInSearch: true,
        width: 120,
        valueType: 'digit',
      },
      {
        title: '已建入库单数量',
        dataIndex: 'order_rel_num',
        align: 'left',
        hideInSearch: true,
        width: 120,
        valueType: 'digit',
        tooltip:
          '已计划未建入库单预计预留数量，统计跨境发货计划审核通过状态、部分已建入库单状态两个状态的未建入库单数量，根据要求物流入仓时间判断，预留时间（亚马逊15天、沃尔玛7天）之内为预留数量，超过预留时间为预计库存。',
      },
    ],
    [dicList],
  );
  return (
    <>
      <ProTable
        toolBarRender={() => [<strong key="time">{`${data?.params?.timeRangeC}`}</strong>]}
        rowKey={(record: any) => record.purchase_order_id}
        bordered
        headerTitle={
          <span className={'text-red'}>
          说明：按要求平台入库时间，入库当周统计并显示为预留数量，预留时间（亚马逊15天、沃尔玛7天）之后为预计库存。
          </span>
        }
        columns={columns}
        options={false}
        pagination={false}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        search={{ labelWidth: 'auto', defaultCollapsed: false, span: 6 }}
        request={async (params) => {
          const res = await getPlanedSendNumDetail({
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
            data: res?.data?.deliveryPlanList || [],
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
          <span className={'text-red'}>{obj?.delivery_plan_no_order_num ?? 0}</span>
        </span>
        <span>
        &nbsp;+&nbsp;跨境平台入库单预计库存数量
          <span className={'text-red'}>{obj1?.in_on_way_num ?? 0}</span>
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
                add(data?.preNum ?? 0, obj?.delivery_plan_no_order_num ?? 0),
                obj1?.in_on_way_num ?? 0,
              ),
              data?.weekNum ?? 0,
            )}
          </span>
        </span>
      </div>
    </>
  );
};

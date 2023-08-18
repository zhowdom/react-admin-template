import InfoItem from './InfoItem';
import './index.less';
import ModalCalDetail from './ModalCalDetail';
import AdviceShipMentDetail from './AdviceShipMentDetail';
import { pubFilter } from '@/utils/pubConfig';
import { history } from 'umi';
import moment from 'moment';

export default (props: any) => {
  const detail: any = props?.data;
  return props?.type == 'info' ? (
    <div className="suggest-info">
      <InfoItem title="备货周期">{detail?.cycle_time}</InfoItem>
      <InfoItem title="备货日期">{detail?.create_time}</InfoItem>
      <InfoItem title="平台">{detail?.platform_code}</InfoItem>
      <InfoItem title="店铺">{detail?.shop_name}</InfoItem>
      <InfoItem title="产品编码">{detail?.goods_code}</InfoItem>
      <InfoItem title="产品名称">{detail?.goods_name}</InfoItem>
      <InfoItem title="款式编码">{detail?.sku_code}</InfoItem>
      <InfoItem title="款式名称">{detail?.sku_name}</InfoItem>
      <InfoItem title="产品线">
        {detail?.business_scope}-{detail?.category_name}
      </InfoItem>
      {detail?.version == 1 ? (
        <>
          <InfoItem title="销售状态">{pubFilter(props?.dicList.LINK_MANAGEMENT_SALES_STATUS, detail?.sales_status)}</InfoItem>
          <InfoItem title="商品尺寸">{detail?.defaultApplyShipment?.belong_classify_name}</InfoItem>
        </>
      ) : ''}
      <InfoItem title="参考库容周期">
        <a
          onClick={() =>
            history.push('/stock-up-in/storageCapacity/IPIList', {
              cycle_time:
                detail?.cycle_time &&
                moment(detail?.cycle_time, 'YYYY-WW周').add(-1, 'week').format('YYYY-WW周'),
              shop_id: detail?.shop_id,
            })
          }
        >
          {detail?.cycle_time &&
            moment(detail?.cycle_time, 'YYYY-WW周').add(-1, 'week').format('YYYY-WW周')}
        </a>
      </InfoItem>
    </div>
  ) : (
    <div className="suggest-info suggest-info-num">
      <InfoItem title="采购计划待审批">
        <ModalCalDetail
          trigger={<a>{detail?.purchase_plan_pending}</a>}
          params={{
            id: detail?.id,
            cycle_time: detail?.cycle_time,
            field: 'purchase_plan_pending',
          }}
        />
      </InfoItem>
      <InfoItem title="发货计划待审批">
        <ModalCalDetail
          trigger={<a>{detail?.deliver_plan_pending}</a>}
          params={{ id: detail?.id, cycle_time: detail?.cycle_time, field: 'deliver_plan_pending' }}
        />
      </InfoItem>
      <InfoItem title="未下单/下单中数量">
        <ModalCalDetail
          trigger={
            <a>
              {(detail?.planned_not_purchase_po_num || 0) + (detail?.purchased_po_not_signed || 0)}
            </a>
          }
          params={{
            id: detail?.id,
            cycle_time: detail?.cycle_time,
            field: 'purchased_po_not_signed,planned_not_purchase_po_num',
          }}
        />
      </InfoItem>
      {detail?.version == 0 ? (
        <>
          <InfoItem title="未计划发货">
            <ModalCalDetail
              trigger={<a>{detail?.unplanned_shipment}</a>}
              params={{ id: detail?.id, cycle_time: detail?.cycle_time, field: 'unplanned_shipment' }}
            />
          </InfoItem>
          <InfoItem title="已计划发货">
            <ModalCalDetail
              trigger={<a>{detail?.planned_shipment}</a>}
              params={{ id: detail?.id, cycle_time: detail?.cycle_time, field: 'planned_shipment' }}
            />
          </InfoItem>
        </>
      ) : ''}
      {detail?.version == 1 ? (
        <>
          <InfoItem title="已计划发货(未选择供应商)">
            <ModalCalDetail
              trigger={<a>{detail?.planned_shipment_no_choosed_vendor}</a>}
              params={{ id: detail?.id, cycle_time: detail?.cycle_time, field: 'planned_shipment_no_choosed_vendor' }}
            />
          </InfoItem>
          <InfoItem title="已计划发货(已选择供应商)">
            <ModalCalDetail
              trigger={<a>{detail?.planned_shipment_choosed_vendor}</a>}
              params={{ id: detail?.id, cycle_time: detail?.cycle_time, field: 'planned_shipment_choosed_vendor' }}
            />
          </InfoItem>
          <InfoItem title="未建入库单数量">
            <ModalCalDetail
              trigger={<a>{detail?.no_generate_warehousing_order_num}</a>}
              params={{ id: detail?.id, cycle_time: detail?.cycle_time, field: 'no_generate_warehousing_order_num' }}
            />
          </InfoItem>
          <InfoItem title="未交货数量">
            <ModalCalDetail
              trigger={<a>{detail?.undelivered_num}</a>}
              params={{ id: detail?.id, cycle_time: detail?.cycle_time, field: 'undelivered_num' }}
            />
          </InfoItem>
        </>
      ) : ''}

      <InfoItem title="国内在途数量">
        <ModalCalDetail
          trigger={<a>{detail?.cn_on_way_num}</a>}
          params={{ id: detail?.id, cycle_time: detail?.cycle_time, field: 'cn_on_way_num' }}
        />
      </InfoItem>
      <InfoItem title="跨境在途数量">
        <ModalCalDetail
          trigger={<a>{detail?.in_on_way_num}</a>}
          params={{ id: detail?.id, cycle_time: detail?.cycle_time, field: 'in_on_way_num' }}
        />
      </InfoItem>
      <InfoItem title="总库存">{detail?.inventory_num}</InfoItem>
      <InfoItem title="货件异常差异数量">
        <ModalCalDetail
          trigger={<a>{detail?.shipment_diff_num}</a>}
          params={{ id: detail?.id, cycle_time: detail?.cycle_time, field: 'shipment_diff_num' }}
        />
      </InfoItem>
      <InfoItem title="生产周期">{detail?.production_cycle}</InfoItem>
      <InfoItem title="安全库存天数">{detail?.safe_days}</InfoItem>
      <InfoItem title="装箱数量">{detail?.box_num}</InfoItem>
      {detail?.version == 1 ? (<InfoItem title="默认物流时效">
        <AdviceShipMentDetail
          trigger={(
            <a>{detail?.defaultApplyShipment?.logistics_time}</a>
          )}
          detail={detail}
        />
      </InfoItem>) : ''}
      <InfoItem title="年度增长率">
        {detail?.growth_rate || detail?.growth_rate == 0 ? `${detail?.growth_rate}%` : ''}
      </InfoItem>
    </div>
  );
};

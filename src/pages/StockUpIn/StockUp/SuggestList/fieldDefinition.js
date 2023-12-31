export default {
  purchase_plan_pending: {
    name: '采购计划待审批',
    definition: ['已经创建采购计划，但是审批未通过的采购数量；'],
    valueLogic: [
      '供应链：〖采购管理-->跨境采购计划〗统计【状态】=“新建/待审核”的记录，取【计划下单数量】字段值汇总；',
    ],
  },
  'purchased_po_not_signed,planned_not_purchase_po_num': {
    name: '未下单/下单中数量',
    definition: ['未下单/下单中数量 = 采购计划未下单数量 + 采购单未签约数量'],
    valueLogic: [
      '1、采购计划未下单数量：从〖跨境采购计划〗统计【状态】=“审核通过/部分已下单”的记录，取【未下单数量】字段值汇总；',
      '2、采购单未签约数量：从〖商品采购单〗中，统计【状态】=“新建/待审核/审核通过/审核不通过/待签约/撤回中/已撤回”的采购单，取值采购单明细中【下单数量】字段值汇总；',
    ],
  },
  planned_not_purchase_po_num: {
    name: '采购未下单数量',
    definition: ['已审批通过的采购计划，但未下采购单的数量；'],
    valueLogic: [
      '供应链：从〖采购管理-->跨境采购计划〗统计【状态】=“审核通过/部分已下单”的记录，取【未下单数量】字段值汇总；',
    ],
  },
  purchased_po_not_signed: {
    name: '采购下单中数量',
    definition: ['已创建采购单，但是未完成签约的数量；'],
    valueLogic: [
      '供应链：从〖采购管理-->商品采购单〗中，统计【状态】=“新建/待审核/审核通过/审核不通过/待签约/撤回中/已撤回”的采购单，取值采购单明细中【下单数量】字段值汇总 ',
      'ERP：从〖采购管理-->采购单管理〗中,统计【当前状态】=“新建/已提交待审批/已审核/待财务审核”的采购单，取值采购明细中的【采购数量】字段值汇总',
    ],
  },
  in_production_num: {
    name: '生产中数量',
    definition: ['已创建入库单，但供应商未发货的数量'],
    valueLogic: [
      '供应链：从〖采购管理-->商品采购单〗中，统计【状态】=“已签约”的采购单，取值采购单明细中【下单数量】字段值汇总，减去这部分采购单关联的入库单且【状态】=“国内在途/国内已入库/跨境在途/平台部分入库/平台入库异常/平台已入库”的记录的发货数量；',
      ' ERP：从〖采购管理-->采购单管理〗中,统计【当前状态】=“已批准/部分收货/全部收货”的采购单，取【采购数量】字段值汇总，减去这部分采购单关联的入库单且【状态】=“等待国内收货/国内已收货/已发往平台/已入库/收货差异”的记录的发货数量；',
    ],
  },
  deliver_plan_pending: {
    name: '发货计划待审批',
    definition: ['已创建发货计划，但是未审批通过的数量'],
    valueLogic: [
      '供应链：从〖采购管理-->跨境发货计划〗统计【状态】=“新建/待审核”的记录，取【计划发货数量】字段值汇总',
    ],
  },
  planned_not_created_shipment: {
    name: '发货未下单数量',
    definition: ['已审批通过的发货计划，但为创建入库单的数量'],
    valueLogic: [
      '供应链：从〖采购管理-->跨境发货计划〗统计【状态】=“审核通过/部分生成入库单”的记录，取【未建入库单数量】字段值汇总',
    ],
  },
  created_shipment_not_delivered: {
    name: '待发货数量',
    definition: ['已创建入库单，但供应商未发货的数量'],
    valueLogic: [
      '供应链：从〖出入库管理-->跨境平台入库单〗统计【状态】=“新建/已同步(待放舱)/已放舱/已通知发货”的记录，取【计划发货数量】字段值汇总 ',
      "ERP： 从〖库存管理-->入库管理〗统计【状态】='新建/待审核'的记录，取详情页中的【预计入库】字段值汇总",
    ],
  },
  unplanned_shipment: {
    name: '未计划发货',
    definition: ['未建入库单数量 - 已建入库单未关联采购单数量 -  已审批通过的发货计划未建入库单数量'],
    valueLogic: [
      '未建入库单数量：状态为“已签约/变更中”的采购单，取【未发货数量】字段值',
      '已建入库单但未关联采购单数量：状态为“新建” 且 为关联 入库单 的入库单，取【计划发货数量】',
      '已审批通过发货计划未建入库单数量：状态为“审批通过”的发货计划，取【未建入库单数量】（需要减去的部分，数据记录为负数）',
    ],
  },
  planned_shipment: {
    name: '已计划发货',
    definition: ['已计划发货数量'],
    valueLogic: [
      '1）入库单中：状态为“新建/已同步/已放舱/已通知/已撤回/撤回中”的入库单，取【计划发货数量】字段值',
      '2）发货计划：状态为“审批通过”的发货计划，取【未建入库单数量】',
      '3）【国内已入库】出现入库差异，且入库差异未处理，此时取差异数量（计划发货数量-计划）',
    ],
  },
  cn_on_way_num: {
    name: '国内在途数量',
    definition: ['国内在途数量 = 国内已发货数量 + 国内已入库数量'],
    valueLogic: [
      '1、国内已发货数量：从〖IN平台入库单〗统计【状态】=“国内在途”的入库单，取【计划发货数量】字段值汇总；',
      '2、国内已入库数量：从〖IN平台入库单〗统计【状态】=“国内已入库”的入库单，取【国内入库数量】字段值汇总；'
    ],
  },
  in_on_way_num: {
    name: '跨境在途数量',
    definition: ['跨境在途数量 = 跨境未入库数量 + 跨境入库未完成数量'],
    valueLogic: [
      '1、跨境未入库数量：已签约采购单下单数量：从〖IN平台入库单〗统计【状态】=“跨境在途库”的入库单，取【国内入库数量】字段值汇总；',
      '2、跨境入库未完成数量：采购单已扣减数量：从〖IN平台入库单〗统计【状态】=“平台入库异常”的入库单，取【国内入库数量-接收数量(平台仓)】字段值汇总；'
    ],
  },
  inventory_num: {
    name: '期末库存',
    definition: ['本周期末库存量 = 上周期末库存量 + 本周预计入库数量 + 本周预计入库数量(调整) - 本周PMC预测总销量'],
    valueLogic: [
      '1、第一周：在创建/重算备货建议时，根据【平台+SKU】维度获取前一天的期末库存；',
      '2、AmazonSC总库存 = 可售库存+预留数量 ；Walmart总库存 = 在库库存；（请注意：IN库存数据会定时更新，考虑到备货建议取值逻辑，如需查看前一天的期末库存，请前往查看IN库存趋势图！）'
    ],
  },
  turnover_days: {
    name: '期末结转',
    definition: ['本周期末周转天数 = 本周期末库存数量 / 下周PMC预测日均销量 = 本周期末库存数量 / （下周PMC预测总销量 / 7）'],
    valueLogic: [
      '1、下周【PMC预测总销量】已填写时使用【PMC预测总销量】，未填写时，使用【系统预测销量】；（一般出现在同一备货周期内，首次创建的备货建议的最后一周）',
      '2、日均销量小于0.5的按0计算，大于0.5的线上取整；',
      '3、期末库存周转天数取值：有库存有销量，按实际计算结果向下取整；有库存无销量的，结果统一为999；无库存的，无论是否有销量，结果都为0；'
    ],
  },
  shipment_diff_num: {
    name: '货件异常差异数量',
    definition:
      ['货件异常差异数量 = 入库单入库差异数量'],
    valueLogic: [
      "1、入库单入库差异数量：从〖UB平台入库单〗统计【状态】=“平台入库异常”的入库单，取【入库异常数量】大于0的数量汇总；",
    ],
  },
  backorder_num: {
    name: '到期未入平台库数量',
    definition: ['根据采购计划中的货好日期，截至上周周日，未完成发货的数量；'],
    valueLogic: [
      '供应链：从〖采购管理-->跨境发货计划〗统计【状态】=“签约”的单据，取【计划下单数量】字段值汇总，并扣除当前采购计划下的采购所关联入库单的计划发货数量（包含两部分：A、已建立入库单；B、对为建入口单的发货计划或未关联采购单的入库单，按先进先出原则进行分配的数量）',
    ],
  },
  advice_purchase_num: {
    name: '系统建议采购数量',
    definition: [
      '1、建议采购数量 = Sum(采购周期总销售量)-【Sum(采购计划待审批数量)+Sum(未下单/下单中数量)+Sum(未交货数量)+Sum(已计划发货数量(已选供应商))+Sum(国内在途数量)+Sum(跨境在途数量)+Sum(总库存)+预计入库数量(调整)】;',
      '2、采购周期 = 生产周期 + 物流周期 + 安全库存周期;',
      '3、物流周期 = 国内运输周期 + 跨境运输周期 + 上架周期;'
    ],
    valueLogic: [
      '1、建议采购数量为负数时，为积压，建议采购数量为正数时，为缺货；',
      '2、当出现取货时需要创建采购计划进行采购；',
      '3、当积压数量小于或等于一箱时需要创建采购计划进行采购；',
      '4、采购时，会进行有N周起订量约束；'
    ],
  },
  available_shipment_num: {
    name: '可发货数量',
    definition: ['可发货数量=Sum(采购计划待审批)+Sum(采购计划已审批.未下单/下单中)+Sum(采购单.未交货数量)-Sum(发货计划待审批)-Sum(发货计划已审批.未建入库单数量)-Sum(入库单.未选择供应商)'],
    valueLogic: [
      '1、第一周可发货数量：取【货好时间】在本周及之前的预计入库数量，第二周及之后发货数量：取【货好时间】在本周的预计入库数量；',
      '2、采购计划待审批：从〖IN采购计划〗统计【状态】=“新建/待审核”的记录，取【未下单数量】字段值汇总；',
      '3、采购计划已审批.未下单/下单中：从〖跨境采购计划〗统计【状态】=“审核通过/部分已下单”的记录，取【未下单数量】字段值汇总；',
      '4、采购单.未交货数量：从〖采购单〗统计【状态】=“已签约/变更中”的记录，取【下单数量-扣减数量】字段值汇总',
      '5、发货计划待审批：从〖IN发货计划〗统计【状态】=“新建/待审核”的记录，取【未建入库单数量】字段值汇总；',
      '6、发货计划已审批.未建入库单数量：从〖IN发货计划〗统计【状态】=“审核通过/部分已下单”的记录，取【未建入库单数量】字段值汇总；',
      '7、入库单.未选择供应商：从〖IN平台入库单〗统计【状态】=“新建”且未未选择供应商的记录，取【计划发货数量】字段值汇总；',
    ],
  },
  advice_shipment_num: {
    name: '系统建议发货数量',
    definition: [
      '1、建议发货数量 = Sum(发货周期总销售量)-【Sum(发货计划未审批数量)+Sum(未建入库单数量)+Sum(已计划发货数量(未选供应商))+Sum(已计划发货数量(已选供应商))+Sum(国内在途数量)+Sum(跨境在途数量)+Sum(总库存)+预计入库数量(调整)】',
      '2、发货周期 = 物流周期 + 安全库存周期 ',
      '3、物流周期 = 国内运输周期 + 跨境运输周期 + 上架周期'
    ],
    valueLogic: [
      '1、建议发货数量为负数时，为积压，建议采购数量为正数时，为缺货；',
      '2、当出现取货时需要创建发货计划补货；',
      '3、当积压数量小于或等于一箱时需要创建发货计划补货；',
      '4、发货时，会进行有N周起订量约束；'
    ],
  },
  expect_instock_num: {
    name: '预计入库数量',
    definition: ['可发货数量=未建入库单数量 + 国内在途数量 + 跨境在途数量'],
    valueLogic: [
      '1、第一周预计入库数量：取【预计入仓时间】在本周及之前的预计入库数量，第二周及之后预计入库数量：取【预计入仓时间】在本周的预计入库数量；',
      '2、发货计划已审批&未创建入库单的发货计划：【要求物流入仓时间】为当周的计划，取【未建入库单数量】字段值汇总；',
      '3、发货计划已审批&已创建入库单的的入库单：【预计入仓时间】为当周的入库单，',
      '1)新建、待放舱、已放舱、已通知发货、国内在途、撤回中、已撤回：取【发货数量】字段值汇总：',
      '2)国内已入库、跨境在途：取【国内入库数量】字段值汇总：',
      '3)平台入库中：取【国内入库数量-入库中数量】大于0部分汇总',
    ],
  },
  expired_not_shipped: {
    name: '到期未建发货计划数量',
    definition: ['按采购计划在本周之前需要进行发货，但是认为建立发货计划的数量'],
    valueLogic: [
      '从〖采购管理-->跨境发货计划〗中取货好时间为本周之前，仍未建立发货计划的数量（入库单已关联入库单的则实际计算，为关联采购单的按先进先出原则进行预扣）',
    ],
  },
  planned_shipment_no_choosed_vendor: {
    name: '已计划发货(未选择供应商)',
    definition: ['已计划发货(未选择供应商) = 未选择供应商的入库单数量'],
    valueLogic: [
      '从〖IN平台入库单〗统计【状态】=“新建”且未选择供应商的入库单，取【计划发货数量】字段值汇总',
    ],
  },
  planned_shipment_choosed_vendor: {
    name: '已计划发货(已选择供应商)',
    definition: ['已计划发货(未选择供应商) = 已选择供应商的入库单数量 + 未发货的入库单数量'],
    valueLogic: [
      '1、已选择供应商的入库单数量：从〖IN平台入库单〗统计【状态】=“新建”且已选择供应商的入库单，取【计划发货数量】字段值汇总；',
      '2、未发货的入库单数量：从〖IN平台入库单〗统计【状态】=“已同步/已放舱/已通知发货/撤回中/已撤回”，取【计划发货数量】字段值汇总；'
    ],
  },
  no_generate_warehousing_order_num: {
    name: '未建入库单数量',
    definition: ['未建入库单数量 = 发货计划未建入库单数量'],
    valueLogic: [
      '从〖IN发货计划〗中统计【状态】=“审核通过/不分生成入库单”的发货计划，取【未建入库单数量】字段值汇总；'
    ],
  },
  undelivered_num: {
    name: '未交货数量',
    definition: ['未交货数量 = 已签约采购单下单数量 - 采购单已扣减数量'],
    valueLogic: [
      '1、已签约采购单下单数量：从〖采购单〗中取状态为“已签约/变更中”的采购单，取【下单数量】字段值汇总；',
      '2、采购单已扣减数量：从〖IN平台入库单〗中按采购单号分别取【扣减数量】字段值汇总；'
    ],
  },

};

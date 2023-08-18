import { pubMsg, pubAlert } from '@/utils/pubConfig';
import { history } from 'umi';

// 生成单个采购单 国内
export const addOrderOne = async (ids?: any, selectDataRows?: any) => {
  if (!ids.length) return pubMsg('请选择要操作的数据！');
  const allStatus = [...new Set(selectDataRows.map((v: any) => v.status))].join(',');
  const allLife_cycle = [...new Set(selectDataRows.map((v: any) => v.life_cycle))].join(',');
  console.log(allLife_cycle);
  if (
    allStatus.search('1') > -1 ||
    allStatus.search('2') > -1 ||
    allStatus.search('3') > -1 ||
    allStatus.search('6') > -1 ||
    allStatus.search('7') > -1
  )
    return pubAlert('只有审批通过并且未下单完的才可以生成采购单,请重新选择采购计划！');
  if (allLife_cycle.search('4') > -1)
    return pubAlert('款式生命周期为 已下架 不能生成采购单,请重新选择采购计划！');
  history.push(`/purchase-manage/plan-addOne?planIds=${ids.join(',')}`);
};

// 生成单个采购单 跨境
export const addOrderOne_IN = async (ids?: any, selectDataRows?: any) => {
  if (!ids.length) return pubMsg('请选择要操作的数据！');
  const allStatus = [...new Set(selectDataRows.map((v: any) => v.status))].join(',');
  const allSales_status = [...new Set(selectDataRows.map((v: any) => v.sales_status))].join(',');
  if (
    allStatus.search('1') > -1 ||
    allStatus.search('2') > -1 ||
    allStatus.search('3') > -1 ||
    allStatus.search('6') > -1 ||
    allStatus.search('7') > -1
  )
    return pubAlert('只有审批通过并且未下单完的才可以生成采购单,请重新选择采购计划！');
  if (allSales_status.search('3') > -1 || allSales_status.search('4') > -1)
    return pubAlert('款式销售状态为 清仓期或已下架 不能生成采购单,请重新选择采购计划！');
  history.push(`/purchase-manage/plan-addOne?planIds=${ids.join(',')}`);
};

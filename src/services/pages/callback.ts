import { request } from 'umi';

const baseUrl = '/order-service';

// 抖音列表
export async function douyin(data: any) {
  return request(`${baseUrl}/douyin/listPage`, {
    method: 'POST',
    data,
  });
}
// 奇门列表
export async function qimen(data: any) {
  return request(`${baseUrl}/qimen/listPage`, {
    method: 'POST',
    data,
  });
}
// 抖音补偿
export async function douyinCallBackCompensate(data: any) {
  return request(`${baseUrl}/douyin/douyinCallBackCompensate`, {
    method: 'POST',
    data,
  });
}
// 奇门补偿
export async function qimenCallBackCompensate(data: any) {
  return request(`${baseUrl}/qimen/qimenCallBackCompensate`, {
    method: 'POST',
    data,
  });
}

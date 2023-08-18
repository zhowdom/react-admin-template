import { request } from 'umi';
const baseUrl = '/report-service';
export async function getList(data: any) {
  return request(`${baseUrl}/inventoryChart/queryData`, {
    method: 'POST',
    data,
  });
}

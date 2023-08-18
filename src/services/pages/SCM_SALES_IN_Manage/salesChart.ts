import { request } from 'umi';
const baseUrl = '/report-service';
export async function getList(data: any) {
  return request(`${baseUrl}/saleChart/queryData`, {
    method: 'POST',
    data,
  });
}

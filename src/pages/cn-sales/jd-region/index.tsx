import React, { useRef } from 'react';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { salesRegionConfigList } from '@/services/pages/cn-sales';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { flatData } from '@/utils/filter';

const Page: React.FC<any> = () => {
  const actionRef: any = useRef<ActionType>();

  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '平台',
      dataIndex: 'platformName',
      width: 220,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '区域',
      dataIndex: 'region',
      width: 60,
      sorter: (a: any, b: any) => a.regionName.localeCompare(b.regionName),
      render: (_: any, record: any) => record?.regionName ?? '-',
    },
    {
      title: '城市',
      dataIndex: 'regionCity',
      width: 120,
      sorter: (a: any, b: any) => a.regionCity.localeCompare(b.regionCity),
    },
    {
      title: '省（自治区）',
      dataIndex: 'province',
    },
    {
      title: '市（盟）',
      dataIndex: 'city',
    },
  ];
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable
        bordered
        columns={columns}
        actionRef={actionRef}
        options={false}
        pagination={false}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        search={false}
        style={{marginBottom: '20px'}}
        cardProps={{ style: { padding: '10px 20px 30px' }, bodyStyle: { padding: 0 } }}
        request={async () => {
          const res = await salesRegionConfigList();
          if (res?.code != pubConfig.sCodeOrder) {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }

          const obj = res.data.reduce((pre: any, cur: any) => {
            if (pre[cur.platformName]) {
              pre[cur.platformName].push(cur);
            } else {
              pre[cur.platformName] = [cur];
            }
            return pre;
          }, {});
          console.log(obj);
          const data = [];
          for (const key in obj) {
            const obj1 = {
              platformName: key,
              details: obj[key],
            };
            data.push(obj1);
          }
          const dataFlat = flatData(data, 'details');
          return {
            success: true,
            data: dataFlat,
          };
        }}
        rowKey={(record: any) => record?.id}
        headerTitle={'CN销量区域归属配置'}
        scroll={{ x: 1200 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        showSorterTooltip={false}
      />
    </PageContainer>
  );
};

export default Page;

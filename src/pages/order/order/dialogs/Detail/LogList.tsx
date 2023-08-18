import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { listPageOrderTrackRecord } from '@/services/pages/order';
import './index.less';
import { pubMsg } from '@/utils/pubConfig';
import { useMemo } from 'react';

const Component: React.FC<{
  orderId: any;
  exceptions: any[];
  timeStamp?: any;
}> = ({ orderId, exceptions = [], timeStamp }) => {
  const optionsTrackType = useMemo(() => {
    return exceptions.concat([
      {
        label: '系统',
        value: 'sys',
      },
      {
        label: '正常',
        value: 'normal',
      },
    ]);
  }, [exceptions]);
  const columns: ProColumns<any>[] = [
    {
      title: '记录类型',
      dataIndex: 'trackType',
      align: 'center',
      width: 120,
      valueType: 'select',
      fieldProps: {
        showSearch: true,
        options: optionsTrackType,
      },
    },
    {
      title: '记录时间',
      dataIndex: 'createTime',
      valueType: 'dateRange',
      search: {
        transform: (value) => ({
          createTimeStart: value[0] + ' 00:00:00',
          createTimeEnd: value[1] + ' 23:59:59',
        }),
      },
      render: (_, record) => record.createTime,
      width: 86,
      align: 'center',
    },
    {
      title: '操作人',
      dataIndex: 'createName',
      align: 'center',
      width: 100,
    },
    {
      title: '操作记录',
      dataIndex: 'trackRecord',
    },
  ];
  return (
    <>
      <ProTable
        bordered
        cardProps={{ bodyStyle: { padding: 0 } }}
        options={false}
        size={'small'}
        columns={columns}
        rowKey={'id'}
        search={{
          className: 'light-search-form',
        }}
        params={{ orderId, timeStamp }}
        request={async (params: any) => {
          const formData = {
            ...params,
            pageIndex: params.current,
          };
          const res = await listPageOrderTrackRecord(formData);
          if (res?.code != '0') {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          return {
            success: true,
            data: res?.data?.list || [],
            total: res?.data?.total || 0,
          };
        }}
        pagination={{
          defaultPageSize: 10,
        }}
      />
    </>
  );
};
export default Component;

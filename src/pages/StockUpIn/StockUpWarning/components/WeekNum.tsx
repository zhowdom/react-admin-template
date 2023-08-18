import { Modal, Statistic, Tooltip } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import PubWeekRender from '@/components/PubWeekRender';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { getWeekNumDetails } from '@/services/pages/stockUpIn/stockUpWarning';

const DetailTransitNumList: React.FC<{
  open: boolean;
  openSet: any;
  data: any;
}> = ({ data, open = false, openSet }) => {
  const types = [
    {
      name: 'PMC预测销量',
      key: 'sell_forecast_artificial',
      tooltip: (
        <>
          PMC预测销量：
          <br /> 1，历史前三周的，保留历史预测记录；
          <br /> 2，当前周和未来周，取备货建议里面实时的；
        </>
      ),
    },
    {
      name: 'PMC预测活动销量',
      key: 'sell_forecast_activity',
      tooltip: (
        <>
          PMC预测活动销量
          <br />
          1，历史前三周的，保留历史预测记录；
          <br />
          2，当前周和未来周，取备货建议里面实时的；
        </>
      ),
    },
    {
      name: '真实周销量（实时）',
      key: 'actual_sales',
      tooltip: '统计历史周销量',
    },
  ];
  const [tableData, tableDataSet] = useState<any>([]);
  const [indexC,indexCSet]= useState<any>();
  // 数据转换
  const getNewData = (key: any, dataC: any) => {
    const newData: any = {};
    dataC?.forEach((element: any,i: number) => {
      newData[`${element.cycle_time}`] = element[key] || 0;
      if(data.cycleTimeC == element.cycle_time) {
        indexCSet(i)
      }
    });
    return newData;
  };

  const titles: any = [{ title: '时间', key: 'type' }, ...tableData];
  const columns: ProColumns<any>[] = [
    ...titles?.map((v: any, i: number) => {
      return {
        title: (
          <>
            {i == 0 ? (
              v.title
            ) : (
              <>
                <PubWeekRender
                  option={{
                    cycle_time: v.cycle_time,
                    begin: v.cycle_time_begin,
                    end: v.cycle_time_end,
                    color: true,
                  }}
                />
              </>
            )}
          </>
        ),
        dataIndex: i == 0 ? v.name : v.cycle_time,
        align: 'center',
        hideInSearch: true,
        width: i == 0 ? 150 : 110,
        valueType: 'digit',
        onHeaderCell: () => {
          return {
            className: data.cycleTimeC == v.cycle_time ? 'title-bg-blue' : '',
          };
        },
        fixed: i == 0 ? 'left' : undefined,
        render: (_: any, record: any) => {
          return i == 0 ? (
            <>
              {record.type}
              <Tooltip placement="top" title={record.tooltip}>
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </>
          ) : (
            <Statistic
              value={record.type == '真实周销量（实时）' && i > indexC+1 ? '-' : record[v.cycle_time]}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
            />
          );
        },
      };
    }),
  ];
  return (
    <>
      <Modal
        width={1200}
        title={'周销量'}
        footer={null}
        open={open}
        maskClosable={false}
        onCancel={() => {
          openSet(false);
        }}
        bodyStyle={{ paddingTop: 0 }}
        destroyOnClose
      >
        <ProTable
          style={{
            marginTop: '20px',
          }}
          rowKey={(record: any) => record?.id}
          bordered
          columns={columns}
          options={false}
          pagination={false}
          showHeader={tableData?.length ? true : false}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          search={false}
          request={async (params: any) => {
            const res = await getWeekNumDetails({
              ...params,
              ...data.params,
            });
            if (res?.code !== pubConfig.sCode) {
              pubMsg(res?.message);
              tableDataSet([]);
              return {
                success: false,
                data: [],
                total: 0,
              };
            }
            const newDetails = types.map((v: any) => {
              return {
                type: v.name,
                tooltip: v.tooltip,
                ...getNewData(v.key, res.data || []),
              };
            });
            tableDataSet(res.data || []);
            return {
              success: true,
              data: (res.data.length && newDetails) || [],
            };
          }}
          scroll={{ x: 800, y: 400 }}
          sticky={{ offsetHeader: 0 }}
          showSorterTooltip={false}
          cardProps={{ bodyStyle: { padding: 0 } }}
        />
      </Modal>
    </>
  );
};
export default DetailTransitNumList;

import { connect } from 'umi';
import { useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import type { ActionType } from '@ant-design/pro-table';
import { calculateProductValuationTypes } from '@/services/pages/productList';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { priceValue } from '@/utils/filter';

const Detail = (props: any) => {
  const ref = useRef<ActionType>();
  const { common } = props;
  const formRef = useRef<ProFormInstance>();

  // 表格配置
  const columns: any[] = [
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
    },
    {
      title: '站点',
      dataIndex: 'shop_site',
      align: 'center',
      valueEnum: common.dicList.SYS_PLATFORM_SHOP_SITE
    },
    {
      title: '尺寸类型',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '旺季派送费',
      dataIndex: 'lowSeasonFba',
      align: 'center',
      render: (_: any, record: any) => {
        return `${priceValue(record?.lowSeasonFba)}${pubFilter(common?.dicList?.SC_CURRENCY, record?.currency)}`;
      },
    },
    {
      title: '淡季派送费',
      dataIndex: 'peakSeasonFba',
      align: 'center',
      render: (_: any, record: any) => {
        return `${priceValue(record?.peakSeasonFba)}${pubFilter(common?.dicList?.SC_CURRENCY, record?.currency)}`;
      },
    },
  ];
  return (
    <ProTable<TableListItem>
      columns={columns}
      actionRef={ref}
      options={false}
      pagination={false}
      bordered
      formRef={formRef}
      request={async () => {
        const res = await calculateProductValuationTypes({
          goods_sku_id: props?.data
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return {
            success: false,
            data: [],
            total: 0,
          };
        }
        const newD = res?.data.map((v: any) => {
          const lowSeasonFba = v?.lowSeasonFba?.fee;
          const peakSeasonFba = v?.peakSeasonFba?.fee;
          return {
            ...v,
            lowSeasonFba: lowSeasonFba?.dynamic_fee,
            peakSeasonFba: peakSeasonFba?.dynamic_fee,
          }
        })
        return {
          success: true,
          data: newD || [],
          total: 0,
        };
      }}
      rowKey="id"
      search={false}
      className="p-table-0"
      dateFormatter="string"
    />
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Detail);

import { connect } from 'umi';
import { Modal } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { unitCostLogPage } from '@/services/pages/products';
import { useState } from 'react';
// 库存成本日志
const LogCost: React.FC<{
  id: any;
  triggerText: string | number;
}> = ({ id, triggerText }) => {
  const [open, openSet] = useState(false);
  // 表格配置
  const columns: ProColumns<any>[] = [
    {
      title: 'No',
      dataIndex: 'index',
      valueType: 'index',
      width: 60,
      align: 'center',
    },
    {
      title: '入库单单号',
      dataIndex: 'warehouse_no',
    },
    {
      title: '采购单号',
      dataIndex: 'purchase_order_no',
    },
    {
      title: '签约日期',
      dataIndex: 'signing_time',
      align: 'center',
    },
    {
      title: '币种',
      dataIndex: 'currency',
      align: 'center',
    },
    {
      title: '原采购单价',
      dataIndex: 'price',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '汇率',
      dataIndex: 'exchange_rate',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 6,
      },
    },
    {
      title: '税率',
      dataIndex: 'excluding_rate',
      align: 'right',
      valueType: 'percent',
    },
    {
      title: '入库数量',
      dataIndex: 'warehousing_num',
      align: 'right',
    },
    {
      title: '不含税采购单价',
      tooltip: (
        <>
          指转换成人民币后的不含税采购单价，根据采购单结算币种进行如下处理：
          <br />
          USD：不含税采购单价 = 原采购单价 * 签约月汇率
          <br />
          CNY：不含税采购单价 = 原采购单价 / （1+税率）* 1.02
          <br />
        </>
      ),
      dataIndex: 'excluding_price',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 6,
      },
    },
    {
      title: '库存数量',
      dataIndex: 'stock_num',
      align: 'right',
    },
    {
      title: '原库存成本',
      dataIndex: 'old_unit_final_cost',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '新库存成本',
      tooltip:
        '计算公式：新库存成本 = (原库存成本*库存数量 + 不含税采购单价*入库数量）/（库存数量+入库数量）',
      dataIndex: 'new_unit_final_cost',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '计算时间',
      dataIndex: 'create_time',
      align: 'center',
    },
  ];
  return (
    <>
      <a onClick={() => openSet(true)}>{triggerText}</a>
      <Modal
        title={'库存成本计算日志'}
        width={1400}
        open={open}
        onCancel={() => openSet(false)}
        footer={null}
      >
        <ProTable
          rowKey="id"
          columns={columns}
          options={false}
          bordered
          request={async (params) => {
            const res = await unitCostLogPage({
              ...params,
              current_page: params?.current,
              page_size: params?.pageSize,
              goods_sku_id: id,
            });
            if (res?.code == pubConfig.sCode) {
              return {
                success: true,
                data: res.data?.records || [],
                total: res.data?.total || 0,
              };
            }
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }}
          search={false}
          className="p-table-0"
          dateFormatter="string"
          scroll={{ x: 1200 }}
        />
      </Modal>
    </>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(LogCost);

import { useMemo, useState } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Modal, Tabs, Table } from 'antd';
import { listInventoryInDetail } from '@/services/pages/SCM_Manage/storageValue';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
// @ts-ignore
import accounting from 'accounting';
// 弹框 - 库存价值报表计算明细
const ModalCalDetail: React.FC<{
  data: any;
  title?: any;
  trigger?: React.ReactNode;
  dicList?: any;
}> = ({ trigger, title, data }) => {
  const [open, openSet] = useState(false);
  const [activeKey, activeKeySet] = useState('CN');
  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        title: 'No.',
        valueType: 'index',
        align: 'center',
        width: 60,
      },
      {
        title: activeKey == 'INVENTORY' ? '平台' : '单据类型',
        dataIndex: activeKey == 'INVENTORY' ? 'platformCode' : 'orderType',
        width: 90,
      },
      {
        title: activeKey == 'INVENTORY' ? '店铺' : '单据编号',
        dataIndex: activeKey == 'INVENTORY' ? 'shopName' : 'orderNo',
        width: 110,
      },
      {
        title: '统计数量',
        dataIndex: 'num',
        width: 90,
        align: 'right',
      },
      {
        title: '统计金额',
        dataIndex: 'amount',
        hideInTable: activeKey == 'PLAN' || activeKey == 'INVENTORY',
        width: 90,
        align: 'right',
      },
      {
        title: '取值说明',
        dataIndex: 'remark',
        render: (text: any) =>
          text ? text.split('<br>').map((item: any) => <div key={item}>{item}</div>) : '-',
      },
      {
        title: '取值时间',
        dataIndex: 'createTime',
        renderText: () => data.createTime,
        width: 80,
        align: 'center',
      },
    ],
    [activeKey],
  );

  return (
    <>
      {<div onClick={() => openSet(true)}>{trigger || <a>{'查看'}</a>}</div>}
      <Modal
        title={title || `库存价值报表计算明细(${data?.shopSkuCode || ''})`}
        width={1200}
        footer={null}
        open={open}
        onCancel={() => openSet(false)}
        bodyStyle={{ paddingTop: 0 }}
      >
        <Tabs
          style={{ position: 'sticky', top: 0, zIndex: 1, background: '#fff' }}
          activeKey={activeKey}
          onChange={(val: any) => activeKeySet(val)}
          items={[
            { label: '待下单/签约数量', key: 'PLAN' },
            { label: '未计划发货', key: 'NO_PLAN' },
            { label: '已计划发货', key: 'PLANNED' },
            { label: '国内在途', key: 'CN' },
            { label: '跨境在途', key: 'IN' },
            { label: '库存', key: 'INVENTORY' },
          ]}
        />
        <ProTable
          key={activeKey}
          bordered
          rowKey={(record) => record?.orderType + record?.orderNo + record?.shopName + record?.num}
          dateFormatter="string"
          pagination={false}
          search={false}
          options={false}
          toolBarRender={false}
          params={{
            type: activeKey,
          }}
          request={async (params) => {
            const res = await listInventoryInDetail({ ...params, id: data?.id });
            if (res?.code == pubConfig.sCodeOrder) {
              return {
                data: res.data,
                success: true,
              };
            } else {
              pubMsg(res?.message);
              return {
                data: [],
                success: false,
              };
            }
          }}
          columns={columns}
          summary={(record: any) => {
            const sum = record.reduce(
              (result: any, current: any) => ({
                num: (Number(result.num) || 0) + (Number(current?.num) || 0),
                amount: (Number(result.amount) || 0) + (Number(current?.amount) || 0),
              }),
              { num: 0, amount: 0 },
            );
            return (
              <Table.Summary.Row style={{ fontWeight: 'bold' }}>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <div style={{ textAlign: 'right' }}>合计:</div>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <div style={{ textAlign: 'right' }}>{sum.num || '-'}</div>
                </Table.Summary.Cell>
                {activeKey == 'PLAN' || activeKey == 'INVENTORY' ? null : (
                  <Table.Summary.Cell index={4}>
                    <div style={{ textAlign: 'right' }}>
                      {accounting.toFixed(sum.amount, 2) || '-'}
                    </div>
                  </Table.Summary.Cell>
                )}
                <Table.Summary.Cell index={5}>{'-'}</Table.Summary.Cell>
                <Table.Summary.Cell index={6}>{'-'}</Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Modal>
    </>
  );
};

export default ModalCalDetail;

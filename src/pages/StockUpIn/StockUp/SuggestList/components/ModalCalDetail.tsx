import { useState, useEffect } from 'react';
import { Modal, Spin, Table } from 'antd';
import '../style.less';
import { findCalcDetail } from '@/services/pages/stockUpIn/stockUp/suggestList';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import filedDefinition from '../fieldDefinition';

// 弹框 - 数据明细
const ModalCalDetail: React.FC<{
  title?: any;
  trigger?: React.ReactNode;
  params: {
    id: any;
    cycle_time: string;
    field: string;
  };
}> = ({ trigger, params }) => {
  const [open, openSet] = useState(false);
  const [detail, detailSet] = useState<any>([]);
  const [loading, loadingSet] = useState(false);
  useEffect(() => {
    if (open && params && params.id) {
      const postData = { ...params };
      if (params.field == 'advice_purchase_num' || params.field == 'advice_shipment_num') {
        postData.field = [postData.field, 'sell_forecast_base'].toString();
      }
      loadingSet(true);
      findCalcDetail(postData)
        .then((res: any) => {
          if (res?.code == pubConfig.sCode) {
            detailSet(res.data);
            return;
          }
          pubMsg(res?.message);
        })
        .finally(() => {
          loadingSet(false);
        });
    }
  }, [open, params]);
  return (
    <>
      {<div style={{ cursor: 'pointer' }} onClick={() => openSet(true)}>{trigger || <a>{'查看'}</a>}</div>}
      <Modal
        title={`数据明细(${filedDefinition[params.field]?.name || ''})`}
        width={1400}
        footer={null}
        open={open}
        onCancel={() => openSet(false)}
        bodyStyle={{ paddingTop: 0 }}
        className={'fontSize12'}
        destroyOnClose
      >
        <Spin spinning={loading}>
          <div className={'item-container'}>
            <div className={'item'}>
              <div className={'item-title'}>计算公式</div>
              <div className={'item-detail'}>
                <ul>
                  {filedDefinition[params.field]
                    ? filedDefinition[params.field]?.definition?.map((item: any, i: any) => (
                      <li key={i}>{item}</li>
                    ))
                    : null}
                </ul>
              </div>
            </div>
            <div className={'item'}>
              <div className={'item-title'}>取值逻辑</div>
              <div className={'item-detail'}>
                <ul>
                  {filedDefinition[params.field]
                    ? filedDefinition[params.field]?.valueLogic?.map((item: any, i: any) => (
                      <li key={i}>{item}</li>
                    ))
                    : null}
                </ul>
              </div>
            </div>
            <div className={'item'}>
              <div className={'item-title'}>数据明细</div>
              <div className={'item-detail'} style={{ padding: 0 }}>
                <Table
                  style={{ width: '100%'}}
                  rowKey={'id'}
                  dataSource={detail}
                  size={'small'}
                  bordered
                  columns={[
                    {
                      title: '数据来源',
                      dataIndex: 'data_source',
                      align: 'center',
                      width: 80,
                    },
                    {
                      title: '单据类型',
                      dataIndex: 'data_type',
                      align: 'center',
                      width: 80,
                    },
                    {
                      title: '单据编号',
                      dataIndex: 'data_no',
                      width: 130,
                    },
                    {
                      title: '统计数量',
                      dataIndex: 'num',
                      align: 'right',
                      width: 70,
                    },
                    {
                      title: '取值说明',
                      dataIndex: 'calc_detail',
                      render: (text) =>
                        text
                          ? text.split('<br/>').map((item: any) => <div key={item}>{item}</div>)
                          : '-',
                    },
                    {
                      title: '取值时间',
                      dataIndex: 'create_time',
                      align: 'center',
                      width: 87,
                    },
                  ]}
                  pagination={false}
                  summary={(record: any) => {
                    const sum = record.reduce(
                      (result: any, current: any) => ({
                        num: Number(result.num) + Number(current?.num) || 0,
                      }),
                      { num: 0 },
                    );
                    return (
                      <Table.Summary fixed>
                        <Table.Summary.Row style={{ fontWeight: 'bold', textAlign: 'right' }}>
                          <Table.Summary.Cell index={0} colSpan={3}>
                            合计:
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={4}>{sum.num}</Table.Summary.Cell>
                          <Table.Summary.Cell index={5} colSpan={2}></Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default ModalCalDetail;

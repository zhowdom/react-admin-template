import { useState } from 'react';
import { Modal, Spin, Form, Table, Popover, Tag } from 'antd';
import { getApplyShipment } from '@/services/pages/stockUpIn/stockUp/suggestList';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { arraySum } from '@/utils/pubConfirm';
import { EditableProTable } from '@ant-design/pro-table';

// 弹框 - 数据明细
const ModalCalDetail: React.FC<{
  title?: any;
  trigger?: React.ReactNode;
  id?: string;
  back: any;
  readonly: any;
  row: any; // 小格子里的数据
}> = ({ trigger, id, back, readonly, row }) => {
  const [open, openSet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, dataSourceSet] = useState<any>([]);
  const [editableKeys, editableKeysSet] = useState<any>([]);
  const [total, totalSet] = useState<any>(0);
  const [editForm] = Form.useForm();
  const columns: any[] = [
    {
      title: '发货途径',
      dataIndex: 'delivery_route_name',
      align: 'center',
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      width: 90,
    },
    {
      title: '运输方式',
      dataIndex: 'shipping_method_name',
      align: 'left',
      width: 100,
      editable: false,
      render: (_: any, record: any) => (
        <div>{record.shipping_method_name}{record?.is_default ? (
          <Tag
            color={'blue'}
            style={{ marginLeft: 5 }}
          >
            默认
          </Tag>
        ) : ''}</div>
      )
    },
    {
      title: '物流周期(天)',
      dataIndex: 'logistics_time',
      align: 'center',
      width: 100,
      editable: false,
      render: (_: any, record: any) => (
        <Popover
          placement="top"
          content={
            <>
              国内运输周期：{record.transport_cycle_cn}天<br />
              跨境运输周期：{record.transport_cycle_in}天<br />
              上架周期：{record.shelves_cycle}天
            </>
          }
        >
          <div>{record.logistics_time}</div>
        </Popover>
      )

    },
    {
      title: (
        <>
          <div>申请数量</div>
          <div>{dataSource && dataSource[0]?.box_type_name}</div>
        </>
      ),
      dataIndex: 'apply_shipment_num',
      align: 'center',
      valueType: 'digit',
      width: 100,
      fieldProps: {
        precision: 0,
      },
      formItemProps: () => {
        return {
          rules: [
            {
              validator(a: any, value: any) {
                if (typeof value == 'number' && value < 0) {
                  return Promise.reject(new Error('申请数量, 请输入大于等于0的数值'));
                }
                if (value > 9999999) {
                  return Promise.reject(new Error(`输入内容不能超过9999999`));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
  ];

  // 关闭
  const modalCancel = () => {
    dataSourceSet([]);
    editableKeysSet([]);
    totalSet(0);
    openSet(false);
  };
  // 用接口得到列表的数据 只有待处理的时候用接口得数据
  const getTable = async () => {
    setLoading(true);
    const res = await getApplyShipment({ detail_id: id });
    setLoading(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const newD: any = [];
      let allNum: number = 0;
      res.data.forEach((v: any) => {
        const childrenNum = v.applyShipments.length;
        v.applyShipments.forEach((k: any, index: number) => {
          allNum += k.apply_shipment_num
          newD.push({
            ...k,
            rowSpan: !index ? childrenNum : 0,
            uuid: `${v.u_id}-${k.shipping_method}`
          })
        })
      })
      dataSourceSet(newD);
      totalSet(allNum);
      editableKeysSet(newD.map((v: any) => v.uuid));
    }
  };
  // 得到列表的数据 从详情里的小格子本身上拿
  const getRow = (data: any) => {
    const newD: any = [];
    data.forEach((v: any) => {
      const childrenNum = v.applyShipments.length;
      v.applyShipments.forEach((k: any, index: number) => {
        newD.push({
          ...k,
          rowSpan: !index ? childrenNum : 0,
          uuid: `${v.u_id}-${k.shipping_method}`
        })
      })
    })
    dataSourceSet(newD);
    editableKeysSet([]);
  };

  const modalOk = () => {
    if (!readonly) {
      Promise.all([editForm.validateFields()])
        .then(() => {
          back(dataSource)
          modalCancel()
        })
        .catch(() => {
          Modal.warning({
            title: '提示',
            content: '请检查表单信息正确性',
          });
        });
    } else {
      modalCancel()
    }
  };
  // 打开
  const modalOpen = () => {
    openSet(true);
    if (!readonly) {
      getTable();
    } else {
      getRow(row.applyShipments);
    }
    console.log(row)
  };
  return (
    <>
      {<div style={{ cursor: 'pointer' }} onClick={() => modalOpen()}>{trigger}</div>}
      <Modal
        title={`发货数量调整`}
        width={600}
        open={open}
        onOk={modalOk}
        onCancel={() => modalCancel()}
        bodyStyle={{ paddingTop: 0 }}
        className={'fontSize12'}
        destroyOnClose
      >
        <Spin spinning={loading}>
          <div style={{ marginTop: '15px' }}>
            <EditableProTable
              columns={columns}
              className="p-table-0 product-edit-skus-e"
              rowKey="uuid"
              value={dataSource}
              bordered
              size='small'
              recordCreatorProps={false}
              editable={{
                type: 'multiple',
                editableKeys,
                form: editForm,
                onValuesChange: (record, recordList) => {
                  dataSourceSet(recordList)
                  // console.log(recordList)
                  const allNum = recordList.map((v: any)=> v.apply_shipment_num)
                  totalSet(arraySum(allNum))
                },
              }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ fontWeight: 'bold' }}>
                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                      合计
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} colSpan={1} align="right">
                      {total}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default ModalCalDetail;

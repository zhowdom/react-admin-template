import StockOrderDetail_IN from '@/components/Reconciliation/StockOrderDetail_IN';
import { customColumnSet } from '@/services/base';
import { scrollByColumn } from '@/utils/filter';
import { pubMsg } from '@/utils/pubConfig';
import { pubGetColumnsState, pubRefreshColumnList } from '@/utils/pubConfirm';
import { SaveOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { EditableProTable } from '@ant-design/pro-table';
import { Button, Card, Col, Form, Popconfirm, Row, Tooltip } from 'antd';
import { useState } from 'react';
import { useAccess, useActivate, useModel } from 'umi';
import UpdateOrder from './UpdateOrder';

export default (props: any) => {
  const { formRef, pageName, dicList, readonly, id, shipping_method } = props;
  const access = useAccess();
  const [deleteIds, setDeleteIds] = useState<any>([]);
  const formItemLayout1 = {
    labelCol: { span: 0 },
    wrapperCol: { span: 24 },
  };
  useActivate(() => {
    setDeleteIds([]);
  });
  console.log(formRef?.current?.getFieldValue('logisticsOrderDetails'),'11222')
  // 移出
  const deleteAction = (row: any) => {
    const logisticsOrderDetails: any = formRef?.current?.getFieldValue('logisticsOrderDetails');
    const dataC =
      logisticsOrderDetails?.filter(
        (v: any) => v.warehousing_order_id != row.warehousing_order_id,
      ) || [];
    const deleteC =
      logisticsOrderDetails?.filter(
        (v: any) => v.warehousing_order_id == row.warehousing_order_id,
      ) || [];
    setDeleteIds((pre: any) => {
      return [...pre, deleteC?.[0]?.warehousing_order_id];
    });
    formRef?.current?.setFieldsValue({
      logisticsOrderDetails: dataC,
    });
  };

  // 列配置
  const columns: any = [
    {
      title: '入库单号',
      dataIndex: 'warehousing_order_no',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      render: (_: any, record: any) => {
        return (
          <StockOrderDetail_IN
            id={record?.warehousing_order_id}
            from="stock"
            dicList={dicList}
            access={access}
            title={<a key="detail">{record.warehousing_order_no}</a>}
          />
        );
      },
    },
    {
      title: '采购负责人',
      dataIndex: 'warehouse_create_name',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: 'Shipment ID',
      dataIndex: 'shipment_id',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: 'Reference ID',
      dataIndex: 'reference_id',
      align: 'center',
      hideInSearch: true,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '平台目的仓库',
      dataIndex: 'platform_target_warehouse',
      align: 'center',
      width: 90,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '中文品名',
      dataIndex: 'sku_name',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '英文品名',
      dataIndex: 'name_en',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: 'SKU',
      dataIndex: 'sku_code',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '数量',
      dataIndex: 'num1',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      render: (_: any, record: any) => {
        return (
          <span>
            {Array.isArray(record.warehousingOrderSpecifications1)
              ? record.warehousingOrderSpecifications1.reduce(
                  (previousValue: any, currentValue: any) =>
                    previousValue + currentValue.pics * currentValue.num,
                  0,
                )
              : record.warehousingOrderSpecifications1.pics *
                record.warehousingOrderSpecifications1.num}
          </span>
        );
      },
    },
    {
      title: '箱数',
      dataIndex: 'num2',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      render: (_: any, record: any) => {
        return (
          <span>
            {Array.isArray(record.warehousingOrderSpecifications1)
              ? record.warehousingOrderSpecifications1.reduce(
                  (previousValue: any, currentValue: any) => previousValue + currentValue.num,
                  0,
                )
              : record.warehousingOrderSpecifications1.num}
          </span>
        );
      },
    },
    {
      title: '长(cm)',
      dataIndex: 'length',
      align: 'center',
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      align: 'center',
    },
    {
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
    },
    {
      title: '单箱重量(kg)',
      dataIndex: 'unit_weight',
      align: 'center',
    },
    {
      title: (
        <>
          <div>总体积</div>
          <div>（m³）</div>
        </>
      ),
      dataIndex: 'total_volume',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: (
        <>
          <div>总重量</div>
          <div>（kg）</div>
        </>
      ),
      dataIndex: 'total_weight',
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: (
        <div>
          入库数量
          <Tooltip
            placement="top"
            title={() => (
              <span>
                货件closed状态，系统自动同步货件入库数量，入库单完成入库，状态变成已入库；
                <br />
                货件处于其他状态，系统不能判断是否已经入库完成，需要等货件变成closed状态才能更新入库数量；
                <br />
                如果确认已完全入库，可以手工入库；
              </span>
            )}
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
          <br />
          (平台仓)
        </div>
      ),
      dataIndex: 'warehousing_num',
      align: 'center',
      width: 120,
      hideInTable: !readonly,
    },
    {
      title: (
        <div>
          平台货件状态
          <Tooltip
            placement="top"
            title={() => (
              <span>
                亚马逊货件状态包括：
                <br />
                working
                <br />
                shipped
                <br />
                in-transit
                <br />
                delivered
                <br />
                checked-in
                <br />
                receiving
                <br />
                closed
                <br />
                cancelled
                <br />
                deleted
                <br />
                error
                <br />
                ready-to-ship
                <br />
                沃尔玛货件状态包括：
                <br />
                Pending Shipment Details
                <br />
                Awaiting Delivery
                <br />
                Receiving in Progress
                <br />
                Closed
                <br />
                Cancelled
                <br />
                入库中数量，还没有完结，数量会变动，数据参考用
              </span>
            )}
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
          <br />
          (入库中数量)
        </div>
      ),
      dataIndex: 'platform_received_num',
      align: 'center',
      width: 120,
      hideInTable: !readonly,
      render: (_: any, record: any) => {
        return record.platform_shipment_status ? (
          <div>
            {record.platform_shipment_status}
            <br />
            {record.platform_received_num ? (
              <span>
                (
                <i style={{ fontStyle: 'normal', color: '#ff0000' }}>
                  {record.platform_received_num}
                </i>
                )
              </span>
            ) : (
              '-'
            )}
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 80,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      hideInTable: readonly,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      render: (_: any, row: any) => (
        <Popconfirm
          key="delete"
          title="确定移出吗?"
          onConfirm={async () => deleteAction(row)}
          okText="确定"
          cancelText="取消"
        >
          <a>移出</a>
        </Popconfirm>
      ),
    },
  ];
  const defaultScrollX = 2800;
  const persistenceKey = window.location.pathname.replace(/\/$/, '');
  const { initialState, setInitialState } = useModel('@@initialState');
  const customColumnSetting = initialState?.currentUser?.customColumnSetting?.find(
    (item: any) => item.code == persistenceKey,
  );
  const [columnsState, columnsStateSet] = useState<any>(
    pubGetColumnsState(columns, customColumnSetting),
  );
  const [scrollX, scrollXSet] = useState<any>(scrollByColumn(columnsState) || defaultScrollX);
  const [loadingCustomColumn, loadingCustomColumnSet] = useState<any>(false);
  return (
    <Card title="货件信息" bordered={false}>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item
            {...formItemLayout1}
            label=""
            name="logisticsOrderDetails"
            rules={[{ required: true, message: '请新增货件信息' }]}
          >
            <EditableProTable
              formRef={formRef}
              bordered
              headerTitle={
                pageName != '详情' && (
                  <UpdateOrder
                    formRefP={formRef}
                    dicList={dicList}
                    id={id}
                    shipping_method={shipping_method}
                    setDeleteIds={setDeleteIds}
                    deleteIds={deleteIds}
                  />
                )
              }
              recordCreatorProps={false}
              rowKey="tempId"
              scroll={{ x: scrollX || defaultScrollX }}
              size="small"
              cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
              columnsState={{
                value: columnsState,
                onChange: (stateMap: any) => {
                  columnsStateSet(stateMap);
                  setTimeout(() => {
                    scrollXSet(scrollByColumn(stateMap) || defaultScrollX);
                  }, 500);
                },
              }}
              options={{
                setting: {
                  checkedReset: false,
                  extra: (
                    <>
                      <Button
                        size={'small'}
                        type={'primary'}
                        icon={<SaveOutlined />}
                        loading={loadingCustomColumn}
                        onClick={() => {
                          loadingCustomColumnSet(true);
                          customColumnSet({
                            id: customColumnSetting?.id || '',
                            code: persistenceKey,
                            json: JSON.stringify(columnsState),
                            isNotice: 'n',
                          })
                            .then((res) => {
                              if (res?.code == '0') pubMsg('保存成功!', 'success');
                              pubRefreshColumnList(initialState, setInitialState);
                            })
                            .finally(() => {
                              loadingCustomColumnSet(false);
                            });
                        }}
                      >
                        保存
                      </Button>
                    </>
                  ),
                },
              }}
              columns={columns}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

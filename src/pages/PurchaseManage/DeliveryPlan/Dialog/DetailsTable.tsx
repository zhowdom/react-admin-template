import { Button, Col, Form, message, Modal, Row, Space, Spin, Tooltip } from 'antd';
import { EditableProTable } from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { listByPlanId, createWarehousing } from '@/services/pages/deliveryPlan';
import { useRef, useState } from 'react';
import CustomText from './CustomText';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { add, divide } from '@/utils/pubConfirm';

export default (props: any) => {
  const { id, num, reload, approvalStatus, record } = props;
  const [dataSource, setDataSource] = useState<any>();
  const formRef = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const [editIds, setEditIds] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderList, setOrderList] = useState<any[]>([]);
  const [tK, setTk] = useState(1);
  const [leaveNum, setLeaveNum] = useState<any>();
  const [hasCreated, setHasCreated] = useState<boolean>(false);
  // 获取未分仓数量
  const getLeaveNum = (data: any) => {
    const leave =
      record.num -
      Number(record.generate_warehousing_order_num) -
      data.reduce((pre: any, cur: any) => {
        if (cur.shipment_quantity) {
          // eslint-disable-next-line no-param-reassign
          pre += Number(cur.shipment_quantity);
        }

        return pre;
      }, 0);
    setLeaveNum(leave);
  };
  // 获取明细数据
  const getDetailAction = async (ifIsAllCreate?: boolean) => {
    setLoading(true);
    const res = await listByPlanId({ id });
    if (res?.code != pubConfig.sCode) {
      setLoading(false);
      pubMsg(res?.message);
    }
    res.data = res.data.map((v: any) => ({
      ...v,
      numC: v.shipment_quantity
    }))
    formRef.current?.setFieldsValue({
      numDetails: res.data || [],
    });
    setDataSource(res.data || []);
    getLeaveNum(res.data);
    // 发货数量存在就可编辑本次发货数量
    setEditIds(res?.data?.flatMap((v: any) => (v.shipment_quantity > 0 ? [v.id] : [])));
    setLoading(false);
    if (ifIsAllCreate) {
      setTk(new Date().getTime());
    }
    if (ifIsAllCreate) {
      if (res?.data?.every((v: any) => v.warehousing_order_id)) {
        setVisible(false);
      }
    }
  };
  // 展示入库列表
  const showOrderList = (list: any) => {
    setOrderList(list);
    setIsModalVisible(true);
    getDetailAction(true);
    setHasCreated(true);
  };
  const modalClose = (isClose?: boolean) => {
    if (isClose) {
      setVisible(false);
    }
    setIsModalVisible(false);
  };

  // 保存数据后创建入库单
  const updateByIdActionA = (data: any) => {
    const hasNumC = data.filter((v: any) => v.numC);
    if (!hasNumC.length) {
      pubMsg('本次发货数量不能全为空！')
    } else {
      formRef?.current
        ?.validateFields()
        .then(async () => {
          setBtnLoading(true);
          const res = await createWarehousing(
            data.flatMap((v: any) => {
              return v.numC
                ? [
                  {
                    shipment_quantity: v.numC,
                    id: v.id,
                    plan_id: id,
                  },
                ]
                : [];
            }),
          );
          if (res?.code != pubConfig.sCode) {
            setBtnLoading(false);
            pubMsg(res?.message);
          } else {
            showOrderList(res?.data || []);
            setBtnLoading(false);
          }
        })
        .catch((e) => {
          console.log(e);
          setBtnLoading(false);
          message.warning('请检查表单正确性');
          editForm.validateFields();
        });
    }
  };
  // 计算补货后的周转天数
  const calcRTurnoverDays = (
    stock_quantity: number,
    transit_num: number,
    planned_shipment_num: number,
    shipment_quantity: number,
    reference_weekly_sales: number,
    effective_days: number,
  ) => {
    const total = add(
      add(add(stock_quantity ?? 0, transit_num ?? 0), planned_shipment_num ?? 0),
      shipment_quantity ?? 0,
    );
    const numC = divide(total, divide(reference_weekly_sales, effective_days));
    return reference_weekly_sales == 0 ? `${total}/0` : Math.floor(numC);
  };
  return (
    <>
      <ModalForm
        formRef={formRef}
        title={false}
        trigger={props.trigger}
        layout="horizontal"
        className="deliDetail"
        modalProps={{
          onCancel: () => hasCreated && reload(),
          destroyOnClose: true,
          maskClosable: false,
        }}
        visible={visible}
        onVisibleChange={(val: boolean) => {
          setVisible(val);
          if (!val) {
            setDataSource([]);
            setEditIds([]);
            setLoading(false);
            setBtnLoading(false);
          } else {
            getDetailAction();
            setHasCreated(false);
          }
        }}
        onFinish={async (values: any) => {
          return Promise.all([editForm.validateFields()])
            .then(() => {
              return updateByIdActionA(
                values.numDetails?.filter((k: any) => k.numC)?.map((v: any) => {
                  return {
                    ...v,
                    numC: v.numC || 0,
                    replenishment_urnover_days: !v.reference_weekly_sales
                      ? 0
                      : calcRTurnoverDays(
                        v.stock_quantity ?? 0,
                        v.transit_num ?? 0,
                        v.planned_shipment_num ?? 0,
                        v.shipment_quantity ?? 0,
                        v.reference_weekly_sales ?? 0,
                        v.effective_days ?? 0,
                      ),
                  };
                }),
              );
            })
            .catch(() => { });
        }}
        onFinishFailed={() => {
          editForm.validateFields();
          message.warning('请检查表单正确性');
          return true;
        }}
        width={1200}
        submitter={
          ['1', '2', '5'].includes(approvalStatus) || editIds?.length === 0
            ? false
            : {
              render: (data: any, doms: any) => (
                <Space>
                  <Button
                    loading={btnLoading}
                    type="primary"
                    key="save"
                    onClick={async () => {
                      data.form?.submit?.();
                    }}
                  >
                    批量创建入库单
                  </Button>
                  {doms[0]}
                </Space>
              ),
            }
        }
      >
        <div style={{ marginTop: '35px' }} className="mb10">
          <Space size={40} wrap>
            <Form.Item label="平台">{record?.platform_name ?? '-'}</Form.Item>
            <Form.Item label="店铺">{record?.shop_name ?? '-'}</Form.Item>
            <Form.Item label="商品名称">{record?.goods_sku_name ?? '-'}</Form.Item>
            <Form.Item label="SKU">{record?.stock_no ?? '-'}</Form.Item>
            <Form.Item label="商品条形码">{record?.bar_code ?? '-'}</Form.Item>
          </Space>
        </div>
        <Form.Item
          label=""
          name="numDetails"
          rules={[
            {
              validator: async (rule, value) => {
                if (
                  value?.filter(
                    (v: any) => v.shipment_quantity == null || v.shipment_quantity == undefined,
                  )?.length
                ) {
                  return Promise.reject(new Error('请输入发货数量（分仓）'));
                }
                const totalCur = value.reduce(
                  (pre: any, cur: { shipment_quantity: number; lock_quantity: number }) => {
                    // eslint-disable-next-line no-param-reassign
                    pre.shipment += cur.shipment_quantity;
                    pre.lock += cur.lock_quantity;
                    return pre;
                  },
                  {
                    shipment: 0,
                    lock: 0,
                  },
                );
                console.log(totalCur, 999);
                if (num - totalCur.lock < totalCur.shipment) {
                  return Promise.reject(new Error('数量之和必须小于该发货计划剩余未建入库单数量'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <>
            <EditableProTable
              loading={loading}
              className={'p-table-0'}
              value={dataSource}
              rowKey="id"
              key={tK}
              search={false}
              pagination={false}
              options={false}
              size="small"
              style={{ minWidth: '400px' }}
              recordCreatorProps={false}
              onChange={setDataSource}
              editable={{
                type: 'multiple',
                // editableKeys: true ? [] : editIds,
                editableKeys: editIds,
                actionRender: (row, config, defaultDoms) => {
                  return [defaultDoms.delete];
                },
                form: editForm,
                onValuesChange: (r, recordList) => {
                  getLeaveNum(recordList);
                  formRef.current?.setFieldsValue({
                    numDetails: recordList,
                  });
                  setDataSource(recordList);
                  setTimeout(() => {
                    formRef.current?.validateFields(['numDetails']);
                  }, 300);
                },
              }}
              bordered={true}
              columns={[
                {
                  title: (
                    <>
                      已计划发货数量
                      <br />
                      （不含正在分仓数)
                      <Tooltip
                        placement="top"
                        title={
                          <>
                            已计划未建入库单数量加上待发货数量（国内平台入库单新建、已撤回、撤回中四个状态），但不包含当前发货计划的计划数量
                          </>
                        }
                      >
                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                      </Tooltip>
                    </>
                  ),
                  align: 'center',
                  dataIndex: 'planned_shipment_num',
                  editable: false,
                },
                {
                  title: (
                    <>
                      在途数量
                      <br />
                      （PMC）
                      <Tooltip placement="top" title={<>在途数量（PMC）= 已同步和国内在途两种状态的发货数量</>}>
                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                      </Tooltip>
                    </>
                  ),
                  align: 'center',
                  dataIndex: 'transit_num',
                  editable: false,
                  width: 90,
                  render: (_: any, r: any) => r?.transit_num ?? 0,
                },
                {
                  title: (
                    <>
                      可售库存
                      <Tooltip placement="top" title={<>接口同步或者导入的平台实时库存数量</>}>
                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                      </Tooltip>
                    </>
                  ),
                  align: 'center',
                  dataIndex: 'stock_quantity',
                  editable: false,
                  width: 90,
                },

                {
                  title: (
                    <>
                      库存结存可用周转天数
                      <Tooltip
                        placement="top"
                        title={
                          <>
                            库存可用天数=在库库存/前7天平均日销量
                            <br />
                            周转天数遇到小数点向下取整
                          </>
                        }
                      >
                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                      </Tooltip>
                    </>
                  ),
                  dataIndex: 'turnover_days',
                  editable: false,
                  width: 90,
                  align: 'center',
                },
                {
                  title: (
                    <>
                      参考周销量
                      <Tooltip placement="top" title={<>前7天销量</>}>
                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                      </Tooltip>
                    </>
                  ),
                  align: 'center',
                  dataIndex: 'reference_weekly_sales',
                  editable: false,
                },

                {
                  title: (
                    <>
                      补货后的周转天数
                      <Tooltip
                        placement="top"
                        title={
                          <>
                            本次发货计划入库后的库存可用天数=本次发货计划入库后的库存数量/前7天平均日销量=（可售库存+在途数量+已计划发货数量+分仓补货后的库存）/前7天平均销量
                            <br />
                            周转天数遇到小数点向下取整
                          </>
                        }
                      >
                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                      </Tooltip>
                    </>
                  ),
                  align: 'center',
                  dataIndex: 'replenishment_urnover_days',
                  editable: false,
                  width: 90,
                  render: (_, r: any) => {
                    return calcRTurnoverDays(
                      r.stock_quantity ?? 0,
                      r.transit_num ?? 0,
                      r.planned_shipment_num ?? 0,
                      r.shipment_quantity ?? 0,
                      r.reference_weekly_sales ?? 0,
                      r.effective_days ?? 0,
                    );
                  },
                },
                {
                  title: (
                    <>
                      历史销售占比参考
                      <Tooltip
                        placement="top"
                        title={
                          <>
                            前7天各个区域的销量占比，公式：某区的销量占比=某区的销量
                            ➗全部区域销量之和
                          </>
                        }
                      >
                        <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                      </Tooltip>
                    </>
                  ),
                  align: 'center',
                  dataIndex: 'sales_proportion',
                  editable: false,
                  render: (_, r) => <span>{r.sales_proportion}%</span>,
                },
                {
                  title: '收货仓库区域',
                  align: 'center',
                  dataIndex: 'warehouse_area_name',
                  editable: false,
                  width: 90,
                },
                {
                  title: '发货数量（分仓）',
                  align: 'center',
                  dataIndex: 'shipment_quantity',
                  valueType: 'digit',
                  editable: false,
                  width: 120,
                },
                {
                  title: (
                    <>
                      已建入库单数量
                      <br />
                      (按分仓统计)
                    </>
                  ),
                  align: 'center',
                  dataIndex: 'lock_quantity',
                  editable: false,
                  width: 110,
                },
                {
                  title: '本次发货数量',
                  width: 120,
                  align: 'center',
                  hideInTable: ['1', '2', '5'].includes(approvalStatus),
                  dataIndex: 'numC',
                  valueType: 'digit',
                  formItemProps: (_: any, row: any) => {
                    return {
                      rules: [
                        {
                          validator(a: any, value: any) {
                            // 2023-04-19 1.2.7版本，允许输入空或0，
                            // if (!value) {
                            //   return Promise.reject(new Error('请输入本次发货数量'));
                            // }
                            if (value > row.entity.shipment_quantity) {
                              return Promise.reject(
                                new Error(
                                  `不能大于发货数量（分仓）数量: ${row.entity.shipment_quantity}`,
                                ),
                              );
                            }
                            if (value < 0) {
                              return Promise.reject(new Error('下单数量不能小于1'));
                            }
                            return Promise.resolve();
                          },
                        },
                      ],
                    };
                  },
                  render: (_: any, r: any) => {
                    return r.numC > 0 ? r.numC : '-';
                  },
                },
                {
                  title: '操作',
                  align: 'center',
                  dataIndex: 'warehouse_area_name',
                  editable: false,
                  width: 100,
                  hideInTable: ['1', '2', '5'].includes(approvalStatus),
                  render: (_: any, r: any) => {
                    return r.shipment_quantity ? (
                      <CustomText
                        detailId={[r?.id]}
                        ids={[id]}
                        numC={r.numC}
                        value={r?.shipment_quantity}
                        title="创建入库单"
                        editForm={editForm}
                        showOrderList={showOrderList}
                      />
                    ) : (
                      '-'
                    );
                  },
                },
              ]}
            />
            <div className="detailTable-tip">
              说明：计划总数量&nbsp;<span>{record.num}</span> ，已建入库单&nbsp;
              <span>{record.generate_warehousing_order_num} </span>， 未建入库单&nbsp;
              <span> {record.num - Number(record.generate_warehousing_order_num)}</span>
              ，未分仓数量&nbsp;
              <span>{leaveNum}</span> ；
            </div>
          </>
        </Form.Item>
      </ModalForm>
      <Modal
        width={500}
        title={'创建成功'}
        open={isModalVisible}
        onCancel={() => {
          modalClose(false);
        }}
        destroyOnClose
        maskClosable={false}
        footer={false}
      >
        <Spin spinning={loading}>
          <>
            <Row style={{ marginBottom: '50px' }}>
              <Col>入库单号：</Col>
              <Col>
                {orderList?.map((item: string) => (
                  <p key={item}>{item}</p>
                ))}
              </Col>
            </Row>
            <Row gutter={20} style={{ marginLeft: '-10px' }}>
              <Col span={12}>
                <Button
                  type="primary"
                  ghost
                  onClick={() => {
                    modalClose(true);
                    reload();
                  }}
                >
                  返回发货计划列表
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  ghost
                  onClick={() => {
                    modalClose(true);
                    setTimeout(() => {
                      history.push('/stock-manage/cn?type=cn');
                    }, 500);
                  }}
                >
                  前往入库单列表
                </Button>
              </Col>
            </Row>
          </>
        </Spin>
      </Modal>
    </>
  );
};

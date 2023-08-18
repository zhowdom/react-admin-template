import { Button, Form, message, Space, Tooltip } from 'antd';
import { EditableProTable } from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { arraySum, sub, add, divide } from '@/utils/pubConfirm';
import { listByPlanId, updateById } from '@/services/pages/deliveryPlan';
import { useRef, useState } from 'react';

export default (props: any) => {
  const { id, num, record } = props;
  const [dataSource, setDataSource] = useState<any>();
  const formRef = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const [editIds, setEditIds] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  // const [visible, setVisible] = useState<boolean>(false);
  const [leaveNum, setLeaveNum] = useState<any>();
  // 提交
  const updateByIdAction = async (data: any) => {
    setBtnLoading(true);
    const res = await updateById(data);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setBtnLoading(false);
      return false;
    } else {
      pubMsg('修改成功', 'success');
      setBtnLoading(false);
      return true;
    }
  };
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
    console.log(leave, 'leave');
    setLeaveNum(leave);
  };
  // 获取明细数据
  const getDetailAction = async () => {
    setLoading(true);
    const res = await listByPlanId({ id });
    if (res?.code != pubConfig.sCode) {
      setLoading(false);
      pubMsg(res?.message);
    }
    formRef.current?.setFieldsValue({
      numDetails: res?.data || [],
    });
    setDataSource(res?.data || []);
    getLeaveNum(res?.data);
    setEditIds(res?.data?.map((v: any) => v.id));
    setLoading(false);
  };
  // 兼容IE及谷歌低版本
  const findLastIndex = (arr: any[], callback: any, thisArg: any) => {
    for (let index = arr.length - 1; index >= 0; index--) {
      const value = arr[index];
      if (callback.call(thisArg, value, index, arr)) {
        return index;
      }
    }
    return -1;
  };
  // 自动分仓；
  // 分仓规则：
  // 1，如果 历史销量占比参考 和为 0 ，点击自动分仓时，将发货计划数量平均分给各个收货区域，多余的添加给最后一个收货区域；
  // 2，如果 历史销量占比参考 和为 99.nn%到100%，可能会有除不尽，会差一点，点击自动分仓时，将发货计划数量按占比分配给各个收货区域，多余的添加给最后一个占比不为0的收货区域；
  const automaticAction = () => {
    const num1: number = record.num - Number(record.generate_warehousing_order_num);
    // 历史销量占比参考 总和
    const allSalesList = dataSource.map((v: any) => v.sales_proportion);
    console.log(allSalesList);
    const allSalesNum = arraySum(allSalesList);
    console.log(allSalesNum);
    // 最后一个不为0的index
    const lastIndex = findLastIndex(dataSource, (v: any) => v.sales_proportion > 0, dataSource);
    console.log(lastIndex);
    let newData: any = [];
    if (allSalesNum != 0) {
      newData = dataSource.map((item: any, index: number) => {
        let numC = 0;
        if (index == lastIndex && index) {
          let upSum = 0;
          dataSource.forEach((h: any, hindex: number) => {
            if (hindex < lastIndex) {
              upSum += Math.floor((num1 * h.sales_proportion) / 100);
            }
          });
          console.log(upSum);
          numC = sub(num1, upSum);
        } else {
          numC = Math.floor((num1 * item.sales_proportion) / 100);
        }
        editForm.setFieldsValue({
          [item.id]: {
            shipment_quantity: numC,
          },
        });
        return {
          ...item,
          shipment_quantity: numC,
        };
      });
    } else {
      newData = dataSource.map((item: any, index: number) => {
        let numC = 0;
        if (index == dataSource.length - 1) {
          let upSum = 0;
          dataSource.forEach((h: any, hindex: number) => {
            if (hindex < dataSource.length - 1) {
              upSum += Math.floor(num1 / dataSource.length);
            }
          });
          console.log(upSum);
          numC = sub(num1, upSum);
        } else {
          numC = Math.floor(num1 / dataSource.length);
        }
        editForm.setFieldsValue({
          [item.id]: {
            shipment_quantity: numC,
          },
        });
        return {
          ...item,
          shipment_quantity: numC,
        };
      });
    }
    console.log(newData);
    getLeaveNum(newData);
    formRef.current?.setFieldsValue({
      numDetails: newData,
    });
    setDataSource(newData);
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
          onCancel: () => console.log('run'),
          destroyOnClose: true,
          maskClosable: false,
        }}
        onOpenChange={(val: boolean) => {
          // setVisible(val);
          if (!val) {
            setDataSource([]);
            setEditIds([]);
            setLoading(false);
            setBtnLoading(false);
          } else {
            getDetailAction();
          }
        }}
        onFinish={async (values: any) => {
          return Promise.all([editForm.validateFields()])
            .then(() => {
              return updateByIdAction(
                values.numDetails?.map((v: any) => {
                  return {
                    ...v,
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
            .catch(() => {});
        }}
        onFinishFailed={() => {
          editForm.validateFields();
          message.warning('请检查表单正确性');
          return true;
        }}
        width={1200}
        submitter={{
          render: (data: any, doms: any) => (
            <Space>
              <Button
                loading={btnLoading}
                style={{ width: '80px' }}
                type="primary"
                key="save"
                onClick={async () => {
                  data.form?.submit?.();
                }}
              >
                {btnLoading ? '保存中' : '保 存'}
              </Button>
              {doms[0]}
            </Space>
          ),
        }}
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
              search={false}
              pagination={false}
              options={false}
              size="small"
              style={{ minWidth: '400px' }}
              recordCreatorProps={false}
              onChange={setDataSource}
              editable={{
                type: 'multiple',
                // editableKeys:
                //   approvalStatus == '7'
                //     ? dataSource?.flatMap((v: any) => (!v.warehousing_order_id ? [v.id] : []))
                //     : editIds,
                editableKeys: editIds,
                actionRender: (row, config, defaultDoms) => {
                  return [defaultDoms.delete];
                },
                form: editForm,
                onValuesChange: (r, recordList) => {
                  const newData = recordList.map((item: any) => {
                    if (item.id == r.id) {
                      return { ...r };
                    } else {
                      return { ...item };
                    }
                  });
                  getLeaveNum(newData);
                  formRef.current?.setFieldsValue({
                    numDetails: newData,
                  });
                  setDataSource(newData);
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
                  width: 180,
                  align: 'center',
                  render: (_, r: any) => {
                    return r.reference_weekly_sales > 0
                      ? r.turnover_days
                      : r.stock_quantity > 0
                      ? `${r.stock_quantity || 0}/0`
                      : `0`;
                  },
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
                  width: 80,
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
                  width: 120,
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
                  title: (
                    <>
                      <span
                        style={{
                          color: 'red',
                          display: 'inline-block',
                        }}
                      >
                        *
                      </span>
                      <span>发货数量（分仓）</span>
                      <>
                        <br />
                        <a onClick={automaticAction}>自动分仓</a>
                      </>
                    </>
                  ),
                  width: 140,
                  align: 'center',
                  dataIndex: 'shipment_quantity',
                  valueType: 'digit',
                  formItemProps: {
                    rules: [{ required: true, message: '发货数量（分仓）' }],
                  },
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
                  width: 120,
                },
              ]}
            />
            <div className="detailTable-tip">
              说明：计划总数量&nbsp;<span>{record.num}</span> ，已建入库单&nbsp;
              <span> {record.generate_warehousing_order_num}</span>， 未建入库单&nbsp;
              <span>{record.num - Number(record.generate_warehousing_order_num)}</span>
              ，未分仓数量&nbsp;
              <span>{leaveNum}</span> ；
            </div>
          </>
        </Form.Item>
      </ModalForm>
    </>
  );
};

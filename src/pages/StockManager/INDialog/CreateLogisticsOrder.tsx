import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { Button, Col, Modal, Popconfirm, Row, Space } from 'antd';
import { useReducer, useRef, useState } from 'react';
import { pubAlert, pubConfig, pubMsg, pubRequiredLengthRule } from '@/utils/pubConfig';
import { history, useAccess } from 'umi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { insertLogisticsVendor } from '@/services/pages/stockManager';

export default (props: any) => {
  const { selectedRowDataSet, selectedRowKeysSet, dataSource, disabled, dicList, reload, from } =
    props;
  const formRef = useRef<ProFormInstance>();
  const [tableData, setTableData] = useState<any>([]);
  const [submitting, setSubmitting] = useState<any>(false);
  const access = useAccess();
  // 存在异常单
  let hasErr = false;
  try {
    dataSource.forEach((item: any) => {
      if (
        item?.orderSkuList &&
        item.orderSkuList.length &&
        item.orderSkuList.some((v: any) => !!v?.difference_num)
      ) {
        hasErr = true;
        throw new Error('存在异常单');
      }
    });
  } catch (e) {
    console.log('存在异常单');
  }
  // 移出
  const deleteAction = (row: any) => {
    if (tableData.length == 1) return pubAlert('至少保留一条数据！');
    const dataC = dataSource.filter((v: any) => v.id != row.id);
    console.log(row);
    selectedRowDataSet(dataC);
    selectedRowKeysSet(dataC.map((v: any) => v.id));
    setTableData(dataC);
  };
  const initialState = { saveType: null };
  const reducer = (state: { saveType: number | null }, action: any) => {
    switch (action.type) {
      case 'toStock': // 返回入库单
        return {
          saveType: 1,
        };
      case 'toLogistics': // 返回物流单
        return {
          saveType: 2,
        };
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  // 提交
  const handleSubmit = async (postData: any) => {
    const res: any = await insertLogisticsVendor(postData);
    if (res?.code != pubConfig.sCode) {
      if (res?.message === '订舱号已存在') {
        Modal.confirm({
          title: '提示',
          icon: <ExclamationCircleOutlined />,
          content: (
            <div style={{ color: 'red' }}>
              订舱号: &nbsp;{formRef?.current?.getFieldValue('booking_number')}
              <br />
              已存在,请确认并重新输入!
            </div>
          ),
        });
      } else {
        pubMsg(res?.message);
      }

      setSubmitting(false);
    } else {
      pubMsg('操作成功', 'success');
      setSubmitting(false);
      selectedRowKeysSet([]);
      selectedRowDataSet([]);
      if (state.saveType === 2) {
        history.push('/logistics-manage-in/logistics-order');
      } else {
        reload();
      }
      return true;
    }
  };
  return dataSource?.every(
    (v: any) => v?.approval_status == '7' && !v.in_logistics_order_no && !hasErr,
  ) ? (
    <ModalForm
      title="创建跨境物流单"
      trigger={
        <Button type="primary" ghost disabled={disabled} size="small">
          创建跨境物流单
        </Button>
      }
      labelAlign="right"
      layout="horizontal"
      formRef={formRef}
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      width={'90%'}
      onFinish={async (values: any) => {
        const postData = {
          ...values,
          logisticsOrderDetails: tableData.map((v: any) => {
            return {
              ...v,
              warehousing_order_id: v.id,
            };
          }),
        };
        return handleSubmit(postData);
      }}
      onFinishFailed={() => {
        setSubmitting(false);
      }}
      submitter={{
        render: (data: any, dom: any) => (
          <Space>
            {dom[0]}
            <Button
              type="primary"
              key="save"
              ghost
              loading={submitting}
              onClick={async () => {
                dispatch({ type: 'toStock' });
                data.form?.submit?.();
                setSubmitting(true);
              }}
            >
              {from == 'logPlan' ? '确定并返回当前列表' : '确定并返回入库单列表'}
            </Button>
            {access.canSee('/logistics-manage-in/logistics-order') && (
              <Button
                type="primary"
                key="save"
                loading={submitting}
                onClick={async () => {
                  dispatch({ type: 'toLogistics' });
                  data.form?.submit?.();
                  setSubmitting(true);
                }}
              >
                确定并前往物流单列表
              </Button>
            )}
          </Space>
        ),
      }}
      onVisibleChange={(visible: boolean) => {
        if (!visible) {
          setTableData([]);
          setSubmitting(false);
        } else {
          setTableData(
            dataSource.map((v: any, index: number) => {
              return {
                ...v,
                index: index + 1,
              };
            }),
          );
        }
      }}
    >
      <ProTable
        options={false}
        bordered
        dataSource={tableData}
        size="small"
        search={false}
        pagination={false}
        columns={[
          {
            title: '序号',
            dataIndex: 'index',
            valueType: 'index',
            width: 80,
          },
          {
            title: '入库单号',
            dataIndex: 'order_no',
            align: 'center',
          },
          {
            title: '运输方式',
            dataIndex: 'shipping_method',
            align: 'center',
            valueEnum: dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || {},
          },
          {
            title: '平台',
            dataIndex: 'platform_name',
            align: 'center',
            width: 90,
          },
          {
            title: '店铺',
            dataIndex: 'shop_name',
            align: 'center',
          },
          {
            title: '平台目的仓',
            dataIndex: 'warehouse_name',
            align: 'center',
          },
          {
            title: '采购主体',
            dataIndex: 'vendor_signing_name',
            align: 'center',
          },
          {
            title: '商品名称',
            dataIndex: 'sku_name',
            align: 'center',
          },
          {
            title: 'SKU',
            dataIndex: 'shop_sku_code',
            align: 'center',
          },
          {
            title: '每箱数量',
            dataIndex: 'pics',
            align: 'center',
            render: (_: any, record: any) =>
              record?.orderSkuList?.[0]?.specificationList?.[0]?.pics ?? '-',
          },
          {
            title: '箱数',
            dataIndex: 'num',
            align: 'center',
            render: (_: any, record: any) =>
              record?.orderSkuList?.[0]?.specificationList?.[0]?.num ?? '-',
          },
          {
            title: '发货数量',
            dataIndex: 'picsTotal',
            align: 'center',
            width: 90,
            hideInSearch: true,
            render: (_: any, record: any) => {
              console.log(record, 'r');
              // 箱规计算出来为0, 默认取父的本次计划发货数量
              return (
                <span>
                  {(record?.orderSkuList?.[0]?.specificationList &&
                    record.orderSkuList?.[0]?.specificationList.reduce(
                      (previousValue: any, currentValue: any) =>
                        previousValue + currentValue.pics * currentValue.num,
                      0,
                    )) ||
                    record.delivery_plan_current_num}
                </span>
              );
            },
          },
          {
            title: '到港时间',
            dataIndex: 'arrival_time',
            align: 'center',
          },
          {
            title: '到港数量',
            dataIndex: 'arrival_num',
            align: 'center',
          },
          {
            title: '操作',
            key: 'option',
            width: 120,
            align: 'center',
            valueType: 'option',
            render: (_, row: any) => (
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
        ]}
      />
      <Row gutter={24}>
        <Col span={8}>
          <ProFormSelect
            label={'运输方式'}
            name={'shipping_method'}
            rules={[{ required: true, message: '请选择运输方式' }]}
            valueEnum={dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || {}}
            initialValue={
              [...new Set(tableData.map((v: any) => v.shipping_method))]?.length == 1
                ? [...new Set(tableData.map((v: any) => v.shipping_method))]?.[0]
                : undefined
            }
          />
        </Col>

        <Col span={8}>
          <ProFormText
            label={'订舱号'}
            name={'booking_number'}
            rules={[
              { required: true, message: '请输入订舱号' },
              {
                validator: (_: any, value: any) => pubRequiredLengthRule(value, 30),
              },
            ]}
          />
        </Col>
      </Row>
    </ModalForm>
  ) : (
    <Button
      type="primary"
      ghost
      size="small"
      disabled={disabled}
      onClick={() => {
        if (!dataSource?.every((v: any) => v?.approval_status == '7')) {
          pubAlert(
            <div style={{ color: 'red' }}>国内已入库状态的跨境平台入库单才能创建跨境物流单</div>,
            '',
            'warning',
          );
        } else if (!dataSource?.every((v: any) => !v.in_logistics_order_no)) {
          pubAlert(
            <div style={{ color: 'red' }}>
              包含已关联物流单的入库单，不能重复创建关联多个物流单
            </div>,
            '',
            'warning',
          );
        } else if (hasErr) {
          pubAlert(
            <div style={{ color: 'red' }}>
              存在异常单，请先处理并且确定收货异常，再创建跨境物流单！
            </div>,
            '',
            'warning',
          );
        }
      }}
    >
      创建跨境物流单
    </Button>
  );
};

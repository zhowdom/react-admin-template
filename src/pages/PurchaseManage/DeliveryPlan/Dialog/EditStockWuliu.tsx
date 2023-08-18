import { useState, useRef } from 'react';
import { Form, Modal, Spin, message } from 'antd';
import { EditableProTable } from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { updateLogisticsByWarehousingOrder } from '@/services/pages/deliveryPlan';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { getStockList } from '@/services/pages/deliveryPlan';

const Dialog = (props: any) => {
  const {
    planId,
    title,
    dicList,
    reload,
  } = props; // isOptions是否批量操作
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState<any>();
  const [editIds, setEditIds] = useState<any>();
  const [editForm] = Form.useForm();

  const formRef = useRef<ProFormInstance>();

  // 提交
  const getList = async (id: any) => {
    setLoading(true);
    const res = await getStockList({ delivery_plan_id: id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const newD = res.data.filter((v: any) => [1, 2, 3, 4, 5, 10].includes(v.approval_status));
      console.log(newD)
      setDataSource(newD);

      setEditIds(newD.map((v: any) => v.id))
      formRef.current?.setFieldsValue({
        stockList: newD,
      });
    }
    setLoading(false);
  };

  const open = () => {
    setIsModalVisible(true);
    getList(planId)
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val?: any) => {
    setIsModalVisible(false);
    if (val) reload();
  };
  // 提交
  const saveSubmit = async (val: any) => {
    formRef?.current
      ?.validateFields()
      .then(async () => {
        console.log(val)
        const newD = val?.stockList.map((v: any)=>({
          order_no: v.order_no,
          required_warehousing_time: v.required_warehousing_time,
          shipping_method: v.shipping_method,
        }))
        setLoading(true);
        const res = await updateLogisticsByWarehousingOrder(newD);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功！', 'success');
          modalClose(true);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
        message.warning('请检查表单正确性');
        editForm.validateFields();
      });
  };

  const columns: any = [
    {
      title: '入库单号',
      align: 'center',
      dataIndex: 'order_no',
      editable: false,
      width: 130,
    },
    {
      title: '入库单状态',
      dataIndex: 'approval_status',
      editable: false,
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(dicList?.WAREHOUSING_ORDER_IN_STATUS, record.approval_status) || '-';
      },
    },
    {
      title: '发货数量',
      dataIndex: 'shipped_num',
      editable: false,
      align: 'center',
      render: (_: any, record: any) => {
        return record?.shipped_num == 0
          ? record?.delivery_plan_current_num
          : record?.shipped_num ?? '-';
      },
    },
    {
      title: '运输方式',
      width: 150,
      align: 'center',
      dataIndex: 'shipping_method',
      valueType: 'select',
      valueEnum: dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD,
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '请选择运输方式' }],
        };
      },
    },
    {
      title: '要求物流入仓时间',
      align: 'center',
      dataIndex: 'required_warehousing_time',
      width: 150,
      valueType: 'date',
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '请选择要求物流入仓时间' }],
        };
      },

    },
  ]
  return (
    <>
      <a key={'deliveryPlan_reback_in'} onClick={() => open()}>{title}</a>
      <Modal
        width={800}
        title={title}
        open={isModalVisible}
        onOk={modalOk}
        onCancel={() => modalClose()}
        destroyOnClose
        maskClosable={false}
        confirmLoading={loading}
      >
        <Spin spinning={loading}>
          <ProForm
            formRef={formRef}
            onFinish={async (values: any) => {
              return Promise.all([editForm.validateFields()])
                .then(() => {
                  return saveSubmit(values);
                })
                .catch(() => { });
            }}
            onFinishFailed={() => {
              editForm.validateFields();
              message.warning('请检查表单正确性');
              return true;
            }}
            labelAlign="right"
            labelWrap
            submitter={false}
            layout="horizontal"
          >
            <Form.Item
              label=""
              name="stockList"
              rules={[
                {
                  validator: async (rule, value) => {
                    if (
                      value?.filter((v: any) => !v.shipping_method)?.length
                    ) {
                      return Promise.reject(new Error('运输方式'));
                    }
                    if (
                      value?.filter((v: any) => !v.required_warehousing_time)?.length
                    ) {
                      return Promise.reject(new Error('请选择要求物流入仓时间'));
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
                    // editableKeys: true ? [] : editIds,
                    editableKeys: editIds,
                    form: editForm,
                    onValuesChange: (r, recordList) => {
                      formRef.current?.setFieldsValue({
                        stockList: recordList,
                      });
                      setDataSource(recordList);
                    },
                  }}
                  bordered={true}
                  columns={columns}
                />
              </>
            </Form.Item>
          </ProForm>
        </Spin>
      </Modal>
    </>
  );
};

export default Dialog;

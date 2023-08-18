import { useState, useRef } from 'react';
import { Divider, Modal, Spin, Alert } from 'antd';
import ProTable from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { afterReviewNullify } from '@/services/pages/purchasePlan';
import { nullifyApproved } from '@/services/pages/deliveryPlan';

import { getInPlanList } from '@/services/pages/purchasePlan';
import { getList as getDeliveryPlanList } from '@/services/pages/deliveryPlan';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import PubWeekRender from '@/components/PubWeekRender';

const Dialog: React.FC<{
  dicList: any;
  reload: any;
  cancelPlanModel: any;
}> = (props: any) => {
  const { reload, dicList } = props;
  const [loading, setLoading] = useState(false);
  const [purchasePlans, setPurchasePlans] = useState<any[]>([]); // 采购
  const [deliveryPlans, setDeliveryPlans] = useState<any[]>([]); // 发货
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedRowKeys, selectedRowKeysSet] = useState<React.Key[]>([]); // 采购
  const [selectedRowKeys1, selectedRowKeysSet1] = useState<React.Key[]>([]); // 发货
  const formRef = useRef<ProFormInstance>();

  const columns: ProColumns<any>[] = [
    {
      title: '备货建议号',
      dataIndex: 'stock_up_advice_code',
      width: 110,
      align: 'center',
    },
    {
      title: '采购计划编号',
      dataIndex: 'plan_no',
      width: 110,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.PURCHASE_PLAN_STATUS, record.status);
      },
    },
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      width: 140,
      align: 'center',
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
    },
    {
      title: '要求下单时间(周次)',
      dataIndex: 'cycle_time',
      width: 160,
      align: 'center',
      render: (_: any, record: any) => (
        <PubWeekRender
          type='line'
          option={{
            cycle_time: record.cycle_time,
            begin: record.required_order_begin_time,
            end: record.required_order_end_time,
          }}
        />
      ),
    },
    {
      title: '计划数量',
      dataIndex: 'num',
      width: 100,
      align: 'center',
    },
  ];
  const columns1: ProColumns<any>[] = [
    {
      title: '备货建议号',
      dataIndex: 'stock_up_advice_code',
      width: 110,
      align: 'center',
    },
    {
      title: '发货计划编号',
      dataIndex: 'plan_no',
      width: 110,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'approval_status',
      align: 'center',
      width: 100,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.DELIVERY_PLAN_STATUS, record.approval_status);
      },
    },
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      width: 140,
      align: 'center',
    },
    {
      title: '商品名称',
      dataIndex: 'goods_sku_name',
    },
    {
      title: '出货周期',
      dataIndex: 'cycle_time',
      width: 160,
      align: 'center',
      render: (_: any, record: any) => (
        <PubWeekRender
          type='line'
          option={{
            cycle_time: record.cycle_time,
            begin: record.shipment_begin_cycle_time,
            end: record.shipment_end_cycle_time,
          }}
        />
      ),
    },
    {
      title: '计划数量',
      dataIndex: 'num',
      width: 100,
      align: 'center',
    },
  ];
  const getList = async (codes: any): Promise<any> => {
    setLoading(true);
    const res = await getInPlanList({
      business_scope: "IN",
      current_page: 1,
      page_size: 999,
      stock_up_advice_codes: codes,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    setPurchasePlans(res?.data?.records || [])
    selectedRowKeysSet(res?.data?.records.filter((k: any) => k.status == '4').map((v: any) => v.id));



    const res1 = await getDeliveryPlanList({
      business_scope: "IN",
      current_page: 1,
      page_size: 999,
      stock_up_advice_codes: codes,
    });
    if (res1?.code != pubConfig.sCode) {
      pubMsg(res1?.message);
    }
    setDeliveryPlans(res1?.data?.records || [])
    selectedRowKeysSet1(res1?.data?.records.filter((k: any) => k.approval_status == '3').map((v: any) => v.id));
    setLoading(false);
  };

  props.cancelPlanModel.current = {
    open: (codes?: any) => {
      setIsModalVisible(true);
      getList(codes);
    },
  };
  // 取消+关闭
  const modalClose = (val?: any) => {
    selectedRowKeysSet([]);
    selectedRowKeysSet1([]);
    setIsModalVisible(false);
    if (val) reload();
  };

  // 提交
  const saveSubmit = async (val: any) => {
    if (!selectedRowKeys.length && !selectedRowKeys1.length) return pubMsg('请选择要操作的数据');
    setLoading(true);
    const remarks = `通过备货建议批量作废计划，作废原因：${val.reason}`
    if (selectedRowKeys.length) {

      // 作废采购计划
      const newD = {
        ids: selectedRowKeys,
        remarks: remarks
      }
      const res = await afterReviewNullify(newD);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
        setLoading(false);
        return
      } else {
        if(!selectedRowKeys1.length){
          pubMsg('操作成功！', 'success');
          modalClose(true);
          setLoading(false);
        }
      }
    }

    if (selectedRowKeys1.length) {
      // 作废发货计划
      const newD1 = {
        id: selectedRowKeys1,
        remarks: remarks
      }
      const res1 = await nullifyApproved(newD1);
      if (res1?.code != pubConfig.sCode) {
        pubMsg(res1?.message);
        setLoading(false);
        return
      } else {
        pubMsg('操作成功！', 'success');
        modalClose(true);
        setLoading(false);
      }
    }
  };
  return (
    <Modal
      width={1200}
      title="作废计划"
      open={isModalVisible}
      onOk={() => formRef?.current?.submit()}
      onCancel={() => modalClose()}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <Alert
          message={(
            <>
              <div>操作提示：</div>
              <div>1、可在此处作废的计划必须满足3个条件，1）当前备货建议创建的计划；2）计划状态为“审核通过”；3）所涉及的计划还未全部创建采购单/入库单；</div>
              <div>2、如需要把计划数量全部作废，可进行如下操作：采购计划已创建采购单，将采购单撤回并作废；发货计划已创建入库单，将入库单撤回并删除；</div>
            </>
          )}
          type="info"
        />
        <div style={{ marginTop: '15px' }}>
          <ProForm
            formRef={formRef}
            onFinish={async (values) => {
              saveSubmit(values);
            }}
            labelAlign="right"
            labelWrap
            submitter={false}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            layout="horizontal"
            onFinishFailed={() => {
              pubMsg('请输入作废原因');
            }}
          >
            <ProFormTextArea
              name="reason"
              label="作废原因"
              placeholder="请输入作废原因"
              rules={[{ required: true, message: '请输入作废原因' }]}
            />
          </ProForm>
        </div>
        <Divider orientation="left" orientationMargin="0" style={{ fontSize: '12px' }}>
          采购计划
        </Divider>
        <ProTable<any>
          columns={columns}
          search={false}
          options={false}
          bordered
          pagination={false}
          tableAlertRender={false}
          dateFormatter="string"
          dataSource={purchasePlans}
          rowKey="id"
          size="small"
          className="p-table-0"
          rowSelection={{
            alwaysShowAlert: false,
            selectedRowKeys,
            onChange: (rowKeys: any) => {
              selectedRowKeysSet(rowKeys);
            },
            getCheckboxProps: (record: any) => ({
              disabled: record.status != '4',
            }),
          }}
        />

        <Divider orientation="left" orientationMargin="0">
          发货计划
        </Divider>
        <ProTable<any>
          columns={columns1}
          search={false}
          options={false}
          bordered
          pagination={false}
          tableAlertRender={false}
          dateFormatter="string"
          dataSource={deliveryPlans}
          rowKey="id"
          size="small"
          className="p-table-0"
          rowSelection={{
            alwaysShowAlert: false,
            selectedRowKeys: selectedRowKeys1,
            onChange: (rowKeys: any) => {
              selectedRowKeysSet1(rowKeys);
            },
            getCheckboxProps: (record: any) => ({
              disabled: record.approval_status != '3',
            }),
          }}
        />
      </Spin>
    </Modal>
  );
};

export default Dialog;

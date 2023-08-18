import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { Button, Space, Statistic } from 'antd';
import ProForm, { ProFormDigit, ProFormTextArea } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef, useState } from 'react';
import { addDeduction } from '@/services/pages/purchaseOrder';

const Deduction = (props: any) => {
  const topFormRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  // const [sum, setSum] = useState(0);
  // const ref = useRef<ActionType>();

  // 获取表格数据
  // const getListAction = async (): Promise<any> => {
  //   const postData = {
  //     id: props?.items?.id,
  //   };
  //   const res = await getDeductionList(postData);
  //   if (res?.code != pubConfig.sCode) {
  //     pubMsg(res?.message);
  //   }
  //   // 总扣款金额
  //   if (res?.data?.length) {
  //     const total = res.data.reduce(
  //       (pre: number, cur: { amount: number; cancel_remarks?: string }) =>
  //         !cur?.cancel_remarks && add(pre, cur.amount),
  //       0,
  //     );
  //     setSum(total);
  //   }
  //   return {
  //     data: res?.data || [],
  //     success: true,
  //   };
  // };
  // 添加扣款
  const addDeductionAction = async (postData: any) => {
    setLoading(true);
    const res = await addDeduction(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    pubMsg('添加成功', 'success');
    // ref?.current?.reload();
    setLoading(false);
    topFormRef?.current?.resetFields();
    props.handleClose(true);
  };
  // const columns: any[] = [
  //   {
  //     title: props?.items?.currency === 'USD' ? '扣款金额（美元)' : '扣款金额',
  //     dataIndex: 'amount',
  //     align: 'center',
  //     render: (_, record: any) => (
  //       <Statistic
  //         value={record.amount}
  //         valueStyle={{ fontWeight: 400, fontSize: '14px' }}
  //         precision={2}
  //       />
  //     ),
  //   },
  //   {
  //     title: '扣款原因',
  //     dataIndex: 'reason',
  //     align: 'center',
  //   },
  //   {
  //     title: '添加扣款时间',
  //     dataIndex: 'create_time',
  //     align: 'center',
  //   },
  //   {
  //     title: '添加扣款人',
  //     dataIndex: 'create_user_name',
  //     align: 'center',
  //   },
  //   {
  //     title: '状态',
  //     dataIndex: 'approval_status',
  //     align: 'center',
  //     valueEnum: props?.dicList.PURCHASE_ORDER_DEDUCTION_STATUS,
  //     render: (_, record: any) => {
  //       const item = props?.dicList.PURCHASE_ORDER_DEDUCTION_STATUS;
  //       const key = record?.approval_status;
  //       return [<span key="approval_status">{item?.[key]?.text || '-'}</span>];
  //     },
  //   },
  // ];

  return (
    <>
      <ProForm
        formRef={topFormRef}
        onFinish={async (values) => {
          const postData = {
            ...values,
            business_no: props?.items?.order_no, //采购单号
            business_id: props?.items?.id, //采购单ID
            business_type: 2,
          };
          addDeductionAction(postData);
        }}
        labelAlign="right"
        // submitter={{
        //   searchConfig: {
        //     resetText: '清空',
        //     submitText: '添加一笔扣款',
        //   },
        //   render: (_, doms) => {
        //     return [
        //       <div style={{ textAlign: 'center', marginBottom: '20px' }} key="wrap">
        //         <Space>{doms}</Space>
        //       </div>,
        //     ];
        //   },
        // }}
        submitter={{
          render: (_) => {
            return [
              <div key="wrapper" style={{ textAlign: 'center' }}>
                <Space size={30}>
                  <Button key="rest" onClick={() => _.form?.resetFields?.()}>
                    清空
                  </Button>
                  <Button
                    type="primary"
                    key="submit"
                    onClick={() => _.form?.submit?.()}
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? '提交中' : '添加一笔扣款'}
                  </Button>
                </Space>
              </div>,
            ];
          },
        }}
        layout="horizontal"
      >
        <ProFormDigit
          fieldProps={{
            precision: 2,
            maxLength: 125,
          }}
          min={0}
          name="amount"
          label="采购单扣款金额"
          placeholder="请输入采购单扣款金额"
          rules={[
            { required: true, message: '请输入采购单扣款金额' },
            {
              pattern: /^(?=.*\S).+$/,
              message: '请输入采购单扣款金额',
            },
            () => ({
              validator(_, value) {
                if (value > props?.items?.payable_amount) {
                  return Promise.reject(new Error('采购单扣款金额需要小于或等于采购单未付金额'));
                }
                return Promise.resolve();
              },
            }),
          ]}
          extra={
            <Space>
              <Statistic
                prefix="提示：采购单扣款金额需要小于或等于采购单未付金额："
                value={props?.items?.payable_amount}
                valueStyle={{ fontWeight: 400, fontSize: '14px', color: '#aaaaaa' }}
                precision={2}
              />
            </Space>
          }
        />
        <ProFormTextArea
          label="采购单扣款原因"
          name="reason"
          style={{ minHeight: '120px' }}
          placeholder=" 请输入5个字以上的扣款原因"
          required
          rules={[
            () => ({
              validator(_, value) {
                const temp = value ? value.trim() : value;
                if (!temp) {
                  return Promise.reject(new Error('请输入采购单扣款原因'));
                }
                if (value.length < 5) {
                  return Promise.reject(new Error('请输入5个字以上的扣款原因'));
                }
                if (value.length > 100) {
                  return Promise.reject(new Error('最多输入100字'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        />
      </ProForm>
      {/* <ProTable
        options={false}
        actionRef={ref}
        columns={columns}
        pagination={false}
        request={getListAction}
        search={false}
        rowKey="id"
        dateFormatter="string"
        headerTitle={
          sum ? (
            <>
              <span>采购单扣款金额： </span>
              <Statistic
                value={sum}
                valueStyle={{ fontWeight: 400, fontSize: '14px' }}
                precision={2}
              />
            </>
          ) : (
            ''
          )
        }
        bordered
      /> */}
    </>
  );
};

export default Deduction;

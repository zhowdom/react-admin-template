import { useState, useRef } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { getBankLog } from '@/services/pages/supplier';
import { getUuid } from '@/utils/pubConfirm';

const HistoryAccount = (props: any) => {
  const [show, setShow] = useState(false);
  // 获取表格数据
  const getListAction = async (): Promise<any> => {
    const postData = {
      business_id: props.businessId,
      business_sub_type: 1,
    };
    const res = await getBankLog(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }

    const dataC = res?.data?.records?.reduce((pre: any, current: any) => {
      const obj: any = {};
      for (const [key, value] of Object.entries(current)) {
        const currentV: any = value;
        obj[key] = currentV?.before_value;
        obj.tempId = getUuid();
      }
      pre.push(obj);
      return pre;
    }, []);
    const data = dataC?.filter((v: any) => v.bank_account);
    if (data.length) {
      setShow(true);
    }
    return {
      data: data || [],
      success: true,
      total: res?.data?.length || 0,
    };
  };
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const columns: any[] = [
    {
      title: '结算币种',
      dataIndex: 'currency',
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList.SC_CURRENCY, record?.currency);
      },
    },
    {
      title: '账户名',
      dataIndex: 'bank_account_name',
      align: 'center',
    },
    {
      title: '开户行',
      dataIndex: 'bank_name',
      align: 'center',
    },
    {
      title: '银行账号',
      dataIndex: 'bank_account',
      align: 'center',
    },
    {
      title: 'Bank Routing#',
      dataIndex: 'bank_routing',
      align: 'center',
      hideInTable: !props.isUSD,
    },
    {
      title: 'SWIFT',
      dataIndex: 'swift',
      align: 'center',
      hideInTable: !props.isUSD,
    },
    {
      title: 'Bank Address',
      dataIndex: 'bank_address',
      align: 'center',
      hideInTable: !props.isUSD,
    },
    {
      title: 'Company Address',
      dataIndex: 'company_address',
      align: 'center',
      hideInTable: !props.isUSD,
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone_number',
      align: 'center',
      hideInTable: !props.isUSD,
    },
    {
      title: '截止使用时间',
      dataIndex: 'expire_date',
      align: 'center',
    },
  ];

  return (
    <>
      <ProTable
        style={{ margin: '30px 0', display: show ? 'block' : 'none' }}
        toolBarRender={() => []}
        columns={columns}
        actionRef={ref}
        options={false}
        pagination={false}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        search={false}
        rowKey="tempId"
        dateFormatter="string"
        headerTitle={<h5 style={{ transform: 'translateY(10px)' }}>历史账户:</h5>}
        bordered
      />
    </>
  );
};

export default HistoryAccount;

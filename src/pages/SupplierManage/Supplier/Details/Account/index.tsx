import { useState, useRef } from 'react';
import { Button, Space } from 'antd';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { CheckCircleTwoTone, PlusOutlined } from '@ant-design/icons';
import Dialog from './dialog';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { getBankCountList, getBankDetail } from '@/services/pages/supplier';
import { history, useAccess, Access } from 'umi';
import HistoryAccount from './history';

const Account = (props: any) => {
  const access = useAccess();
  const vendor_id = history?.location?.query?.id || null;
  const [isUSD, setIsUSD] = useState(true);
  const [data, setData] = useState<any[]>([]);
  // 获取表格数据
  const getListAction = async (): Promise<any> => {
    const postData = {
      vendor_id,
    };
    const res = await getBankCountList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    if (res?.data?.length) {
      setIsUSD(res?.data?.[0].currency === 'USD');
    }
    setData(res?.data || []);
    return {
      data: res?.data || [],
      success: true,
      total: res?.data?.length || 0,
    };
  };

  const [state, setState] = useState({
    isModalVisible: false,
    dialogForm: {}, // 弹窗表单
  });
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  // 获取结算账户信息
  const getDetailAction = async (row: any) => {
    const res = await getBankDetail({
      id: row?.id,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const result = res.data || {};
      if (typeof result.is_default == 'number') {
        result.is_default = String(result.is_default);
      }
      if (!result.contract_id) {
        result.contract_id = [];
      }
      result.view = row.view;
      setState((pre: any) => {
        return {
          ...pre,
          dialogForm: result,
          isModalVisible: true,
        };
      });
    }
  };
  // 新增或编辑,有id编辑,无id新增
  const toUpdate: any = (row: {
    id: string | undefined;
    is_default: number | string;
    contract_id: any;
  }) => {
    if (!row?.id) {
      setState((pre: any) => {
        return {
          ...pre,
          dialogForm: {},
          isModalVisible: true,
        };
      });
    } else {
      getDetailAction(row);
    }
  };

  // 弹窗关闭
  const handleClose = (cancel: any) => {
    setState((pre) => {
      return { ...pre, isModalVisible: false };
    });
    if (!cancel) {
      ref?.current?.reload();
    }
  };
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
      render: (_: any, row: any) => {
        return (
          <Space>
            <CheckCircleTwoTone
              twoToneColor="#52c41a"
              style={{
                fontSize: '16px',
                display: row.is_default == 1 ? 'block' : 'none',
              }}
            />

            <span>{row.bank_name}</span>
          </Space>
        );
      },
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
      hideInTable: !isUSD,
    },
    {
      title: 'SWIFT',
      dataIndex: 'swift',
      align: 'center',
      hideInTable: !isUSD,
    },
    {
      title: 'Bank Address',
      dataIndex: 'bank_address',
      align: 'center',
      hideInTable: !isUSD,
    },
    {
      title: 'Company Address',
      dataIndex: 'company_address',
      align: 'center',
      hideInTable: !isUSD,
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone_number',
      align: 'center',
      hideInTable: !isUSD,
    },
    {
      title: '账户状态',
      dataIndex: 'approval_status',
      align: 'center',
      render: (_, record: any) => {
        const item = props.dicList.VENDOR_APPROVAL_STATUS;
        const key = record?.approval_status;
        return [<span key="approval_status">{item?.[key]?.text || '-'}</span>];
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 130,
      align: 'center',
      valueType: 'option',
      render: (_: any, row: any) => (
        <Space>
          {access.canSee('supplier_bank_account_view') ? (
            <a
              onClick={() => {
                row.view = true;
                toUpdate(row);
              }}
              key="view"
            >
              查看详情
            </a>
          ) : null}
          {access.canSee('supplier_bank_account_edit') && data?.[0]?.approval_status != '1' ? (
            <a
              onClick={() => {
                row.view = false;
                toUpdate(row);
              }}
              key="edit"
            >
              账户变更
            </a>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Dialog
        vendor_id={vendor_id}
        state={state}
        isModalVisible={state.isModalVisible}
        handleClose={handleClose}
        dicList={props.dicList}
      />
      <ProTable
        toolBarRender={() => [
          <Access key="add" accessible={access.canSee('supplier_bank_account_add')}>
            <Button
              style={{ display: data.length ? 'none' : 'block' }}
              onClick={() => {
                toUpdate();
              }}
              ghost
              type="primary"
              key="update"
              icon={<PlusOutlined />}
            >
              新增账号
            </Button>
          </Access>,
        ]}
        columns={columns}
        actionRef={ref}
        options={false}
        pagination={false}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        search={false}
        rowKey="id"
        dateFormatter="string"
        headerTitle={<h5 style={{ transform: 'translateY(10px)' }}>账户信息:</h5>}
        bordered
      />
      {data?.[0]?.id && (
        <HistoryAccount dicList={props.dicList} businessId={data?.[0]?.id} isUSD={isUSD} />
      )}
    </>
  );
};

export default Account;

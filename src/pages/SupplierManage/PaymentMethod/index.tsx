import { PageContainer } from '@ant-design/pro-layout';
import { connect, history, useAccess, Access } from 'umi';
import { useState, useRef } from 'react';
import { Button, Space, Tag, Tooltip, Typography } from 'antd';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { getList, sync, changeLog } from '@/services/pages/paymentMethod';
import { pubAlert, pubConfig, pubFilter, pubModal, pubMsg } from '@/utils/pubConfig';
import { getUuid } from '@/utils/pubConfirm';
import ProductLine from '@/components/PubForm/ProductLine';
import Add from '@/pages/ContractManage/List/Dialog/Add';
import ChangeLog from './ChangeLog';
import { QuestionCircleOutlined } from '@ant-design/icons';

const PaymentMethod = (props: any) => {
  const access = useAccess();
  const { common } = props;
  const { dicList } = common;
  const [tempKey, setTempKey] = useState(getUuid());
  const formRef = useRef<ProFormInstance>();
  const ref: any = useRef<ActionType>();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectRows, setSelectRows] = useState<any>([]);
  const preStyle: any = {
    marginBottom: 0,
    fontFamily: 'Arial, Helvetica, sans-serif',
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.85)',
  };
  // 添加弹窗实例
  const addModel = useRef();
  const [vendorData, setVendorData] = useState<any>();
  // keepAlive页面激活钩子函数
  useActivate(() => {
    console.log(tempKey);
    setTempKey(getUuid());
    if (ref?.current) ref?.current?.reload();
  });

  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    setVendorData(null);
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      business_scope: params.category_data ? params.category_data?.[0] : null, //业务范畴
      group_id: params?.category_data?.[1] ? params?.category_data?.[1] : null, //产品线
    };
    const res = await getList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  // 弹窗关闭
  const modalClose = (data: any) => {
    console.log(data);
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
  };
  // 确定显示结算变更弹窗
  const addModalOpen: any = (record: any) => {
    setVendorData(record);
    setTimeout(() => {
      const data: any = addModel?.current;
      data.open();
    }, 300);
  };
  // 同步
  const synAction = async () => {
    if (!selectRows?.length) {
      pubAlert('请勾选数据', '', 'warning');
      return;
    }
    pubModal('是否确定同步结算方式?')
      .then(async () => {
        setConfirmLoading(true);
        const res: any = await sync({
          vendor_ids: selectRows,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功', 'success');
          ref?.current?.reload();
          setSelectRows([]);
        }
        setConfirmLoading(false);
      })
      .catch(() => {
        setSelectRows([]);
        console.log('点击了取消');
      });
  };
  const columns: any[] = [
    {
      title: '供应商名称',
      dataIndex: 'vendor_name',
      align: 'left',
      order: 4,
    },

    {
      title: '产品线',
      dataIndex: 'business_scope',
      align: 'left',
      width: 350,
      hideInSearch: true,
      render: (_, record: any) => {
        return [
          <Space key="business_scope" align="start" size={0}>
            <span style={{ paddingLeft: '10px' }}>
              {record.business_scope == 'CN'
                ? '国内-'
                : record.business_scope == 'IN'
                ? '跨境-'
                : '-'}
            </span>
            <span style={{ display: 'inline-block', width: '289px', marginTop: '-3px' }}>
              {record.vendor_group_name?.split(',').map((k: any) => {
                // cyan
                return (
                  <Tag color={'blue'} key={k} style={{ margin: '4px' }}>
                    {k}
                  </Tag>
                );
              })}
            </span>
          </Space>,
        ];
      },
    },
    {
      title: '产品线',
      dataIndex: 'category_data',
      hideInTable: true,
      order: 5,
      renderFormItem: (_, rest, form) => {
        return (
          <ProductLine
            single={true}
            back={(v: any) => {
              form.setFieldsValue({ category_data: v });
            }}
          />
        );
      },
    },

    {
      title: '合作状态',
      dataIndex: 'vendor_status',
      valueType: 'select',
      align: 'center',
      fieldProps: selectProps,
      order: 2,
      width: 120,
      valueEnum: dicList.VENDOR_COOPERATION_STATUS,
      render: (_, record: any) => {
        return pubFilter(dicList.VENDOR_COOPERATION_STATUS, record.vendor_status);
      },
    },
    {
      title: '账期类型',
      dataIndex: 'pay_method_type',
      align: 'left',
      hideInSearch: true,
      render: (_: any, record: any) => <pre style={preStyle}>{record.pay_method_type || '-'}</pre>,
    },
    {
      title: '当前结算方式',
      dataIndex: 'payment_method',
      align: 'center',
      hideInSearch: true,
      order: 3,
      valueType: 'select',
      valueEnum: dicList.VENDOR_PAYMENT_METHOD,
    },
    {
      title: (data, type: string) => {
        return type == 'form' ? (
          '变更中'
        ) : (
          <>
            变更中
            <Tooltip
              placement="top"
              title={
                <>
                  <div>
                    若当前存在正在签署中的框架合同或者结算方
                    式变更协议，结算方式属于变更中，若没有则 变更状态为否
                  </div>
                  <div>
                    签署中：状态为合同审批中、合同审批不通过、
                    甲方已签约、甲方签约失败、供应商签约失
                    败、续签审批中、待供应商签约、供应商已签约
                  </div>
                </>
              }
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        );
      },
      dataIndex: 'changing',
      valueType: 'select',
      align: 'center',
      width: 90,
      valueEnum: dicList.SC_YES_NO,
      render: (_, record: any) => {
        return pubFilter(dicList.SC_YES_NO, record.changing_count);
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 200,
      align: 'center',
      fixed: 'right',
      valueType: 'option',
      className: 'wrap',
      render: (_: any, record: any) => [
        <Access
          key="toContract"
          accessible={access.canSee('scm_payMethod_toContract') && record.changing_count == '1'}
        >
          <a
            onClick={() => {
              history.push(`/contract-manage/list?vendorId=${record.vendor_id}&nameId=11`);
            }}
          >
            转到合同列表
          </a>
        </Access>,
        <Access
          key="toContract"
          accessible={access.canSee('scm_payMethod_toChange') && record.changing_count == '0'}
        >
          <a
            onClick={() => {
              addModalOpen(record);
            }}
          >
            发起变更
          </a>
        </Access>,
        <Access key="log" accessible={access.canSee('scm_payMethod_log')}>
          <ChangeLog api={changeLog} vendorId={record.vendor_id} dicList={common?.dicList} />
        </Access>,
      ],
    },
  ];

  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          bordered
          rowSelection={
            access.canSee('scm_payMethod_sync')
              ? {
                  selectedRowKeys: selectRows,
                  onSelect: (record: any, selected: any) => {
                    let keys = [...selectRows];
                    if (selected) {
                      keys = [...selectRows, record.vendor_id];
                    } else {
                      keys = selectRows.filter((item: any) => item !== record.vendor_id);
                    }
                    setSelectRows(keys);
                  },
                  onSelectAll: (selected, selectedRows, changeRows) => {
                    if (selected) {
                      const addCheckedKeys = changeRows.map((item: any) => {
                        return item.vendor_id;
                      });
                      setSelectRows([...selectRows, ...addCheckedKeys]);
                    } else {
                      const subCheckedKeys = selectRows.filter((idT: string) => {
                        return !changeRows.some((item) => {
                          return item.vendor_id === idT;
                        });
                      });

                      setSelectRows(subCheckedKeys);
                    }
                  },
                }
              : false
          }
          request={getListAction}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          rowKey="vendor_id"
          scroll={{ x: 1200 }}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          dateFormatter="string"
          headerTitle={
            <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
              说明：系统每天会定时更新账期类型为按订单数和按时间段的供应商的结算方式，如果满足变更条件则会自动更新
            </Typography.Text>
          }
          toolBarRender={() => [
            <Access key="sync" accessible={access.canSee('scm_payMethod_sync')}>
              <Button
                loading={confirmLoading}
                onClick={() => {
                  synAction();
                }}
                type="primary"
              >
                同步结算方式
              </Button>
            </Access>,
          ]}
        />
      </PageContainer>
      <Add addModel={addModel} handleClose={modalClose} dicList={dicList} vendorData={vendorData} />
    </>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(PaymentMethod);
export default ConnectPage;

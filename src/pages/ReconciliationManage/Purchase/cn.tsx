import { PageContainer } from '@ant-design/pro-layout';
import { connect, history, useActivate } from 'umi';
import { useState, useRef } from 'react';
import { Button, Popconfirm, Space, Spin } from 'antd';
import { DownloadOutlined, ReconciliationOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/reconciliation/askAction';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  getBookmarks,
  getAccountStatementOrderCnPage,
  deleteById,
} from '@/services/pages/reconciliationPurchase';
import { pubConfig, pubMsg, pubFilter, pubAlert, pubModal } from '@/utils/pubConfig';
import { pubGetSigningList, pubGetVendorList } from '@/utils/pubConfirm';
import { dateFormat, priceValue } from '@/utils/filter';
import Add from './Dialog/Add';
import AuditList from './Dialog/AuditList';
import Pament from './Dialog/Pament';
import Export from './Dialog/Export';
import './style.less';
import { uploadAccountSave, print } from './config';
import { useAccess, Access } from 'umi';
import PamentList from './Dialog/PamentList';
import { IsGrey } from '@/utils/pubConfirm';

const Account = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const [loading, setLoading] = useState(false);
  const [tabActiveKey, tabActiveKeySet] = useState('-1');
  const [tabList, setTabList] = useState([{ tab: '全部(0)', key: '-1' }]);
  const access = useAccess();

  const [selectRows, setSelectRows] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const ref: any = useRef<ActionType>();
  const formRef: any = useRef<ProFormInstance>();
  // 添加弹窗实例
  const addModel = useRef();
  const auditListModel = useRef();
  const pamentModel = useRef();
  const pamentListModel = useRef();
  const exportModel = useRef();
  // 添加
  const addModelOpen: any = (business_scope: string) => {
    const data: any = addModel?.current;
    data.open(business_scope);
  };
  // // 确认付款
  // const pamentModelOpen: any = (rowData?: any) => {
  //   const data: any = pamentModel?.current;
  //   data.open(rowData);
  // };
  // 批量确认付款
  const pamentListModelOpen: any = (rowData?: any) => {
    const data: any = pamentListModel?.current;
    data.open(rowData);
  };
  // 审批记录
  const auditListModelOpen: any = (id?: any) => {
    const data: any = auditListModel?.current;
    data.open(id);
  };
  // 导出付款报表
  const exportModelOpen: any = (business_scope: string) => {
    const data: any = exportModel?.current;
    data.open(business_scope);
  };
  // 弹窗关闭
  const modalClose = (data: any) => {
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
  };
  // 搜索清除前后空格
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

  // 获取tabs数据
  const getTabList = async (): Promise<any> => {
    const res = await getBookmarks({
      business_scope: 'CN',
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return {
        data: [],
        success: true,
        total: 0,
      };
    }
    const allNumList = res.data.map((v: any) => v.count);
    const allNum = allNumList.reduce((prev: any, curr: any) => prev + curr);
    const newTablist = [{ tab: '全部(0)', key: '-1' }];
    newTablist[0].tab = `全部(${allNum})`;
    res.data.forEach((v: any) => {
      newTablist.push({
        tab: `${v.name}(${v.count})`,
        key: v.key,
      });
    });
    setTabList(newTablist);
  };
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    getTabList();
    const postData = {
      ...params,
      approval_status: params?.tabActiveKey ? params?.tabActiveKey : tabActiveKey, //账单状态
      begin_time: params?.time?.[0] ? params?.time?.[0] : null, //账单期间 开始日期
      end_time: params?.time?.[1] ? params?.time?.[1] : null, //账单期间 结束日期
      begin_latest_payment_date: params?.latest_payment_date?.[0]
        ? params?.latest_payment_date?.[0]
        : null, //最迟付款日期 开始日期
      end_latest_payment_date: params?.latest_payment_date?.[1]
        ? params?.latest_payment_date?.[1]
        : null, //最迟付款日期 结束日期
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await getAccountStatementOrderCnPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    setSelectRows([]);
    setSelectedItems([]);
    ref?.current?.clearSelected();
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  // 切换tabs时
  const changeTabs = async (key: any) => {
    console.log(key);
    tabActiveKeySet(key);
    formRef?.current?.setFieldsValue({
      tabActiveKey: key,
    });
    ref?.current?.reload();
  };
  useActivate(() => {
    ref?.current?.reload();
  });

  // 批量确认付款
  const pamentListOk = async (ids?: any) => {
    if (!ids.length) return pubMsg('请选择要操作的数据！');
    if (selectedItems.every((item: any) => item.approval_status == '8')) {
      pamentListModelOpen(ids);
    } else {
      pubAlert('只有付款确认状态才可以提交批量确认付款,请重新选择采购单！');
    }
  };
  // 更新账单
  const uploadAccount = (id: string) => {
    pubModal('是否确定更新此账单？')
      .then(async () => {
        setLoading(true);
        uploadAccountSave(id)
          .then(() => {
            ref?.current?.reload();
          })
          .catch(() => {});
        setLoading(false);
      })
      .catch(() => {
        console.log('点了取消');
      });
  };

  // 表格配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '对账单号',
      dataIndex: 'order_no',
      width: 110,
      order: 8,
      align: 'center',
    },
    {
      title: '类型',
      dataIndex: 'order_type',
      width: 100,
      order: 10,
      align: 'center',
      valueEnum: dicList.ACCOUNT_STATEMENT_ORDER_ORDER_TYPE,
      render: (_: any, record: any) => {
        return pubFilter(dicList.ACCOUNT_STATEMENT_ORDER_ORDER_TYPE, record.order_type);
      },
    },
    {
      title: '对账单状态',
      dataIndex: 'approval_status',
      width: 100,
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return pubFilter(dicList.ACCOUNT_STATEMENT_STATUS, record.approval_status);
      },
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      hideInSearch: true,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_id',
      valueType: 'select',
      hideInTable: true,
      order: 9,
      fieldProps: selectProps,
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
    },
    {
      title: '付款主体',
      dataIndex: 'main_name',
      valueType: 'select',
      fieldProps: {
        showSearch: true,
      },
      request: async () => pubGetSigningList(),
      search: {
        transform: (value) => ({ main_id: value }),
      },
    },
    {
      title: '结算方式',
      order: 3,
      dataIndex: 'payment_method',
      valueType: 'select',
      align: 'center',
      valueEnum: common?.dicList.VENDOR_PAYMENT_METHOD,
      render: (_: any, record: any) => {
        if (['8', '9', '10', '11', '12', '13'].includes(record?.payment_method)) {
          return record.prepayment_percentage
            ? pubFilter(dicList?.VENDOR_PAYMENT_METHOD, record?.payment_method)?.replace(
                '+',
                `${record.prepayment_percentage}%+`,
              ) ?? '-'
            : pubFilter(dicList?.VENDOR_PAYMENT_METHOD, record?.payment_method) ?? '-';
        }
        return pubFilter(dicList?.VENDOR_PAYMENT_METHOD, record?.payment_method) ?? '-';
      },
    },
    {
      title: '账单起始日期',
      dataIndex: 'begin_time',
      width: 100,
      hideInSearch: true,
      align: 'center',
      render: (_: any, record: any) => {
        return dateFormat(record.begin_time);
      },
    },
    {
      title: '账单截止日期',
      dataIndex: 'end_time',
      width: 100,
      hideInSearch: true,
      align: 'center',
      render: (_: any, record: any) => {
        return dateFormat(record.end_time);
      },
    },
    {
      title: '最迟付款日期',
      dataIndex: 'latest_payment_date',
      width: 100,
      hideInSearch: true,
      align: 'center',
      render: (_: any, record: any) => {
        return dateFormat(record.latest_payment_date);
      },
    },
    {
      title: '币种',
      dataIndex: 'currency',
      width: 100,
      hideInSearch: true,
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(dicList.SC_CURRENCY, record.currency);
      },
    },
    {
      title: '账单期间',
      dataIndex: 'time',
      valueType: 'dateRange',
      hideInTable: true,
      order: 7,
    },
    {
      title: '最迟付款时间',
      dataIndex: 'latest_payment_date',
      valueType: 'dateRange',
      hideInTable: true,
      order: 6,
    },
    {
      title: '还需支付金额',
      dataIndex: 'amount',
      width: 130,
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.amount);
      },
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      hideInSearch: true,
      valueType: 'select',
      width: 100,
    },
    {
      title: '操作',
      key: 'option',
      width: 160,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (_, row) => {
        const renderList = [];
        renderList.push(
          <Access key="detail" accessible={access.canSee('accountStatementOrder_cn_detail')}>
            <a
              onClick={() => {
                history.push(`/reconciliation-manage/purchaseCn-detail?id=${row.id}`);
              }}
            >
              详情
            </a>
          </Access>,
          <Access
            key="checkButton"
            accessible={
              access.canSee('accountStatementOrder_cn_update') &&
              (row.approval_status == '1' ||
                row.approval_status == '3' ||
                row.approval_status == '5' ||
                row.approval_status == '7')
            }
          >
            <a
              onClick={() => {
                uploadAccount(row.id);
              }}
              key="check"
            >
              更新账单
            </a>
          </Access>,
          // <Access
          //   key="paymentButton"
          //   accessible={
          //     access.canSee('accountStatementOrder_cn_payment') && row.approval_status == '8'
          //   }
          // >
          //   <a
          //     onClick={() => {
          //       pamentModelOpen(row);
          //     }}
          //     key="payment"
          //   >
          //     确认付款
          //   </a>
          // </Access>,
          <Access key="auditList" accessible={access.canSee('accountStatementOrder_cn_history')}>
            <a
              onClick={() => {
                auditListModelOpen(row.id);
              }}
            >
              审批日志
            </a>
          </Access>,
          /*数据字典:ACCOUNT_STATEMENT_STATUS 新建和驳回状态才能移除*/
          <Access
            key="delete"
            accessible={
              access.canSee('scm_accountStatementOrder_cn_remove') &&
              [1, 3, 5, 7, 10].includes(Number(row.approval_status))
            }
          >
            <Popconfirm
              title="确定删除?"
              onConfirm={async () => {
                const res = await deleteById(row.id);
                if (res?.code != pubConfig.sCode) {
                  pubMsg(res?.message);
                } else {
                  pubMsg(res?.message, 'success');
                  ref?.current?.reload();
                }
              }}
              okText="确定"
              cancelText="取消"
            >
              <a>删除</a>
            </Popconfirm>
          </Access>,
        );
        return renderList;
      },
    },
  ];
  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
        tabList={tabList}
        tabActiveKey={tabActiveKey}
        onTabChange={changeTabs}
        className="pubPageTabs"
      >
        <Spin spinning={loading}>
          <ProTable<TableListItem>
            columns={columns}
            options={{ fullScreen: true, setting: false }}
            pagination={{
              showSizeChanger: true,
            }}
            actionRef={ref}
            formRef={formRef}
            scroll={{ x: 1600 }}
            sticky={{ offsetHeader: 48 }}
            defaultSize={'small'}
            tableAlertRender={false}
            tableAlertOptionRender={false}
            request={getListAction}
            rowSelection={{
              fixed: true,
              defaultSelectedRowKeys: selectRows,
              onChange: (selectedRowKeys: any, rowItems: any) => {
                setSelectRows(selectedRowKeys);
                setSelectedItems(rowItems);
              },
            }}
            rowKey="id"
            search={{ className: 'light-search-form', defaultCollapsed: false }}
            dateFormatter="string"
            headerTitle={
              <Space key="space" wrap>
                <Access
                  key="access"
                  accessible={access.canSee('accountStatementOrder_cn_paymentList')}
                >
                  <Button
                    disabled={!selectRows.length}
                    onClick={() => {
                      pamentListOk(selectRows);
                    }}
                  >
                    批量确认付款
                  </Button>
                </Access>
              </Space>
            }
            toolBarRender={() => [
              <Space key="space">
                <Access
                  key="printButton"
                  accessible={access.canSee('accountStatementOrder_cn_print_list')}
                >
                  <Button
                    key="print"
                    type="primary"
                    ghost
                    icon={<ReconciliationOutlined />}
                    onClick={() => {
                      print(selectRows);
                    }}
                  >
                    批量打印
                  </Button>
                </Access>
                <Access
                  key="cancelButton"
                  accessible={access.canSee('accountStatementOrder_cn_export')}
                >
                  <Button
                    key="cancel"
                    type="primary"
                    ghost
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      exportModelOpen('CN');
                    }}
                  >
                    导出付款报表
                  </Button>
                </Access>
                <Access key="addButton" accessible={access.canSee('accountStatementOrder_cn_add')}>
                  <Button
                    key="add"
                    type="primary"
                    onClick={() => {
                      addModelOpen('CN');
                    }}
                  >
                    创建对账单
                  </Button>
                </Access>
              </Space>,
            ]}
          />
        </Spin>
        <Add addModel={addModel} handleClose={modalClose} />
        <AuditList auditListModel={auditListModel} handleClose={modalClose} />
        <Pament pamentModel={pamentModel} handleClose={modalClose} />
        <PamentList pamentListModel={pamentListModel} handleClose={modalClose} />
        <Export exportModel={exportModel} handleClose={modalClose} />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(
  ({ account, common }: { account: Record<string, unknown>; common: Record<string, unknown> }) => ({
    account,
    common,
  }),
)(Account);
export default ConnectPage;

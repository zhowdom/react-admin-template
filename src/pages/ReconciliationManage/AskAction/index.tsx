import { PageContainer } from '@ant-design/pro-layout';
import { connect, history, useActivate } from 'umi';
import { useState, useRef } from 'react';
import { Button, Popconfirm, Space } from 'antd';
import { DownloadOutlined, ReconciliationOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/reconciliation/askAction';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  getBookmarks,
  getPurchaseOrderRequestFundsPage,
  purchaseOrderRequestFundsExport,
  deleteById,
} from '@/services/pages/reconciliationAskAction';
import { pubConfig, pubMsg, pubFilter, pubAlert } from '@/utils/pubConfig';
import { IsGrey, pubGetUserList, pubGetVendorList, pubGoUrl } from '@/utils/pubConfirm';
import moment from 'moment';
import { dateFormat, priceValue } from '@/utils/filter';
import './style.less';
import { useAccess, Access } from 'umi';
import OrderDetail from '@/components/OrderDetail';
import HandleAction from './Dialog/HandleAction';

const Account = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const [tabActiveKey, tabActiveKeySet] = useState('-1');
  const [tabList, setTabList] = useState([{ tab: '全部(0)', key: '-1' }]);
  const access = useAccess();
  const [selectRows, setSelectRows] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [downLoading, setDownLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const ref = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();

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
    const res = await getBookmarks({});
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return {
        data: [],
        success: true,
        total: 0,
      };
    }
    console.log(res.data);
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
      create_time_start: params?.create_time?.[0] ? params?.create_time?.[0] : null, //开始日期
      create_time_end: params?.create_time?.[1] ? params?.create_time?.[1] : null, //结束日期
      requirement_pay_time_start: params?.requirement_pay_time?.[0]
        ? params?.requirement_pay_time?.[0]
        : null, //开始日期
      requirement_pay_time_end: params?.requirement_pay_time?.[1]
        ? params?.requirement_pay_time?.[1]
        : null, //结束日期
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await getPurchaseOrderRequestFundsPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    setSelectRows([]);
    ref?.current?.clearSelected();
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 添加弹窗实例
  const aduitModel = useRef();
  // 打开弹窗
  const handleOpen: any = (ids?: any, type?: any, required?: any, values?: any) => {
    const data: any = aduitModel?.current;
    data.open(ids, type, required, values);
  };
  // 批量付款
  const batchPayAction = async () => {
    if (!selectRows.length) {
      pubAlert('请勾选数据', '', 'warning');
      return;
    }
    if (!selectedItems.every((item: any) => ['8'].includes(item.approval_status))) {
      pubAlert('只有状态为“付款确认”才可操作，请重新选择数据', '', 'warning');
      return;
    }
    setPayLoading(true);
    handleOpen(selectRows.join(','), 'batchPayment');
  };
  // 弹窗关闭
  const modalClose = (data: any) => {
    setPayLoading(false);
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
  };
  // 切换tabs时
  const changeTabs = async (key: any) => {
    tabActiveKeySet(key);
  };
  useActivate(() => {
    ref?.current?.reload();
  });
  // 批量打印
  const print = async () => {
    console.log('批量打印');
    if (!selectRows.length) return pubMsg('请选择要打印的数据！');
    console.log(selectRows);
    const url = `/appPage_Scm/askAction-print?ids=${selectRows.join(',')}`;
    pubGoUrl(url);
  };
  // 导出明细
  const exportTemp = async () => {
    const params = formRef?.current?.getFieldsValue();
    params.approval_status = tabActiveKey; //账单状态
    params.create_time_start = params?.create_time?.[0]
      ? moment(params?.create_time?.[0]).format('YYYY-MM-DD')
      : null; //开始日期
    params.create_time_end = params?.create_time?.[1]
      ? moment(params?.create_time?.[1]).format('YYYY-MM-DD')
      : null; //结束日期
    params.requirement_pay_time_start = params?.requirement_pay_time?.[0]
      ? moment(params?.requirement_pay_time?.[0]).format('YYYY-MM-DD')
      : null; //开始日期
    params.requirement_pay_time_end = params?.requirement_pay_time?.[1]
      ? moment(params?.requirement_pay_time?.[1]).format('YYYY-MM-DD')
      : null; //结束日期
    console.log(params);
    setDownLoading(true);
    const res: any = await purchaseOrderRequestFundsExport(params);
    console.log(res);
    const type = res.response.headers.get('content-type');
    if (type.indexOf('application/json') > -1) {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `${params.name}.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
    setDownLoading(false);
  };
  // 删除
  const deleteAction = async (id: string) => {
    const res = await deleteById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('删除成功', 'success');
      ref?.current?.reload();
    }
  };
  // 表格配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '请款单号',
      dataIndex: 'funds_no',
      width: 130,
      align: 'center',
      order: 3,
    },
    {
      title: '采购单号',
      dataIndex: 'order_no',
      width: 130,
      align: 'center',
      order: 4,
    },
    {
      title: '供应商',
      order: 6,
      dataIndex: 'vendor_id',
      valueType: 'select',
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
      fieldProps: {
        showSearch: true,
        filterOption: (input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        },
      },
      render: (_: any, record: any) => record.vendor_name || '-',
    },
    {
      title: '请款人',
      dataIndex: 'create_user_name',
      width: 130,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '请款原因',
      dataIndex: 'reason',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '请款金额',
      dataIndex: 'amount',
      width: 130,
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return IsGrey ? '' :priceValue(record.amount);
      },
    },
    {
      title: '请款日期',
      dataIndex: 'create_time',
      width: 100,
      hideInSearch: true,
      align: 'center',
      render: (_: any, record: any) => {
        return dateFormat(record.create_time);
      },
    },
    {
      title: '请款日期',
      dataIndex: 'create_time',
      valueType: 'dateRange',
      hideInTable: true,
      order: 2,
    },
    {
      title: '要求付款日期',
      dataIndex: 'requirement_pay_time',
      valueType: 'dateRange',
      hideInTable: true,
      order: 1,
    },
    {
      title: '要求付款日期',
      dataIndex: 'requirement_pay_time',
      width: 100,
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return dateFormat(record?.requirement_pay_time);
      },
    },
    {
      title: '请款人',
      dataIndex: 'create_id',
      hideInTable: true,
      order: 5,
      fieldProps: selectProps,
      valueType: 'select',
      request: async (v: any) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
    },
    {
      title: '请款状态',
      dataIndex: 'approval_status',
      width: 100,
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return pubFilter(dicList.PURCHASE_REQUEST_FUNDS_STATUS, record.approval_status);
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 160,
      align: 'center',
      valueType: 'option',
      className: 'wrap',
      render: (_, row: any) => {
        const renderList = [];
        if (
          row.approval_status == '3' ||
          row.approval_status == '5' ||
          row.approval_status == '7' ||
          row.approval_status == '111'
        ) {
          renderList.push(
            <Access key="editButton" accessible={access.canSee('askAction_update')}>
              <a
                onClick={() => {
                  history.push(`/reconciliation-manage/askAction-edit?id=${row.id}`);
                }}
                key="edit"
              >
                编辑
              </a>
            </Access>,
          );
        } else {
          renderList.push(
            <Access key="detailButton" accessible={access.canSee('askAction_detail')}>
              <a
                onClick={() => {
                  history.push(`/reconciliation-manage/askAction-detail?id=${row.id}`);
                }}
                key="detail"
              >
                详情
              </a>
            </Access>,
          );
        }

        renderList.push(
          <Access key="findByIdButton" accessible={access.canSee('askAction_order_detail')}>
            <OrderDetail id={row.order_id} title={<a>采购单</a>} dicList={dicList} />
          </Access>,
        );
        // 驳回状态添加删除功能
        if (['5', '7', '10', '111'].includes(row.approval_status)) {
          renderList.push(
            <Access key="detailButton" accessible={access.canSee('scm_askAction_delete')}>
              <Popconfirm
                key="delete"
                title="确定删除吗?"
                onConfirm={async () => deleteAction(row.id)}
                okText="确定"
                cancelText="取消"
              >
                <a>删除</a>
              </Popconfirm>
            </Access>,
          );
        }
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
        <ProTable<TableListItem>
          columns={columns}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          params={{
            tabActiveKey,
          }}
          actionRef={ref}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          rowSelection={{
            fixed: true,
            defaultSelectedRowKeys: selectRows,
            onChange: (selectedRowKeys: any, rowItems: any) => {
              setSelectedItems(rowItems);
              setSelectRows(selectedRowKeys);
            },
          }}
          rowKey="id"
          search={{ defaultCollapsed: false, className: 'light-search-form' }}
          dateFormatter="string"
          headerTitle={false}
          toolBarRender={() => [
            <Space key="space">
              <Access key="printButton" accessible={access.canSee('askAction_print_list')}>
                <Button
                  key="print"
                  type="primary"
                  ghost
                  icon={<ReconciliationOutlined />}
                  onClick={() => {
                    print();
                  }}
                >
                  批量打印
                </Button>
              </Access>
              <Access key="cancel" accessible={access.canSee('askAction_payment')}>
                <Button
                  onClick={batchPayAction}
                  type="primary"
                  ghost
                  loading={payLoading}
                  disabled={!selectRows.length}
                >
                  批量确认付款
                </Button>
              </Access>
              <Access key="exportButton" accessible={access.canSee('askAction_export')}>
                <Button
                  key="export"
                  type="primary"
                  ghost
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    exportTemp();
                  }}
                  disabled={downLoading}
                  loading={downLoading}
                >
                  导出明细
                </Button>
              </Access>
            </Space>,
          ]}
        />
      </PageContainer>
      <HandleAction aduitNoModel={aduitModel} handleClose={modalClose} />
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

import { PageContainer } from '@ant-design/pro-layout';
import { connect, history, useActivate } from 'umi';
import { useState, useRef } from 'react';
import { Button, Space, Spin } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/reconciliation/askAction';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  getBookmarks,
  getSysBusinessDeductionPage,
  deleteSysBusinessDeduction,
} from '@/services/pages/reconciliationDeduction';
import { pubConfig, pubMsg, pubFilter, pubModal } from '@/utils/pubConfig';
import { IsGrey, pubGetVendorList } from '@/utils/pubConfirm';
import { dateFormat, priceValue } from '@/utils/filter';
import Add from './Dialog/Add';
import './style.less';
import { useAccess, Access } from 'umi';

const Account = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const [loading, setLoading] = useState(false);
  const [tabActiveKey, tabActiveKeySet] = useState('-1');
  const [tabList, setTabList] = useState([{ tab: '全部(0)', key: '-1' }]);

  const ref = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();
  // 添加弹窗实例
  const addModel = useRef();
  // 添加
  const addModelOpen: any = (id?: any) => {
    const data: any = addModel?.current;
    data.open(id);
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
      start_time: params?.time?.[0] ? params?.time?.[0] : null, //开始日期
      end_time: params?.time?.[1] ? params?.time?.[1] : null, //结束日期
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await getSysBusinessDeductionPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
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

  // 删除
  const delItem = (id: string) => {
    pubModal('是否确认删除扣款单？')
      .then(async () => {
        setLoading(true);
        const res = await deleteSysBusinessDeduction({
          ids: id,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('删除成功', 'success');
          ref?.current?.reload();
        }
        setLoading(false);
      })
      .catch(() => {
        console.log('点了取消');
      });
  };
  // 表格配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '扣款单号',
      dataIndex: 'deduction_no',
      width: 130,
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '供应商',
      dataIndex: 'vendor_id',
      valueType: 'select',
      hideInTable: true,
      fieldProps: selectProps,
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
    },
    {
      title: '扣款类型',
      dataIndex: 'business_type',
      width: 100,
      valueType: 'select',
      align: 'center',
      valueEnum: dicList?.BUSINESS_DEDUCTION_BUSINESS_TYPE,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.BUSINESS_DEDUCTION_BUSINESS_TYPE, record.business_type);
      },
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '扣款状态',
      dataIndex: 'approval_status',
      width: 130,
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.PURCHASE_ORDER_DEDUCTION_STATUS, record.approval_status);
      },
    },
    {
      title: '申请扣款金额',
      dataIndex: 'amount',
      width: 100,
      hideInSearch: true,
      align: 'center',
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.amount);
      },
    },
    {
      title: '申请人',
      dataIndex: 'create_user_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '申请日期',
      dataIndex: 'create_time',
      align: 'center',
      width: 100,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return dateFormat(record.create_time);
      },
    },
    {
      title: '申请日期',
      dataIndex: 'time',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: '扣款原因',
      dataIndex: 'reason',
      width: 100,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 120,
      align: 'center',
      valueType: 'option',
      render: (_, row) => {
        const renderList = [];
        if (row.approval_status == '1') {
          renderList.push(
            <Access key="delButton" accessible={access.canSee('sysBusinessDeduction_delete')}>
              <a
                onClick={() => {
                  delItem(row.id);
                }}
                key="del"
              >
                删除
              </a>
            </Access>,
            <Access key="editButton" accessible={access.canSee('sysBusinessDeduction_update')}>
              <a
                onClick={() => {
                  history.push(`/reconciliation-manage/deduction-edit?id=${row.id}`);
                }}
                key="edit"
              >
                编辑
              </a>
            </Access>,
          );
        } else {
          renderList.push(
            <Access key="detailButton" accessible={access.canSee('sysBusinessDeduction_detail')}>
              <a
                onClick={() => {
                  history.push(`/reconciliation-manage/deduction-detail?id=${row.id}`);
                }}
                key="detail"
              >
                详情
              </a>
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
        <Spin spinning={loading}>
          <ProTable<TableListItem>
            columns={columns}
            options={{ fullScreen: true, setting: false }}
            pagination={{
              showSizeChanger: true,
            }}
            actionRef={ref}
            formRef={formRef}
            tableAlertRender={false}
            tableAlertOptionRender={false}
            request={getListAction}
            rowKey="id"
            search={{ defaultCollapsed: false, className: 'light-search-form' }}
            dateFormatter="string"
            headerTitle={false}
            toolBarRender={() => [
              <Space key="space">
                <Access key="addButton" accessible={access.canSee('sysBusinessDeduction_add')}>
                  <Button
                    key="back"
                    type="primary"
                    onClick={() => {
                      addModelOpen();
                    }}
                  >
                    创建扣款单
                  </Button>
                </Access>
              </Space>,
            ]}
          />
          <Add addModel={addModel} handleClose={modalClose} />
        </Spin>
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

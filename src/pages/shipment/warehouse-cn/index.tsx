import { PageContainer } from '@ant-design/pro-layout';
import { Access, connect, useAccess } from 'umi';
import React, { useEffect, useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubModal, pubMsg } from '@/utils/pubConfig';
import { getList, syn, unbinding } from '@/services/pages/shipment/warehousecN';
import Update from './Dialogs/Update';
import { Button, Popconfirm, Space } from 'antd';
import CommonLogAms from '@/components/CommonLogAms';
import QMUpdate from './Dialogs/QMUpdate';

const Page = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const [tabList, setTabList] = useState<any>([]);
  const [pageSize, setPageSize] = useState<any>(20);
  const [tabStatus, setTabStatus] = useState('JD');
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const access = useAccess();
  const _ref: any = useRef();
  const _refL: any = useRef();
  const _refQ: any = useRef();
  const [confirmLoading, setConfirmLoading] = useState(false);
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      platform_code: tabStatus,
      status: Number(params.status),
      current_page: params?.current,
      page_size: params?.pageSize,
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
  useEffect(() => {
    setTabList([
      ...Object.values(dicList?.ORDER_DELIVERY_PLATFORM || {}).map((v: any) => {
        return {
          key: v?.detail_code,
          tab: v?.detail_name,
        };
      }),
    ]);
  }, [dicList]);
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });
  // 同步
  const synchronizationAction = async () => {
    pubModal('是否确定同步仓库数据?')
      .then(async () => {
        setConfirmLoading(true);
        const res: any = await syn({});
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('同步成功', 'success');
          ref?.current?.reload();
        }
        setConfirmLoading(false);
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  const unbindingAction = async (id: string) => {
    const res: any = await unbinding({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功', 'success');
      ref?.current?.reload();
    }
  };
  const columns: ProColumns<any>[] = [
    {
      title: 'NO.',
      valueType: 'index',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '发货平台',
      dataIndex: 'platform_code',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.ORDER_DELIVERY_PLATFORM, record?.platform_code) || '-';
      },
    },
    {
      title: '仓库代码',
      dataIndex: 'warehouse_code',
      align: 'center',
    },
    {
      title: '仓库名称',
      dataIndex: 'warehouse_name',
      align: 'center',
    },
    {
      title: '签约公司',
      dataIndex: 'signing_company',
      align: 'center',
      hideInSearch: true,
      hideInTable: ['HUIYE', 'YUNCANG'].includes(tabStatus),
    },
    {
      title: '快递',
      dataIndex: 'express',
      align: 'center',
      hideInSearch: true,
      hideInTable: tabStatus != 'HUIYE',
    },
    {
      title: '启用状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: dicList.SYS_ENABLE_STATUS,
      align: 'center',
      width: 100,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.SYS_ENABLE_STATUS, record?.status) || '-';
      },
    },

    {
      title: '操作',
      key: 'option',
      width: 230,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      className: 'wrap',
      render: (_: any, record: any) => {
        return [
          <Access key="edit" accessible={access.canSee('order_warehouse-cn_edit')}>
            <a
              onClick={() => {
                _ref.current.visibileChange(true, record);
              }}
            >
              编辑
            </a>
          </Access>,
          <Access key="log" accessible={access.canSee('order_warehouse-cn_log')}>
            <a
              onClick={() => {
                _refL.current.visibileChange(true, record?.id);
              }}
            >
              操作日志
            </a>
          </Access>,
        ];
      },
    },
  ];
  const columnsC: ProColumns<any>[] = [
    {
      title: 'NO.',
      valueType: 'index',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '仓库名称',
      dataIndex: 'warehouse_name',
      align: 'center',
    },
    {
      title: '仓库代码',
      dataIndex: 'warehouse_code',
      align: 'center',
    },
    {
      title: '仓库类型',
      dataIndex: 'category',
      valueType: 'select',
      align: 'center',
      hideInSearch: true,
      width: 120,
      render: (_: any, record: any) => {
        return pubFilter(common.dicList.SYS_PLATFORM_WAREHOUSING_CATEGORY, record.category);
      },
      hideInTable: ['QIMEN_YUNCANG'].includes(tabStatus),
    },
    {
      title: '仓库联系人',
      dataIndex: 'contacts',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '联系人电话',
      dataIndex: 'phone',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '仓库详细地址',
      dataIndex: 'complete_address',
      align: 'left',
      hideInSearch: true,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '支持快递',
      dataIndex: 'express',
      align: 'center',
      hideInSearch: true,
      hideInTable: ['QIMEN_YUNCANG'].includes(tabStatus),
    },
    {
      title: '启用状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: dicList.SYS_ENABLE_STATUS,
      align: 'center',
      width: 100,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.SYS_ENABLE_STATUS, record?.status) || '-';
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      editable: false,
      align: 'center',
      fixed: 'right',
      hideInTable: !['QIMEN_YUNCANG'].includes(tabStatus),
      render: (text: any, record: any) => [
        <Access key="edit" accessible={access.canSee('order_warehouse-cn_edit')}>
          <a
            onClick={() => {
              _refQ.current.visibileChange(true, { ...record, handleType: 'edit' });
            }}
          >
            编辑
          </a>
        </Access>,
        <Access key="bind" accessible={access.canSee('order_warehouse-cn_binding')}>
          <a
            onClick={() => {
              _refQ.current.visibileChange(true, { ...record, handleType: 'bind' });
            }}
          >
            绑定
          </a>
        </Access>,
        <Access key="unbind" accessible={access.canSee('order_warehouse-cn_unbinding')}>
          <Popconfirm
            key="bindCancel"
            title="确认解绑吗？"
            onConfirm={() => {
              unbindingAction(record.id);
            }}
          >
            <a>解绑</a>
          </Popconfirm>
        </Access>,
      ],
    },
  ];
  // 切换tabs时
  const changeTabs = async (key: any) => {
    setTabStatus(key);
    setPageSize(20);
  };

  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
        fixedHeader
        tabActiveKey={tabStatus || 'JD'}
        className="pubPageTabs"
        tabList={tabList}
        onTabChange={changeTabs}
      >
        <ProTable
          sticky={{ offsetHeader: 96 }}
          columns={['YUNCANG', 'QIMEN_YUNCANG'].includes(tabStatus) ? columnsC : columns}
          actionRef={ref}
          params={{ tabStatus }}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
            pageSize,
            onChange: (page, size) => {
              setPageSize(size);
            },
          }}
          headerTitle={
            <Space size={20}>
              <Access
                key="edit"
                accessible={
                  !['YUNCANG'].includes(tabStatus) && access.canSee('order_warehouse-cn_add')
                }
              >
                <Button
                  type="primary"
                  onClick={() => {
                    if (tabStatus == 'QIMEN_YUNCANG') {
                      _refQ.current.visibileChange(true);
                    } else {
                      _ref.current.visibileChange(true);
                    }
                  }}
                >
                  新增
                </Button>
              </Access>
              <Access
                key="approval"
                accessible={tabStatus == 'YUNCANG' && access.canSee('order_warehouse-cn_sync')}
              >
                <Button
                  loading={confirmLoading}
                  onClick={() => {
                    synchronizationAction();
                  }}
                >
                  同步仓库数据
                </Button>
              </Access>
            </Space>
          }
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          scroll={{ x: 1500 }}
          rowKey="id"
          dateFormatter="string"
          revalidateOnFocus={false}
        />
        <Update
          _ref={_ref}
          reload={ref?.current?.reload}
          dicList={common.dicList}
          tabStatus={tabStatus}
        />
        <QMUpdate
          _ref={_refQ}
          reload={ref?.current?.reload}
          common={common}
          tabStatus={tabStatus}
        />
        <CommonLogAms dicList={common?.dicList} _ref={_refL} />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

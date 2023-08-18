import { PageContainer } from '@ant-design/pro-layout';
import { connect, useAccess, Access } from 'umi';
import { useState, useRef } from 'react';
import { Button, Space, Switch } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { StopOutlined } from '@ant-design/icons';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import { getList } from '@/services/pages/account';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import { pubGetVendorList } from '@/utils/pubConfirm';
import ChangePassword from './ChangePassword';
import { pubModal } from '@/utils/pubConfig';

const Account = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const access = useAccess();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
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
  const [state, setState] = useState({
    selectRows: [], // 表格选中数据
  });
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
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  // 重置密码
  // const resetPassword = (ids: any): any => {
  //   pubModal('确定重置密码吗','',{
  //     icon: <ExclamationCircleOutlined />,
  //     okText: '确认',
  //     cancelText: '取消',
  //   }).then( () => {
  //     props.dispatch({
  //       type: 'account/resetAction',
  //       payload: { ids: ids.join(',') },
  //       callback: (res: boolean) => {
  //         if (res) {
  //           pubMsg('重置成功', 'success');
  //           ref?.current?.clearSelected();
  //           ref?.current?.reload();
  //         }
  //       },
  //     });
  //   })
  //   .catch(() => {
  //     console.log('点了取消');
  //   });
  // };
  // 禁用账号
  const disableAccount = (ids: any): any => {
    pubModal('确定禁用该账号吗?')
      .then(async () => {
        props.dispatch({
          type: 'account/disabledAction',
          payload: { ids: ids.join(',') },
          callback: (res: boolean) => {
            if (res) {
              pubMsg(ids?.length > 1 ? '批量禁用成功' : '禁用成功', 'success');
              ref?.current?.reload();
              ref?.current?.clearSelected();
            }
          },
        });
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 启用账号
  const enableAccount = (ids: any): any => {
    pubModal('确定启用该账号吗?')
      .then(async () => {
        props.dispatch({
          type: 'account/enableAction',
          payload: { ids: ids.join(',') },
          callback: (res: boolean) => {
            if (res) {
              pubMsg('启用成功', 'success');
              ref?.current?.reload();
            }
          },
        });
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 启用禁用数据
  const updateStatusAction = (val: boolean, id: string) => {
    if (val) {
      enableAccount([id]);
    } else {
      disableAccount([id]);
    }
  };
  // keepAlive页面激活钩子函数
  useActivate(() => {
    ref?.current?.reload();
  });
  // 表格配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '供应商名称',
      dataIndex: 'vendor_id',
      align: 'center',
      fieldProps: selectProps,
      valueType: 'select',
      hideInTable: true,
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
    },
    {
      title: '供应商名称',
      dataIndex: 'vendor_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '供应商登录账号',
      dataIndex: 'user_name',
      hideInSearch: true,
      align: 'center',
      render: (_, record) => <span>{record?.user_name || record?.user_mobile}</span>,
    },
    {
      title: '是否主账号',
      dataIndex: 'user_type',
      valueType: 'select',
      fieldProps: selectProps,
      align: 'center',
      valueEnum: dicList.SC_YES_NO,
      render: (_: any, record: any) => {
        return pubFilter(dicList.SC_YES_NO, record.user_type);
      },
    },
    {
      title: '使用状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: dicList.SYS_ENABLE_STATUS,
      fieldProps: selectProps,
      align: 'center',
      render: (_, record) => {
        return access.canSee('account_change_status') ? (
          <Switch
            onChange={(val) => updateStatusAction(val, record.id)}
            checkedChildren="正常"
            unCheckedChildren="禁用"
            checked={record.status == 1 ? true : false}
          />
        ) : (
          pubFilter(dicList.SYS_ENABLE_STATUS, record.status)
        );
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 220,
      align: 'center',
      valueType: 'option',
      hideInTable: !access.canSee('account_reset'),
      render: (_, row) => [
        <ChangePassword
          key="resetSingle"
          ids={[row.id]}
          trigger={<a>重置密码</a>}
          reload={() => ref?.current?.reload()}
        />,
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
          rowSelection={
            access.canSee('account_batch_disabled') || access.canSee('account_batch_reset')
              ? {
                  onChange: (selectedRowKeys) =>
                    setState((pre: any) => {
                      return { ...pre, selectRows: selectedRowKeys };
                    }),
                }
              : false
          }
          rowKey={(record: any) => record.id + '__' + record.auth_status}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          dateFormatter="string"
          headerTitle="供应商登录账号"
          toolBarRender={() => [
            <Space key="space">
              <Access key="disabled" accessible={access.canSee('account_batch_disabled')}>
                <Button
                  key="disabled"
                  disabled={!state.selectRows.length}
                  onClick={() => {
                    disableAccount(state.selectRows.map((item: string) => item?.split('__')[0]));
                  }}
                  icon={<StopOutlined />}
                >
                  批量禁用
                </Button>
              </Access>

              <Access key="reset" accessible={access.canSee('account_batch_reset')}>
                <ChangePassword
                  key="resetSingle"
                  ids={state.selectRows.map((item: string) => item?.split('__')[0])}
                  trigger={<Button disabled={!state.selectRows.length}>批量重置</Button>}
                  reload={() => ref?.current?.reload()}
                />
              </Access>
            </Space>,
          ]}
        />
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

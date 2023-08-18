import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import React, { useMemo, useRef, useState } from 'react';
import { Tag, Space } from 'antd';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import AddPermission from './AddPermission';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { configPage } from '@/services/pages/settinsPermission';
import { pubGetVendorGroupTree } from '@/utils/pubConfirm';
import { useAccess, Access } from 'umi';
import './style.less';
import EditBatch from './Dialogs/EditBatch';
import ShopPermissionBatch from './Dialogs/ShopPermissionBatch';
import ShopPermission from './ShopPermission';
import TagBatch, { enumRangeType } from './Dialogs/TagBatch';
import SyncTagUser from './Dialogs/SyncTagUser';
import ViewAuth from './Dialogs/ViewAuth';
import PlatStore from '@/components/PubForm/PlatStore';

// 颜色
const colors: string[] = [
  'pink',
  'blue',
  'green',
  'gold',
  'volcano',
  'cyan',
  'purple',
  'lime',
  'geekblue',
  'red',
];
// 数据权限 - 列表页
const PageAuthority = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const access = useAccess();
  const [productLines, setProductLines] = useState<any[]>([]);
  const [selectedRowKeys, selectedRowKeysSet] = useState<React.Key[]>([]);
  const [selectedUsers, selectedUsersSet] = useState<Record<string, any>[]>([]);
  const [selectedUser, selectedUserSet] = useState<Record<string, any>>({});
  const [openShopPermission, openShopPermissionSet] = useState<boolean>(false);

  // 添加弹窗实例
  const addPermissionModel = useRef();
  // 新增弹窗 编辑弹窗
  const addPermissionModelOpen: any = (row: any) => {
    selectedUserSet(row);
    const data: any = addPermissionModel?.current;
    data.open(row?.user_id);
  };
  // 弹窗关闭
  const modalClose = (data: any) => {
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
  };
  // 获取产品线数组
  const getProductLines = async (): Promise<any> => {
    const res: any = await pubGetVendorGroupTree(dicList.SYS_BUSINESS_SCOPE);
    setProductLines(res);
  };

  const getListAction = async (params: any): Promise<any> => {
    const res = await configPage(params);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    getProductLines();
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        title: '员工姓名',
        dataIndex: 'name',
        hideInSearch: true,
        width: 70,
      },
      {
        title: '帐号/姓名',
        dataIndex: 'key',
        hideInTable: true,
        align: 'center',
      },
      {
        title: '帐号',
        dataIndex: 'account',
        hideInSearch: true,
        width: 90,
      },
      {
        title: '职位',
        dataIndex: 'position',
        width: 70,
      },
      {
        title: '产品线范围',
        dataIndex: ['sysDataAuthorityConfig', 'range_type'],
        width: 90,
        align: 'center',
        valueType: 'select',
        valueEnum: enumRangeType,
        render: (_: any, record: any) => {
          const range_type = record?.sysDataAuthorityConfig?.range_type;
          if (!range_type) {
            return <span title={'未设置产品线范围'}> </span>;
          } else if (range_type == '-') {
            return <span title={'该员工无任何产品线范围'}>-</span>;
          }
          return <Tag color={range_type == 'CN' ? 'cyan' : 'blue'}>{range_type}</Tag>;
        },
        search: {
          transform: (val) => ({ range_type: val }),
        },
      },
      {
        title: '账号状态',
        dataIndex: 'status',
        align: 'center',
        width: 70,
        valueEnum: dicList?.SYS_USER_STATUS || {},
      },
      {
        title: '产品线',
        dataIndex: 'vendor_group_id',
        align: 'center',
        search: false,
        render: (_, row) => {
          const newArray = productLines.map((item: any) => {
            return {
              ...item,
              children: row?.sysDataAuthorityConfig
                ? item.children.filter((k: any) => {
                    return row?.sysDataAuthorityConfig?.vendor_group_id?.indexOf(k.value) > -1;
                  })
                : [],
            };
          });
          return newArray.length
            ? newArray.map((val: any, index: number) => {
                return val?.children.length ? (
                  <div className="productLine-item" key={val.label}>
                    <div className="vendor-group-title">{val.label}:</div>
                    <div className="vendor-group-content">
                      {val.children.map((k: any) => {
                        return (
                          <Tag color={index ? 'blue' : 'cyan'} key={k.id + k.value}>
                            {k.label}
                          </Tag>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })
            : '';
        },
      },
      {
        title: '店铺',
        dataIndex: 'shop_id',
        align: 'center',
        renderFormItem: () => <PlatStore />,
        search: {
          transform: (val: any[]) => ({
            platform_id: val[0], // 平台
            shop_id: val[1], // 店铺
          }),
        },
        render: (_, record) => {
          if (record.shopMap) {
            return Object.keys(record.shopMap).map((key, index) => {
              const items = record.shopMap[key];
              return (
                <div key={key} className="productLine-item">
                  <span className="vendor-group-title" style={{ minWidth: 64 }}>
                    {key}:{' '}
                  </span>
                  <span className="vendor-group-content">
                    {items.map((item: any) => (
                      <Tag color={colors[index]} key={item.id}>
                        {item.shop_name}
                      </Tag>
                    ))}
                  </span>
                </div>
              );
            });
          }
          return '-';
        },
      },
      {
        title: '操作',
        key: 'option',
        width: 50,
        align: 'center',
        valueType: 'option',
        render: (_, row) => (
          <Space direction={'vertical'}>
            <Access accessible={access.canSee('permission_edit')}>
              <a
                onClick={() => {
                  addPermissionModelOpen(row);
                }}
              >
                编辑数据权限
              </a>
            </Access>
            <Access accessible={access.canSee('scm_authShop')}>
              <a
                onClick={() => {
                  selectedUserSet(row);
                  openShopPermissionSet(true);
                }}
              >
                编辑店铺权限
              </a>
            </Access>
          </Space>
        ),
      },
    ],
    [productLines],
  );

  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        {/*编辑数据权限*/}
        <AddPermission
          user={selectedUser}
          addPermissionModel={addPermissionModel}
          handleClose={modalClose}
        />
        {/*编辑店铺权限*/}
        <ShopPermission
          reload={ref.current?.reload}
          user={selectedUser}
          open={openShopPermission}
          openSet={openShopPermissionSet}
        />
        <ProTable
          bordered
          columns={columns}
          actionRef={ref}
          request={getListAction}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          options={{ fullScreen: true, setting: false }}
          sticky={{ offsetHeader: 48 }}
          rowKey="id"
          search={{
            defaultCollapsed: false,
            className: 'light-search-form',
            labelWidth: 90,
          }}
          dateFormatter="string"
          pagination={{ defaultPageSize: 10 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys, records) => {
              selectedRowKeysSet(keys);
              selectedUsersSet(records);
            },
          }}
          headerTitle={
            <Space>
              <Access accessible={access.canSee('scm_authorityEditBatch')}>
                {/*数据权限批量调整*/}
                <EditBatch
                  defaultSelectedUsers={selectedUsers}
                  dicList={dicList}
                  reload={ref?.current?.reload}
                  resetSelect={() => {
                    selectedRowKeysSet([]);
                    selectedUsersSet([]);
                  }}
                />
              </Access>
              <Access accessible={access.canSee('scm_authShopBatch')}>
                {/*批量设置店铺权限*/}
                <ShopPermissionBatch
                  defaultSelectedUsers={selectedUsers}
                  reload={ref?.current?.reload}
                  resetSelect={() => {
                    selectedRowKeysSet([]);
                    selectedUsersSet([]);
                  }}
                />
              </Access>
              <Access accessible={access.canSee('scm_authorityStaffFromLine')}>
                {/*查看产品线员工*/}
                <ViewAuth productLines={productLines} />
              </Access>
              <Access accessible={access.canSee('scm_authorityTagLine')}>
                {/*标记产品线范围*/}
                <TagBatch
                  defaultSelectedUsers={selectedUsers}
                  reload={() => {
                    ref?.current?.reload();
                    selectedRowKeysSet([]);
                    selectedUsersSet([]);
                  }}
                />
              </Access>
              <Access accessible={access.canSee('scm_authoritySyncLine')}>
                {/*同步产品线*/}
                <SyncTagUser reload={ref?.current?.reload} />
              </Access>
            </Space>
          }
        />
      </PageContainer>
    </>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(PageAuthority);
export default ConnectPage;

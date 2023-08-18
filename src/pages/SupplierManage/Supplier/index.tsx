import { PageContainer } from '@ant-design/pro-layout';
import { connect, Link, useAccess, Access, history } from 'umi';
import { useState, useRef } from 'react';
import { Button, Modal, Popconfirm, Table, Card, Tooltip } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { TableListItem } from '@/types/supplier';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { deleteByIds, getList, findByVendorId } from '@/services/pages/supplier';
import { pubAlert, pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { getUuid, pubGetUserList } from '@/utils/pubConfirm';
import AddSupplier from './AddSupplier';
import Dialog from './Dialog';
import ProductLine from '@/components/PubForm/ProductLine';
import ForbidCoop from './components/ForbidCoop';
import SuspendCoop from './components/SuspendCoop';
import Cancel from './components/Cancel';
import SupplerLevel from './components/SupplerLevel';

const Supplier = (props: any) => {
  const access = useAccess();
  const { supplier, common } = props;
  const { dicList, cityData2 } = common;
  console.log(cityData2)
  const [tempKey, setTempKey] = useState(getUuid());
  const [selectItems, setSelectItems] = useState<any>([]);
  const formRef = useRef<ProFormInstance>();
  const ref: any = useRef<ActionType>();
  const _ref: any = useRef();
  const [state, setState] = useState({
    selectTreeKey: '0-0-0',
    isModalVisible: false,
    dialogForm: {}, // 弹窗表单
    proLineList: [],
    vendor_group_id: null,
    id: null,
    title: null,
    footer: true,
    width: 1000,
  });
  // keepAlive页面激活钩子函数
  useActivate(() => {
    console.log(tempKey);
    setTempKey(getUuid());
    setState((pre) => {
      return { ...pre, isModalVisible: false, changeShow: false };
    });
    if (ref?.current) ref?.current?.reload();
  });
  // 获取人
  const pubGetUserListAction = async (v: any): Promise<any> => {
    const res: any = await pubGetUserList(v);
    return res?.map((item: any) => ({ ...item, value: item.name })) || [];
  };
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      selectTreeKey: state.selectTreeKey === '0-0-0' ? null : state.selectTreeKey,
      begin_create_time: params.time && params.time[0] ? `${params.time[0]} 00:00:00` : null,
      end_create_time: params.time && params.time[1] ? `${params.time[1]} 23:59:59` : null,
      // vendor_group_id: state.vendor_group_id,
      business_scope: params.category_data ? params.category_data?.[0] : null, //业务范畴
      vendor_group_id: params?.category_data?.[1] ? params?.category_data?.[1]?.split(',') : null, //产品线
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
  // 新增供应商
  const supplierUpdate: any = (row: { code: string | undefined }) => {
    console.log(row);
    setState((pre: any) => {
      return {
        ...pre,
        dialogForm: {},
        isModalVisible: true,
      };
    });
  };
  // 添加弹窗关闭
  const handleClose = (cancel: any) => {
    if (!cancel) {
      setTempKey(getUuid());
    }
    setTimeout(() => {
      setState((pre) => {
        return { ...pre, isModalVisible: false };
      });
    }, 20);
  };
  // 公共弹窗关闭
  const dialogClose = () => {
    _ref?.current?.modalChange();
    ref?.current?.reload();
    ref?.current?.clearSelected();
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

  // 删除
  const deleteAction = async (id: string) => {
    const res = await deleteByIds({ ids: id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功', 'success');
      ref?.current?.reload();
    }
  };
  // 编辑按钮：新建(未合作)；审批不通过；审批通过(合作中,临时合作,暂停合作,禁止合作); 撤销（未合作,合作中,临时合作,暂停合作,禁止合作}
  const canEditHandle = (record: any) => {
    return (
      ((record.approval_status == '5' || record.approval_status == null) &&
        record.vendor_status == '0') ||
      record.approval_status == '3' ||
      (record.approval_status == '2' && ['1', '2', '3', '4'].includes(record.vendor_status)) ||
      (record.approval_status == '4' && ['0', '1', '2', '3', '4'].includes(record.vendor_status))
    );
  };
  // 撤回按钮： 审批中所有；
  const canCancelHandle = (record: any) => {
    return record.approval_status == '1';
  };
  // 删除按钮：撤销（未合作）;新建(未合作);审批不通过(未合作)
  const canDeleteHandle = (record: any) => {
    return (
      (record.approval_status == '4' && record.vendor_status == '0') ||
      ((record.approval_status == '5' || record.approval_status == null) &&
        record.vendor_status == '0') ||
      (record.approval_status == '3' && record.vendor_status == '0')
    );
  };
  // 禁止合作按钮/暂停合作按钮/结算方式变更按钮: 审批不通过（合作中，临时合作）；审批通过(合作中，临时合作)； 撤回(合作中，临时合作)
  const commonForbidSuspendPayHandle = (record: any) => {
    return (
      (record.approval_status == '3' && ['1', '4'].includes(record.vendor_status)) ||
      (record.approval_status == '2' && ['1', '4'].includes(record.vendor_status)) ||
      (record.approval_status == '4' && ['1', '4'].includes(record.vendor_status))
    );
  };
  // 变更开发日志按钮: 审批不通过（合作/临时合作/暂停合作/禁止合作）； 审批通过（合作/临时合作/暂停合作/禁止合作）；已撤回（合作/临时合作/暂停合作/禁止合作）
  const devChangeHandle = (record: any) => {
    return (
      (record.approval_status == '3' && ['1', '4', '3', '2'].includes(record.vendor_status)) ||
      (record.approval_status == '2' && ['1', '4', '3', '2'].includes(record.vendor_status)) ||
      (record.approval_status == '4' && ['1', '4', '3', '2'].includes(record.vendor_status))
    );
  };
  // 查看供应商
  const showVendorInfo = async (vendor: any) => {
    const res = await findByVendorId({ vendor_id: vendor.id, current_page: 1, page_size: 999 });
    if (res?.code == pubConfig.sCode) {
      Modal.info({
        icon: null,
        width: 800,
        bodyStyle: { padding: '10px' },
        content: (
          <Card title={`${vendor.name} - 供应商登录帐户`}>
            <div style={{ marginBottom: '4px' }}>
              公章授权状态为已授权方可进行线上电子签约，公章授权前需完成实名认证
            </div>
            <Table
              dataSource={res?.data?.records || []}
              pagination={false}
              columns={[
                {
                  title: '手机号(用户名)',
                  dataIndex: 'user_mobile',
                  align: 'center',
                },
                {
                  title: '是否主账号',
                  dataIndex: 'user_type',
                  align: 'center',
                  render: (_: any) => pubFilter(dicList.SC_YES_NO, _),
                },
                {
                  title: '实名认证状态',
                  dataIndex: 'auth_status',
                  align: 'center',
                  render: (_: any) => (
                    <span className={[0, 2].includes(Number(_)) ? 'text-red' : ''}>
                      {pubFilter(dicList.USER_AUTH_STATUS, _)}
                    </span>
                  ),
                },
                {
                  title: '公章授权状态',
                  dataIndex: 'signature_status',
                  align: 'center',
                  render: (_: any) => (
                    <span className={[0, 2].includes(Number(_)) ? 'text-red' : ''}>
                      {pubFilter(dicList.VENDOR_USER_SIGNATURE_STATUS, _)}
                    </span>
                  ),
                },
                {
                  title: '账号状态',
                  dataIndex: 'status',
                  align: 'center',
                  render: (_: any) => (
                    <span className={[0].includes(Number(_)) ? 'text-gray' : ''}>
                      {pubFilter(dicList.SYS_ENABLE_STATUS, _)}
                    </span>
                  ),
                },
              ]}
            />
          </Card>
        ),
      });
    } else {
      pubMsg(res?.message);
    }
  };
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '供应商代码',
      dataIndex: 'code',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '供应商名称',
      dataIndex: 'name',
      align: 'center',
      order: 5,
      render: (dom: any, row) => {
        return <Link to={`/supplier-manage/detail-basic?id=${row?.id}`}>{dom}</Link>;
      },
    },
    {
      title: '工厂所在地',
      dataIndex: 'factory_province',
      align: 'center',
      valueType: 'select',
      fieldProps: {
        ...selectProps,
        options: cityData2.map((v: any) => ({
          value: v.label,
          label: v.label
        })),
      }
    },
    {
      title: '业务范畴',
      dataIndex: 'business_scope',
      align: 'center',
      valueType: 'select',
      valueEnum: supplier.businessList,
      fieldProps: selectProps,
      order: 4,
      hideInSearch: true,
      render: (_, record: any) => {
        return [
          <span key="business_scope">
            {record.business_scope == 'CN' ? '国内' : record.business_scope == 'IN' ? '跨境' : '-'}
          </span>,
        ];
      },
    },
    {
      title: '产品线',
      dataIndex: 'category_data',
      hideInTable: true,
      order: 10,
      renderFormItem: (_, rest, form) => {
        return (
          <ProductLine
            back={(v: any) => {
              form.setFieldsValue({ category_data: v });
            }}
          />
        );
      },
    },
    {
      title: (
        <>
          供应商帐户
          <Tooltip
            placement="top"
            title="供应商登录账户，可以查询到供应商的登录账户的认证信息和授权信息，必须完成认证且授权公章，才能进行线上电子签约"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'vendorInfo',
      hideInSearch: true,
      render: (_: any, record: any) => <a onClick={() => showVendorInfo(record)}>查看</a>,
      align: 'center',
      width: 120,
    },
    {
      title: '合作状态',
      dataIndex: 'vendor_status',
      valueType: 'select',
      align: 'center',
      fieldProps: selectProps,
      order: 3,
      valueEnum: dicList.VENDOR_COOPERATION_STATUS,
      render: (_, record: any) => {
        const item = dicList.VENDOR_COOPERATION_STATUS;
        const key = record?.vendor_status;
        return [<span key="vendor_status">{item?.[key]?.text || '-'}</span>];
      },
    },

    {
      title: '供应商等级',
      dataIndex: 'vendor_grade',
      valueType: 'select',
      align: 'center',
      fieldProps: selectProps,
      valueEnum: dicList.VENDOR_GRADE,
      render: (_, record: any) => pubFilter(dicList.VENDOR_GRADE, record?.vendor_grade) || '-',
    },
    {
      title: '对接开发',
      dataIndex: 'liability_name',
      align: 'center',
      request: pubGetUserListAction,
      valueType: 'select',
      fieldProps: selectProps,
      order: 4,
    },
    {
      title: '入驻时间',
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
      sorter: (a: any, b: any) =>
        new Date(a.create_time).getTime() - new Date(b.create_time).getTime(),
    },
    {
      title: '入驻时间',
      dataIndex: 'time',
      align: 'center',
      valueType: 'dateRange',
      hideInTable: true,
      order: 1,
      sorter: (a: any, b: any) =>
        new Date(a.create_time).getTime() - new Date(b.create_time).getTime(),
    },

    {
      title: '审核状态',
      dataIndex: 'approval_status',
      valueType: 'select',
      fieldProps: selectProps,
      align: 'center',
      order: 2,
      valueEnum: () => {
        // console.log(dicList.VENDOR_APPROVAL_STATUS);
        const items = dicList.VENDOR_APPROVAL_STATUS
          ? JSON.parse(JSON.stringify(dicList.VENDOR_APPROVAL_STATUS))
          : [];
        delete items?.['0'];
        return items;
      },
      render: (_, record: any) => {
        const item = dicList.VENDOR_APPROVAL_STATUS;
        const key = record?.approval_status;
        return [<span key="approval_status">{item?.[key]?.text || '-'}</span>];
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 260,
      align: 'center',
      fixed: 'right',
      valueType: 'option',
      className: 'wrap',
      render: (_, row) => [
        <Access key="edit" accessible={access.canSee('supplier_edit') && canEditHandle(row)}>
          <a
            onClick={() => {
              window.sessionStorage.removeItem('SDTB');
              history.push(`/supplier-manage/edit-basic?id=${row?.id}`);
            }}
          >
            编辑
          </a>
        </Access>,

        <Access key="cancel" accessible={access.canSee('supplier_cancel') && canCancelHandle(row)}>
          <Cancel title="撤回" id={row.id} _ref={ref} />
        </Access>,
        <Access key="delete" accessible={access.canSee('supplier_delete') && canDeleteHandle(row)}>
          <Popconfirm
            title="确定删除吗?"
            onConfirm={async () => deleteAction(row.id)}
            okText="确定"
            cancelText="取消"
          >
            <a>删除</a>
          </Popconfirm>
        </Access>,
        <Access
          key="suspend"
          accessible={access.canSee('supplier_suspend_coop') && commonForbidSuspendPayHandle(row)}
        >
          <SuspendCoop dicList={dicList} data={row} title="暂停合作" _ref={ref} />
        </Access>,
        <Access
          key="forbid"
          accessible={access.canSee('supplier_forbid_coop') && commonForbidSuspendPayHandle(row)}
        >
          <ForbidCoop dicList={dicList} data={row} title="禁止合作" _ref={ref} />
        </Access>,
        <Access
          key="liabilitylog"
          accessible={access.canSee('supplier_developer_transfer') && devChangeHandle(row)}
        >
          <a
            onClick={() => {
              _ref?.current?.modalChange();
              setState((pre: any) => {
                return { ...pre, id: row.id, title: '开发变更日志', footer: false, width: 1000 };
              });
            }}
          >
            开发变更日志
          </a>
        </Access>,
        <Access
          key="supplier_level"
          accessible={access.canSee('scm_supplier_level')}
        >
          <SupplerLevel dicList={dicList} data={row} title="供应商等级" _ref={ref} />
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
        <AddSupplier
          dicList={dicList}
          state={state}
          isModalVisible={state.isModalVisible}
          handleClose={handleClose}
          proLineList={state.proLineList}
        />
        <Dialog
          id={state.id}
          mRef={_ref}
          title={state.title}
          footer={state.footer}
          selectItems={selectItems}
          dicList={dicList}
          dialogClose={dialogClose}
          width={state.width}
        />
        <ProTable
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          rowSelection={
            access.canSee('supplier_batch_transfer')
              ? {
                onChange: (selectedRowKeys, selectedRows) => {
                  console.log(selectedRows);
                  setSelectItems(selectedRows);
                },
              }
              : false
          }
          request={getListAction}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          rowKey="id"
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          scroll={{ x: 1200 }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          dateFormatter="string"
          headerTitle={
            <Access
              key="createLink"
              accessible={access.canSee('supplier_create_link')}
            // fallback={<div>--</div>}
            >
              <Button
                key="add"
                onClick={() => {
                  _ref?.current?.modalChange();
                  setState((pre: any) => {
                    return { ...pre, title: '供应商邀请链接', footer: false, width: 600 };
                  });
                }}
                ghost
                type="primary"
              >
                生成邀请链接
              </Button>
            </Access>
          }
          toolBarRender={() => [
            <Access key="change" accessible={access.canSee('supplier_batch_transfer')}>
              <Button
                key="change"
                disabled={!selectItems.length}
                onClick={() => {
                  const length = [...new Set(selectItems.map((v: any) => v.liability_name))]
                    ?.length;
                  if (length != 1) {
                    pubAlert('必须是同一个责任人下的供应商，才可以操作批量变更责任人的功能！');
                  } else {
                    _ref?.current?.modalChange();
                    setState((pre: any) => {
                      return { ...pre, title: '批量变更开发', footer: true, width: 1000 };
                    });
                  }
                }}
                ghost
                type="primary"
              >
                批量变更开发
              </Button>
            </Access>,
            <Access key="add" accessible={access.canSee('supplier_add')}>
              <Button
                onClick={() => {
                  supplierUpdate();
                }}
                ghost
                type="primary"
                icon={<PlusOutlined />}
              >
                添加供应商
              </Button>
            </Access>,
          ]}
        />
      </PageContainer>
    </>
  );
};

const ConnectPage: React.FC = connect(
  ({
    supplier,
    common,
  }: {
    supplier: Record<string, unknown>;
    common: Record<string, unknown>;
  }) => ({
    supplier,
    common,
  }),
)(Supplier);
export default ConnectPage;

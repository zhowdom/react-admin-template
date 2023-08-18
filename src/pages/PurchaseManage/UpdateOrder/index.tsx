import { PageContainer } from '@ant-design/pro-layout';
import { connect, Link, Access, useAccess } from 'umi';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubGetUserList, pubGetVendorList } from '@/utils/pubConfirm';
import { pubAlert, pubConfig, pubFilter, pubModal, pubMsg } from '@/utils/pubConfig';
import OrderTable from './components/OrderTable';
import AuditOptions from './components/AuditOptions';
import { getList, agree, syncVendor, purchaseOrderManualFinish } from '@/services/pages/updateOrder';
import DialogSigning from '../Order/components/dialogSigning';
import DialogSigningR from '../Order/components/dialogSigningR';
import CommonLog from '@/components/CommonLog';
import { getOperationHistory } from '@/services/pages/stockManager';

const Page = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const [selectRows, setSelectRows] = useState([]);
  const access = useAccess();
  const [tabList, setTabList] = useState([{ key: 'all', tab: '全部' }]);
  const [pageSize, setPageSize] = useState<any>(20);
  const [tabStatus, setTabStatus] = useState(null);
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const [selectedItems, setSelectedItems] = useState([]);
  const [modalSigningData, setModalSigningData] = useState<any>({});
  const [modalSigning, setModalSigning] = useState(false);
  const [modalSigningDataR, setModalSigningDataR] = useState<any>({});
  const [modalSigningR, setModalSigningR] = useState(false);
  // 审核通过
  const agreeAction = async (orderId: any[]) => {
    pubModal('确定审批通过?')
      .then(async () => {
        const ids = orderId.join(',');
        const res: any = await agree({ id: ids });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功', 'success');
          ref?.current?.reload();
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 同步到供应商
  const syncVendorAction = async (id: any[]) => {
    pubModal('确定同步至供应商吗?')
      .then(async () => {
        const ids = id.join(',');
        const res: any = await syncVendor({ id: ids });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('同步成功', 'success');
          ref?.current?.reload();
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      approval_status: tabStatus == 'all' ? null : tabStatus ? [tabStatus] : null, //状态
      current_page: params?.current,
      page_size: params?.pageSize,
      begin_create_time:
        params.create_time && params.create_time[0] ? `${params.create_time[0]} 00:00:00` : null,
      end_create_time:
        params.create_time && params.create_time[1] ? `${params.create_time[1]} 23:59:59` : null,
    };
    const res = await getList(postData);
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
  useEffect(() => {
    setTabList([
      { key: 'all', tab: '全部' },
      ...Object.values(dicList?.PURCHASE_ORDER_CHANGE_HISTORY_APPROVAL_STATUS || {}).map(
        (v: any) => {
          return {
            key: v?.detail_code,
            tab: v?.detail_name,
          };
        },
      ),
    ]);
  }, [dicList]);
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });
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
  const handleClose = (cancel?: any) => {
    setModalSigning(false);
    setModalSigningR(false);
    if (cancel) {
      ref?.current?.reload();
    }
  };

  // 强制变更
  const editMyself = async (row: { id: string | undefined }) => {
    pubModal('强制变更，非供应商签约变更，变更单不显示盖章信息，请确认是否继续强制变更！')
      .then(async () => {
        const res = await purchaseOrderManualFinish({ id: row.id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        pubMsg('变更成功!', 'success');
        setTimeout(() => {
          ref?.current?.reload();
        }, 200);
      })
      .catch(() => {
        console.log('点了取消');
      });
  };

  const columns: ProColumns<any>[] = [
    {
      title: '变更单号',
      dataIndex: 'change_order_no',
      align: 'center',
    },
    {
      title: '关联采购单号',
      dataIndex: 'order_no',
      align: 'center',
      render: (_: any, record: any) =>
        access.canSee('updateOrder_detail') ? (
          <Link to={`/purchase-manage/order-detail?id=${record.order_id}`}>
            <span>{record.order_no}</span>
          </Link>
        ) : (
          <span>{record.order_no}</span>
        ),
    },
    {
      title: '变更单状态',
      dataIndex: 'approval_status',
      valueType: 'select',
      align: 'center',
      width: 100,
      hideInSearch: true,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      render: (_: any, record: any) => {
        return (
          pubFilter(
            dicList?.PURCHASE_ORDER_CHANGE_HISTORY_APPROVAL_STATUS,
            record?.approval_status,
          ) || '-'
        );
      },
    },
    {
      title: '供应商',
      dataIndex: 'vendor_id',
      fieldProps: selectProps,
      valueType: 'select',
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
    },
    {
      title: '采购员',
      dataIndex: 'purchaser_id',
      align: 'center',
      request: async (v) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
      valueType: 'select',
      hideInTable: true,
      fieldProps: selectProps,
    },
    {
      title: '采购员',
      dataIndex: 'purchaser_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      hideInTable: true,
    },
    {
      title: 'SKU',
      dataIndex: 'sku_code',
      hideInTable: true,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      valueType: 'dateRange',
      render: (_: any, record: any) => record.create_time,
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
          <Access
            key="cancel"
            accessible={record.approval_status === '5' && access.canSee('updateOrder_cancel')}
          >
            <AuditOptions
              type="withdraw"
              reload={() => ref?.current?.reload()}
              ids={[record.id]}
              selectData={selectedItems}
              approval_status={['5']}
              title="撤回"
            />
          </Access>,
          <Access
            key="confirm"
            accessible={
              record.approval_status === '5' &&
              record.manual_signing == '1' &&
              access.canSee('updateOrder_upload_sign')
            }
          >
            <a
              key="confirm"
              onClick={() => {
                setModalSigning(true);
                setModalSigningData(record);
              }}
            >
              确认已签约
            </a>
          </Access>,
          <Access
            key="confirmR"
            accessible={
              record.approval_status === '5' &&
              record.r_manual_signing == 1 &&
              access.canSee('updateOrder_upload_sign_R')
            }
          >
            <a
              key="confirm"
              onClick={() => {
                setModalSigningR(true);
                setModalSigningDataR(record);
              }}
            >
              上传线下签约合同-R
            </a>
          </Access>,
          <Access
            key="rConfirm"
            accessible={
              record.approval_status === '8' &&
              record.manual_signing == '1' &&
              record.supportR == 1 &&
              access.canSee('updateOrder_upload_sign')
            }
          >
            <a
              key="reUp"
              onClick={() => {
                setModalSigning(true);
                setModalSigningData(record);
              }}
            >
              重新上传签约单
            </a>
          </Access>,
          <Access
            key="rConfirmR"
            accessible={
              record.approval_status === '8' &&
              record.r_manual_signing == 1 &&
              access.canSee('updateOrder_upload_sign_R')
            }
          >
            <a
              key="reUp"
              onClick={() => {
                setModalSigningR(true);
                setModalSigningDataR(record);
              }}
            >
              重新上传线下签约合同-R
            </a>
          </Access>,
          <Access
            key="delete"
            accessible={
              ['2', '3', '4', '6'].includes(record.approval_status) &&
              access.canSee('updateOrder_cancellation')
            }
          >
            <AuditOptions
              type="nullify"
              reload={() => ref?.current?.reload()}
              ids={[record.id]}
              selectData={selectedItems}
              approval_status={['2', '3', '4', '6']}
              title="作废"
            />
          </Access>,
          <Access key="detail" accessible={access.canSee('updateOrder_detail')}>
            <Link to={`/purchase-manage/update-detail?type=detail&id=${record.id}`}>
              变更单详情
            </Link>
          </Access>,
          <Access key="edit_myself" accessible={access.canSee('scm_updateOrder_edit_myself') && ['5'].includes(record.approval_status)}>
            <a
              onClick={() => {
                editMyself(record);
              }}
              key="edit_myself"
            >
              强制变更
            </a>
          </Access>,
          <Access key="updateOrder_log" accessible={access.canSee('scm_updateOrder_log')}>
            <CommonLog
              api={getOperationHistory}
              business_id={record.id}
              dicList={props?.dicList}
            />
          </Access>,
        ];
      },
    },
  ];
  // 切换tabs时
  const changeTabs = async (key: any) => {
    setTabStatus(key == 'all' ? null : key);
    setPageSize(20);
  };
  return (
    <>
      <DialogSigning
        dicList={dicList}
        data={modalSigningData}
        isModalVisible={modalSigning}
        handleClose={handleClose}
        change={true}
      />
      <DialogSigningR
        dicList={dicList}
        data={modalSigningDataR}
        isModalVisible={modalSigningR}
        handleClose={handleClose}
        change={true}
      />
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
        fixedHeader
        tabActiveKey={tabStatus || 'all'}
        className="pubPageTabs"
        tabList={tabList}
        onTabChange={changeTabs}
      >
        <ProTable
          expandable={{
            expandedRowRender: (record: any) => (
              <OrderTable
                value={record.purchaseOrderSkuChangeHistories}
                currency={record.currency}
                dicList={dicList}
                type="both"
                business_scope={record.business_scope}
              />
            ),
          }}
          columns={columns}
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
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          scroll={{ x: 1500, y: 'calc(100vh - 360px)' }}
          rowKey="id"
          dateFormatter="string"
          revalidateOnFocus={false}
          rowSelection={{
            fixed: true,
            onChange: (selectedRowKeys: any, rowItems: any) => {
              setSelectedItems(rowItems);
              setSelectRows(selectedRowKeys);
            },
          }}
          headerTitle={
            <Space size={20}>
              <Access key="approval" accessible={access.canSee('updateOrder_auditing')}>
                <Button
                  disabled={!selectRows.length}
                  onClick={() => {
                    if (selectedItems.every((item: any) => item.approval_status === '2')) {
                      agreeAction(selectRows);
                    } else {
                      pubAlert('只有待审核状态才可以审核,请重新选择采购单！');
                    }
                  }}
                  type="primary"
                  ghost
                >
                  审核通过
                </Button>
              </Access>
              <Access key="reject" accessible={access.canSee('updateOrder_auditing')}>
                <AuditOptions
                  type="refuse"
                  reload={() => ref?.current?.reload()}
                  ids={selectRows}
                  selectData={selectedItems}
                  title="审核不通过"
                  approval_status={['2']}
                  isBatch
                />
              </Access>
              <Access key="sync" accessible={access.canSee('updateOrder_sync')}>
                <Button
                  disabled={!selectRows.length}
                  onClick={() => {
                    if (selectedItems.every((item: any) => item.approval_status === '3')) {
                      syncVendorAction(selectRows);
                    } else {
                      pubAlert('只有审核通过状态才可以同步至供应商,请重新选择采购单！');
                    }
                  }}
                  type="primary"
                  ghost
                >
                  同步至供应商
                </Button>
              </Access>
              <Access key="cancel" accessible={access.canSee('updateOrder_cancel')}>
                <AuditOptions
                  type="withdraw"
                  reload={() => ref?.current?.reload()}
                  ids={selectRows}
                  selectData={selectedItems}
                  title="从供应商撤回"
                  approval_status={['5']}
                  isBatch
                />
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
}))(Page);
export default ConnectPage;

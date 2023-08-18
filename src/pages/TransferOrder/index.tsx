import { PageContainer } from '@ant-design/pro-layout';
import { connect, Access, useAccess } from 'umi';
import React, { useRef, useState } from 'react';
import { Button, Modal, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubFilter, pubAlert } from '@/utils/pubConfig';
import SkuTable from './components/SkuTable';
import Add from './components/Add';
import { cancel, getList, syn, exportExcel } from '@/services/pages/transfer';
import { sysCloudWarehousingCloudPage } from '@/services/pages/storageManage';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { sub } from '@/utils/pubConfirm';
// import Log from './components/Log';

const Page = (props: any) => {
  const { confirm } = Modal;
  const access = useAccess();
  const { common } = props;
  const { dicList } = common;
  // console.log(dicList?.CLOUD_WAREHOUSE_CHANGE_BILL_STATUS);
  const [selectRows, setSelectRows] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [exportForm, setExportForm] = useState<any>({});
  const [loading, setLoading] = useState({
    downLoading: false,
    syncLoading: false,
    cancelLoading: false,
  });
  const ref = useRef<ActionType>();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    setExportForm(postData);
    const res = await getList(postData);
    const refC: any = ref?.current;
    refC?.clearSelected();
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    const newData = res?.data?.records.map((v: any) => ({
      ...v,
      isAbnormal: v.details.find(
        (h: any) => v.bill_status == 0 && sub(h.stockout_nums, h.receive_nums) != 0,
      ),
      details: v.details.map((k: any) => ({
        ...k,
        abnormal_nums: v.bill_status == 0 ? sub(k.stockout_nums, k.receive_nums) : 0,
      })),
    }));
    return {
      data: newData || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  const formRef = useRef<ProFormInstance>();
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });
  const columns: ProColumns<any>[] = [
    {
      title: '状态',
      dataIndex: 'bill_status',
      align: 'center',
      hideInSearch: true,
      width: 100,
      render: (_: any, record: any) => {
        return (
          pubFilter(dicList?.CLOUD_WAREHOUSE_CHANGE_BILL_STATUS, record?.bill_status) || '新建'
        );
      },
    },
    {
      title: '调拨单号',
      dataIndex: 'bill_code',
      align: 'center',
      order: 8,
      width: 130,
    },
    {
      title: '调拨原因',
      dataIndex: 'reason',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '调出仓库',
      dataIndex: 'platform_warehousing_out_id',
      align: 'center',
      order: 7,
      width: 120,
      valueType: 'select',
      hideInTable: true,
      render: (_: any, record: any) => record?.storage_out_name || '-',
      fieldProps: {
        showSearch: true,
      },
      request: async () => {
        const res = await sysCloudWarehousingCloudPage({
          current_page: 1,
          page_size: 999,
          status: 1,
        });
        if (res && res.code == pubConfig.sCode) {
          const data = res.data.records.map((item: any) => ({
            ...item,
            label: item.warehousing_name,
            value: item.id,
          }));
          return data;
        }
        return [];
      },
    },
    {
      title: '调出仓库名称',
      dataIndex: 'platform_warehousing_out_name',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '调出仓库编码',
      dataIndex: 'platform_warehousing_out_code',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '调入仓库',
      dataIndex: 'platform_warehousing_in_id',
      align: 'center',
      order: 6,
      width: 120,
      valueType: 'select',
      render: (_: any, record: any) => record?.storage_in_name || '-',
      fieldProps: {
        showSearch: true,
      },
      hideInTable: true,
      request: async () => {
        const res = await sysCloudWarehousingCloudPage({
          current_page: 1,
          page_size: 999,
          status: 1,
        });
        if (res && res.code == pubConfig.sCode) {
          const data = res.data.records.map((item: any) => ({
            ...item,
            label: item.warehousing_name,
            value: item.id,
          }));
          return data;
        }
        return [];
      },
    },
    {
      title: '调入仓库名称',
      dataIndex: 'platform_warehousing_in_name',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '调入仓库编码',
      dataIndex: 'platform_warehousing_in_code',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      width: 120,
      order: 3,
      align: 'center',
      onCell: () => ({ colSpan: 8, style: { padding: 0 } }),
      className: 'p-table-inTable noBorder',
      render: (_, record: any) => <SkuTable data={record?.details} dicList={dicList} />,
    },
    {
      title: 'SKU',
      dataIndex: 'sku_code',
      width: 120,
      align: 'center',
      hideInSearch: true,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: 'ERP编码',
      dataIndex: 'erp_sku',
      width: 150,
      order: 5,
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },

    {
      title: '条形码',
      dataIndex: 'bar_code',
      width: 150,
      order: 4,
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '计划调拨数量',
      dataIndex: 'nums',
      hideInSearch: true,
      width: 110,
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '调出数量',
      dataIndex: 'stockout_nums',
      hideInSearch: true,
      align: 'center',
      width: 80,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '调入数量',
      dataIndex: 'receive_nums',
      hideInSearch: true,
      align: 'center',
      width: 80,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '异常数量',
      dataIndex: 'abnormal_nums',
      hideInSearch: true,
      align: 'center',
      width: 80,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      valueType: 'dateRange',
      order: 2,
      width: '95px',
      search: {
        transform(value) {
          return {
            begin_create_time: `${value[0]} 00:00:00`,
            end_create_time: `${value[1]} 23:59:59`,
          };
        },
      },
      render: (_: any, record: any) => record.create_time || '-',
    },
    {
      title: '完成时间',
      dataIndex: 'completion_time',
      align: 'center',
      width: '95px',
      valueType: 'dateRange',
      order: 1,
      hideInTable: true,
      search: {
        transform(value) {
          return {
            begin_completion_time: `${value[0]} 00:00:00`,
            end_completion_time: `${value[1]} 23:59:59`,
          };
        },
      },
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      hideInSearch: true,
      width: '100px',
      align: 'center',
    },
    {
      title: '推送时间',
      dataIndex: 'syn_time',
      hideInSearch: true,
      width: '95px',
      align: 'center',
    },
    {
      title: '推送状态',
      dataIndex: 'syn_status',
      hideInSearch: true,
      width: '120px',
      align: 'center',
      render: (_: any, record: any) => {
        return (
          pubFilter(dicList?.CLOUD_WAREHOUSE_CHANGE_BILL_SYN_STATUS, record?.syn_status) || '-'
        );
      },
    },
    {
      title: '最后更新时间',
      dataIndex: 'last_update_time',
      hideInSearch: true,
      width: '95px',
      align: 'center',
    },
    {
      title: '调拨单关闭时间',
      dataIndex: 'close_time',
      hideInSearch: true,
      width: '95px',
      align: 'center',
    },
    // {
    //   title: '操作',
    //   key: 'option',
    //   width: 100,
    //   align: 'center',
    //   valueType: 'option',
    //   fixed: 'right',
    //   className: 'wrap',
    //   render: () => <Log />,
    // },
  ];
  // 关闭/取消
  const cancelAction = async () => {
    if (!selectRows.length) {
      pubAlert('请勾选数据', '', 'warning');
      return;
    }
    if (!selectedItems.every((item: any) => [2, 3].includes(item.bill_status))) {
      pubAlert('关闭失败，只有状态为“待审核/待处理”的调拨单才可关闭', '', 'warning');
      return;
    }
    confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '确定批量关闭吗?',
      async onOk() {
        setLoading((pre) => {
          return {
            ...pre,
            cancelLoading: true,
          };
        });
        const res = await cancel({ ids: selectRows.join(',') });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功', 'success');
          ref?.current?.reload();
        }
        setLoading((pre) => {
          return {
            ...pre,
            cancelLoading: false,
          };
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  // 导出数据
  const downLoad = async () => {
    setLoading((pre) => {
      return {
        ...pre,
        downLoading: true,
      };
    });
    const res: any = await exportExcel(exportForm);
    const type = res.response.headers.get('content-type');
    if (type.indexOf('application/json') > -1) {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `采购单.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
    setLoading((pre) => {
      return {
        ...pre,
        downLoading: false,
      };
    });
  };
  // 同步
  const syncAction = async () => {
    setLoading((pre) => {
      return {
        ...pre,
        syncLoading: true,
      };
    });
    const res = await syn({ ids: selectRows.join(',') });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功', 'success');
      ref?.current?.reload();
    }
    setLoading((pre) => {
      return {
        ...pre,
        syncLoading: false,
      };
    });
  };
  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
        fixedHeader
        className="pubPageTabs"
        tabList={[
          {
            tab: '云仓',
            key: 'cloud',
          },
        ]}
        tabActiveKey={'cloud'}
      >
        <ProTable
          size="small"
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          bordered
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          scroll={{ x: 1500 }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          rowKey="id"
          dateFormatter="string"
          rowClassName={(record: any) => {
            // 有异常时
            if (record?.isAbnormal) {
              return 'row-transferOrder-err';
            }
            return '';
          }}
          rowSelection={
            true
              ? {
                  fixed: true,
                  onChange: (selectedRowKeys: any, rowItems: any) => {
                    setSelectedItems(rowItems);
                    setSelectRows(selectedRowKeys);
                  },
                }
              : false
          }
          headerTitle={
            <Space key="space" wrap>
              <Access key="down" accessible={access.canSee('transfer_export')}>
                <Button onClick={downLoad} type="primary" ghost loading={loading.downLoading}>
                  导出
                </Button>
              </Access>
              <Access key="sync" accessible={access.canSee('transfer_sync')}>
                <Button onClick={syncAction} type="primary" ghost loading={loading.syncLoading}>
                  数据同步
                </Button>
              </Access>
              <Access key="cancel" accessible={access.canSee('transfer_batch_close')}>
                <Button onClick={cancelAction} type="primary" ghost loading={loading.cancelLoading}>
                  批量关闭
                </Button>
              </Access>
              <Access key="add" accessible={access.canSee('transfer_add')}>
                <Add
                  reload={() => {
                    ref?.current?.reload();
                  }}
                />
              </Access>
            </Space>
          }
          revalidateOnFocus={false}
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

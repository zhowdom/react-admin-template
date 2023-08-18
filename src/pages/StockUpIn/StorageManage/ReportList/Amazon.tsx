import { useState, useRef, useContext } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useAccess, Access } from 'umi';
import type { TableListItem } from '@/types/account';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import { Context } from './context';
import { downAmazon, getAmazonList } from '@/services/pages/stockUpIn/storageManage/reportList';
import SyncModal from './components/SyncModal';
import { getUuid, pubFreeGetStoreList } from '@/utils/pubConfirm';

const Comp = () => {
  const access = useAccess();
  console.log(access);
  const ref = useRef<ActionType>();
  const { dicList, selectProps, downLoadTemp } = useContext(Context);
  const [loading, setLoading] = useState({
    syncLoading: false,
    downLoading: false,
  });
  const [exportForm, setExportForm] = useState<any>({});
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };

    const res = await getAmazonList(postData);
    if (res?.code != pubConfig.sCode) {
      setExportForm({});
      pubMsg(res?.message);
    } else {
      setExportForm({
        shop_id: postData.shop_id,
        status: postData.status,
        shop_sku_code: postData.shop_sku_code,
      });
    }
    const data = res?.data?.records?.map((v: any) => {
      return {
        ...v,
        tempId: getUuid(),
      };
    });
    return {
      data: data || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 获取店铺
  const pubGetStoreListAction = async (): Promise<any> => {
    const res: any = await pubFreeGetStoreList({ business_scope: 'IN' });
    return res.filter((v: any) => v.platform_name === 'Amazon' || v.platform_name === 'AmazonSC');
  };
  // keepAlive页面激活钩子函数
  useActivate(() => {
    ref?.current?.reload();
  });
  // 下载导入模板
  const downLoadTempAction = () => {
    setLoading((values: any) => {
      return { ...values, downLoading: true };
    });
    downLoadTemp(() => {
      return downAmazon(exportForm);
    }).finally(function () {
      setLoading((values: any) => {
        return { ...values, downLoading: false };
      });
    });
  };

  // 表格配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'NO.',
      dataIndex: 'index',
      valueType: 'index',
      width: 80,
      align: 'center',
    },
    {
      title: '店铺',
      dataIndex: 'shop_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '店铺',
      dataIndex: 'shop_id',
      align: 'center',
      valueType: 'select',
      request: pubGetStoreListAction,
      fieldProps: selectProps,
      hideInTable: true,
    },

    {
      title: '店铺状态',
      dataIndex: 'status',
      valueType: 'select',
      align: 'center',
      fieldProps: selectProps,
      valueEnum: dicList.SYS_ENABLE_STATUS,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.SYS_ENABLE_STATUS, record.status);
      },
      width: 100,
    },
    {
      title: '站点',
      dataIndex: 'shop_site',
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(dicList?.SYS_PLATFORM_SHOP_SITE, record.shop_site) || '-';
      },
      hideInSearch: true,
      width: 90,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
    },
    {
      title: '可售库存',
      dataIndex: 'fulfillable_quantity',
      tooltip: '可直接用于销售的库存',
      align: 'right',
      width: 100,
      valueType: 'digit',
      hideInSearch: true,
    },
    {
      title: '待发货',
      dataIndex: 'inbound_working_quantity',
      tooltip: '状态为WORKING的货件的预计发货数量总和',
      align: 'right',
      width: 100,
      valueType: 'digit',
      hideInSearch: true,
    },
    {
      title: '运输中',
      dataIndex: 'inbound_shipped_quantity',
      tooltip: '状态为SHIPPED的货件的预计发货数量总和',
      align: 'right',
      width: 100,
      valueType: 'digit',
      hideInSearch: true,
    },
    {
      title: '待入库',
      dataIndex: 'inbound_receiving_quantity',
      tooltip: '状态为RECEIVING的货件仍未入库的数量总和',
      align: 'right',
      width: 100,
      valueType: 'digit',
      hideInSearch: true,
    },
    {
      title: '不可售',
      dataIndex: 'total_unfulfillable_quantity',
      tooltip: '由于损坏或有缺陷导致货物不可售',
      align: 'right',
      width: 100,
      valueType: 'digit',
      hideInSearch: true,
    },
    {
      title: '调查中',
      dataIndex: 'total_researching_Quantity',
      tooltip: 'Amazon盘点时发现数量不对发起的调查的数量',
      align: 'right',
      width: 100,
      valueType: 'digit',
      hideInSearch: true,
    },
    {
      title: '预留',
      dataIndex: 'total_reserved_quantity',
      tooltip: '已被订单锁定但未出库或转运等原因，对货物在仓库进行预留，但数量不在可售库存中',
      align: 'right',
      width: 100,
      valueType: 'digit',
      hideInSearch: true,
    },
    {
      title: '库存最后更新日期',
      dataIndex: 'last_updated_time',
      tooltip: 'SKU最后一次库存变动的时间',
      hideInSearch: true,
      width: 146,
      align: 'center',
    },
    {
      title: '最后同步日期',
      dataIndex: 'update_time',
      tooltip: '内部最后一次向Amazon成功请求库存数据的时间',
      hideInSearch: true,
      width: 146,
      align: 'center',
      render: (_, record: any) => record?.update_time || record?.create_time,
    },
  ];
  return (
    <>
      <ProTable<TableListItem>
        columns={columns}
        options={{ fullScreen: true, setting: false }}
        pagination={{
          showSizeChanger: true,
        }}
        scroll={{ x: 1900 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        actionRef={ref}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        rowKey="tempId"
        search={{ className: 'light-search-form', defaultCollapsed: false }}
        dateFormatter="string"
        headerTitle={
          <Space key="space">
            <Access key="export" accessible={access.canSee('stock_manage_export_amazon')}>
              <Button
                loading={loading.downLoading}
                disabled={loading.downLoading}
                type="primary"
                onClick={downLoadTempAction}
              >
                {loading.downLoading ? '导出中' : '导出'}
              </Button>
            </Access>
            <Access key="sync" accessible={access.canSee('stock_manage_primary_amazon')}>
              <SyncModal
                platform_name="Amazon,AmazonSC"
                reload={() => {
                  ref?.current?.reload();
                }}
              />
            </Access>
          </Space>
        }
      />
    </>
  );
};

export default Comp;

import { useState, useRef, useContext } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useAccess, Access } from 'umi';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import { Context } from './context';
import { downWalmart, getWalmartList } from '@/services/pages/stockUpIn/storageManage/reportList';
import SyncModal from './components/SyncModal';
import { getUuid, pubFreeGetStoreList } from '@/utils/pubConfirm';

const Comp = () => {
  const access = useAccess();
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const { dicList, selectProps, downLoadTemp } = useContext(Context);
  const [loading, setLoading] = useState({
    confirmLoading: false,
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

    const res = await getWalmartList(postData);
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
    return res.filter((v: any) => v.platform_name === 'Walmart');
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
      return downWalmart(exportForm);
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
    },
    {
      title: '站点',
      dataIndex: 'shop_site',
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(dicList?.SYS_PLATFORM_SHOP_SITE, record.shop_site) || '-';
      },
      hideInSearch: true,
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
      title: '在库库存',
      dataIndex: 'fulfillable_quantity',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '最后更新日期',
      dataIndex: 'update_time',
      hideInSearch: true,
      align: 'center',
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
        scroll={{ x: 1000 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        actionRef={ref}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        rowKey="tempId"
        search={{ className: 'light-search-form', defaultCollapsed: false }}
        dateFormatter="string"
        headerTitle={
          <Space key="space">
            <Access key="export" accessible={access.canSee('stock_manage_export_walmart')}>
              <Button
                loading={loading.downLoading}
                disabled={loading.downLoading}
                type="primary"
                onClick={downLoadTempAction}
              >
                {loading.downLoading ? '导出中' : '导出'}
              </Button>
            </Access>
            <Access key="sync" accessible={access.canSee('stock_manage_primary_walmart')}>
              <SyncModal
                platform_name="Walmart"
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

import { useState, useRef, useContext } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useAccess, Access } from 'umi';
import type { TableListItem } from '@/types/account';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import { Context } from './context';
import { downAll, getAllList } from '@/services/pages/stockUpIn/storageManage/reportList';
import StockDetails from './components/StockDetails';
const Comp = () => {
  const access = useAccess();
  const ref = useRef<ActionType>();
  const { downLoadTemp } = useContext(Context);
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

    const res = await getAllList(postData);
    if (res?.code != pubConfig.sCode) {
      setExportForm({});
      pubMsg(res?.message);
    } else {
      setExportForm({
        shop_sku_code: postData.shop_sku_code,
        sku_name: postData.sku_name,
      });
    }

    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
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
      return downAll(exportForm);
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
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'center',
    },
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
      order: 2,
    },
    {
      title: '在库库存',
      dataIndex: 'fulfillable_quantity',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => {
        const num = (record?.fulfillable_quantity || 0) + (record?.total_reserved_quantity || 0);
        return num && access.canSee('stock_manage_detail') ? (
          <StockDetails trigger={num} shop_sku_code={record.shop_sku_code} />
        ) : (
          num || '-'
        );
      },
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
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        rowKey="shop_sku_code"
        search={{ className: 'light-search-form', defaultCollapsed: false }}
        dateFormatter="string"
        headerTitle={
          <Space key="space">
            <Access key="export" accessible={access.canSee('stock_manage_export_all')}>
              <Button
                loading={loading.downLoading}
                disabled={loading.downLoading}
                type="primary"
                onClick={downLoadTempAction}
              >
                {loading.downLoading ? '导出中' : '导出'}
              </Button>
            </Access>
          </Space>
        }
      />
    </>
  );
};

export default Comp;

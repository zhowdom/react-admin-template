import { useAccess, Access } from 'umi';
import { useState, useRef } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  cloudWarehouseInventoryPage,
  cloudWarehouseInventorySyn,
  synInventoryStreamExportInventory,
} from '@/services/pages/libraryManager';
import { pubConfig, pubMsg, pubModal } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import HistoryLog from './Dialog/HistoryLog';
import './style.less';
import { sub } from '@/utils/pubConfirm';
import SelectDependency from '@/components/PubForm/SelectDependency';
import moment from 'moment';

const Cloud = (props: any) => {
  const access = useAccess();
  const ref: any = useRef<ActionType>();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [downLoading, setDownLoading] = useState(false); // loading
  const [exportForm, exportFormSet] = useState({});
  // 添加弹窗实例
  const historyLogModel = useRef();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      warehousing_platform:
        params.platform_warehousing_type == 'QIMEN'
          ? 'QIMEN_YUNCANG'
          : params.platform_warehousing_type == 'WLN'
          ? 'YUNCANG'
          : '',
      platform_warehousing_id: params.warehouse_id,
    };
    exportFormSet(postData);
    const res = await cloudWarehouseInventoryPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    ref?.current?.clearSelected();
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const formRef = useRef<ProFormInstance>();

  // 同步
  const synchronizationAction = async () => {
    pubModal('是否确定同步库存数据?')
      .then(async () => {
        setConfirmLoading(true);
        const res: any = await cloudWarehouseInventorySyn({});
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
  // 导出库存
  const downLoadsynchronization = async () => {
    setDownLoading(true);
    const res: any = await synInventoryStreamExportInventory(exportForm);
    const type = res.response.headers.get('content-type');
    if (type === 'application/json') {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `库存导出.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
    setDownLoading(false);
  };
  // 详情弹窗
  const historyLogModelOpen: any = (row: any) => {
    const data: any = historyLogModel?.current;
    data.open(row.id);
  };
  // keepAlive页面激活钩子函数
  useActivate(() => {
    // setTempKey(new Date().getTime());
    ref?.current?.reload();
  });
  // 表格配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '仓库类型',
      dataIndex: 'warehousing_platform_name',
      hideInSearch: true,
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      ellipsis: true,
      render: (_: any, record: any) => record?.warehousing_name || '-',
      initialValue: [null, null],
      renderFormItem: () => (
        <SelectDependency
          valueEnum={props?.dicList?.SYS_PLATFORM_WAREHOUSING_PLATFORM || {}}
          requestUrl={'/sc-scm/orderDeliveryWarehouse/page'}
          requestParam={'platform_code'}
          placeholder={['类型', '仓库选择']}
        />
      ),
      search: {
        transform: (v) => ({ platform_warehousing_type: v[0], warehouse_id: v[1] }),
      },
    },
    {
      title: '仓库编码',
      dataIndex: 'warehousing_code',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'left',
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      align: 'center',
    },
    {
      title: '商品编码(ERP编码)',
      dataIndex: 'erp_sku',
      align: 'center',
      width: 150,
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      align: 'center',
    },
    {
      title: '库存编号',
      dataIndex: 'stock_no',
      align: 'center',
    },
    {
      title: '实际库存数量',
      dataIndex: 'quantity',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '可用库存数量',
      dataIndex: 'available',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '残次品数量',
      dataIndex: 'incomplete_qty',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '占用数量',
      dataIndex: 'occupyNum',
      align: 'center',
      hideInSearch: true,
      render: (_, record: any) => {
        return sub(record.quantity, record.available);
      },
    },
    {
      title: '库存时间',
      dataIndex: 'inventory_time',
      align: 'center',
      valueType: 'date',
      sorter: (a: any, b: any) =>
        new Date(a.inventory_time).getTime() - new Date(b.inventory_time).getTime(),
      search: {
        transform: (val) => ({ start_inventory_time: val, end_inventory_time: val }),
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '库存时间必选',
          },
        ],
      },
      initialValue: moment(new Date()).format('YYYY-MM-DD'),
      width: 80,
      render: (_: any, record: any) => record.inventory_time ?? '-',
    },
    {
      title: '操作',
      key: 'option',
      width: 100,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (_, record: any) => {
        return [
          // 查看
          <Access
            key="link"
            accessible={
              access.canSee('libraryManager_list_history') &&
              record.warehousing_platform_name != '奇门云仓'
            }
          >
            <a
              onClick={() => {
                historyLogModelOpen(record);
              }}
              key="edit"
            >
              库存流水
            </a>
          </Access>,
        ];
      },
    },
  ];
  return (
    <>
      <ProTable<TableListItem>
        columns={columns}
        search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
        pagination={{
          showSizeChanger: true,
        }}
        form={{
          ignoreRules: false,
        }}
        actionRef={ref}
        formRef={formRef}
        bordered
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        scroll={{ x: 1400 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        rowKey="id"
        dateFormatter="string"
        headerTitle={
          <Space key="space" wrap>
            <Access key="approval" accessible={access.canSee('libraryManager_sync')}>
              <Button
                loading={confirmLoading}
                onClick={() => {
                  synchronizationAction();
                }}
              >
                同步库存
              </Button>
            </Access>
            <Access key="exportInventory" accessible={access.canSee('libraryManager_sync_export')}>
              <Button
                type="primary"
                loading={downLoading}
                onClick={() => {
                  downLoadsynchronization();
                }}
              >
                导出
              </Button>
            </Access>
          </Space>
        }
      />
      <HistoryLog historyLogModel={historyLogModel} />
    </>
  );
};
export default Cloud;

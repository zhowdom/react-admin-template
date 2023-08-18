import { Access, useAccess } from 'umi';
import { useRef, useState } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import * as api from '@/services/pages/stockManage';
import { pubConfig, pubFilter, pubModal, pubMsg } from '@/utils/pubConfig';
import ViewLife from './components/ViewLife';
import InnerTable from './components/InnerTable';
import { QuestionCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const Page = (props: any) => {
  const { dicList } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [downLoading, setDownLoading] = useState(false); // loading
  const [exportForm, exportFormSet] = useState({});
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '商品图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
    },
    {
      title: 'SKU',
      dataIndex: 'stock_no',
      align: 'center',
    },
    {
      title: '商品条形码',
      dataIndex: 'bar_code',
      align: 'center',
    },
    {
      title: '款式生命周期',
      dataIndex: 'life_cycle',
      valueType: 'select',
      valueEnum: dicList.GOODS_LIFE_CYCLE,
      render: (_: any, record: any) => {
        return pubFilter(dicList.GOODS_LIFE_CYCLE, record?.life_cycle) || '-';
      },
    },

    {
      title: '链接生命周期',
      dataIndex: 'customerComments',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <ViewLife goods_sku_id={record.goods_sku_id} dicList={dicList} platform_code="TM" />
      ),
      width: 145,
      hideInTable: !access.canSee('libraryManager_life_cn'),
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      ellipsis: true,
      hideInSearch: true,
      valueEnum: dicList.SYS_PLATFORM_NAME,
    },
    {
      title: '仓库（区域）',
      dataIndex: 'region',
      align: 'center',
      hideInSearch: true,
      width: '120px',
      onCell: () => ({ colSpan: 4, style: { padding: 0 } }),
      className: 'p-table-inTable noBorder',
      render: (_, record: any) => <InnerTable data={record.inventories} dicList={dicList} />,
    },
    {
      title: (
        <>
          在途
          <Tooltip placement="top" title={'供应商已发货，平台还未入库的数量'}>
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'in_transit_num',
      align: 'center',
      hideInSearch: true,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: '120px',
    },
    {
      title: (
        <>
          在库可用数量
          <Tooltip placement="top" title={'接口获取的平台仓库的剩余库存数量'}>
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'available',
      align: 'center',
      hideInSearch: true,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: '120px',
    },
    {
      title: (
        <>
          总库存
          <Tooltip placement="top" title={'总库存=在途库存+在库库存'}>
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'total_quantity',
      align: 'center',
      hideInSearch: true,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: '120px',
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
  ];
  // 同步
  const synchronizationAction = async () => {
    pubModal('是否确定同步库存数据?')
      .then(async () => {
        setConfirmLoading(true);
        const res: any = await api.syn({ platform_code: 'TM' });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('同步成功', 'success');
          actionRef?.current?.reload();
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
    const res: any = await api.exportInventory(exportForm);
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
  return (
    <ProTable
      bordered
      columns={columns}
      actionRef={actionRef}
      options={{ fullScreen: true }}
      pagination={{
        defaultPageSize: 100,

        showSizeChanger: true,
      }}
      form={{
        ignoreRules: false,
      }}
      formRef={formRef}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      request={async (params: any) => {
        const formData = {
          ...params,
          current_page: params?.current,
          page_size: params?.pageSize,
          platform_code: 'TM',
        };
        exportFormSet(formData);
        const res = await api.getList(formData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return {
            success: false,
            data: [],
            total: 0,
          };
        }
        return {
          success: true,
          data: res?.data?.records || [],
          total: res?.data?.total || 0,
        };
      }}
      rowKey="key"
      dateFormatter="string"
      headerTitle={
        <Space key="space" wrap>
          <Access key="approval" accessible={access.canSee('libraryManager_sync_cn')}>
            <Button
              loading={confirmLoading}
              onClick={() => {
                synchronizationAction();
              }}
            >
              同步库存
            </Button>
          </Access>
          <Access key="exportInventory" accessible={access.canSee('libraryManager_sync_export_cn')}>
            <Button
              type="primary"
              loading={downLoading}
              onClick={() => {
                downLoadsynchronization();
              }}
            >
              导出库存
            </Button>
          </Access>
          <span style={{ color: 'red', fontSize: '14px' }}>说明：每天8:00、13:00、20:00更新</span>
        </Space>
      }
      scroll={{ x: 1200 }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      search={{ defaultCollapsed: false, className: 'light-search-form' }}
    />
  );
};

export default Page;

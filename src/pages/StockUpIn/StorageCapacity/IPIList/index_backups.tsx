import { useState, useRef } from 'react';
import { Button, Space, DatePicker } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useAccess, Access, connect } from 'umi';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import { getList, exportExcel, changeFieldHistory } from '@/services/pages/stockUpIn/IPI';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import { pubBlobDownLoad, pubFreeGetStoreList } from '@/utils/pubConfirm';
import PubWeekRender from '@/components/PubWeekRender';
import Update from './Dialogs/Update';
import Log from '../../Components/Log';
import { IPIContext } from './context';
import { checkDate, GetDateStr } from '@/utils/filter';
import moment from 'moment';

const Home: React.FC<any> = ({ common, history }) => {
  const access = useAccess();
  const dicList = common.dicList;
  const [loading, setLoading] = useState({
    skuLoading: false,
    deliveryLoading: false,
    confirmLoading: false,
    downLoading: false,
    upLoading: false,
  });
  const ref = useRef<ActionType>();
  const [timeSearch, setTimeSearch] = useState<any>({});
  const [exportForm, setExportForm] = useState<any>({});
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      ...timeSearch,
    };

    const res = await getList(postData);
    if (res?.code != pubConfig.sCode) {
      setExportForm({});
      pubMsg(res?.message);
    } else {
      setExportForm(postData);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  // 获取店铺
  const pubGetStoreListAction = async (): Promise<any> => {
    const res: any = await pubFreeGetStoreList({ business_scope: 'IN' });
    return res;
  };
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

  // keepAlive页面激活钩子函数
  useActivate(() => {
    ref?.current?.reload();
  });
  // 下载导入模板
  const downLoadTemp = async () => {
    setLoading((values: any) => {
      return { ...values, downLoading: true };
    });
    const res: any = await exportExcel(exportForm);
    setLoading((values: any) => {
      return { ...values, downLoading: false };
    });
    pubBlobDownLoad(res, 'ipi数据');
  };
  const operatingFormatter = (date1: string, date2: string, number: number) => {
    if (checkDate(date1, GetDateStr(date2, number))) {
      return true;
    } else {
      return false;
    }
  };
  // 表格配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'NO',
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
      initialValue: history.location?.state?.shop_id || '',
      valueType: 'select',
      request: pubGetStoreListAction,
      fieldProps: selectProps,
      hideInTable: true,
    },
    {
      title: '站点',
      dataIndex: 'shop_site',
      width: 90,
      align: 'center',
      valueType: 'select',
      valueEnum: dicList.SYS_PLATFORM_SHOP_SITE,
      fieldProps: selectProps,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueType: 'select',
      align: 'center',
      hideInSearch: true,
      fieldProps: selectProps,
      valueEnum: dicList.SYS_ENABLE_STATUS,
      render: (_: any, record: any) => {
        return pubFilter(dicList.SYS_ENABLE_STATUS, record.status);
      },
    },
    {
      title: '时间周期',
      dataIndex: 'cycle_time',
      align: 'center',
      initialValue: history.location?.state?.cycle_time
        ? moment(history.location?.state?.cycle_time, 'YYYY-WW周')
        : null,
      // @ts-ignore
      renderFormItem: () => <DatePicker picker={'week'} />,
      search: {
        transform: (data) => ({
          cycle_time_begin: moment(data).weekday(0).format('YYYY-MM-DD'),
          cycle_time_end: moment(data).weekday(6).format('YYYY-MM-DD'),
        }),
      },
      render: (_: any, record: any) => (
        <PubWeekRender
          option={{
            cycle_time: record.cycle_time,
            begin: record.cycle_time_begin,
            end: record.cycle_time_end,
          }}
        />
      ),
    },

    {
      title: 'IPI',
      dataIndex: 'marks',
      width: 90,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '标准件',
      dataIndex: '标准件',
      align: 'center',
      hideInSearch: true,
      children: [
        {
          title: '季度容量限制',
          dataIndex: 'standard_volume_is_limit',
          align: 'center',
          renderText: (text: any, record: any) =>
            text == '1' ? record.standard_volume_limit + record.standard_volume_uom : '无限制',
        },
        {
          title: '库容使用量',
          dataIndex: 'standard_capacity_used',
          align: 'center',
          width: 150,
          hideInSearch: true,
          render: (_: any, record: any) => (
            <span>
              {record.standard_capacity_used
                ? `${record.standard_capacity_used}${pubFilter(
                    dicList.IPI_UOM,
                    record.standard_capacity_uom,
                  )}`
                : '-'}
            </span>
          ),
        },
        {
          title: '最高库存水平',
          dataIndex: 'standard_stock_max_used',
          align: 'right',
        },
        {
          title: '库存限额使用量',
          dataIndex: 'standard_stock_used',
          align: 'right',
        },
        {
          title: '最大货件数量',
          dataIndex: 'standard_remarks',
          align: 'right',
          render: (_, record: any) => record.standard_stock_max_used - record.standard_stock_used,
        },
      ],
    },
    {
      title: '大件',
      dataIndex: '大件',
      align: 'center',
      hideInSearch: true,
      children: [
        {
          title: '季度容量限制',
          dataIndex: 'big_volume_is_limit',
          align: 'center',
          renderText: (text: any, record: any) =>
            text == '1' ? record.big_volume_limit + record.big_volume_uom : '无限制',
        },
        {
          title: '库容使用量',
          dataIndex: 'big_capacity_used',
          align: 'center',
          width: 150,
          hideInSearch: true,
          render: (_: any, record: any) => (
            <span>
              {record.big_capacity_used
                ? `${record.big_capacity_used}${pubFilter(
                    dicList.IPI_UOM,
                    record.big_capacity_uom,
                  )}`
                : '-'}
            </span>
          ),
        },
        {
          title: '最高库存水平',
          dataIndex: 'big_stock_max_used',
          align: 'right',
        },
        {
          title: '库存限额使用量',
          dataIndex: 'big_stock_used',
          align: 'right',
        },
        {
          title: '最大货件数量',
          dataIndex: 'big_remarks',
          align: 'right',
          render: (_, record: any) => record.big_stock_max_used - record.big_stock_used,
        },
      ],
    },
    {
      title: '操作',
      key: 'option',
      fixed: 'right',
      width: 140,
      align: 'center',
      valueType: 'option',
      render: (_: any, record: any) => {
        return [
          common?.dicList && (
            <IPIContext.Provider value={common?.dicList} key="add">
              <Access
                key="update"
                accessible={
                  access.canSee('stock_up_ipi_edit') &&
                  operatingFormatter(record.cycle_time_end, moment().format('YYYY-MM-DD'), -15)
                }
              >
                <Update
                  record={record}
                  reload={() => {
                    ref?.current?.reload();
                  }}
                />
              </Access>
            </IPIContext.Provider>
          ),
          <Access key="log" accessible={access.canSee('stock_up_ipi_log')}>
            <Log
              key={'log'}
              api={changeFieldHistory}
              business_id={record.id}
              dicList={common?.dicList}
            />
          </Access>,
        ];
      },
    },
  ];
  return (
    <>
      <ProTable<TableListItem>
        bordered
        columns={columns}
        options={{ fullScreen: true, setting: false }}
        pagination={{
          showSizeChanger: true,
        }}
        onReset={() => setTimeSearch({})}
        scroll={{ x: 2200 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        actionRef={ref}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        rowKey="id"
        search={{ className: 'light-search-form', defaultCollapsed: false }}
        dateFormatter="string"
        headerTitle={
          <Space key="space">
            <Access accessible={access.canSee('stock_up_ipi_export')}>
              <Button
                loading={loading.downLoading}
                disabled={loading.downLoading}
                type="primary"
                onClick={() => {
                  downLoadTemp();
                }}
              >
                {loading.downLoading ? '导出中' : '导出'}
              </Button>
            </Access>
            <IPIContext.Provider value={common?.dicList} key="add">
              <Access accessible={access.canSee('stock_up_ipi_add')}>
                <Update
                  dicList={common.dicList}
                  reload={() => {
                    ref?.current?.reload();
                  }}
                />
              </Access>
            </IPIContext.Provider>
          </Space>
        }
      />
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Home);
export default ConnectPage;

import { Access, connect, useAccess } from 'umi';
import React, { useRef, useState } from 'react';
import { useActivate } from 'react-activation';
import { Button, DatePicker, Popconfirm, Space, Input } from 'antd';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import Update from './Dialogs/Update';
import BatchShelvesCycle from './Dialogs/BatchShelvesCycle';
import * as api from '@/services/pages/stockUpIn/rate';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubBlobDownLoad } from '@/utils/pubConfirm';
import Log from '@/pages/StockUpIn/Components/Log';
import moment from 'moment';
import * as apiFn from '@/services/pages/stockUpIn/logisticsPeriod';
import { pubGetPlatformList } from '@/utils/pubConfirm';
import CommonLogAms from '@/components/CommonLogAms';
import './Dialogs/index.less'

/*跨境备货 - 月度汇率管理  @zhujing 2022-09-26*/
// 格式币种下拉, 只展示英文
const formatCurrency = (currencyObj: any = {}) => {
  Object.keys(currencyObj).forEach((key: string) => {
    currencyObj[key].text = key;
  });
  return currencyObj;
};
const onSearch = (value: string) => console.log(value);
const Page: React.FC<{ common: any }> = ({ common }) => {
  const formRef: any = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [queryParams, queryParamsSet] = useState<any>({});
  const [exporting, exportingSet] = useState(false);
  const [selectedRowKeys, selectedRowKeysSet] = useState([]);
  const [selectedRowData, selectedRowDataSet] = useState([]);
  const _refL: any = useRef();
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  // 列表
  const columns: ProColumns<any>[] = [
    {
        title: '平台',
        dataIndex: 'platform_id',
        key: 'platform_id',
        valueType: 'select',
        align: 'center',
        request: () => pubGetPlatformList({ business_scope: 'IN'}),
        fieldProps: { showSearch: true },
        width: 120,
      },

    {
        title: '站点',
        dataIndex: 'site',
        key: 'site',
        align: 'center',
        valueEnum: common?.dicList?.SYS_PLATFORM_SHOP_SITE || [],
        fieldProps: {
          showSearch: true,
        },
      },
      {
        title: '目的仓',
        dataIndex: 'delivery_route',
        key: 'delivery_route',
        align: 'center',
        valueEnum: common?.dicList?.LOGISTICS_TIME_MANAGE_IN_DELIVERY_ROUTE || [],
        fieldProps: {
          showSearch: true,
        },
      },
      {
        title: '运输方式',
        dataIndex: 'shipping_method',
        key: 'shipping_method',
        align: 'center',
        valueEnum: common?.dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || [],
        fieldProps: {
          showSearch: true,
        },
      },
    {
        title: '国内运输周期（天）',
        dataIndex: 'domestic_transport_cycle',
        key: 'domestic_transport_cycle',
        className: 'effectTxtRight',
        hideInSearch: true,
    },
    {
        title: '跨境运输周期（天）',
        hideInSearch: true,
        children: [
            {
                title: '整柜',
                children: [
                    {
                        title: '标准件',
                        key: 'whole_box_standard',
                        className: 'effectTxtRight',
                        dataIndex: 'whole_box_standard'
                    },
                    {
                        title: '大件',
                        key: 'whole_box_big',
                        className: 'effectTxtRight',
                        dataIndex: 'whole_box_big'
                    }
                ]
            },
            {
                title: '散货',
                children: [
                    {
                        title: '标准件',
                        key: 'part_box_standard',
                        className: 'effectTxtRight',
                        dataIndex: 'part_box_standard'
                    },
                    {
                        title: '大件',
                        key: 'part_box_big',
                        className: 'effectTxtRight',
                        dataIndex: 'part_box_big'
                    }
                ]
            },
        ]
    },
    {
      title: '上架周期（天）',
      dataIndex: 'shelves_cycle',
      key: 'shelves_cycle',
      className: 'effectTxtRight',
      hideInSearch: true,
  },
    {
      title: '总时效（天）',
      hideInSearch: true,
      children: [
          {
              title: '整柜',
              children: [
                  {
                      title: '标准件',
                      key: 'all_whole_box_standard',
                      className: 'effectTxtRight',
                      dataIndex: 'all_whole_box_standard'
                  },
                  {
                      title: '大件',
                      key: 'all_whole_box_big',
                      className: 'effectTxtRight',
                      dataIndex: 'all_whole_box_big'
                  }
              ]
          },
          {
              title: '散货',
              children: [
                  {
                      title: '标准件',
                      key: 'all_part_box_standard',
                      className: 'effectTxtRight',
                      dataIndex: 'all_part_box_standard'
                  },
                  {
                      title: '大件',
                      key: 'all_part_box_big',
                      className: 'effectTxtRight',
                      dataIndex: 'all_part_box_big'
                  }
              ]
          },
      ]
    },
    
    {
        title: '状态',
        dataIndex: 'status_name',
        key: 'status_name',
        align: 'center',
        hideInSearch: true,
    },
    {
      title: '操作',
      width: 130,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => [
        /*只能修改上个月及未来月*/
        <Access
          key="edit"
          accessible={
            access.canSee('stock_up_logisticsPeriod_edit') &&
            moment(record.month).isAfter(moment().add(-2, 'month'))
          }
        >
          <Update
            initialValues={record}
            title={'修改'}
            trigger={<a>修改</a>}
            reload={actionRef?.current?.reload}
            dicList={common.dicList}
            formatCurrency={formatCurrency}
          />
        </Access>,
        // <Access key="log" accessible={access.canSee('scm_stock_up_in_rate_log')}>
        //   <Log
        //     key="log"
        //     api={api.changeFieldHistory}
        //     business_id={record.id}
        //     dicList={common?.dicList}
        //   />
        // </Access>,
        <Access key="log" accessible={access.canSee('stock_up_logisticsPeriod_log')}>
            <a
              onClick={() => {
                _refL.current.visibileChange(true, record?.id);
              }}
            >
              操作日志
            </a>
          </Access>,
      ],
    },
  ];
  // 导出
  const exportExcel = async () => {
    exportingSet(true);
    const res: any = await api.exportExcev2(queryParams);
    exportingSet(false);
    pubBlobDownLoad(res, `物流时效(${queryParams.startMonth || ''}-${queryParams.endMonth || ''})`);
    return;
  };
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable
        bordered
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        pagination={{
          showSizeChanger: true,
        }}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={async (params: any) => {
          const formData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
          };
          queryParamsSet(formData);
          const res = await apiFn.getList(formData);
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
        rowKey="id"
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
        dateFormatter="string"
        headerTitle={
          <Space>
            {/* <Access key="delete" accessible={access.canSee('scm_stock_up_in_rate_delete')}>
              <Popconfirm
                disabled={selectedRowKeys?.length == 0}
                key="delete"
                title="确认删除所选?"
                onConfirm={async () => {
                  const res = await api.deleteItem({ ids: selectedRowKeys.toString() });
                  if (res?.code == pubConfig.sCode) {
                    pubMsg(res?.message || '操作成功!', 'success');
                    selectedRowKeysSet([]);
                    actionRef?.current?.reload();
                    return;
                  }
                  pubMsg(res?.message);
                }}
              >
                <Button disabled={selectedRowKeys?.length == 0} type={'primary'}>
                  批量删除
                </Button>
              </Popconfirm>
            </Access> */}

            <Access key="export" accessible={access.canSee('stock_up_logisticsPeriod_export')}>
              <Button onClick={() => exportExcel()} loading={exporting} type="primary">
                {exporting ? '导出中' : '导出'}
              </Button>
            </Access>
            <Access key="add" accessible={access.canSee('stock_up_logisticsPeriod_add')}>
              <Update
                reload={actionRef?.current?.reload}
                dicList={common.dicList}
                formatCurrency={formatCurrency}
              />
            </Access>

            <Access key="batch_shelves_cycle" accessible={access.canSee('stock_up_logisticsPeriod_batch_onshelves')}>
              <BatchShelvesCycle
                reload={actionRef?.current?.reload}
                selectedRowKeys={selectedRowKeys}
                selectedRowKeysSet={selectedRowKeysSet}
              />
            </Access>
            <Access key="batch_enable" accessible={access.canSee('stock_up_logisticsPeriod_batch_enable')}>
              <Popconfirm
                disabled={selectedRowKeys?.length == 0}
                key="batch_enable"
                title="确认启用所选?"
                onConfirm={async () => {
                  let _parm = selectedRowKeys.map((id:any) => {
                    return {
                      id,
                      status: 1
                    }
                  })
                  const res = await api.batchUpdateStatus(_parm);
                  if (res?.code == pubConfig.sCode) {
                    pubMsg(res?.message || '操作成功!', 'success');
                    selectedRowKeysSet([]);
                    selectedRowDataSet([]);
                    actionRef?.current?.reload();
                    return;
                  }
                  pubMsg(res?.message);
                }}
              >
                <Button disabled={selectedRowKeys?.length == 0 || selectedRowData.every((item:any) => item.status == 1)} type={'primary'}>
                  批量启用
                </Button>
              </Popconfirm>
            </Access>

            <Access key="batch_disable" accessible={access.canSee('stock_up_logisticsPeriod_batch_disable')}>
              <Popconfirm
                disabled={selectedRowKeys?.length == 0}
                key="batch_disable"
                title="确认禁用所选?"
                onConfirm={async () => {
                  let _parm = selectedRowKeys.map((id:any) => {
                    return {
                      id,
                      status: 0
                    }
                  })
                  const res = await api.batchUpdateStatus(_parm);
                  if (res?.code == pubConfig.sCode) {
                    pubMsg(res?.message || '操作成功!', 'success');
                    selectedRowKeysSet([]);
                    selectedRowDataSet([]);
                    actionRef?.current?.reload();
                    return;
                  }
                  pubMsg(res?.message);
                }}
              >
                <Button disabled={selectedRowKeys?.length == 0|| selectedRowData.every((item:any) => item.status == 0)} type={'primary'}>
                批量禁用
                </Button>
              </Popconfirm>
            </Access>


          </Space>
        }
        scroll={{ x: 800 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        rowSelection={{
          selectedRowKeys,
          // onChange: (rowKeys: any, rowItems: any) => {
          onChange: (keys: any, rowItems: any) => {
            selectedRowKeysSet(keys);
            selectedRowDataSet(rowItems);
          },
        }}
      />
      <CommonLogAms dicList={common?.dicList} _ref={_refL}/>
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

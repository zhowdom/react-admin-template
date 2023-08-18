import { Access, connect, useAccess } from 'umi';
import React, { useRef, useState } from 'react';
import { useActivate } from 'react-activation';
import { Button, DatePicker, Popconfirm, Space } from 'antd';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import Update from './Dialogs/Update';
import * as api from '@/services/pages/stockUpIn/rate';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubBlobDownLoad } from '@/utils/pubConfirm';
import Log from '@/pages/StockUpIn/Components/Log';
import moment from 'moment';

/*跨境备货 - 月度汇率管理  @zhujing 2022-09-26*/
// 格式币种下拉, 只展示英文
const formatCurrency = (currencyObj: any = {}) => {
  Object.keys(currencyObj).forEach((key: string) => {
    currencyObj[key].text = key;
  });
  return currencyObj;
};
const Page: React.FC<{ common: any }> = ({ common }) => {
  const formRef: any = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [queryParams, queryParamsSet] = useState<any>({});
  const [exporting, exportingSet] = useState(false);
  const [selectedRowKeys, selectedRowKeysSet] = useState([]);
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '原币种',
      dataIndex: 'original_currency',
      align: 'center',
      valueType: 'select',
      valueEnum: formatCurrency(common?.dicList?.SC_CURRENCY || {}),
      fieldProps: {
        showSearch: true,
      },
    },
    {
      title: '目标币种',
      dataIndex: 'target_currency',
      align: 'center',
      valueType: 'select',
      valueEnum: formatCurrency(common?.dicList?.SC_CURRENCY || {}),
      fieldProps: {
        showSearch: true,
      },
    },
    {
      title: '汇率',
      dataIndex: 'exchange_rate',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: { precision: 6 },
    },
    {
      title: '月份',
      dataIndex: 'month',
      align: 'center',
      valueType: 'dateMonth',
      hideInSearch: true,
    },
    {
      title: '月份',
      dataIndex: 'month',
      align: 'center',
      valueType: 'dateMonth',
      renderFormItem: () => (
        // @ts-ignore
        <DatePicker.RangePicker placeholder={['开始', '结束']} picker="month" />
      ),
      search: {
        transform: (val) => ({ startMonth: val[0], endMonth: val[1] }),
      },
      hideInTable: true,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '最后更新时间',
      dataIndex: 'update_time',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => [
        /*只能修改上个月及未来月*/
        <Access
          key="edit"
          accessible={
            access.canSee('scm_stock_up_in_rate_edit') &&
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
        <Access key="log" accessible={access.canSee('scm_stock_up_in_rate_log')}>
          <Log
            key="log"
            api={api.changeFieldHistory}
            business_id={record.id}
            dicList={common?.dicList}
          />
        </Access>,
      ],
    },
  ];
  // 导出
  const exportExcel = async () => {
    exportingSet(true);
    const res: any = await api.exportExcel(queryParams);
    exportingSet(false);
    pubBlobDownLoad(res, `汇率(${queryParams.startMonth || ''}-${queryParams.endMonth || ''})`);
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
        rowKey="id"
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
        dateFormatter="string"
        headerTitle={
          <Space>
            <Access key="delete" accessible={access.canSee('scm_stock_up_in_rate_delete')}>
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
            </Access>
            <Access key="export" accessible={access.canSee('scm_stock_up_in_rate_export')}>
              <Button onClick={() => exportExcel()} loading={exporting} type="primary">
                {exporting ? '导出中' : '导出'}
              </Button>
            </Access>
            <Access key="add" accessible={access.canSee('scm_stock_up_in_rate_edit')}>
              <Update
                reload={actionRef?.current?.reload}
                dicList={common.dicList}
                formatCurrency={formatCurrency}
              />
            </Access>
          </Space>
        }
        scroll={{ x: 800 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys: any) => selectedRowKeysSet(keys),
        }}
      />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

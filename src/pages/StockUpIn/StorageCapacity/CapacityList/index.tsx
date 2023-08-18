import { Access, connect, useAccess } from 'umi';
import { useRef, useState } from 'react';
import { useActivate } from 'react-activation';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import { Button, Space } from 'antd';
import Update from './Dialogs/Update';
import * as api from '@/services/pages/stockUpIn/capacity';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubBlobDownLoad, pubFreeGetStoreList } from '@/utils/pubConfirm';
import Log from '../../Components/Log';
import moment from 'moment';

const Page: React.FC<{ common: any }> = ({ common }) => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [queryParams, queryParamsSet] = useState<any>({});
  const [exporting, exportingSet] = useState(false);
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  // 导出
  const exportExcel = async () => {
    exportingSet(true);
    const res: any = await api.exportExcel(queryParams);
    exportingSet(false);
    pubBlobDownLoad(res, `库容数据(${queryParams.cycle_time})`);
    return;
  };
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '店铺',
      dataIndex: 'shop_id',
      valueType: 'select',
      fieldProps: { showSearch: true },
      request: async () => {
        const res: any = await pubFreeGetStoreList({ business_scope: 'IN' });
        return res;
      },
      align: 'center',
      hideInTable: true,
    },
    {
      title: '店铺',
      dataIndex: 'shop_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '站点',
      dataIndex: 'shop_site',
      align: 'center',
      width: 80,
      valueEnum: common?.dicList?.SYS_PLATFORM_SHOP_SITE || {},
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      align: 'center',
      hideInSearch: true,
      fieldProps: { showSearch: true },
      valueEnum: common?.dicList?.SYS_ENABLE_STATUS || {},
      width: 90,
    },
    {
      title: '时间周期',
      dataIndex: 'cycle_time',
      align: 'center',
      valueType: 'dateRange',
      fieldProps: { picker: 'quarter', format: 'YYYY-\\QQ' },
      render: (dom, record: any) => record.cycle_time,
      width: 100,
    },
    {
      title: '标准',
      dataIndex: '标准',
      align: 'center',
      hideInSearch: true,
      children: [
        {
          title: '仓储容量限制',
          dataIndex: 'standard_volume_is_limit',
          align: 'center',
          renderText: (text: any, record: any) =>
            text == '1' ? record.standard_volume_limit + record.standard_volume_uom : '无限制',
        },
        {
          title: '说明',
          dataIndex: 'standard_remarks',
          align: 'center',
          ellipsis: true,
        },
      ],
    },
    {
      title: '大件',
      dataIndex: 'dajian',
      align: 'center',
      hideInSearch: true,
      children: [
        {
          title: '仓储容量限制',
          dataIndex: 'big_volume_is_limit',
          align: 'center',
          renderText: (text: any, record: any) =>
            text == '1' ? record.big_volume_limit + record.big_volume_uom : '无限制',
        },
        {
          title: '说明',
          dataIndex: 'big_remarks',
          align: 'center',
          ellipsis: true,
        },
      ],
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => [
        /*只能编辑当前和下一个季度*/
        <Access
          key="edit"
          accessible={
            access.canSee('stock_up_capacity_edit') &&
            [
              moment().format('YYYY-\\QQ'),
              moment().add(1, 'quarters').format('YYYY-\\QQ'),
            ].includes(record.cycle_time)
          }
        >
          <Update
            initialValues={record}
            title={'编辑'}
            trigger={<a>编辑</a>}
            reload={actionRef?.current?.reload}
            dicList={common.dicList}
          />
        </Access>,
        <Access key="log" accessible={access.canSee('stock_up_capacity_log')}>
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
            cycle_time: params.cycle_time && params.cycle_time.toString(),
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
            <Access key="export" accessible={access.canSee('stock_up_capacity_export')}>
              <Button key="export" onClick={() => exportExcel()} loading={exporting} type="primary">
                {exporting ? '导出中' : '导出'}
              </Button>
            </Access>
            <Access key="add" accessible={access.canSee('stock_up_capacity_add')}>
              <Update title={'新增'} reload={actionRef?.current?.reload} dicList={common.dicList} />
            </Access>
          </Space>
        }
        scroll={{ x: 1200 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
      />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

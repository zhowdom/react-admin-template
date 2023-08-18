import { Access, connect, useAccess } from 'umi';
import React, { useMemo, useRef, useState } from 'react';
import { useActivate } from 'react-activation';
import { Button } from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import Update from './Dialogs/Update';
import { orderDeliveryExpressCompanyPage } from '@/services/pages/shipment';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import CommonLogAms from '@/components/CommonLogAms';

const Page: React.FC<{ common: any }> = ({ common }) => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const _refL: any = useRef();
  const access = useAccess();
  const [open, openSet] = useState(false);
  const [selectedData, selectedDataSet] = useState(null);
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });

  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        title: 'No.',
        dataIndex: 'index',
        valueType: 'index',
        width: 60,
        align: 'center',
        search: false,
      },
      {
        title: '快递编码',
        dataIndex: 'express_code',
        align: 'center',
      },
      {
        title: '快递简称',
        dataIndex: 'express_short',
        align: 'center',
      },
      {
        title: '京东平台对接码',
        dataIndex: 'jd_docking_code',
        align: 'center',
        search: false,
      },
      {
        title: '天猫平台对接码',
        dataIndex: 'tm_docking_code',
        align: 'center',
        search: false,
      },
      {
        title: '抖音对接码',
        dataIndex: 'dy_docking_code',
        align: 'center',
        search: false,
      },
      {
        title: '菜鸟仓对接码',
        dataIndex: 'cainiao_docking_code',
        align: 'center',
        search: false,
      },
      {
        title: '万里牛云仓对接码',
        dataIndex: 'wln_docking_code',
        align: 'center',
        search: false,
      },
      {
        title: '奇门云仓对接码',
        dataIndex: 'qm_docking_code',
        align: 'center',
        search: false,
      },
      {
        title: '京东仓对接码',
        dataIndex: 'jdwh_docking_code',
        align: 'center',
        search: false,
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        align: 'center',
        width: 147,
        search: false,
      },
      {
        title: '启用状态',
        dataIndex: 'status',
        align: 'center',
        width: 80,
        valueEnum: common?.dicList?.SYS_ENABLE_STATUS || {},
        search: false,
      },
      {
        title: '操作',
        width: 90,
        align: 'center',
        valueType: 'option',
        fixed: 'right',
        render: (dom: any, record) => [
          <Access key="edit" accessible={access.canSee('order_express-company_edit')}>
            <a
              onClick={() => {
                selectedDataSet(record);
                openSet(true);
              }}
              type={'primary'}
            >
              编辑
            </a>
          </Access>,
          <Access key="log" accessible={access.canSee('order_express-company_log')}>
            <a
              onClick={() => {
                _refL.current.visibileChange(true, record?.id);
              }}
            >
              日志
            </a>
          </Access>,
        ],
      },
    ],
    [common],
  );
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable
        headerTitle={'快递公司维护'}
        rowKey="id"
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
          const res = await orderDeliveryExpressCompanyPage(formData);
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
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
        dateFormatter="string"
        scroll={{ x: 1200 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        toolBarRender={() => [
          <Access key="add" accessible={access.canSee('order_express-company_add')}>
            {/*新增*/}
            <Button
              onClick={() => {
                selectedDataSet(null);
                openSet(true);
              }}
              type={'primary'}
            >
              新增
            </Button>
          </Access>,
        ]}
      />
      {/*弹框*/}
      <Update
        open={open}
        openSet={openSet}
        initialValues={selectedData}
        reload={actionRef?.current?.reload}
        dicList={common.dicList}
      />
      <CommonLogAms dicList={common?.dicList} _ref={_refL} />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

import { useRef } from 'react';
import { Access, connect, useAccess } from 'umi';
import { useActivate } from 'react-activation';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-form';
import Update from './Dialogs/Update';
import { stockUpCnSafeDaysList } from '@/services/pages/stockUpCn/stockConfig';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import CommonLog from '@/components/CommonLog';
import { getOperationHistory } from '@/services/pages/stockManager';

const Page: React.FC<{ common: any }> = ({ common }) => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });

  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '款式生命周期',
      dataIndex: 'life_cycle',
      valueType: 'select',
      align: 'center',
      valueEnum: common?.dicList?.GOODS_LIFE_CYCLE || {},
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
    },
    {
      title: '安全库存天数',
      dataIndex: 'safe_days',
      align: 'center',
    },
    {
      title: '操作',
      width: 200,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      render: (dom: any, record) => [
        <Access
          key="edit"
          accessible={access.canSee('scm_stock-up-cn_stockConfigCn_update')}
        >
          <Update
            initialValues={record}
            title={'修改安全库存'}
            trigger={<a>修改安全库存</a>}
            reload={actionRef?.current?.reload}
            dicList={common.dicList}
          />
        </Access>,
        <Access key="log" accessible={access.canSee('scm_stock-up-cn_stockConfigCn_log')}>
          <CommonLog
            api={getOperationHistory}
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
        className="seasonRatio"
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        style={{ paddingBottom: '15px', background: '#fff' }}
        pagination={false}
        request={async (params: any) => {
          const formData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
          };
          const res = await stockUpCnSafeDaysList(formData);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          const newD: any = [];
          res?.data.forEach((v: any) => {
            v?.stockUpCnSafeDaysList.forEach((k: any, kindex: number) => {
              newD.push({
                ...k,
                rowSpan: !kindex ? v?.stockUpCnSafeDaysList.length : 0,
                allRow: v?.stockUpCnSafeDaysList
              })
            })
          })
          return {
            success: true,
            data: newD || [],
            total: 0,
          };
        }}
        rowKey="id"
        search={false}
        dateFormatter="string"
        defaultSize={'small'}
      />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;

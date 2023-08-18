import { PageContainer } from '@ant-design/pro-layout';
import { connect, useAccess } from 'umi';
import ProTable from '@ant-design/pro-table';
import type { ActionType } from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import { useRef } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';
import { Modal } from 'antd';
import { getAuditLogList } from '@/services/pages/AmsManage/auditLog';
import Detail from './Detail';

const Log = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const access = useAccess();
  console.log(dicList.ams_app_name);
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      account: params?.name,
      pageIndex: params?.current,
      pageSize: params?.pageSize,
    };

    const res = await getAuditLogList(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.list || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const info = (text: any, width: number) => {
    Modal.info({
      title: '操作说明',
      content: <div style={{ maxHeight: '50vh', overflow: 'auto' }}>{`${text}`}</div>,
      okText: '关闭',
      width,
      onOk() {
        console.log('ok');
      },
    });
  };
  // keepAlive页面激活钩子函数
  useActivate(() => {
    ref?.current?.reload();
  });
  // 表格配置
  const columns: any[] = [
    {
      title: '序号',
      valueType: 'index',
      align: 'center',
      hideInSearch: true,
      width: 90,
    },
    {
      title: (_: any, type: string) => {
        return type === 'table' ? '系统名称' : '系统';
      },
      width: 200,
      dataIndex: 'appName',
      align: 'center',
      valueType: 'select',
      fieldProps: {
        placeholder: '请选择系统名称',
      },
      valueEnum: dicList?.ams_app_name || {},
    },
    {
      title: '功能',
      dataIndex: 'businessTypeName',
      align: 'center',
    },
    {
      title: '操作说明',
      dataIndex: 'operationText',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <a
          onClick={() => {
            info(record.operationText, 1200);
          }}
        >
          查看说明
        </a>
      ),
    },
    {
      title: '系统备注',
      dataIndex: 'remark',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作人',
      dataIndex: 'createName',
      align: 'center',
      width: 100,
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      hideInTable: true,
      valueType: 'dateRange',
      search: {
        transform: (value) => ({
          createStartTime: value[0] + ' 00:00:00',
          createEndTime: value[1] + ' 23:59:59',
        }),
      },
    },
    {
      title: '操作人IP',
      dataIndex: 'requestIp',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '日志详情',
      dataIndex: 'exception',
      align: 'center',
      width: 100,
      hideInSearch: true,
      render: (_: any, record: any) =>
        access.canSee('ams_audit_detail') ? (
          <Detail trigger={<a>查看详情</a>} id={record.id} />
        ) : (
          '-'
        ),
    },
  ];

  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable<TableListItem>
          columns={columns}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          bordered
          actionRef={ref}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          rowKey="id"
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          dateFormatter="string"
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(
  ({ common }: { account: Record<string, unknown>; common: Record<string, unknown> }) => ({
    common,
  }),
)(Log);
export default ConnectPage;

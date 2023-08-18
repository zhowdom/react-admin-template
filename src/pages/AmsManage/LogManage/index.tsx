import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import ProTable from '@ant-design/pro-table';
import type { ActionType } from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import { useRef } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';
import { getLogList } from '@/services/pages/AmsManage/log';
import { Modal } from 'antd';

const Log = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  console.log(dicList.ams_app_name);
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      account: params?.name,
      pageIndex: params?.current,
      pageSize: params?.pageSize,
    };

    const res = await getLogList(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.list || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const info = (text: any, width: number,title: string) => {
    Modal.info({
      title: title || '异常信息',
      content: <div style={{maxHeight: '50vh',overflow: 'auto'}}>{`${text}`}</div>,
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
      title: (_: any, type: string) => {
        return type === 'table' ? '系统名称' : '系统';
      },
      dataIndex: 'appName',
      align: 'center',
      valueType: 'select',
      fieldProps: {
        placeholder: '请选择系统名称',
      },
      valueEnum: dicList?.ams_app_name || {},
    },
    {
      title: '日志类型',
      dataIndex: 'type',
      align: 'center',
      valueType: 'select',
      valueEnum: {
        1: { text: '正常' },
        2: { text: '异常' },
      },
      render: (_: any, record: any) =>
        record.type == '1' ? (
          <span style={{ color: 'green' }}>正常</span>
        ) : (
          <span style={{ color: 'red' }}>异常</span>
        ),
    },

    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      valueType: 'dateRange',
      search: {
        transform: value => ({createStartTime: value[0]+' 00:00:00', createEndTime: value[1]+' 23:59:59'})
      },
      render: (_: any,record: any) => record.createTime ?? '-'
    },
    {
      title: '异常信息',
      dataIndex: 'exception',
      align: 'center',
      width: 100,
      hideInSearch: true,
      render: (_: any, record: any) => <a onClick={() => {info(record.exception, 1200,'异常信息')}}>查看异常</a>,
    },
    {
      title: '执行方法',
      dataIndex: 'method',
      align: 'center',
      hideInSearch: true,
      width: 200,
    },
    {
      title: '请求路径',
      dataIndex: 'url',
      align: 'center',
    },
    {
      title: '请求参数',
      dataIndex: 'params',
      align: 'center',
      hideInSearch: true,
      width: 100,
      render: (_: any, record: any) => <a onClick={() => {info(record.params, 600,'请求参数')}}>查看参数</a>,
    },
    {
      title: '操作ip',
      dataIndex: 'ip',
      align: 'center',
    },
    {
      title: '请求ip',
      dataIndex: 'requestIp',
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
      title: '耗时(ms)',
      dataIndex: 'executeTime',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '地区',
      dataIndex: 'location',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '标题',
      dataIndex: 'title',
      align: 'center',
    },
    {
      title: '操作内容',
      dataIndex: 'operation',
      align: 'center',
      hideInSearch: true,
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

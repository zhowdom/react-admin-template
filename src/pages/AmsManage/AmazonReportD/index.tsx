import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { ActionType } from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import { useRef } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';
import { listPage, download } from '@/services/pages/amazonReportD';
import { Modal } from 'antd';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import { pubGetStoreList } from '@/utils/pubConfirm';
import { useAccess } from 'umi';

const ARD = () => {
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const access = useAccess();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      account: params?.name,
      pageIndex: params?.current,
      pageSize: params?.pageSize,
    };
    const res = await listPage(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.list || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 查看快照信息
  const info = (text: any, width: number, title: string) => {
    Modal.info({
      title: title || '查看信息',
      content: (
        <pre style={{ maxHeight: '60vh', overflow: 'auto' }}>
          {JSON.stringify(JSON.parse(text), null, 2)}
        </pre>
      ),
      okText: '关闭',
      width,
      onOk() {
        console.log('ok');
      },
    });
  };
  // 下载
  const downLoadAction = async (data: any) => {
    const res: any = await download(data);
    const type = res.response.headers.get('content-type');
    if (type.indexOf('application/json') > -1) {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], {
        type: 'text/plain;charset=utf-8',
      });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `亚马逊报告下载`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.target = '_blank';
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
  };
  // keepAlive页面激活钩子函数
  useActivate(() => {
    ref?.current?.reload();
  });
  // 表格配置
  const columns: any[] = [
    {
      title: '报告id',
      dataIndex: 'reportId',
    },
    {
      title: '店铺',
      dataIndex: 'shopId',
      request: () => pubGetStoreList({ business_scope: 'IN' }),
      fieldProps: { showSearch: true },
      valueType: 'select',
      render: (_: any, record: any) => record.shopName ?? '-',
    },
    {
      title: '跨境erp店铺id',
      dataIndex: 'amazonStoreId',
      hideInSearch: true,
      width: 100,
    },
    {
      title: '报告类型',
      dataIndex: 'kind',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'step',
      valueType: 'select',
      valueEnum: {
        READY: {
          text: '准备',
        },
        DOWNLOADED: {
          text: '已下载',
        },
        FINISH: {
          text: '解析完成',
        },
        FAILURE: {
          text: '解析完成',
        },
      },
    },
    {
      title: '报告创建时间',
      dataIndex: 'reportCreatedTime',
      hideInSearch: true,
      width: 130,
    },

    {
      title: '报告数据开始时间',
      dataIndex: 'dataStartTime',
      hideInSearch: true,
      width: 130,
    },

    {
      title: '报告数据结束时间',
      dataIndex: 'dataEndTime',
      hideInSearch: true,
      width: 130,
    },
    {
      title: '报告文档id',
      dataIndex: 'reportDocumentId',
      hideInSearch: true,
      width: 100,
    },
    {
      title: '处理状态',
      dataIndex: 'processingStatus',
      width: 80,
    },

    {
      title: '报告处理开始时间',
      dataIndex: 'processingStartTime',
      hideInSearch: true,
      width: 130,
    },
    {
      title: '报告处理结束时间',
      dataIndex: 'processingEndTime',
      hideInSearch: true,
      width: 130,
    },

    {
      title: '本地的报告数据开始时间',
      dataIndex: 'localDataStartTime',
      hideInSearch: true,
      width: 130,
    },
    {
      title: '本地的报告数据结束时间',
      dataIndex: 'localDataEndTime',
      hideInSearch: true,
      width: 130,
    },
    {
      title: '报告快照信息',
      dataIndex: 'amazonReportSnapshot',
      width: 100,
      hideInSearch: true,
      align: 'center',
      render: (_: any, record: any) => (
        <a
          onClick={() => {
            info(record.amazonReportSnapshot, 1200, '报告快照信息');
          }}
        >
          查看
        </a>
      ),
    },
    {
      title: '报告创建时间',
      dataIndex: 'timeRange',
      hideInTable: true,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (val: any) => ({ createStartTime: val[0], createEndTime: val[1] }),
      },
    },
    {
      title: '报告数据开始时间',
      dataIndex: 'timeRange1',
      hideInTable: true,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (val: any) => ({ dataStartTimeStart: val[0], dataStartTimeEnd: val[1] }),
      },
    },
    {
      title: '报告数据结束时间',
      dataIndex: 'timeRange2',
      hideInTable: true,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (val: any) => ({ dataEndTimeStart: val[0], dataEndTimeEnd: val[1] }),
      },
    },
    {
      title: '操作',
      width: 80,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      hideInTable: !access.canSee('report_amazonReportD_download'),
      render: (dom: any, record: any) => [
        <a
          key="download"
          onClick={() => {
            downLoadAction({
              shopId: record.shopId,
              reportId: record.reportId,
              kind: record.kind,
            });
          }}
        >
          下载
        </a>,
      ],
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
          scroll={{ x: 1600 }}
          search={{ labelWidth: 120, defaultCollapsed: false }}
          dateFormatter="string"
        />
      </PageContainer>
    </>
  );
};

export default ARD;

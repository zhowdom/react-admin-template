import { PageContainer } from '@ant-design/pro-layout';
import { useRef } from 'react';
import { connect } from 'umi';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import { getPage } from '@/services/pages/communicate';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import Detail from './Detail';

const Communicate = (props: any) => {
  const { common } = props;
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      vendor_id: props.id,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await getPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const detailModel = useRef();
  // 详情弹窗
  const detailModelOpen: any = (row: any) => {
    const data: any = detailModel?.current;
    data.open(row);
  };
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const columns: any[] = [
    {
      title: '沟通时间',
      dataIndex: 'communicate_time',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '员工姓名',
      dataIndex: 'communicate_name',
      align: 'center',
    },
    {
      title: '流程来源',
      dataIndex: 'source',
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(common.dicList.VENDOR_COMMUNICATION_SOURCE, record.source);
      },
    },
    {
      title: '拜访信息状态',
      dataIndex: 'status',
      valueType: 'select',
      align: 'center',
      valueEnum: common.dicList.VENDOR_COMMUNICATION_STATUS,
      render: (_: any, record: any) => {
        return pubFilter(common.dicList.VENDOR_COMMUNICATION_STATUS, record.status);
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 120,
      align: 'center',
      valueType: 'option',
      render: (_: any, row: any) => {
        return [
          <a
            onClick={() => {
              detailModelOpen(row);
            }}
            key="edit"
          >
            查看
          </a>,
        ];
      },
    },
  ];
  return (
    <>
      <Detail detailModel={detailModel} />
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable
          columns={columns}
          actionRef={ref}
          options={false}
          pagination={{
            showSizeChanger: true,
          }}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={false}
          rowKey="id"
          dateFormatter="string"
          headerTitle={false}
          bordered
        />
      </PageContainer>
    </>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Communicate);

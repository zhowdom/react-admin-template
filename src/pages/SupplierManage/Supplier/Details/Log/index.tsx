import { PageContainer } from '@ant-design/pro-layout';
import { useRef } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import { getLogList } from '@/services/pages/supplier';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';

const Log = (props: any) => {
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      business_id: props.id,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await getLogList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // const downLoad = async () => {};
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const columns: any[] = [
    {
      title: '操作时间',
      dataIndex: 'create_time',
      align: 'center',
    },
    {
      title: '修改前',
      dataIndex: 'before_value',
      align: 'center',
      render: (dom: any, record: any) => {
        return (
          <span>
            {record.item_name}: {record.before_value}
          </span>
        );
      },
    },
    {
      title: '修改后',
      dataIndex: 'after_value',
      align: 'center',
      render: (dom: any, record: any) => {
        return (
          <span>
            {record.item_name}: {record.after_value}
          </span>
        );
      },
    },
    {
      title: '操作类型',
      dataIndex: 'operation_type',
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList?.SYNC_OPERATION_TYPE, record?.operation_type) || '-';
      },
    },
    {
      title: '操作人',
      dataIndex: 'create_user_name',
      align: 'center',
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
          // toolBarRender={() => [
          //   <Button key="downLoad" onClick={downLoad} type="primary" ghost>
          //     导出日志
          //   </Button>,
          // ]}
        />
      </PageContainer>
    </>
  );
};

export default Log;

import { PageContainer } from '@ant-design/pro-layout';
import { useState, useRef } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import { getApprovalList } from '@/services/pages/supplier';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import Dialog from './dialog';
import { useAccess } from 'umi';

const Approval = (props: any) => {
  const access = useAccess();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      business_id: [props.id],
      business_type: ['APPROVAL_VENDOR_BASE'],
    };
    const res = await getApprovalList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  const [visible, setVisible] = useState(false);
  const [id, setId] = useState(null);
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  // 详情
  const toDetail: any = (row: { id: any }) => {
    setId(row.id);
    setVisible(true);
  };
  // 弹窗关闭
  const handleClose = () => {
    setVisible(false);
  };
  const columns: any[] = [
    {
      title: '审批名称',
      dataIndex: 'title',
      align: 'center',
    },
    {
      title: '提交时间',
      dataIndex: 'create_time',
      align: 'center',
    },
    {
      title: '审批状态',
      dataIndex: 'approval_status',
      align: 'center',
      render: (_, record: any) => {
        const item = props.dicList.VENDOR_APPROVAL_STATUS;
        const key = record?.approval_status;
        return [<span key="approval_status">{item?.[key]?.text || '-'}</span>];
      },
    },
    {
      title: '审批详情',
      key: 'option',
      width: 120,
      align: 'center',
      hideInTable: !access.canSee('scm_approval_detail'),
      valueType: 'option',
      render: (_: any, row: any) => [
        <a
          onClick={() => {
            toDetail(row);
          }}
          key="edit"
        >
          详情
        </a>,
      ],
    },
  ];

  return (
    <>
      <Dialog id={id} isModalVisible={visible} handleClose={handleClose} />
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable
          columns={columns}
          actionRef={ref}
          pagination={{
            showSizeChanger: true,
          }}
          options={false}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={false}
          rowKey="id"
          dateFormatter="string"
          headerTitle="审批历史"
          bordered
          toolBarRender={false}
          className="supplier-approval"
        />
      </PageContainer>
    </>
  );
};

export default Approval;

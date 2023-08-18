import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { PlatformDingdingItem } from '@/types/storage';
import {
  sysApprovalHistoryPage,
  syncSysApprovalHistory,
} from '@/services/pages/settinsDingDingAudit';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubFilter, pubModal } from '@/utils/pubConfig';
import { useAccess } from 'umi';

const selectProps = {
  showSearch: true,
  filterOption: (input: any, option: any) => {
    const trimInput = input.replace(/^\s+|\s+$/g, '');
    if (trimInput) {
      return option.label.indexOf(trimInput) >= 0;
    } else {
      return true;
    }
  },
};
const ContractManage = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const access = useAccess();
  // 添加弹窗实例

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();

  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    console.log('查询', params);
    const postData = {
      ...params,
      approval_status: params?.approval_status ? [params?.approval_status] : null,
      business_type: params?.business_type ? [params?.business_type] : null,
      business_id: params?.business_id ? [params?.business_id] : null,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    delete postData.current;
    delete postData.pageSize;
    const res = await sysApprovalHistoryPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    return {
      data: res?.code == pubConfig.sCode ? res.data.records : [],
      success: res?.code == pubConfig.sCode,
      total: res?.data?.total || 0,
    };
  };
  // 同步钉钉状态
  const changeStatus: any = (row?: any) => {
    pubModal('是否同步钉钉状态？')
      .then(async () => {
        const res = await syncSysApprovalHistory({ id: row?.id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        pubMsg('操作成功！', 'success');
        setTimeout(() => {
          ref?.current?.reload();
        }, 200);
      })
      .catch(() => {
        console.log('点了取消');
      });
  };

  const columns: ProColumns<PlatformDingdingItem>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      align: 'center',
    },
    {
      title: '业务ID',
      dataIndex: 'business_id',
      align: 'center',
      width: 170,
    },
    {
      title: '业务编码',
      dataIndex: 'business_no',
      align: 'center',
      width: 170,
    },
    {
      title: '业务类型',
      dataIndex: 'business_type',
      valueType: 'select',
      align: 'center',
      width: 170,
      fieldProps: selectProps,
      valueEnum: common.dicList.APPROVAL_BUSINESS_TYPE,
      render: (_, row) => {
        return row?.business_type
          ? pubFilter(dicList.APPROVAL_BUSINESS_TYPE, row?.business_type)
          : '-';
      },
    },
    {
      title: '实例ID',
      dataIndex: 'instance_id',
      hideInSearch: true,
      align: 'center',
      width: 300,
    },
    {
      title: '审批状态',
      dataIndex: 'approval_status',
      valueType: 'select',
      align: 'center',
      initialValue: '1',
      width: 100,
      fieldProps: selectProps,
      valueEnum: common.dicList.APPROVAL_STATUS,
      render: (_, row) => {
        return row?.approval_status
          ? pubFilter(dicList.APPROVAL_STATUS, row?.approval_status)
          : '-';
      },
    },
    {
      title: '添加人',
      dataIndex: 'create_user_name',
      align: 'center',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '添加时间',
      dataIndex: 'create_time',
      align: 'center',
      width: 150,
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 120,
      align: 'center',
      valueType: 'option',
      render: (_: any, row: any) => {
        if (row.approval_status == '1' && access.canSee('approval_sync_history')) {
          return (
            <a
              onClick={() => {
                changeStatus(row);
              }}
              key="edit"
            >
              同步钉钉状态
            </a>
          );
        }
      },
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
        <ProTable<PlatformDingdingItem>
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          scroll={{ x: 1500 }}
          formRef={formRef}
          search={{ defaultCollapsed: false, className: 'light-search-form' }}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getList}
          rowKey="id"
          dateFormatter="string"
          headerTitle="钉钉审批记录"
        />
      </PageContainer>
    </>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(ContractManage);
export default ConnectPage;

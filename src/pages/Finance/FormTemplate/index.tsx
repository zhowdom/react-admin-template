import { Access, connect, useAccess } from 'umi';
import { useRef } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import Update from './components/Update';
import CommonLog from '@/components/CommonLog';
import { requestFundsTemplate, changeFieldHistory } from '@/services/pages/form-template';
import { getOperationHistory } from '@/services/pages/stockManager';

const Page = (props: any) => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const dicList = props?.common?.dicList;
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '表单模板名称(钉钉)',
      dataIndex: 'process_template_name',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '表单模板名称',
      dataIndex: 'process_template_name',
      width: 100,
      hideInTable: true,
    },

    {
      title: '表单Code',
      dataIndex: 'process_code',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '请款费用类型',
      dataIndex: 'request_funds_type',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '是否对接到ERP',
      dataIndex: 'dock_sys_flag',
      width: 100,
      hideInSearch: true,
      render: (_: any, record: any) => (record.dock_sys_flag ? '是' : '否'),
    },

    {
      title: '更新时间',
      dataIndex: 'update_time',
      width: 130,
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 100,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (_: any, row: any) => [
        <Access key="edit" accessible={access.canSee('scm_formTemplate_editTemplate')}>
          <Update
            record={row}
            reload={() => {
              actionRef?.current?.reload();
            }}
          />
        </Access>,
        <Access key="edit" accessible={access.canSee('scm_formTemplate_handleLog')}>
          <CommonLog api={getOperationHistory} business_id={row.id} dicList={dicList} />
        </Access>,
      ],
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 2300);
  return (
    <ProTable
      bordered
      columns={columns}
      actionRef={actionRef}
      pagination={{
        showSizeChanger: true,
      }}
      headerTitle={
        <span style={{ color: 'red', fontSize: '12px' }}>
          功能说明：表单管理功能通过添加钉钉的表单审批模板，来确认是否需要将对应流程对接到ERP进行审批，并通过修改是否对接到ERP的对接状态来控制后续是否继续对接
        </span>
      }
      toolBarRender={() => [
        <Access key="edit" accessible={access.canSee('scm_formTemplate_addTemplate')}>
          <Update
            key="add"
            reload={() => {
              actionRef?.current?.reload();
            }}
          />
        </Access>,
      ]}
      formRef={formRef}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      {...ColumnSet}
      request={async (params: any) => {
        const formData = {
          ...params,
          page_size: params.pageSize,
          current_page: params.current,
        };
        const res = await requestFundsTemplate(formData);
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
      dateFormatter="string"
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      search={{ labelWidth: 120, defaultCollapsed: false }}
    />
  );
};
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

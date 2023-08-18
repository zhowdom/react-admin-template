import { ModalForm } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubMsg, pubConfig } from '@/utils/pubConfig';
import { ProTable } from '@ant-design/pro-components';
import { auditLogFieldPage } from '@/services/pages/AmsManage/auditLog';
// 重置密码弹框
const EditDrawer: React.FC<{
  id: any;
  trigger: any;
}> = ({ id, trigger }) => {
  const changeFormRef = useRef<ProFormInstance>();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      auditLogId: id,
      pageIndex: params?.current,
      pageSize: params?.pageSize,
    };

    const res = await auditLogFieldPage(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.list || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  return (
    <ModalForm
      title="日志详情"
      trigger={trigger}
      width={1200}
      labelAlign="right"
      layout="horizontal"
      formRef={changeFormRef}
      modalProps={{
        destroyOnClose: true,
      }}
      submitter={false}
    >
      <ProTable
        options={false}
        columns={[
          {
            title: '修改前',
            dataIndex: 'beforeValue',
            align: 'center',
            hideInSearch: true,
          },
          {
            title: '修改后',
            dataIndex: 'afterValue',
            align: 'center',
            hideInSearch: true,
          },
          {
            title: '变更记录',
            dataIndex: 'diffValue',
            align: 'center',
            hideInSearch: true,
          },
          {
            title: '字段中文名',
            dataIndex: 'propertyName',
            align: 'center',
            hideInSearch: true,
            width: 100,
          },
          {
            title: '字段英文名',
            dataIndex: 'combinationName',
            align: 'center',
            width: 100,
            hideInSearch: true,
          },
          {
            title: '创建时间',
            dataIndex: 'createTime',
            align: 'center',
            width: 200,
            valueType: 'dateRange',
            search: {
              transform: (value) => ({
                createStartTime: value[0] + ' 00:00:00',
                createEndTime: value[1] + ' 23:59:59',
              }),
            },
            render: (_: any, record: any) => record?.createTime ?? '-',
          },
        ]}
        pagination={{
          showSizeChanger: true,
        }}
        bordered
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        rowKey="id"
        search={{ className: 'light-search-form', defaultCollapsed: false }}
        dateFormatter="string"
      />
    </ModalForm>
  );
};
export default EditDrawer;

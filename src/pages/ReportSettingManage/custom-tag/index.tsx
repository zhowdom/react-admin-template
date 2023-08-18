import { Access, useAccess } from 'umi';
import React, { useRef } from 'react';
import { useActivate } from 'react-activation';
import { Popconfirm, Space } from 'antd';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import * as api from '@/services/pages/SettingManage';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import Update from './Dialogs/Update';
import { pubGetUserList } from '@/utils/pubConfirm';
import ProductLine from '@/components/PubForm/ProductLine';
import EditTag from './Dialogs/EditTag';
/*自定义客诉标签 - 列表页*/
const Page: React.FC<{ common: any }> = ({}) => {
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
      title: '标签名',
      dataIndex: 'labelName',
      align: 'center',
      search: {
        transform: (val: any) => ({ labelName: val.trim() }),
      },
    },
    {
      title: '父级标签',
      dataIndex: 'parentLabelName',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '父级标签',
      dataIndex: 'parentId',
      align: 'center',
      hideInTable: true,
      valueType: 'select',
      request: async () => {
        const res = await api.tagPage({
          pageSize: 9999,
          pageIndex: 1,
          parentId: '0',
        });
        if (res?.code == pubConfig.sCode && res?.data?.list) {
          return res.data.list.map((item: any) => ({
            ...item,
            label: `${item.labelName}(${item.categoryName})`,
            value: item.id,
          }));
        }
        return [];
      },
      fieldProps: { showSearch: true },
    },
    {
      title: '产品线',
      dataIndex: 'categoryName',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '产品线',
      dataIndex: 'categoryId',
      valueType: 'select',
      fieldProps: { showSearch: true },
      renderFormItem: () => <ProductLine single={true} />,
      search: {
        transform: (val: string[]) => ({ businessScope: val[0], categoryId: val[1] }),
      },
      hideInTable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      render: (_, record: any) => (
        <span className={record.status == 1 ? 'text-green' : 'text-red'}>
          {record.status == 1 ? '启用' : '禁用'}
        </span>
      ),
      valueType: 'select',
      request: async () => {
        return [
          { label: '启用', value: '1' },
          { label: '禁用', value: '0' },
        ];
      },
    },
    {
      title: '描述',
      dataIndex: 'remark',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '创建人',
      dataIndex: 'createName',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '创建人',
      dataIndex: 'createId',
      valueType: 'select',
      fieldProps: { showSearch: true },
      request: (v: any) => pubGetUserList(v),
      hideInTable: true,
    },
    {
      title: '操作',
      width: 200,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => (
        <Space>
          <Access accessible={access.canSee('liyi99-report_custom_tag_edit')}>
            <EditTag reload={actionRef?.current?.reload} initialValues={record} />
          </Access>

          <Access accessible={access.canSee('liyi99-report_custom_tag_disabled')}>
            <Popconfirm
              title={`确定${record.status == '1' ? '禁用' : '启用'}该标签?`}
              onConfirm={async () => {
                const res = await api.tagDisable({ id: record.id });
                if (res?.code == pubConfig.sCode) {
                  pubMsg(res.message, 'success');
                  actionRef.current?.reload();
                } else {
                  pubMsg(res.message);
                }
              }}
            >
              <a>{record.status == '1' ? '禁用' : '启用'}</a>
            </Popconfirm>
          </Access>
          <Access accessible={access.canSee('liyi99-report_custom_tag_delete')}>
            <Popconfirm
              title={`确定删除该标签?`}
              onConfirm={async () => {
                const res = await api.tagDelete({ id: record.id });
                if (res?.code == pubConfig.sCode) {
                  pubMsg(res.message, 'success');
                  actionRef.current?.reload();
                } else {
                  pubMsg(res.message);
                }
              }}
            >
              <a>删除</a>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable
        bordered
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        pagination={{
          showSizeChanger: true,
        }}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={async (params: any) => {
          const formData = {
            ...params,
            pageIndex: params.current,
          };
          const res = await api.tagPage(formData);
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
            data: res?.data?.list || [],
            total: res?.data?.total || 0,
          };
        }}
        rowKey="id"
        dateFormatter="string"
        headerTitle={'自定义客诉标签'}
        toolBarRender={() => [
          <Space key={'tools'}>
            <Access accessible={access.canSee('liyi99-report_custom_tag_add')}>
              {/*添加子标签*/}
              <Update reload={actionRef?.current?.reload} />
            </Access>
            <Access accessible={access.canSee('liyi99-report_custom_tag_add')}>
              {/*添加父标签*/}
              <Update reload={actionRef?.current?.reload} isParent={true} />
            </Access>
          </Space>,
        ]}
        scroll={{ x: 800 }}
        sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
        showSorterTooltip={false}
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
      />
    </PageContainer>
  );
};

export default Page;

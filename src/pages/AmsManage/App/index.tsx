import { PageContainer } from '@ant-design/pro-layout';
import { Access, useAccess } from 'umi';
import { useRef } from 'react';
import { Button, Popconfirm, Switch, Tag } from 'antd';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import { deleteAction, getAppList, updateStatus } from '@/services/pages/AmsManage/app';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import Add from './Add';
import { pubModal } from '@/utils/pubConfig';

const Account = () => {
  const access = useAccess();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      pageIndex: params?.current,
      pageSize: params?.pageSize,
    };

    const res = await getAppList(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.list || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 搜索清除前后空格
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
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();

  // 启用禁用数据
  const updateStatusAction = (val: any, id: string) => {
    console.log(val);
    pubModal(`是否${val ? '启用' : '停用'}此应用？`)
      .then(async () => {
        const res = await updateStatus({ id, status: val ? 'y' : 'n' });
        if (res?.code != pubConfig.sCodeOrder) {
          pubMsg(res?.message);
          return;
        }
        pubMsg('操作成功!', 'success');
        ref?.current?.reload();
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 删除
  const deleteApp = async (id: string) => {
    const res = await deleteAction({ appId: id });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      return;
    }
    pubMsg('操作成功!', 'success');
    ref?.current?.reload();
  };
  // keepAlive页面激活钩子函数
  useActivate(() => {
    ref?.current?.reload();
  });
  // 表格配置
  const columns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      align: 'center',
      valueType: 'index',
    },
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '编码',
      dataIndex: 'code',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '系统名称',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      width: 80,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: selectProps,
      hideInSearch: true,
      align: 'center',
      render: (_, record) => {
        return access.canSee('ams_app_statusUpdate') ? (
          <Switch
            onChange={(val) => updateStatusAction(val, record.id)}
            checkedChildren="启用"
            unCheckedChildren="停用"
            checked={record.status == 'y' ? true : false}
          />
        ) : (
          <>
            {record.status == 'y' && <Tag color="green">启用</Tag>}
            {record.status == 'n' && <Tag color="red">停用</Tag>}
          </>
        );
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 220,
      align: 'center',
      valueType: 'option',
      hideInTable: !access.canSee('account_reset'),
      render: (_: any, row: any) => [
        <Access key="edit" accessible={access.canSee('ams_app_edit')}>
          <Add id={row.id} trigger={<a>编辑</a>} reload={() => ref?.current?.reload()} />
        </Access>,
        <Access key="delete" accessible={access.canSee('ams_app_delete')}>
          <Popconfirm
            key="delete"
            title="确定删除吗?"
            onConfirm={async () => deleteApp(row.id)}
            okText="确定"
            cancelText="取消"
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </Access>,
      ],
    },
  ];
  return (
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
          headerTitle={
            <Access key="add" accessible={access.canSee('ams_app_add')}>
              <Add
                trigger={<Button type="primary">添加应用</Button>}
                reload={() => ref?.current?.reload()}
              />
            </Access>
          }
        />
      </PageContainer>
  );
};

export default Account;

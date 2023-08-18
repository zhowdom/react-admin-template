/*数据字典*/
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, Modal, Popconfirm, Space } from 'antd';
import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { BetaSchemaForm } from '@ant-design/pro-form';
import { connect } from 'umi';
import { dictAdd, dictUpdate, dictDelete, dictPage, refreshCache } from '@/services/base';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import DictDetail from './DictDetail';
import { useAccess, Access } from 'umi';
// 页面主体
const Page: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [visibleDrawer, setVisibleDrawer] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  // table配置
  const columns: ProColumns<any>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      align: 'center',
      hideInSearch: true,
      valueType: 'index',
      width: 80,
    },
    {
      title: '分组名称',
      dataIndex: 'dictName',
      ellipsis: true,
    },
    {
      title: '分组编码',
      dataIndex: 'dictType',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      valueType: 'select',
      initialValue: '0',
      width: 80,
      fieldProps: {
        allowClear: false,
        options: [
          {
            label: '启用',
            value: '0',
          },
          {
            label: '停用',
            value: '1',
          },
        ],
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      align: 'center',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      hideInSearch: true,
      width: 136,
    },
    {
      title: '操作',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 160,
      render: (_, row) => [
        <Access key="edit" accessible={access.canSee('ams_dict_editType')}>
          <a
            key="edit"
            onClick={() => {
              setData(row);
              setVisible(true);
            }}
          >
            修改
          </a>
        </Access>,
        <Access key="delete" accessible={access.canSee('ams_dict_deleteType')}>
          <Popconfirm
            key="delete"
            title="确认删除"
            onConfirm={async () => {
              const res = await dictDelete({ ids: row.id });
              if (res?.code == pubConfig.sCodeOrder) {
                pubMsg(res?.message || '操作成功!', 'success');
                actionRef.current?.reload();
              } else {
                pubMsg(res.message);
              }
            }}
          >
            <a>删除</a>
          </Popconfirm>
        </Access>,
        <Access key="accessButton" accessible={access.canSee('ams_dict_log_listPage')}>
          <a
            key="data"
            onClick={() => {
              setData(row);
              setVisibleDrawer(true);
            }}
          >
            字典列表
          </a>
        </Access>,
      ],
    },
  ];
  // json表单
  const columnsJson: any[] = [
    {
      title: '分组名称',
      dataIndex: 'dictName',
      formItemProps: {
        rules: [{ required: true, message: '此项为必填项' }],
      },
      fieldProps: {
        maxLength: 100,
      },
    },
    {
      title: '分组编码',
      dataIndex: 'dictType',
      formItemProps: {
        rules: [{ required: true, message: '此项为必填项' }],
      },
      fieldProps: {
        maxLength: 100,
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      formItemProps: {
        rules: [{ required: true, message: '此项为必填项' }],
      },
      valueEnum: {
        '0': { text: '启用' },
        '1': { text: '停用' },
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      valueType: 'textarea',
      fieldProps: {
        maxLength: 200,
      },
    },
  ];
  return (
    <PageContainer
      header={{ title: false, breadcrumb: {} }}
    >
      <ProTable
        rowKey="id"
        bordered
        headerTitle={'数据字典'}
        actionRef={actionRef}
        dateFormatter="string"
        request={async (params) => {
          const queryParams = {
            status: '0',
            ...params,
            pageIndex: params.current,
          };
          delete queryParams.current
          const res = await dictPage(queryParams);
          if (res.code == pubConfig.sCodeOrder) {
            return {
              total: res.data?.total || 0,
              data: res.data?.list || [],
              success: true,
            };
          } else {
            pubMsg(res.message);
            return {
              success: false,
            };
          }
        }}
        columns={columns}
        search={{
          defaultCollapsed: false,
          labelWidth: 100,
          className: 'light-search-form',
        }}
        toolBarRender={() => [<Space key={'tools'}>
          <Access key="accessButton" accessible={access.canSee('ams_dict_addType')}>
            <Button type="primary" onClick={() => setVisible(true)}>
              新增
            </Button>
          </Access>
          <Access key="accessButton" accessible={access.canSee('ams_dict_reload')}>
            <Popconfirm
              title="确定刷新缓存?"
              onConfirm={async () => {
                const res = await refreshCache({ time: new Date().getTime() })
                if (res?.code == pubConfig.sCodeOrder) {
                  pubMsg(res?.message || '刷新成功!', 'success')
                  return true
                } else {
                  pubMsg(res?.message)
                  return false
                }
              }}
              okText="确定"
              cancelText="取消"
            >
              <Button type="primary" ghost>刷新缓存</Button>
            </Popconfirm>
          </Access>
        </Space>]}
      />
      <Drawer
        width="800px"
        bodyStyle={{ padding: 0 }}
        title={data && `${data.dictName}(${data.dictType})`}
        placement="right"
        onClose={() => {
          setData(null);
          setVisibleDrawer(false);
        }}
        visible={visibleDrawer}
      >
        <DictDetail dataSource={data} />
      </Drawer>
      <Modal
        title="新增/编辑字典分组"
        footer={null}
        visible={visible}
        onCancel={() => {
          setData(null);
          setVisible(false);
        }}
        destroyOnClose
        maskClosable={false}
      >
        <BetaSchemaForm
          request={async () => {
            return data || {};
          }}
          params={data || {}}
          shouldUpdate={false}
          columns={columnsJson}
          onFinish={async (values) => {
            let api = dictAdd;
            if (data) {
              api = dictUpdate;
            }
            const res = await api({ ...values, id: data?.id });
            if (res && res.code == pubConfig.sCodeOrder) {
              pubMsg(res?.message || '操作成功!', 'success');
              setVisible(false);
              actionRef.current?.reload();
            } else {
              pubMsg(res.message);
            }
          }}
        />
      </Modal>
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;

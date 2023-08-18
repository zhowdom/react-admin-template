/*数据字典详情弹框*/
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { Popconfirm, Select } from 'antd';
import React, { useRef } from 'react';
import { dictDetail, dictDetailAdd, dictDetailDelete, dictDetailUpdate } from '@/services/base';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useAccess, Access } from 'umi';
// 页面主体
const DictDetail: React.FC<{ dataSource: any }> = ({ dataSource }) => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  // table配置
  const columns: ProColumns<any>[] = [
    {
      title: '排序',
      dataIndex: 'dictSort',
      align: 'center',
      valueType: 'digit',
      initialValue: 1,
      fieldProps: {
        min: 1,
        max: 100,
        precision: 0,
      },
      width: 100,
      search: false,
      sorter: (a: any, b: any) => a.dictSort - b.dictSort,
    },
    {
      title: '字典名称',
      dataIndex: 'dictLabel',
      hideInTable: true,
    },
    {
      title: '字典名称',
      dataIndex: 'dictLabel',
      align: 'right',
      fieldProps: {
        maxLength: 100,
      },
      formItemProps: { rules: [{ required: true, message: '此项为必填项' }] },
      search: false,
    },
    {
      title: '字典编码',
      dataIndex: 'dictValue',
      hideInTable: true,
    },
    {
      title: '字典编码',
      dataIndex: 'dictValue',
      align: 'left',
      fieldProps: {
        maxLength: 100,
      },
      formItemProps: { rules: [{ required: true, message: '此项为必填项' }] },
      search: false,
      sorter: (a: any, b: any) => a.dictValue - b.dictValue,
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      initialValue: '0',
      valueEnum: {
        '0': { text: '正常', status: 'success' },
        '1': { text: '禁用', status: 'default' },
      },
      renderFormItem: () => (
        <Select
          options={[
            { label: '正常', value: '0' },
            { label: '禁用', value: '1' },
          ]}
        />
      ),
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      fieldProps: {
        maxLength: 100,
      },
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 160,
      render: (text, record, _, action) => [
        <Access key="dict_log_edit" accessible={access.canSee('ams_dict_log_edit')}>
          <a
            key="editable"
            onClick={() => {
              action?.startEditable?.(record.id);
            }}
          >
            编辑
          </a>
        </Access>,
        <Access key="dict_log_delete" accessible={access.canSee('ams_dict_log_delete')}>
          <Popconfirm
            key="delete"
            title="确认删除"
            onConfirm={async () => {
              const res = await dictDetailDelete({
                ids: record.id,
              });
              if (res.code == pubConfig.sCodeOrder) {
                pubMsg(res.message || '操作成功', 'success');
                actionRef.current?.reload()
              } else {
                pubMsg(res.message);
              }
            }}
          >
            <a>删除</a>
          </Popconfirm>
        </Access>
      ],
    },
  ];
  return (
    <EditableProTable
      form={{ ignoreRules: true }}
      rowKey="id"
      actionRef={actionRef}
      dateFormatter="string"
      key={dataSource?.dictType}
      request={async (params) => {
        if (!dataSource) return Promise.reject()
        const res = await dictDetail({
          ...params,
          dictType: dataSource.dictType,
          pageIndex: 1,
          pageSize: 999,
          dictLabel: '',
          dictName: dataSource.dictName
        });
        if (res.code == pubConfig.sCodeOrder) {
          return {
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
      search={{ labelWidth: 100 }}
      pagination={false}
      options={false}
      recordCreatorProps={access.canSee('ams_dict_log_add') ? { record: () => ({ id: Date.now() }) } : false}
      editable={{
        onSave: async (rowKey, data: any) => {
          let api = dictDetailAdd;
          if (data.dictType) {
            api = dictDetailUpdate;
            data.id = rowKey;
          } else {
            delete data.id
          }
          const res = await api({ ...data, dictType: dataSource.dictType });
          if (res && res.code == pubConfig.sCodeOrder) {
            pubMsg(res.message || '操作成功!', 'success');
          } else {
            pubMsg(res.message);
          }
          actionRef.current?.reload();
        },
      }}
    />
  );
};
export default DictDetail;

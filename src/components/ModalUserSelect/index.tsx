import {UserAddOutlined} from '@ant-design/icons';
import {ProTable} from '@ant-design/pro-components'
import type {ProColumns} from '@ant-design/pro-components'
import {Button, Modal, Space, Tag} from 'antd';
import {useMemo, useState} from 'react';
import {getUsers} from "@/services/base";
import {pubConfig} from "@/utils/pubConfig";
// 通用导出按钮
const Component: React.FC<{
  onChange: (arg: any[]) => any;
  value: Record<string, any>[];
  trigger?: any;
  appType?: string; // 默认钉钉用户
}> = ({trigger, value = [], onChange = Function.prototype, appType = '3'}) => {
  const [open, openSet] = useState(false)
  const selectedRowKeys = useMemo(() => value.map(item => item.id), [value])

  const columns: ProColumns[] = [
    {
      title: '账号',
      dataIndex: 'account',
      align: 'center',
      width: 170,
      hideInSearch: true,
      render: (_, record) => <Space>{record.account} {record.appType == '3' ? <Tag color={'blue'}>钉钉</Tag> : null}</Space>
    },
    {
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
      hideInSearch: true,
      width: 90,
    },
    {
      title: '姓名/账号',
      dataIndex: 'key',
      align: 'center',
      hideInTable: true,
    },
    {
      title: '部门',
      dataIndex: 'deptNames',
      hideInSearch: true,
    },
    {
      title: '职位',
      dataIndex: 'position',
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInSearch: true,
      align: 'center',
      width: 80,
      render: (_, record) => <Tag color={record.status == 1 ? 'green' : 'red'}>{record.status == 1 ? '在职' : '离职'}</Tag>
    },
  ]

  return <>
    {trigger || <Button icon={<UserAddOutlined/>} type="primary" onClick={() => openSet(true)}>选择人员</Button>}
    <Modal title={'选择人员'} bodyStyle={{padding: '0 12px'}} width={800} open={open} onCancel={() => openSet(false)} footer={<Button type={'primary'} onClick={() => openSet(false)}>确定</Button>}>
      <ProTable rowKey={'id'}
                columns={columns}
                options={false}
                defaultSize={'small'}
                bordered
                search={{ defaultCollapsed: false, className: 'light-search-form', span: 8 }}
                cardProps={{bodyStyle: {padding: 0}}}
                sticky={{offsetScroll: 0, offsetHeader: 0}}
                rowSelection={{
                  preserveSelectedRowKeys: true,
                  selectedRowKeys,
                  onChange: (v, rows) => onChange(rows),
                }}
                request={async (params: any) => {
                  const key = params?.key ? params?.key.trim() : ''
                  const res = await getUsers({
                    ...params,
                    appType,
                    name: key,
                    account: key,
                    pageIndex: params.current
                  })
                  if (res?.code == pubConfig.sCodeOrder) {
                    return {
                      success: true,
                      data: res?.data?.list || [],
                      total: res?.data?.total
                    }
                  } else {
                    return {
                      success: false,
                      data: [],
                      total: 0
                    }
                  }
                }}
      />
    </Modal>
  </>
};
export default Component;

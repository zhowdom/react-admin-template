import { ModalForm } from '@ant-design/pro-form';
import { useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  getUserRoleByUserIdAndRoleId,
} from '@/services/pages/AmsManage/users';
import {  Tag } from 'antd';
// 重置密码弹框
const EditDrawer: React.FC<{
  rowData?: any;
  trigger: any;
}> = ({ rowData, trigger }) => {
  const [detail, setDetail] = useState<any>({});
  const [userList, setUserList] = useState<any>([]);
  // 获取详情
  const getDetail = async (idT: string) => {
    const res = await getUserRoleByUserIdAndRoleId({ roleId: idT });
    if (res.code == '0') {
      setUserList(res.data?.users);
    }
  };

  // 表格配置
  const columns: ProColumns[] = [
    {
      title: '账号',
      dataIndex: 'account',
      align: 'center',
      width: 170,
      hideInSearch: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '姓名/账号',
      dataIndex: 'key',
      align: 'center',
      render: (_, record) => (
        <>
        { record.account }
        { record.appType == 3 ?(<Tag color="blue">钉钉</Tag>):'' }
        </>
      ),
    },
    {
      title: '职位',
      dataIndex: 'position',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInSearch: true,
      align: 'center',
      width: 80,
      render: (_, record) => (
        <>
          {record.status == 1 && <Tag color="green">在职</Tag>}
          {record.status == 0 && <Tag color="red">离职</Tag>}
        </>
      ),
    },
  ];
  return (
    <ModalForm
      title={`查看角色已有人员 -- 【${detail?.name}】`}
      trigger={trigger}
      width={600}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      submitter={false}
      onOpenChange={async (visible: boolean) => {
        if (visible) {
          if (rowData) {
            setDetail(rowData);
            getDetail(rowData?.id)
          }
        }
      }}
    >
      <ProTable
        columns={columns}
        options={false}
        pagination={false}
        bordered
        dataSource={userList}
        rowKey="id"
        size='small'
        search={false}
        dateFormatter="string"
        className="p-table-0"
      />
    </ModalForm>
  );
};
export default EditDrawer;

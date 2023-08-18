import { ModalForm } from '@ant-design/pro-form';
import { useState } from 'react';
import { Row, Col, Tag } from 'antd';
import ProTable from '@ant-design/pro-table';
import { pubMsg, pubConfig, pubModal } from '@/utils/pubConfig';
import { getRoleMenuByMenuIdAndRoleId, getUserRoleByUserIdAndRoleId, removeUserRoleByRoleIdAndUserIds } from '@/services/pages/AmsManage/menus';
// 重置密码弹框
const EditDrawer: React.FC<{
  data?: any;
  reload: any;
  trigger: any;
}> = ({ data, trigger, reload }) => {
  const [myMenu, setMyMenu] = useState('')
  const [hasdRole, setHasdRole] = useState([])
  const [selectedRowKeys, selectedRowKeysSet] = useState<any>([]);
  const [chosedRole, chosedRoleSet] = useState<any>({});
  const [rigthData, rigthDataSet] = useState<any>([]);
  // 递归找名字
  const getName = (mydata: any, newArr?: any) => {
    const newText = newArr || [];
    newText.push(mydata[0].name);
    if (mydata[0].children) {
      getName(mydata[0].children, newText);
    }
    return newText;
  };
  // 通过菜单id 获取角色
  const getDetail = async (id: string) => {
    const res = await getRoleMenuByMenuIdAndRoleId({ menuId: id });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    } else {
      const name = getName(res.data?.menus || []).map((v: any) => `[${v}]`);
      setMyMenu(`查询角色/用户 - ${name.join(' - ')}`);
      setHasdRole(res?.data?.roles || []);
    }
  };
  // 通过角色id 获取人
  const getUser = async (rData: any) => {
    const res = await getUserRoleByUserIdAndRoleId({ roleId: rData?.id });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    } else {
      chosedRoleSet(rData);
      rigthDataSet(res?.data?.users || []);
    }
  };

  // 表格配置
  const columns: any[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      align: 'center',
    },
    {
      title: '操作',
      key: 'option',
      width: 120,
      align: 'center',
      valueType: 'option',
      render: (_: any, row: any) => (
        <a onClick={() => getUser(row)}>查看用户</a>
      ),
    },
  ];
  const columns1: any[] = [
    {
      title: '员工姓名',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '职位',
      dataIndex: 'position',
      align: 'center',
    },
    {
      title: '账号',
      dataIndex: 'account',
      width: 160,
      align: 'center',
      valueType: 'option',
      render: (_: any, row: any) => (
        <>
          {row?.account} <Tag v-if="row.appType == '3'" color="blue">钉钉</Tag>
        </>
      ),
    },
  ];
  return (
    <ModalForm
      title={myMenu}
      trigger={trigger}
      width={900}
      labelCol={{ flex: '0 0 105px' }}
      wrapperCol={{ span: 16 }}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        okText:'取消选择用户和角色的关联'
      }}
      onOpenChange={async (visible: boolean) => {
        if (visible) {
          if (data) {
            setTimeout(() => {
              getDetail(data?.id)
            }, 200);
          }
        }
      }}
      onFinish={async () => {
        pubModal(`是否取消选择用户和角色的关联？`)
          .then(async () => {
            const newData = {
              userIds: selectedRowKeys.join(','),
              roleId: chosedRole.id,
            };
            const res = await removeUserRoleByRoleIdAndUserIds(newData);
            if (res?.code != pubConfig.sCodeOrder) {
              pubMsg(res?.message);
              return false;
            } else {
              pubMsg('操作成功', 'success');
              chosedRoleSet({});
              rigthDataSet([]);
              return true;
            }
          })
          .catch(() => {
            console.log('点击了取消');
          });
      }}
      validateTrigger="onBlur"
    >
      <Row gutter={10}>
        <Col span={11}>
          <ProTable
            columns={columns}
            options={false}
            pagination={false}
            bordered
            dataSource={hasdRole}
            rowKey="id"
            size='small'
            search={false}
            dateFormatter="string"
            className="p-table-0"
          />
        </Col>
        <Col span={13}>
          <ProTable
            columns={columns1}
            options={false}
            pagination={false}
            bordered
            dataSource={rigthData}
            rowKey="id"
            headerTitle={`选择的角色: ${chosedRole?.name || ''}`}
            size='small'
            search={false}
            dateFormatter="string"
            className="p-table-0"
            tableAlertRender={false}
            showSorterTooltip={false}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => {
                selectedRowKeysSet(keys);
              },
            }}
          />

        </Col>
      </Row>

    </ModalForm>
  );
};
export default EditDrawer;

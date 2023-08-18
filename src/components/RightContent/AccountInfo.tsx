import React, {useState} from 'react';
import {Modal, Tag, Divider, Table} from 'antd';
import {ProDescriptions} from '@ant-design/pro-components';
import {pubConfig, pubMsg} from '@/utils/pubConfig';
import {getUserRoleByUserIdAndRoleId, getAuthoritys} from '@/services/pages/AmsManage/users';
import './index.less'

// 颜色
const colors: string[] = [
  'pink',
  'blue',
  'green',
  'gold',
  'volcano',
  'cyan',
  'purple',
  'lime',
  'geekblue',
  'red',
];
const Dialog: React.FC<{ trigger?: any, currentUser: any }> = ({trigger, currentUser}) => {
  const [open, openSet] = useState(false)
  const [roles, rolesSet] = useState([])
  const [auths, authsSet] = useState<any>({})

  return (
    <>
      <span onClick={() => openSet(true)}>{trigger || <span>账号信息</span>}</span>
      <Modal
        title="账号信息"
        width={1200}
        open={open}
        onCancel={() => openSet(false)}
        footer={null}
        className={'modal-account-info'}
        bodyStyle={{paddingTop: 12}}
        destroyOnClose
      >
        <ProDescriptions column={3} request={async () => {
          // 获取数据权限
          getAuthoritys({}).then((res: any) => {
            if (res?.code == pubConfig.sCode) {
              authsSet(res.data)
            } else {
              pubMsg(res?.message + ', 获取账号数据权限信息失败~')
              authsSet({})
            }
          })
          const res = await getUserRoleByUserIdAndRoleId({userId: currentUser?.id});
          if (res?.code == pubConfig.sCode) {
            rolesSet(res.data.roles)
            return {
              success: true,
              data: res.data?.users[0] || {},
            }
          } else {
            pubMsg(res?.message + ', 获取账号信息失败~')
            rolesSet([])
            return {
              success: false,
              data: {},
            }
          }
        }}>
          <ProDescriptions.Item span={3} style={{paddingBottom: 6}}>
            <h3>基本信息</h3>
          </ProDescriptions.Item>
          <ProDescriptions.Item label={'账号'} dataIndex={'account'}/>
          <ProDescriptions.Item label={'姓名'} dataIndex={'name'}/>
          <ProDescriptions.Item label={'手机'} dataIndex={'account'}/>
          <ProDescriptions.Item label={'钉钉'} dataIndex={'dingdingId'}/>
          <ProDescriptions.Item label={'职位'} dataIndex={'position'}/>
          <ProDescriptions.Item />
          <ProDescriptions.Item label={'角色'} span={3} contentStyle={{display: 'flex', flexWrap: 'wrap'}}>
            {roles.map((item: any) => <Tag key={item.id}>{item.name}</Tag>)}
          </ProDescriptions.Item>
          <ProDescriptions.Item span={3}>
            <Divider style={{margin: 0}}/>
          </ProDescriptions.Item>
          <ProDescriptions.Item span={3} style={{paddingBottom: 10}}>
            <h3>数据权限</h3>
          </ProDescriptions.Item>
          <ProDescriptions.Item span={3} contentStyle={{display: 'block'}}>
            <Table bordered style={{width: '100%'}} rowKey={'id'} pagination={false} columns={[
              {
                title: '数据权限名称',
                dataIndex: 'title',
                width: 108,
              },
              {
                title: '数据权限详情',
                dataIndex: 'detail',
                align: 'center',
                render: (_, record: any) => {
                  return auths[record.detail] ? Object.keys(auths[record.detail]).map((key, index) => {
                    const items = auths[record.detail][key];
                    return (
                      <div key={key} className="productLine-item">
                        <span className="vendor-group-title" style={{minWidth: 64}}>{key == 'CN' ? '国内' : key == 'IN' ? '跨境' : key}: </span>
                        <span className="vendor-group-content">{items.map((item: any) => (<Tag color={colors[index]} key={item.id}>{item.shop_name || item.name}</Tag>))}</span>
                      </div>
                    );
                  }) : '-'
                }
              },
            ]} dataSource={[
              {id: 1, title: '产品线', detail: 'vendorGroupMap',},
              {id: 2, title: '店铺', detail: 'shopMap',}
            ]}/>
          </ProDescriptions.Item>
        </ProDescriptions>

      </Modal>
    </>
  );
};
export default Dialog;

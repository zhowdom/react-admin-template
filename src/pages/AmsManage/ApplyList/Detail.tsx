import { Modal, Spin, Steps, Space, Tag, Button, Divider, Tree, Tabs } from 'antd'
import { FileOutlined } from '@ant-design/icons'
import * as api from '@/services/pages/AmsManage/applyList'
import { pubConfig, pubMsg, pubFilter } from "@/utils/pubConfig";
import { useEffect, useMemo, useState } from "react";
import { useAccess, Access } from "umi";
import { operates } from './index'
import Approval from './Approval'

const Component: React.FC<{
  open: boolean;
  openSet: any;
  dataSource: Record<string, any>;
  dicList: any;
  currentUser: any;
  refresh: any;
}> = ({ open, openSet, dataSource, dicList, currentUser, refresh }) => {
  const access = useAccess();
  const [loading, loadingSet] = useState(false)
  const [openApproval, openApprovalSet] = useState(false)
  const [approval, approvalSet] = useState('')
  const [detail, detailSet] = useState<any>({})
  const status = useMemo(() => detail?.status, [detail])
  console.log(currentUser)
  const treeData = useMemo(() => {
    if (detail?.roles?.length) {
      return detail?.roles
    }
    return []
  }, [detail])
  const { Step } = Steps

  const aaDist = {
    checkReject: { text: '初审拒绝' },
    checkagree: { text: '初审同意' },
    reject: { text: '拒绝' },
    agree: { text: '同意' },
    applying: { text: '提交申请' },
  }


  const changeMenu = (data: any) => {
    const newData: any = [];
    data.forEach((item: any) => {
      let newChildren = null; // 子级菜单
      const buttonList: any = []; // 子级按钮
      if (item.children) {
        if (item.children[0]?.type == 2) {
          newChildren = null;
          item.children.forEach((s: any) => {
            buttonList.push({
              ...s,
              allIds: item.children.map((k: any) => k.id),
            });
          });
        }
        if (item.children[0]?.type == 1) {
          newChildren = changeMenu(item.children);
        }
      }
      newData.push({
        ...item,
        children: newChildren,
        buttonList,
      });
    });
    return newData;
  };
  const getDetail = async () => {
    loadingSet(true)
    const res = await api.findById({ id: dataSource.id });
    loadingSet(false)
    if (res.code == pubConfig.sCodeOrder) {
      const temp = res.data
      temp.roles.forEach((element: any) => {
        element.apps.forEach((kitem: any) => {
          kitem.children = changeMenu(kitem.children);
        });
      })
      console.log(temp, 'detail')
      detailSet(temp)
    } else {
      pubMsg(res?.message)
    }
  };
  useEffect(() => {
    if (open) {
      getDetail()
    }
  }, [open])
  return (
    <>
      <Modal title={'审批详情'}
        width={800}
        open={open}
        footer={null}
        onCancel={() => {
          detailSet({})
          openSet(false)
        }}>
        <Spin spinning={loading}>
          {status != 'prepare' ?
            <Steps current={['applying'].includes(status) ? 0 : ['checkagree', 'checkReject'].includes(status) ? 2 : 3}>
              <Step title={'已申请'} description={<div>{detail.createName} <br /> {detail.createTime}</div>} />
              <Step {...['checkReject'].includes(status) ? { status: 'error' } : {}} title={['applying'].includes(status) ? '等待处理' : ['checkagree', 'agree', 'reject'].includes(status) ? '已通过' : '已拒绝'}
                description={
                  ['applying'].includes(status) ?
                    detail.checkUsers.map((item: any) => item.name).toString(',') :
                    <div>
                      {detail.checkName} <br /> {detail.checkTime}
                    </div>
                }
              />
              {['applying', 'checkagree', 'agree', 'reject'].includes(status) ?
                <Step {...['reject'].includes(status) ? { status: 'error' } : {}} title={['applying', 'checkagree'].includes(status) ? '等待处理' : ['agree'].includes(status) ? '已通过' : '已拒绝'}
                  description={
                    ['applying', 'checkagree'].includes(status) ?
                      detail.passUsers.map((item: any) => item.name).toString(',') :
                      <div>
                        {detail.updateName} <br /> {detail.updateTime}
                      </div>
                  } />
                : null
              }
            </Steps>
            : null}
          {status != 'prepare' ? <Divider /> : null}
          <Space size={40} align={'start'}>
            <Space direction={'vertical'}>
              <div>业务名称: {detail.businessName}</div>
              <div>申请人: {detail.createName}</div>
              <div>审批状态: {
                ['checkagree', 'agree'].includes(status) ?
                  <Tag color={'green'}>{pubFilter(dicList?.ams_apply_status, status)}</Tag> :
                  ['checkReject', 'reject'].includes(status) ?
                    <Tag color={'red'}>{pubFilter(dicList?.ams_apply_status, status)}</Tag> :
                    <Tag>{pubFilter(dicList?.ams_apply_status, status)}</Tag>
              }
              </div>
              <Space>
                {
                  ['applying'].includes(status) ?
                    <Access accessible={access.canSee('ams_apply_check')}>
                      <Space>
                        <Button onClick={() => {
                          openApprovalSet(true)
                          approvalSet('checkagree')
                        }} type={'primary'}>初审同意</Button>
                        <Button onClick={() => {
                          openApprovalSet(true)
                          approvalSet('checkReject')
                        }} type={'primary'}>初审拒绝</Button>
                      </Space>
                    </Access> :
                    ['checkagree'].includes(status) ?
                      <Access accessible={access.canSee('ams_apply_audit')}>
                        <Space>
                          <Button onClick={() => {
                            openApprovalSet(true)
                            approvalSet('agree')
                          }} type={'primary'}>同意</Button>
                          <Button onClick={() => {
                            openApprovalSet(true)
                            approvalSet('reject')
                          }} type={'primary'}>拒绝</Button>
                        </Space>
                      </Access> : null
                }
                {
                  ['applying'].includes(status) && detail.createId == currentUser.id ?
                    <Button type={'primary'} onClick={() => operates(detail.id, api.withdraw, refresh)}>撤回</Button> :
                    null
                }
              </Space>
            </Space>
            <Steps progressDot direction={'vertical'}>
              {detail?.historyRemaks?.map((item: any, i: number) =>
                <Step status={'finish'} key={i} title={
                  <>
                    {`${item.createName}(${pubFilter(aaDist, item.status)}) ${item.createTime}`}
                  </>
                } description={item.remark} />
              )}
            </Steps>
          </Space>
          {treeData.length ? <>
            <div style={{ marginTop: '10px' }}>
              <Tabs
                items={treeData.map((tData: any) => ({
                  label: tData.name,
                  key: tData.id,
                  children: (
                    <Tree defaultExpandAll defaultExpandParent autoExpandParent selectable={false} treeData={tData.apps[0].children}
                      fieldNames={{ title: 'name', key: 'routeUrl', children: 'children' }}
                      titleRender={(node: any) => {
                        return <>
                          <div><FileOutlined /> {node?.name}</div>
                          {node?.buttonList?.length ?
                            <Space wrap>
                              {node.buttonList.map((item: any) => <div key={item.id}>
                                <Tag style={{ marginRight: '-2px' }}>{item.name}</Tag>
                                <Tag color={item.changeType == '2' ? 'green' : 'red'}>{item.changeType == '2' ? '添加' : '删除'}</Tag>
                              </div>)}
                            </Space> :
                            null}
                        </>
                      }}
                    />
                  )
                }))
                }
              />
            </div>
          </> : null}
        </Spin>
      </Modal>
      <Approval refresh={() => {
        getDetail()
        refresh()
      }}
        dicList={dicList}
        open={openApproval}
        openSet={openApprovalSet}
        dataSource={{ id: detail.id, status: approval }} />
    </>
  );
};
export default Component;

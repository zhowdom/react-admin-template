import {connect, useAccess} from 'umi';
import {useRef, useState} from 'react';
import {Space} from 'antd';
import {ProTable, PageContainer} from '@ant-design/pro-components';
import type {ProFormInstance, ActionType, ProColumns} from '@ant-design/pro-components';
import * as api from '@/services/pages/AmsManage/applyList';
import {pubConfig, pubModal, pubMsg} from '@/utils/pubConfig';
import {useActivate} from 'react-activation';
import {useModel, history} from "umi";
import {getSum} from "@/utils/filter";
import Detail from './Detail'

// 操作
export const operates = (id: string, apiMethod: any = Function.prototype, refresh: any = Function.prototype) => {
  pubModal('确认操作此申请', '提示').then(async () => {
    const res = await apiMethod({id})
    if (res?.code == pubConfig.sCodeOrder) {
      pubMsg(res?.message || '操作成功!', 'success')
      refresh();
    } else {
      pubMsg(res?.message)
    }
  })
};

const Page: React.FC<{ common: any }> = ({common}) => {
  const {initialState}: any = useModel('@@initialState');
  const {currentUser} = initialState
  const {dicList} = common;
  const access = useAccess();
  const [tabsList, tabsListSet] = useState([])
  const [tabActiveKey, tabActiveKeySet] = useState('all')
  const [selectedRecord, selectedRecordSet] = useState({})
  const [openDetail, openDetailSet] = useState(false)
  const getCount = () => {
    api.getApplysCount({}).then(res => {
      if (res.code == pubConfig.sCodeOrder) {
        const allNum = getSum(res.data.map((v: any) => v.total));
        const newTabs: any = [];
        newTabs.push({
          tab: `全部(${allNum})`,
          key: 'all',
        });
        newTabs.push({
          tab: `草稿(${res.data.find((v: any) => v.status == 'prepare')
            ? res.data.find((v: any) => v.status == 'prepare').total
            : 0})`,
          key: 'prepare',
        });
        newTabs.push({
          tab: `审批中(${getSum(
            res.data
              .filter((v: any) => v.status == 'applying' || v.status == 'checkagree')
              .map((k: any) => k.total),
          )})`,
          key: 'applying,checkagree',
        });
        newTabs.push({
          tab: `已通过(${res.data.find((v: any) => v.status == 'agree')
            ? res.data.find((v: any) => v.status == 'agree').total
            : 0})`,
          key: 'agree',
        });
        newTabs.push({
          tab: `已拒绝(${getSum(
            res.data
              .filter((v: any) => v.status == 'checkReject' || v.status == 'reject')
              .map((k: any) => k.total),
          )})`,
          key: 'checkReject,reject',
        });
        tabsListSet(newTabs)
      }
    });
  };
  const getListAction = async (params: any): Promise<any> => {
    getCount()
    const postData = {
      ...params,
      pageIndex: params?.current,
      pageSize: params?.pageSize,
      status: tabActiveKey == 'all' ? '' : tabActiveKey,
    };

    const res = await api.listPage(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.list || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();

  // 编辑和重新发起
  const goEdit = (id?: any) => {
    history.push(`/ams/roles/editRolesPromiss?editId=${id}`)
  };
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  // 表格配置
  const columns: ProColumns[] = [
    {
      title: '业务名称',
      dataIndex: 'businessName',
    },
    {
      title: '申请原因',
      dataIndex: 'remark',
    },
    {
      title: '申请人姓名',
      dataIndex: 'createName',
      align: 'center',
    },
    {
      title: '申请人账号',
      dataIndex: 'createAccount',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      align: 'center',
      valueType: 'dateRange',
      render: (_, record) => record.createTime,
      search: {
        transform: value => ({createTimeBegin: value[0], createTimeEnd: value[1]})
      },
    },
    {
      title: '业务状态',
      dataIndex: 'status',
      align: 'center',
      width: 120,
      hideInSearch: true,
      valueEnum: dicList?.ams_apply_status,
    },
    {
      title: '操作',
      key: 'option',
      width: 80,
      align: 'center',
      valueType: 'option',
      render: (_, record) => <Space wrap>
        {access.canSee('ams_apply_detail') && record.status != 'prepare' || currentUser.id != record.createId ?
          <a onClick={() => {
            selectedRecordSet(record)
            setTimeout(() => {
              openDetailSet(true)
            }, 100);
          }}>查看</a> : ''}
        {access.canSee('ams_apply_cancel') && record.status == 'applying' && currentUser.id == record.createId ?
          <a onClick={() => {
            operates(record.id, api.withdraw, actionRef.current?.reload)
          }}>撤回</a> : ''}
        {(record.status == 'checkReject' || record.status == 'reject') && currentUser.id == record.createId ?
          <a onClick={() => {
            goEdit(record.id)
          }}>重新发起</a> : ''}
        {record.status == 'prepare' && currentUser.id == record.createId ?
          <a onClick={() => {
            goEdit(record.id)
          }}>编辑</a> : ''}
        {record.status == 'prepare' && currentUser.id == record.createId ?
          <a onClick={() => {
            operates(record.id, api.deleteItem, actionRef.current?.reload)
          }}>删除</a> : ''}
      </Space>,
    },
  ];
  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
        tabActiveKey={tabActiveKey}
        tabList={tabsList}
        onTabChange={val => {
          tabActiveKeySet(val)
          formRef.current?.submit()
        }}
      >
        <ProTable
          headerTitle={'审批管理'}
          rowKey="id"
          actionRef={actionRef}
          formRef={formRef}
          columns={columns}
          options={{fullScreen: true, setting: false}}
          sticky={{offsetScroll: 32, offsetHeader: 48}}
          bordered
          defaultSize={'small'}
          search={{className: 'light-search-form', defaultCollapsed: false}}
          dateFormatter="string"
          request={getListAction}
        />
        {/*详情-查看*/}
        <Detail refresh={actionRef.current?.reload} dataSource={selectedRecord} open={openDetail} openSet={openDetailSet} dicList={dicList} currentUser={currentUser}/>
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(
  ({account, common}: { account: Record<string, unknown>; common: Record<string, unknown> }) => ({
    account,
    common,
  }),
)(Page);
export default ConnectPage;

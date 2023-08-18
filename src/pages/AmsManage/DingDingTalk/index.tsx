import {useRef} from 'react';
import {Space} from 'antd';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import {connect, useAccess} from 'umi';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {pubAlert, pubConfig, pubMsg} from '@/utils/pubConfig';
import {useActivate} from 'react-activation';
import {listPage} from '@/services/pages/AmsManage/dingding';
import {getUsers} from "@/services/base";
import Update from './Update'

const Page: React.FC<{ common: any }> = ({}) => {
  const actionRef = useRef<ActionType>();
  const access = useAccess()
  useActivate(() => actionRef?.current?.reload())


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


  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      pageIndex: params?.current,
    };
    const res = await listPage(postData);
    if (res?.code == pubConfig.sCodeOrder) {
      return {
        data: res?.data?.list || [],
        success: true,
        total: res?.data?.total || 0,
      };
    } else {
      pubMsg(res?.message);
      return {
        data: [],
        success: false,
        total: 0,
      }
    }
  };
  // keepAlive页面激活钩子函数
  const info = (record: any) => {
    pubAlert(`结果字典值:  ${record.success};   任务调度id: ${record.taskId};   钉钉错误编码: ${record.errorCode};   钉钉错误信息: ${record.errMsg};`, '发送结果信息')
  };
  // 表格配置
  const columns: ProColumns[] = [
    {
      title: '标题',
      dataIndex: 'title',
      align: 'center',
      render: (_, record) => <Update refresh={actionRef.current?.reload} dataSource={record} trigger={<a>{record.title}</a>} />
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      align: 'center',
      hideInSearch: true,
      render: (_, record) => <a onClick={() => info(record)}>{record.success == 1 ? '成功' : '失败'}</a>
    },
    {
      title: '内容',
      dataIndex: 'content',
      align: 'center',
      ellipsis: true,
      width: 600,
    },
    {
      title: '内容变量',
      dataIndex: 'params',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '推送人员',
      dataIndex: 'pushUserName',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '推送人员',
      dataIndex: 'dingIds',
      align: 'center',
      valueType: 'select',
      ellipsis: true,
      hideInTable: true,
      fieldProps: selectProps,
      request: async () => {
        const res = await getUsers({
          pageIndex: 1,
          pageSize: 999,
        });
        if (res.code == pubConfig.sCodeOrder) {
          return res.data?.list.map((v: any) => ({
            ...v,
            label: `${v.name}(${v.phone})`,
            value: v.dingdingId || v?.id,
          }));
        } else {
          return [];
        }
      }
    },
    {
      title: '创建人',
      dataIndex: 'createName',
      width: 80,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 136,
      align: 'center',
      valueType: 'dateRange',
      render: (_, record) => record.createTime,
      search: {
        transform: val => ({createStartTime: val[0], createEndTime: val[1]})
      },
    },
  ];

  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable
          rowKey="id"
          bordered
          search={{className: 'light-search-form', defaultCollapsed: false}}
          options={{fullScreen: true, setting: false}}
          sticky={{offsetHeader: 48, offsetScroll: 36}}
          scroll={{x: 1200}}
          actionRef={actionRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          columns={columns}
          request={getListAction}
          toolBarRender={() => [
            <Space key={'toolbar'}>
              {access.canSee('ams_publishDingTalkMsg') ? <Update refresh={actionRef.current?.reload} /> : null}
            </Space>
          ]}
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({common}: any) => ({common}))(Page);
export default ConnectPage;

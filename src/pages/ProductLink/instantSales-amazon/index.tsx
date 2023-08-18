import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { useRef } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import type { PlatFormTableListItem } from '@/types/storage';
import { getSysPlatformPage } from '@/services/pages/storageManage';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import type { ProFormInstance } from '@ant-design/pro-form';

import AddDialog from './AddDialog';
import { useAccess, Access } from 'umi';

const ContractManage = (props: any) => {
  const { common } = props;
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
  // 添加弹窗实例
  const addModel = useRef();
  const access = useAccess();

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();

  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    console.log('查询', params);
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    delete postData.current;
    delete postData.pageSize;
    const res = await getSysPlatformPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    return {
      data: res?.code == pubConfig.sCode ? res.data.records : [],
      success: res?.code == pubConfig.sCode,
      total: res?.data?.total || 0,
    };
  };
  // 新增 编辑弹窗
  const addModalOpen: any = (row?: any) => {
    const data: any = addModel?.current;
    data.open(row?.id);
  };

  // 弹窗关闭
  const modalClose = (data: any) => {
    console.log(data);
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
  };
  const columns: ProColumns<PlatFormTableListItem>[] = [
    {
      title: '平台',
      dataIndex: 'name',
      align: 'center',
      order: 9,
    },
    {
      title: '业务范畴',
      dataIndex: 'business_scope',
      valueType: 'select',
      align: 'center',
      order: 10,
      fieldProps: selectProps,
      valueEnum: common.dicList.SYS_BUSINESS_SCOPE,
      render: (_: any, record: any) => {
        return pubFilter(common.dicList.SYS_BUSINESS_SCOPE, record.business_scope);
      },
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
    },
    // {
    //   title: '操作',
    //   key: 'option',
    //   width: 100,
    //   align: 'center',
    //   valueType: 'option',
    //   render: (_, row) => [
    //     <Access key="editButton" accessible={access.canSee('platform_edit')}>
    //       <a
    //         onClick={() => {
    //           addModalOpen(row);
    //         }}
    //         key="edit"
    //       >
    //         编辑
    //       </a>
    //     </Access>,
    //   ],
    // },
  ];
  return (
    <>
      <AddDialog addModel={addModel} handleClose={modalClose} />

      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable<PlatFormTableListItem>
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getList}
          rowKey="id"
          search={{ defaultCollapsed: false, className: 'light-search-form' }}
          dateFormatter="string"
          toolBarRender={() => [
            <>
              <Space>
                <Access key="addButton" accessible={access.canSee('platform_add')}>
                  <Button
                    onClick={() => {
                      addModalOpen();
                    }}
                    ghost
                    type="primary"
                    icon={<PlusOutlined />}
                  >
                    新增平台
                  </Button>
                </Access>
              </Space>
            </>,
          ]}
        />
      </PageContainer>
    </>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(ContractManage);
export default ConnectPage;

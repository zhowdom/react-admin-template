import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { useRef } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import type { PlatformShopTableListItem } from '@/types/storage';
import { sysImportTemplatePage } from '@/services/pages/settinsTemplateDown';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import type { ProFormInstance } from '@ant-design/pro-form';

import AddDialog from './AddDialog';
import { useAccess, Access } from 'umi';

const ContractManage = (props: any) => {
  const { common } = props;
  console.log(common);
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
    const res = await sysImportTemplatePage(postData);
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
  const columns: ProColumns<PlatformShopTableListItem>[] = [
    {
      title: '模板名称',
      dataIndex: 'template_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '模板Code',
      dataIndex: 'template_code',
      hideInSearch: true,
    },
    {
      title: '添加人',
      dataIndex: 'create_user_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '添加时间',
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 80,
      align: 'center',
      valueType: 'option',
      render: (_, row) => [
        <Access key="edit" accessible={access.canSee('template_edit')}>
          <a
            onClick={() => {
              addModalOpen(row);
            }}
            key="edit"
          >
            编辑
          </a>
        </Access>,
      ],
    },
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
        <ProTable<PlatformShopTableListItem>
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
          search={false}
          dateFormatter="string"
          headerTitle="导入模板管理"
          toolBarRender={() => [
            <>
              <Space>
                <Access key="accessButton" accessible={access.canSee('template_add')}>
                  <Button
                    onClick={() => {
                      addModalOpen();
                    }}
                    ghost
                    type="primary"
                    icon={<PlusOutlined />}
                  >
                    新增模板
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
